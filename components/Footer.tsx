import Link from "next/link"
import { Download } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card)]/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700">
                <Download className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Vid<span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Grab</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Free online video downloader supporting YouTube, Instagram, TikTok, and 1000+ more sites.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/how-to-use", label: "How to Use" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Supported Sites */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Supported Sites</h3>
            <ul className="space-y-2">
              {["YouTube", "Instagram", "TikTok", "Facebook", "Twitter / X", "Vimeo"].map((site) => (
                <li key={site} className="text-sm text-[var(--muted)]">{site}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} VidGrab. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            For personal use only. Respect copyright and content creators.
          </p>
        </div>
      </div>
    </footer>
  )
}
