import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { randomUUID } from "crypto"

/**
 * If INSTAGRAM_COOKIES env var is set, writes it to a temp file
 * and returns the path. Caller must clean up the file after use.
 * Returns null if no cookies are configured.
 */
export async function getCookieFile(): Promise<string | null> {
  const cookies = process.env.INSTAGRAM_COOKIES
  if (!cookies) return null

  const cookiePath = join(tmpdir(), `cookies-${randomUUID()}.txt`)
  await writeFile(cookiePath, cookies, "utf-8")
  return cookiePath
}

export async function cleanupCookieFile(path: string | null) {
  if (path) {
    await unlink(path).catch(() => {})
  }
}
