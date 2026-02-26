import { NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Use yt-dlp to get video info
    const { stdout } = await execFileAsync("yt-dlp", [
      "--dump-json",
      "--no-download",
      "--no-warnings",
      url,
    ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 })

    const info = JSON.parse(stdout)

    // Process formats - group by quality and pick best per resolution
    const videoFormats: Array<{
      formatId: string
      quality: string
      ext: string
      filesize: number | null
      resolution: string
      fps: number | null
      vcodec: string
      acodec: string
      hasAudio: boolean
      hasVideo: boolean
    }> = []

    const seenQualities = new Set<string>()

    // Sort formats by quality (height) descending
    const sortedFormats = (info.formats || [])
      .filter((f: any) => f.url || f.manifest_url)
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))

    for (const f of sortedFormats) {
      const hasVideo = f.vcodec && f.vcodec !== "none"
      const hasAudio = f.acodec && f.acodec !== "none"

      if (hasVideo) {
        const height = f.height || 0
        let quality = "Unknown"
        if (height >= 2160) quality = "2160p (4K)"
        else if (height >= 1440) quality = "1440p (2K)"
        else if (height >= 1080) quality = "1080p (Full HD)"
        else if (height >= 720) quality = "720p (HD)"
        else if (height >= 480) quality = "480p"
        else if (height >= 360) quality = "360p"
        else if (height >= 240) quality = "240p"
        else if (height > 0) quality = `${height}p`

        const ext = f.ext || "mp4"
        const key = `${quality}-${ext}`

        if (!seenQualities.has(key)) {
          seenQualities.add(key)
          videoFormats.push({
            formatId: f.format_id,
            quality,
            ext,
            filesize: f.filesize || f.filesize_approx || null,
            resolution: f.resolution || `${f.width || "?"}x${f.height || "?"}`,
            fps: f.fps || null,
            vcodec: f.vcodec || "",
            acodec: f.acodec || "",
            hasAudio,
            hasVideo: true,
          })
        }
      }
    }

    // Check for audio-only formats
    const audioFormats = sortedFormats
      .filter((f: any) => {
        const hasAudio = f.acodec && f.acodec !== "none"
        const hasVideo = f.vcodec && f.vcodec !== "none"
        return hasAudio && !hasVideo
      })
      .slice(0, 3)
      .map((f: any) => ({
        formatId: f.format_id,
        quality: `${f.abr || "?"}kbps`,
        ext: f.ext || "m4a",
        filesize: f.filesize || f.filesize_approx || null,
        resolution: "Audio only",
        fps: null,
        vcodec: "none",
        acodec: f.acodec || "",
        hasAudio: true,
        hasVideo: false,
      }))

    return NextResponse.json({
      success: true,
      data: {
        title: info.title || "Unknown Title",
        thumbnail: info.thumbnail || null,
        duration: info.duration || 0,
        uploader: info.uploader || info.channel || null,
        platform: info.extractor_key || info.extractor || "Unknown",
        viewCount: info.view_count || null,
        uploadDate: info.upload_date || null,
        description: info.description?.slice(0, 200) || null,
        videoFormats: videoFormats.slice(0, 8),
        audioFormats,
      },
    })
  } catch (error: any) {
    console.error("Error fetching video info:", error)

    if (error.message?.includes("is not a valid URL")) {
      return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 400 })
    }

    if (error.message?.includes("Unsupported URL") || error.stderr?.includes("Unsupported URL")) {
      return NextResponse.json({ error: "This URL is not supported" }, { status: 400 })
    }

    if (error.stderr?.includes("Video unavailable") || error.stderr?.includes("Private video")) {
      return NextResponse.json({ error: "Video is unavailable or private" }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to fetch video info. Make sure the URL is valid and the video is publicly available." },
      { status: 500 }
    )
  }
}
