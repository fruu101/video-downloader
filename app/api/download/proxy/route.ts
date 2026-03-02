import { NextRequest } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import { readFile, unlink, readdir } from "fs/promises"
import { join, basename } from "path"
import { randomUUID } from "crypto"
import { tmpdir } from "os"
import { YTDLP_PATH } from "@/lib/yt-dlp"
import { getCookieFile, cleanupCookieFile, cleanVideoUrl } from "@/lib/cookies"
import { isYouTubeUrl } from "@/lib/youtube"

const execFileAsync = promisify(execFile)

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const id = randomUUID()
  const tempBase = join(tmpdir(), `vidgrab-${id}`)
  let cookiePath: string | null = null

  try {
    const { url, formatId, filename, downloadUrl } = await req.json()

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return Response.json({ error: "Invalid URL" }, { status: 400 })
    }

    // For YouTube with a direct download URL from youtubei.js, proxy the stream
    if (isYouTubeUrl(url) && downloadUrl) {
      return await proxyYouTubeDownload(downloadUrl, filename)
    }

    // For non-YouTube, use yt-dlp
    const cleanUrl = cleanVideoUrl(url)
    cookiePath = await getCookieFile(cleanUrl)

    const args: string[] = [
      "-o", `${tempBase}.%(ext)s`,
      "--no-warnings",
      "--no-playlist",
      "--no-check-certificates",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      ...(cookiePath ? ["--cookies", cookiePath] : []),
    ]

    if (formatId) {
      args.push("-f", `${formatId}/best`)
    } else {
      args.push("-f", "best")
    }

    args.push(cleanUrl)

    await execFileAsync(YTDLP_PATH, args, { timeout: 55000 })

    const tmpDir = tmpdir()
    const files = await readdir(tmpDir)
    const prefix = basename(tempBase)
    const downloadedFile = files.find((f) => f.startsWith(prefix))

    if (!downloadedFile) {
      return Response.json({ error: "Download failed — file not found" }, { status: 500 })
    }

    const filePath = join(tmpDir, downloadedFile)
    const actualExt = downloadedFile.split(".").pop() || "mp4"

    const data = await readFile(filePath)
    await unlink(filePath).catch(() => {})
    await cleanupCookieFile(cookiePath)

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
    await cleanupCookieFile(cookiePath)
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
      : stderr.includes("login") || stderr.includes("cookies") || stderr.includes("empty media response")
      ? "This platform requires authentication cookies to download."
      : "Download failed. Try a different quality or URL."

    return Response.json({ error: msg }, { status: 400 })
  }
}

async function proxyYouTubeDownload(downloadUrl: string, filename?: string) {
  try {
    const response = await fetch(downloadUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      return Response.json({ error: "Failed to download video from YouTube" }, { status: 400 })
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const ext = contentType.includes("webm") ? "webm" : "mp4"
    const safeName = (filename || "video").replace(/[^\w\s\-()[\]]/g, "").trim() || "video"

    return new Response(response.body, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}.${ext}"`,
        "Content-Type": "application/octet-stream",
        ...(response.headers.get("content-length")
          ? { "Content-Length": response.headers.get("content-length")! }
          : {}),
        "X-File-Ext": ext,
      },
    })
  } catch (error: any) {
    console.error("YouTube proxy download error:", error.message)
    return Response.json({ error: "Failed to download YouTube video." }, { status: 400 })
  }
}
