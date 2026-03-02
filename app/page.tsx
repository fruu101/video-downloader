"use client"

import { useState } from "react"
import {
  Download,
  Link2,
  Loader2,
  ClipboardPaste,
  Play,
  AlertCircle,
  Clock,
  Eye,
  User,
  Check,
  X,
  Globe,
  Zap,
  Shield,
  MonitorPlay,
  ArrowRight,
} from "lucide-react"
import { formatDuration, formatFileSize } from "@/lib/utils"
import { AdSlot } from "@/components/AdSlot"
import { FAQ } from "@/components/FAQ"

interface VideoFormat {
  formatId: string
  quality: string
  ext: string
  filesize: number | null
  resolution: string
  fps: number | null
  hasAudio: boolean
  hasVideo: boolean
}

interface VideoInfo {
  title: string
  thumbnail: string | null
  duration: number
  uploader: string | null
  platform: string
  viewCount: number | null
  uploadDate: string | null
  description: string | null
  videoFormats: VideoFormat[]
}

const platforms = [
  "YouTube", "Instagram", "TikTok", "Facebook", "Twitter / X", "Vimeo",
  "Reddit", "Dailymotion", "Twitch", "SoundCloud", "Tumblr", "Pinterest",
]

export default function Home() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadPhase, setDownloadPhase] = useState<"idle" | "downloading" | "merging" | "saving" | "done">("idle")
  const [downloadSpeed, setDownloadSpeed] = useState("")
  const [downloadEta, setDownloadEta] = useState("")

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
    } catch {
      // Clipboard access denied
    }
  }

  const handleFetchInfo = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setVideoInfo(null)
    setSelectedFormat(null)

    try {
      const response = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to fetch video info")
        return
      }

      setVideoInfo(result.data)
      if (result.data.videoFormats.length > 0) {
        setSelectedFormat(result.data.videoFormats[0].formatId)
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
  }

  const formatEta = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const handleDownload = async () => {
    if (!videoInfo) return

    setDownloading(true)
    setDownloadProgress(0)
    setDownloadPhase("downloading")
    setDownloadSpeed("")
    setDownloadEta("")
    setError(null)

    try {
      const selectedFmt = videoInfo.videoFormats.find((f) => f.formatId === selectedFormat)
      const ext = selectedFmt?.ext || "mp4"
      const sanitizedTitle = videoInfo.title.replace(/[^\w\s\-()[\]]/g, "").trim() || "video"
      const filename = `${sanitizedTitle}.${ext}`

      // Use expected filesize from info for progress tracking
      const totalSize = selectedFmt?.filesize || 0

      const res = await fetch("/api/download/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          formatId: selectedFormat,
          filename: sanitizedTitle,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        setError(errData?.error || "Failed to start download")
        setDownloading(false)
        setDownloadPhase("idle")
        return
      }

      // Get total size from Content-Length header (server sends it now)
      const contentLength = res.headers.get("content-length")
      const responseSize = contentLength ? parseInt(contentLength, 10) : totalSize
      const knownSize = responseSize || totalSize

      // Stream the response with progress tracking
      const reader = res.body?.getReader()

      if (!reader) {
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
        setDownloadPhase("done")
        setDownloadProgress(100)
        setTimeout(() => {
          setDownloading(false)
          setDownloadPhase("idle")
          setDownloadProgress(0)
        }, 3000)
        return
      }

      const chunks: BlobPart[] = []
      let receivedLength = 0
      let lastTime = Date.now()
      let lastBytes = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        receivedLength += value.length

        // Update progress
        if (knownSize > 0) {
          setDownloadProgress(Math.min(99, Math.round((receivedLength / knownSize) * 100)))
        } else {
          setDownloadSpeed(formatFileSize(receivedLength))
        }

        // Calculate speed & ETA every second
        const now = Date.now()
        const elapsed = (now - lastTime) / 1000
        if (elapsed >= 1) {
          const bytesPerSec = (receivedLength - lastBytes) / elapsed
          if (knownSize > 0) {
            setDownloadSpeed(formatSpeed(bytesPerSec))
            if (bytesPerSec > 0) {
              const remaining = knownSize - receivedLength
              const eta = Math.round(remaining / bytesPerSec)
              setDownloadEta(formatEta(eta))
            }
          } else {
            setDownloadSpeed(`${formatFileSize(receivedLength)} (${formatSpeed(bytesPerSec)})`)
          }

          lastTime = now
          lastBytes = receivedLength
        }
      }

      // Create blob and trigger browser download
      setDownloadPhase("saving")
      const blob = new Blob(chunks)
      const blobUrl = URL.createObjectURL(blob)
      // Use actual extension from server if available
      const actualExt = res.headers.get("x-file-ext")
      const downloadName = actualExt ? `${sanitizedTitle}.${actualExt}` : filename
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = downloadName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)

      setDownloadPhase("done")
      setDownloadProgress(100)

      setTimeout(() => {
        setDownloading(false)
        setDownloadPhase("idle")
        setDownloadProgress(0)
        setDownloadSpeed("")
        setDownloadEta("")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Download failed. Please try again.")
      setDownloading(false)
      setDownloadPhase("idle")
      setDownloadProgress(0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleFetchInfo()
    }
  }

  return (
    <div className="flex flex-col">
      {/* Ad: Leaderboard below navbar */}
      <AdSlot size="leaderboard" className="mt-4 px-4" />

      {/* ===== HERO SECTION ===== */}
      <section className="px-4 pt-16 pb-8 sm:pt-24 sm:pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5">
            Download Videos{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              from Anywhere
            </span>
          </h1>
          <p className="text-[var(--muted)] text-base sm:text-lg mb-8 max-w-xl mx-auto">
            YouTube, Instagram, TikTok, Facebook, Twitter & 1000+ sites. Free, fast, no registration.
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-10 flex-wrap">
            {[
              { icon: <Zap className="h-3.5 w-3.5" />, label: "Fast Downloads" },
              { icon: <Shield className="h-3.5 w-3.5" />, label: "Free & Secure" },
              { icon: <Globe className="h-3.5 w-3.5" />, label: "No Registration" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <span className="text-[var(--accent-light)]">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="url"
                  placeholder="Paste video URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-13 sm:h-14 pl-10 pr-12 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)] text-sm outline-none transition-all focus:border-[var(--accent)] glow-input"
                />
                <button
                  onClick={handlePaste}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleFetchInfo}
                disabled={loading || !url.trim()}
                className="h-13 sm:h-14 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-medium text-sm hover:from-violet-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {loading ? "Fetching..." : "Get Info"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ERROR / LOADING / RESULTS ===== */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0" />
              <p className="text-sm text-[var(--error)]">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-[var(--error)] hover:text-red-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-[var(--card-border)] border-t-[var(--accent)] animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium">Fetching video information...</p>
                  <p className="text-xs text-[var(--muted)] mt-1">This may take a few seconds</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Info + Download */}
          {videoInfo && !loading && (
            <div className="space-y-4">
              {/* Video Details */}
              <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {videoInfo.thumbnail && (
                    <div className="sm:w-64 flex-shrink-0 relative">
                      <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-40 sm:h-full object-cover" />
                      {videoInfo.duration > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md font-mono">
                          {formatDuration(videoInfo.duration)}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-[var(--accent)]/20 text-[var(--accent-light)]">
                        {videoInfo.platform}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold leading-snug mb-3 line-clamp-2">{videoInfo.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                      {videoInfo.uploader && (
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{videoInfo.uploader}</span>
                      )}
                      {videoInfo.duration > 0 && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(videoInfo.duration)}</span>
                      )}
                      {videoInfo.viewCount && (
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{new Intl.NumberFormat().format(videoInfo.viewCount)} views</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-4">
                  {/* Quality Options */}
                  {videoInfo.videoFormats.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Select Quality</p>
                      <div className="grid gap-2">
                        {videoInfo.videoFormats.map((f) => (
                          <button
                            key={f.formatId}
                            onClick={() => setSelectedFormat(f.formatId)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${selectedFormat === f.formatId ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--card-border)] hover:border-[var(--muted)]/30"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFormat === f.formatId ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--muted)]/40"}`}>
                                {selectedFormat === f.formatId && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div>
                                <span className="text-sm font-medium">{f.quality}</span>
                                <span className="text-xs text-[var(--muted)] ml-2">.{f.ext}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                              {f.resolution !== "Audio only" && <span>{f.resolution}</span>}
                              {f.fps && <span>{f.fps}fps</span>}
                              <span className="font-mono">{formatFileSize(f.filesize)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[var(--muted)] text-sm">
                      No video formats available.
                    </div>
                  )}

                  {/* Download Button & Progress */}
                  {downloading ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {downloadPhase === "done" ? (
                            <><Check className="h-4 w-4 text-[var(--success)]" /><span className="text-[var(--success)]">Download complete!</span></>
                          ) : downloadPhase === "saving" ? (
                            <><Loader2 className="h-4 w-4 animate-spin text-[var(--accent-light)]" /><span>Saving file...</span></>
                          ) : (
                            <><Download className="h-4 w-4 text-[var(--accent-light)]" /><span>Downloading...</span></>
                          )}
                        </div>
                        <div className="flex items-center gap-3 font-mono text-xs text-[var(--muted)]">
                          {downloadPhase === "downloading" && downloadSpeed && <span>{downloadSpeed}</span>}
                          {downloadPhase === "downloading" && downloadEta && <span>ETA {downloadEta}</span>}
                          {downloadProgress > 0 && <span>{downloadProgress}%</span>}
                        </div>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                        {downloadPhase === "saving" ? (
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 animate-pulse-glow" style={{ width: "100%" }} />
                        ) : downloadProgress > 0 ? (
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300 ease-out" style={{ width: `${downloadProgress}%` }} />
                        ) : (
                          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 animate-[progress-slide_1.5s_ease-in-out_infinite]" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleDownload}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold text-sm hover:from-violet-500 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download Video
                    </button>
                  )}
                </div>

                {/* Ad: Rectangle sidebar */}
                <div className="hidden lg:block">
                  <AdSlot size="rectangle" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why Choose VidGrab?</h2>
            <p className="text-[var(--muted)] text-sm max-w-lg mx-auto">
              The fastest, easiest way to download videos from any website
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Globe className="h-6 w-6" />,
                title: "1000+ Sites",
                desc: "YouTube, Instagram, TikTok, Facebook, Twitter, Vimeo, and hundreds more.",
              },
              {
                icon: <MonitorPlay className="h-6 w-6" />,
                title: "HD Quality",
                desc: "Download in 360p, 720p, 1080p, or 4K. Choose the quality you need.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "No Limits",
                desc: "Download unlimited videos without any daily caps or restrictions.",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Fast & Free",
                desc: "No registration, no limits, no hidden fees. Just paste and download.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)] w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-4 py-16 sm:py-20 bg-[var(--card)]/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-[var(--muted)] text-sm">Download any video in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Paste URL", desc: "Copy the video URL from any supported website and paste it into the input field." },
              { step: "2", title: "Select Quality", desc: "Choose your preferred video quality — 360p, 720p, 1080p, or 4K." },
              { step: "3", title: "Download", desc: "Click the download button and your video will be saved to your device." },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-3 h-5 w-5 text-[var(--muted)]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUPPORTED PLATFORMS ===== */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Supported Platforms</h2>
            <p className="text-[var(--muted)] text-sm">Download from all your favourite sites</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {platforms.map((name) => (
              <div
                key={name}
                className="px-4 py-2.5 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-sm font-medium hover:border-[var(--accent)]/30 transition-colors"
              >
                {name}
              </div>
            ))}
            <div className="px-4 py-2.5 rounded-lg border border-dashed border-[var(--card-border)] text-sm text-[var(--muted)]">
              + 1000 more
            </div>
          </div>
        </div>
      </section>

      {/* Ad: In-content */}
      <AdSlot size="leaderboard" className="py-4 px-4" />

      {/* ===== FAQ ===== */}
      <section className="px-4 py-16 sm:py-20">
        <FAQ />
      </section>

      {/* Ad: Footer banner */}
      <AdSlot size="leaderboard" className="pb-8 px-4" />
    </div>
  )
}
