import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import { YTDLP_PATH } from "@/lib/yt-dlp"
import { getCookieFile, cleanupCookieFile } from "@/lib/cookies"

const execFileAsync = promisify(execFile)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testUrl = searchParams.get("url") || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  let cookiePath: string | null = null

  try {
    const ytEnv = process.env.YOUTUBE_COOKIES

    cookiePath = await getCookieFile(testUrl)

    let cookieFileContent = ""
    let cookieFileLines = 0
    if (cookiePath) {
      cookieFileContent = await readFile(cookiePath, "utf-8")
      cookieFileLines = cookieFileContent.split("\n").filter(l => l.trim() && !l.startsWith("#")).length
    }

    // Actually test yt-dlp with cookies
    let ytdlpResult = ""
    let ytdlpError = ""
    let ytdlpVersion = ""

    try {
      const { stdout: version } = await execFileAsync(YTDLP_PATH, ["--version"], { timeout: 5000 })
      ytdlpVersion = version.trim()
    } catch (e: any) {
      ytdlpVersion = "error: " + e.message
    }

    try {
      const args = [
        "--dump-json",
        "--no-download",
        "--no-warnings",
        "--no-check-certificates",
        ...(cookiePath ? ["--cookies", cookiePath] : []),
        testUrl,
      ]
      const { stdout } = await execFileAsync(YTDLP_PATH, args, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 })
      const info = JSON.parse(stdout)
      ytdlpResult = `SUCCESS: ${info.title}`
    } catch (e: any) {
      ytdlpError = (e.stderr?.toString() || e.message || "unknown error").slice(0, 1000)
    }

    await cleanupCookieFile(cookiePath)

    return NextResponse.json({
      ytdlpVersion,
      cookieInfo: {
        envVarSet: !!ytEnv,
        envVarLength: ytEnv?.length || 0,
        looksBase64: !ytEnv?.trimStart().startsWith("#") && !ytEnv?.trimStart().startsWith("."),
        cookieFileCreated: !!cookiePath,
        cookieFileLines,
        cookieHasTabs: cookieFileContent.includes("\t"),
      },
      testResult: ytdlpResult || null,
      testError: ytdlpError || null,
    })
  } catch (error: any) {
    await cleanupCookieFile(cookiePath)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
