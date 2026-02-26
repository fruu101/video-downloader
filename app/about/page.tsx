import type { Metadata } from "next"
import { AdSlot } from "@/components/AdSlot"

export const metadata: Metadata = {
  title: "About VidGrab",
  description:
    "Learn about VidGrab — a free online video downloader supporting YouTube, Instagram, TikTok, Facebook, Twitter, and 1000+ websites.",
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
        About VidGrab
      </h1>

      <div className="space-y-6 text-[var(--muted)] leading-relaxed">
        <p className="text-lg">
          VidGrab is a free, fast, and easy-to-use online video downloader that lets you save videos
          from your favorite platforms — no registration, no software installation required.
        </p>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
          <p>
            We believe everyone should have easy access to save online videos for personal use.
            Whether you want to watch a tutorial offline, save a memorable clip, or convert a
            podcast to MP3 — VidGrab makes it simple and free.
          </p>
        </div>

        <AdSlot size="banner" />

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">What We Offer</h2>
          <ul className="space-y-3 list-disc list-inside">
            <li>
              <strong className="text-white">1000+ Supported Sites</strong> — YouTube, Instagram,
              TikTok, Facebook, Twitter, Vimeo, Dailymotion, Reddit, and many more.
            </li>
            <li>
              <strong className="text-white">Multiple Quality Options</strong> — Choose from
              available resolutions including 360p, 480p, 720p, 1080p, and even 4K.
            </li>
            <li>
              <strong className="text-white">MP3 Audio Extraction</strong> — Convert any video to
              high-quality MP3 audio with a single click.
            </li>
            <li>
              <strong className="text-white">Real-Time Progress</strong> — Watch your download
              progress in real time with speed and ETA indicators.
            </li>
            <li>
              <strong className="text-white">No Registration</strong> — Start downloading
              immediately. No sign-up, no accounts, no hassle.
            </li>
            <li>
              <strong className="text-white">100% Free</strong> — VidGrab is completely free to
              use with no hidden charges.
            </li>
          </ul>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">How It Works</h2>
          <p>
            VidGrab uses advanced technology to fetch video information and provide you with
            available download options. Simply paste a video URL, select your preferred quality
            or format, and click download. Our servers handle the processing so you get a clean,
            ready-to-play file.
          </p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Fair Use</h2>
          <p>
            VidGrab is designed for personal, offline viewing of publicly available content.
            Please respect copyright laws and the terms of service of the platforms you download
            from. Do not use VidGrab to download copyrighted content without permission from the
            content owner.
          </p>
        </div>
      </div>

      <AdSlot size="banner" />
    </div>
  )
}
