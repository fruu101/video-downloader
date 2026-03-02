import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { randomUUID } from "crypto"

// Sites that need cookie-based auth
const COOKIE_DOMAINS = ["instagram.com", "facebook.com", "fb.watch"]

/**
 * If INSTAGRAM_COOKIES env var is set AND the URL is for a site that needs cookies,
 * writes cookies to a temp file and returns the path.
 * Returns null if no cookies are configured or URL doesn't need them.
 */
export async function getCookieFile(url?: string): Promise<string | null> {
  const cookies = process.env.INSTAGRAM_COOKIES
  if (!cookies) return null

  // Only use cookies for sites that require them
  if (url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase()
      const needsCookies = COOKIE_DOMAINS.some(d => hostname.includes(d))
      if (!needsCookies) return null
    } catch {
      return null
    }
  }

  const cookiePath = join(tmpdir(), `cookies-${randomUUID()}.txt`)
  await writeFile(cookiePath, cookies, "utf-8")
  return cookiePath
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
