import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { randomUUID } from "crypto"

// Map of cookie env vars to their domains
const COOKIE_CONFIGS = [
  { envVar: "INSTAGRAM_COOKIES", domains: ["instagram.com", "facebook.com", "fb.watch"] },
  { envVar: "YOUTUBE_COOKIES", domains: ["youtube.com", "youtu.be", "googlevideo.com"] },
]

/**
 * Returns a temp cookie file path if cookies are configured for the given URL.
 * Checks INSTAGRAM_COOKIES for Instagram/Facebook and YOUTUBE_COOKIES for YouTube.
 */
export async function getCookieFile(url?: string): Promise<string | null> {
  if (!url) return null

  let hostname: string
  try {
    hostname = new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }

  for (const config of COOKIE_CONFIGS) {
    const cookies = process.env[config.envVar]
    if (!cookies) continue

    const matches = config.domains.some(d => hostname.includes(d))
    if (matches) {
      const cookiePath = join(tmpdir(), `cookies-${randomUUID()}.txt`)
      await writeFile(cookiePath, cookies, "utf-8")
      return cookiePath
    }
  }

  return null
}

/**
 * Clean YouTube URLs by removing playlist params that can cause issues.
 */
export function cleanVideoUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
      const videoId = parsed.searchParams.get("v")
      return `https://www.youtube.com/watch?v=${videoId}`
    }

    return url
  } catch {
    return url
  }
}

export async function cleanupCookieFile(path: string | null) {
  if (path) {
    await unlink(path).catch(() => {})
  }
}
