import { NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import { YTDLP_PATH } from "@/lib/yt-dlp"
import { getCookieFile, cleanupCookieFile, cleanVideoUrl } from "@/lib/cookies"
import { getYouTubeInfo, isYouTubeUrl } from "@/lib/youtube"

const execFileAsync = promisify(execFile)

export const maxDuration = 60

export async function POST(req: NextRequest) {
  let cookiePath: string | null = null

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

    // Use YouTube.js for YouTube (bypasses bot detection), yt-dlp for everything else
    if (isYouTubeUrl(url)) {
      return await handleYouTube(url)
    }

    return await handleGeneric(url)
  } catch (error: any) {
    await cleanupCookieFile(cookiePath)
    console.error("Error fetching video info:", error.message)

    return NextResponse.json(
      { error: "Failed to fetch video info. Make sure the URL is valid and the video is publicly available." },
      { status: 500 }
    )
  }
}

async function handleYouTube(url: string) {
  try {
    const info = await getYouTubeInfo(url)

    return NextResponse.json({
      success: true,
      data: {
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        uploader: info.uploader,
        platform: info.platform,
        viewCount: info.viewCount,
        uploadDate: info.uploadDate,
        description: info.description,
        videoFormats: info.videoFormats.map(({ url: _url, ...rest }) => rest),
        // Store download URLs server-side for the download endpoint
        _downloadUrls: Object.fromEntries(
          info.videoFormats.map(f => [f.formatId, f.url])
        ),
      },
    })
  } catch (error: any) {
    console.error("YouTube.js error:", error.message)
    return NextResponse.json(
      { error: "Could not fetch YouTube video info. The video may be private or unavailable." },
      { status: 400 }
    )
  }
}

async function handleGeneric(url: string) {
  let cookiePath: string | null = null

  try {
    const cleanUrl = cleanVideoUrl(url)
    cookiePath = await getCookieFile(cleanUrl)

    const args = [
      "--dump-json",
      "--no-download",
      "--no-warnings",
      "--no-check-certificates",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      ...(cookiePath ? ["--cookies", cookiePath] : []),
      cleanUrl,
    ]

    const { stdout } = await execFileAsync(YTDLP_PATH, args, { timeout: 55000, maxBuffer: 10 * 1024 * 1024 })
    const info = JSON.parse(stdout)

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

    const sortedFormats = (info.formats || [])
      .filter((f: any) => f.url || f.manifest_url)
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))

    for (const f of sortedFormats) {
      const hasVideo = f.vcodec && f.vcodec !== "none"
      const hasAudio = f.acodec && f.acodec !== "none"

      if (hasVideo && hasAudio) {
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
            hasAudio: true,
            hasVideo: true,
          })
        }
      }
    }

    if (videoFormats.length === 0) {
      for (const f of sortedFormats) {
        const hasVideo = f.vcodec && f.vcodec !== "none"
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
              hasAudio: !!(f.acodec && f.acodec !== "none"),
              hasVideo: true,
            })
          }
        }
      }
    }

    await cleanupCookieFile(cookiePath)

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
      },
    })
  } catch (error: any) {
    await cleanupCookieFile(cookiePath)

    const stderr = error.stderr?.toString() || ""
    console.error("yt-dlp error:", { message: error.message, stderr: stderr.slice(0, 500) })

    if (error.message?.includes("Unsupported URL") || stderr.includes("Unsupported URL")) {
      return NextResponse.json({ error: "This URL is not supported" }, { status: 400 })
    }

    if (stderr.includes("Video unavailable") || stderr.includes("Private video")) {
      return NextResponse.json({ error: "Video is unavailable or private" }, { status: 400 })
    }

    if (stderr.includes("login") || stderr.includes("cookies") || stderr.includes("empty media response")) {
      return NextResponse.json({
        error: "This platform requires authentication. Instagram and some other sites may not work without cookies configured."
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to fetch video info. Make sure the URL is valid and the video is publicly available." },
      { status: 500 }
    )
  }
}
