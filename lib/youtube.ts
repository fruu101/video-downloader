import { Innertube } from "youtubei.js"

let innertube: Innertube | null = null

async function getClient() {
  if (!innertube) {
    innertube = await Innertube.create({
      retrieve_player: true,
      generate_session_locally: true,
    })
  }
  return innertube
}

export interface YouTubeVideoInfo {
  title: string
  thumbnail: string | null
  duration: number
  uploader: string | null
  platform: string
  viewCount: number | null
  uploadDate: string | null
  description: string | null
  videoFormats: Array<{
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
    url: string
  }>
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v")
    }

    if (hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Get YouTube video info using InnerTube API (no yt-dlp needed)
 */
export async function getYouTubeInfo(url: string): Promise<YouTubeVideoInfo> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  const yt = await getClient()
  const info = await yt.getBasicInfo(videoId)

  const details = info.basic_info
  const streamingData = info.streaming_data

  const videoFormats: YouTubeVideoInfo["videoFormats"] = []
  const seenQualities = new Set<string>()

  // Process formats - prefer combined (audio+video) formats
  const allFormats = [
    ...(streamingData?.formats || []),
    ...(streamingData?.adaptive_formats || []),
  ]

  // Sort by height descending
  allFormats.sort((a, b) => (b.height || 0) - (a.height || 0))

  for (const f of allFormats) {
    const hasVideo = !!f.has_video
    const hasAudio = !!f.has_audio

    // Only include formats with both audio and video
    if (hasVideo && hasAudio && f.url) {
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

      const mime = f.mime_type || "video/mp4"
      const ext = mime.includes("webm") ? "webm" : "mp4"
      const key = `${quality}-${ext}`

      if (!seenQualities.has(key)) {
        seenQualities.add(key)
        videoFormats.push({
          formatId: String(f.itag || ""),
          quality,
          ext,
          filesize: f.content_length ? Number(f.content_length) : null,
          resolution: `${f.width || "?"}x${f.height || "?"}`,
          fps: f.fps || null,
          vcodec: (f as any).codecs?.split(",")[0]?.trim() || "",
          acodec: (f as any).codecs?.split(",")[1]?.trim() || (f as any).codecs || "",
          hasAudio: true,
          hasVideo: true,
          url: f.url,
        })
      }
    }
  }

  // Fallback: if no combined formats, show video-only
  if (videoFormats.length === 0) {
    for (const f of allFormats) {
      if (f.has_video && f.url) {
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

        const mime = f.mime_type || "video/mp4"
        const ext = mime.includes("webm") ? "webm" : "mp4"
        const key = `${quality}-${ext}`

        if (!seenQualities.has(key)) {
          seenQualities.add(key)
          videoFormats.push({
            formatId: String(f.itag || ""),
            quality,
            ext,
            filesize: f.content_length ? Number(f.content_length) : null,
            resolution: `${f.width || "?"}x${f.height || "?"}`,
            fps: f.fps || null,
            vcodec: (f as any).codecs || "",
            acodec: "",
            hasAudio: !!f.has_audio,
            hasVideo: true,
            url: f.url,
          })
        }
      }
    }
  }

  const thumbnail = details.thumbnail?.[0]?.url
    || details.thumbnail?.[details.thumbnail.length - 1]?.url
    || null

  return {
    title: details.title || "Unknown Title",
    thumbnail,
    duration: details.duration || 0,
    uploader: details.author || details.channel?.name || null,
    platform: "YouTube",
    viewCount: details.view_count || null,
    uploadDate: null,
    description: details.short_description?.slice(0, 200) || null,
    videoFormats: videoFormats.slice(0, 8),
  }
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname.includes("youtube.com") || hostname === "youtu.be"
  } catch {
    return false
  }
}
