import { NextRequest } from "next/server"
import { getJob } from "@/lib/download-store"

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")

  if (!id) {
    return new Response("Missing id", { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Poll job status every 300ms for smooth updates
      const interval = setInterval(() => {
        const job = getJob(id)

        if (!job) {
          sendEvent({ status: "error", error: "Download not found" })
          clearInterval(interval)
          controller.close()
          return
        }

        sendEvent({
          status: job.status,
          progress: job.progress,
          speed: job.speed,
          eta: job.eta,
          totalSize: job.totalSize,
        })

        if (job.status === "complete" || job.status === "error") {
          clearInterval(interval)
          controller.close()
        }
      }, 300)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
