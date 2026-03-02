import { NextRequest } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import { readFile, unlink, readdir } from "fs/promises"
import { join, basename } from "path"
import { randomUUID } from "crypto"
import { tmpdir } from "os"
import { YTDLP_PATH } from "@/lib/yt-dlp"

const execFileAsync = promisify(execFile)

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const id = randomUUID()
  const tempBase = join(tmpdir(), `vidgrab-${id}`)

  try {
    const { url, formatId, filename } = await req.json()

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return Response.json({ error: "Invalid URL" }, { status: 400 })
    }

    const args: string[] = [
      "-o", `${tempBase}.%(ext)s`,
      "--no-warnings",
      "--no-playlist",
      "--no-check-certificates",
    ]

    if (formatId) {
      args.push("-f", `${formatId}/best`)
    } else {
      args.push("-f", "best")
    }

    args.push(url)

    await execFileAsync(YTDLP_PATH, args, { timeout: 55000 })

    // Find the downloaded file (yt-dlp adds the actual extension)
    const tmpDir = tmpdir()
    const files = await readdir(tmpDir)
    const prefix = basename(tempBase)
    const downloadedFile = files.find((f) => f.startsWith(prefix))

    if (!downloadedFile) {
      return Response.json({ error: "Download failed — file not found" }, { status: 500 })
    }

    const filePath = join(tmpDir, downloadedFile)
    const actualExt = downloadedFile.split(".").pop() || "mp4"

    // Read file into memory and delete temp file
    const data = await readFile(filePath)
    await unlink(filePath).catch(() => {})

    const safeName =
      (filename || "video").replace(/[^\w\s\-()[\]]/g, "").trim() || "video"

    return new Response(data, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}.${actualExt}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": data.length.toString(),
        "X-File-Ext": actualExt,
      },
    })
  } catch (error: any) {
    // Clean up temp file on error
    const tmpDir = tmpdir()
    const files = await readdir(tmpDir).catch(() => [])
    const prefix = basename(tempBase)
    for (const f of files) {
      if (f.startsWith(prefix)) {
        await unlink(join(tmpDir, f)).catch(() => {})
      }
    }

    console.error("Download error:", error.message)
    const stderr = error.stderr?.toString() || error.message || ""
    const msg = stderr.includes("Unsupported URL")
      ? "This URL is not supported for download."
      : stderr.includes("Video unavailable") || stderr.includes("Private video")
      ? "Video is unavailable or private."
      : stderr.includes("format is not available")
      ? "Selected format is not available for this video."
      : "Download failed. Try a different quality or URL."

    return Response.json({ error: msg }, { status: 400 })
  }
}
