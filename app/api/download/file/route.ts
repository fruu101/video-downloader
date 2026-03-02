import { NextRequest } from "next/server"
import { createReadStream, statSync, unlinkSync } from "fs"
import { getJob, deleteJob } from "@/lib/download-store"

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  const filename = req.nextUrl.searchParams.get("filename") || "video.mp4"

  if (!id) {
    return new Response("Missing id", { status: 400 })
  }

  const job = getJob(id)
  if (!job || job.status !== "complete") {
    return new Response(JSON.stringify({ error: "File not ready" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const stat = statSync(job.outputFile)
    const fileStream = createReadStream(job.outputFile)

    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk: string | Buffer) => {
          const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk
          controller.enqueue(new Uint8Array(buf))
        })
        fileStream.on("end", () => {
          controller.close()
          // Clean up
          try { unlinkSync(job.outputFile) } catch {}
          deleteJob(id)
        })
        fileStream.on("error", (err) => {
          controller.error(err)
          try { unlinkSync(job.outputFile) } catch {}
          deleteJob(id)
        })
      },
      cancel() {
        fileStream.destroy()
        try { unlinkSync(job.outputFile) } catch {}
        deleteJob(id)
      },
    })

    const isAudio = job.outputFile.endsWith(".mp3")

    return new Response(stream, {
      headers: {
        "Content-Type": isAudio ? "audio/mpeg" : "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stat.size.toString(),
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: "File not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
}
