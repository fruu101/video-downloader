import type { Metadata } from "next"
import { AdSlot } from "@/components/AdSlot"

export const metadata: Metadata = {
  title: "How to Use VidGrab",
  description:
    "Step-by-step guide on how to download videos using VidGrab. Learn to download from YouTube, Instagram, TikTok, and 1000+ sites in seconds.",
}

export default function HowToUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
        How to Use VidGrab
      </h1>
      <p className="text-[var(--muted)] text-lg mb-10">
        Downloading videos is quick and easy. Follow these simple steps.
      </p>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              1
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Copy the Video URL</h2>
              <p className="text-[var(--muted)] leading-relaxed">
                Go to the website where the video is hosted (YouTube, Instagram, TikTok, etc.) and
                copy the video URL from your browser&apos;s address bar. On mobile, you can usually tap
                the &quot;Share&quot; button and select &quot;Copy Link&quot;.
              </p>
              <div className="bg-black/30 rounded-lg p-3 text-sm text-[var(--muted)] font-mono">
                Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              2
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Paste & Get Info</h2>
              <p className="text-[var(--muted)] leading-relaxed">
                Paste the copied URL into the input field on VidGrab&apos;s homepage and click the
                <strong className="text-white"> &quot;Get Info&quot; </strong> button. VidGrab will
                fetch the video details including title, thumbnail, duration, and available download
                formats.
              </p>
            </div>
          </div>
        </div>

        <AdSlot size="banner" />

        {/* Step 3 */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              3
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Choose Quality & Format</h2>
              <p className="text-[var(--muted)] leading-relaxed">
                Select your preferred video quality (360p, 480p, 720p, 1080p, or higher). You can
                also toggle <strong className="text-white">&quot;Audio Only (MP3)&quot;</strong> if
                you just want the audio track — perfect for music and podcasts.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              4
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Download</h2>
              <p className="text-[var(--muted)] leading-relaxed">
                Click the <strong className="text-white">&quot;Download&quot;</strong> button. You&apos;ll
                see a real-time progress bar showing the download percentage, speed, and estimated
                time remaining. Once complete, the file will automatically save to your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AdSlot size="banner" />

      {/* Tips Section */}
      <div className="mt-12 bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Tips</h2>
        <ul className="space-y-3 text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">&#10003;</span>
            <span>
              <strong className="text-white">Private videos</strong> — VidGrab can only download
              publicly accessible videos. Private or restricted content is not supported.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">&#10003;</span>
            <span>
              <strong className="text-white">Best quality</strong> — Higher resolutions produce
              larger files. If you&apos;re on a slow connection, try 480p or 720p for a good
              balance of quality and file size.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">&#10003;</span>
            <span>
              <strong className="text-white">Audio extraction</strong> — Use the MP3 option to
              download just the audio. Great for saving music, podcasts, or lecture audio.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">&#10003;</span>
            <span>
              <strong className="text-white">Playlists</strong> — VidGrab downloads individual
              videos only. For playlists, paste each video link separately.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
