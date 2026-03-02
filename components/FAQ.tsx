"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "Is VidGrab free to use?",
    a: "Yes, VidGrab is completely free. There are no hidden charges, subscriptions, or registration required. Simply paste a URL and download.",
  },
  {
    q: "Which websites are supported?",
    a: "VidGrab supports over 1000 websites including YouTube, Instagram, TikTok, Facebook, Twitter/X, Vimeo, Dailymotion, Reddit, and many more.",
  },
  {
    q: "Can I download videos in HD quality?",
    a: "Yes! VidGrab lets you choose from all available qualities including 360p, 480p, 720p, 1080p, and even 4K when available. You can select the quality that best suits your needs.",
  },
  {
    q: "What video qualities are available?",
    a: "VidGrab offers all qualities available from the source — from 360p up to 4K. Just pick the quality you need and hit download.",
  },
  {
    q: "Do I need to install any software?",
    a: "No installation is needed. VidGrab works entirely in your web browser. Just visit the website, paste your link, and download.",
  },
  {
    q: "Is it legal to download videos?",
    a: "Downloading videos for personal, offline viewing is generally permitted. However, always respect copyright laws and the terms of service of the platforms you're downloading from. Do not redistribute copyrighted content.",
  },
  {
    q: "Why is my download slow?",
    a: "Download speed depends on the source server and your internet connection. Larger files (1080p, 4K) naturally take longer. VidGrab downloads at the maximum speed available from the source.",
  },
  {
    q: "What format are downloaded videos in?",
    a: "Videos are downloaded in MP4 format, which is compatible with virtually all devices and media players.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-[var(--muted)] text-sm">Everything you need to know about VidGrab</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--muted)] flex-shrink-0 ml-4 transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-[var(--muted)] leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
