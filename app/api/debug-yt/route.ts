import { NextResponse } from "next/server"
import { Innertube } from "youtubei.js"

export const maxDuration = 30

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get("v") || "OpuQOgccky0"

  try {
    const yt = await Innertube.create({
      retrieve_player: true,
      generate_session_locally: true,
    })

    const info = await yt.getInfo(videoId)

    const bi = info.basic_info
    const sd = info.streaming_data

    // Check format structure
    const sampleFormat = sd?.formats?.[0]
    const sampleAdaptive = sd?.adaptive_formats?.[0]

    return NextResponse.json({
      basic_info: {
        title: bi?.title,
        duration: bi?.duration,
        author: bi?.author,
        channel: bi?.channel,
        view_count: bi?.view_count,
        short_description: bi?.short_description?.slice(0, 100),
        thumbnail: bi?.thumbnail,
        keys: bi ? Object.keys(bi) : [],
      },
      streaming_data: {
        has_streaming_data: !!sd,
        formats_count: sd?.formats?.length || 0,
        adaptive_count: sd?.adaptive_formats?.length || 0,
        sample_format: sampleFormat ? {
          itag: sampleFormat.itag,
          mime_type: sampleFormat.mime_type,
          width: sampleFormat.width,
          height: sampleFormat.height,
          has_video: sampleFormat.has_video,
          has_audio: sampleFormat.has_audio,
          fps: sampleFormat.fps,
          url: sampleFormat.url ? "HAS_URL" : "NO_URL",
          content_length: sampleFormat.content_length,
          keys: Object.keys(sampleFormat).filter(k => !['url', 'cipher', 'signature_cipher'].includes(k)),
        } : null,
        sample_adaptive: sampleAdaptive ? {
          itag: sampleAdaptive.itag,
          mime_type: sampleAdaptive.mime_type,
          width: sampleAdaptive.width,
          height: sampleAdaptive.height,
          has_video: sampleAdaptive.has_video,
          has_audio: sampleAdaptive.has_audio,
          url: sampleAdaptive.url ? "HAS_URL" : "NO_URL",
          keys: Object.keys(sampleAdaptive).filter(k => !['url', 'cipher', 'signature_cipher'].includes(k)),
        } : null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.slice(0, 500),
    }, { status: 500 })
  }
}
