"use client"

import { useState, useEffect } from "react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-2xl shadow-black/40">
        <p className="text-sm text-[var(--muted)] flex-1">
          We use cookies to improve your experience. By using VidGrab, you agree to our{" "}
          <a href="/privacy" className="text-[var(--accent-light)] hover:underline">Privacy Policy</a>.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-medium hover:from-violet-500 hover:to-purple-600 transition-all"
          >
            Accept
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-lg bg-white/5 text-[var(--muted)] text-sm hover:bg-white/10 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
