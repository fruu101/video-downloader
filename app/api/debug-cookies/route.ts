import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import { YTDLP_PATH } from "@/lib/yt-dlp"
import { getCookieFile, cleanupCookieFile } from "@/lib/cookies"

const execFileAsync = promisify(execFile)

const CLIENTS_TO_TEST = [
  "default",
  "web_creator",
  "mweb",
  "android",
  "ios",
  "tv",
  "tv_embedded",
  "web_creator,mweb",
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testUrl = searchParams.get("url") || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  let cookiePath: string | null = null

  try {
    cookiePath = await getCookieFile(testUrl)

    let ytdlpVersion = ""
    try {
      const { stdout: version } = await execFileAsync(YTDLP_PATH, ["--version"], { timeout: 5000 })
      ytdlpVersion = version.trim()
    } catch (e: any) {
      ytdlpVersion = "error: " + e.message
    }

    // Test each client
    const results: Record<string, string> = {}

    for (const client of CLIENTS_TO_TEST) {
      // Need fresh cookie file for each attempt
      const cp = await getCookieFile(testUrl)
      try {
        const args = [
          "--dump-json",
          "--no-download",
          "--no-warnings",
          "--no-check-certificates",
          ...(client !== "default" ? ["--extractor-args", `youtube:player_client=${client}`] : []),
          "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          ...(cp ? ["--cookies", cp] : []),
          testUrl,
        ]
        const { stdout } = await execFileAsync(YTDLP_PATH, args, { timeout: 20000, maxBuffer: 10 * 1024 * 1024 })
        const info = JSON.parse(stdout)
        results[client] = `SUCCESS: ${info.title}`
      } catch (e: any) {
        const err = (e.stderr?.toString() || e.message || "unknown").slice(0, 200)
        results[client] = `FAIL: ${err}`
      }
      await cleanupCookieFile(cp)
    }

    await cleanupCookieFile(cookiePath)

    return NextResponse.json({
      ytdlpVersion,
      testUrl,
      cookiesAvailable: !!cookiePath,
      results,
    })
  } catch (error: any) {
    await cleanupCookieFile(cookiePath)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
