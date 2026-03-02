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

function getQualityLabel(height: number): string {
  if (height >= 2160) return "2160p (4K)"
  if (height >= 1440) return "1440p (2K)"
  if (height >= 1080) return "1080p (Full HD)"
  if (height >= 720) return "720p (HD)"
  if (height >= 480) return "480p"
  if (height >= 360) return "360p"
  if (height >= 240) return "240p"
  if (height > 0) return `${height}p`
  return "Unknown"
}

export async function getYouTubeInfo(url: string): Promise<YouTubeVideoInfo> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  const yt = await getClient()

  // Use getInfo (not getBasicInfo) to get full streaming data with deciphered URLs
  const info = await yt.getInfo(videoId)

  // Debug: log what we got
  const bi = info.basic_info
  console.log("YouTube info:", {
    title: bi?.title,
    duration: bi?.duration,
    author: bi?.author,
    hasStreamingData: !!info.streaming_data,
    formatsCount: info.streaming_data?.formats?.length || 0,
    adaptiveCount: info.streaming_data?.adaptive_formats?.length || 0,
  })

  const videoFormats: YouTubeVideoInfo["videoFormats"] = []
  const seenQualities = new Set<string>()

  // Collect all formats
  const allFormats: any[] = [
    ...(info.streaming_data?.formats || []),
    ...(info.streaming_data?.adaptive_formats || []),
  ]

  // Sort by height descending
  allFormats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0))

  // First pass: combined audio+video formats
  for (const f of allFormats) {
    const hasVideo = f.has_video || (f.width && f.height)
    const hasAudio = f.has_audio || f.audio_channels

    if (hasVideo && hasAudio) {
      const height = f.height || 0
      const quality = getQualityLabel(height)
      const mimeType = f.mime_type || ""
      const ext = mimeType.includes("webm") ? "webm" : "mp4"
      const key = `${quality}-${ext}`

      // Get the decipher'd URL
      const streamUrl = f.decipher?.(yt.session?.player) || f.url || ""

      if (!seenQualities.has(key) && streamUrl) {
        seenQualities.add(key)
        videoFormats.push({
          formatId: String(f.itag || ""),
          quality,
          ext,
          filesize: f.content_length ? Number(f.content_length) : (f.approx_duration_ms && f.bitrate ? Math.floor((f.bitrate * f.approx_duration_ms) / 8000) : null),
          resolution: `${f.width || "?"}x${f.height || "?"}`,
          fps: f.fps || null,
          vcodec: "",
          acodec: "",
          hasAudio: true,
          hasVideo: true,
          url: streamUrl,
        })
      }
    }
  }

  // Fallback: video-only formats if no combined ones
  if (videoFormats.length === 0) {
    for (const f of allFormats) {
      const hasVideo = f.has_video || (f.width && f.height)
      if (hasVideo) {
        const height = f.height || 0
        const quality = getQualityLabel(height)
        const mimeType = f.mime_type || ""
        const ext = mimeType.includes("webm") ? "webm" : "mp4"
        const key = `${quality}-${ext}`

        const streamUrl = f.decipher?.(yt.session?.player) || f.url || ""

        if (!seenQualities.has(key) && streamUrl) {
          seenQualities.add(key)
          videoFormats.push({
            formatId: String(f.itag || ""),
            quality,
            ext,
            filesize: f.content_length ? Number(f.content_length) : null,
            resolution: `${f.width || "?"}x${f.height || "?"}`,
            fps: f.fps || null,
            vcodec: "",
            acodec: "",
            hasAudio: !!(f.has_audio || f.audio_channels),
            hasVideo: true,
            url: streamUrl,
          })
        }
      }
    }
  }

  // Get best thumbnail
  const thumbnails = bi?.thumbnail || []
  const thumbnail = thumbnails.length > 0
    ? (thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || null)
    : null

  return {
    title: bi?.title || "Unknown Title",
    thumbnail,
    duration: bi?.duration || 0,
    uploader: bi?.author || (bi?.channel as any)?.name || null,
    platform: "YouTube",
    viewCount: bi?.view_count ?? null,
    uploadDate: null,
    description: bi?.short_description?.slice(0, 200) || null,
    videoFormats: videoFormats.slice(0, 8),
  }
}

export function isYouTubeUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname.includes("youtube.com") || hostname === "youtu.be"
  } catch {
    return false
  }
}
