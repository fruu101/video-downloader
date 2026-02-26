"use client"

import { useState } from "react"
import { AdSlot } from "@/components/AdSlot"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In production, this would send to an API endpoint
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
        Contact Us
      </h1>
      <p className="text-[var(--muted)] text-lg mb-10">
        Have a question, suggestion, or issue? We&apos;d love to hear from you.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-[var(--card)] border border-green-500/30 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">&#10003;</div>
              <h2 className="text-2xl font-semibold text-white mb-2">Message Sent!</h2>
              <p className="text-[var(--muted)]">
                Thank you for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2 rounded-lg bg-white/5 text-[var(--muted)] hover:bg-white/10 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-1.5">
                  Subject
                </label>
                <select
                  id="subject"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Question</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="copyright">Copyright / DMCA</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold hover:from-violet-500 hover:to-purple-600 transition-all"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Quick Info</h2>
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <div>
                <p className="text-white font-medium">Response Time</p>
                <p>We typically respond within 24-48 hours.</p>
              </div>
              <div>
                <p className="text-white font-medium">Bug Reports</p>
                <p>
                  Please include the video URL and any error messages you see so we can investigate.
                </p>
              </div>
              <div>
                <p className="text-white font-medium">DMCA Requests</p>
                <p>
                  For copyright claims, please include the original content URL and proof of
                  ownership.
                </p>
              </div>
            </div>
          </div>

          <AdSlot size="rectangle" />
        </div>
      </div>
    </div>
  )
}
