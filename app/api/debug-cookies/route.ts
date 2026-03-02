import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { getCookieFile, cleanupCookieFile } from "@/lib/cookies"

export async function GET() {
  const testUrl = "https://www.youtube.com/watch?v=test"
  let cookiePath: string | null = null

  try {
    const ytEnv = process.env.YOUTUBE_COOKIES
    const igEnv = process.env.INSTAGRAM_COOKIES

    cookiePath = await getCookieFile(testUrl)

    let cookieFileContent = ""
    let cookieFileLines = 0
    if (cookiePath) {
      cookieFileContent = await readFile(cookiePath, "utf-8")
      cookieFileLines = cookieFileContent.split("\n").filter(l => l.trim() && !l.startsWith("#")).length
    }

    await cleanupCookieFile(cookiePath)

    return NextResponse.json({
      youtube: {
        envVarSet: !!ytEnv,
        envVarLength: ytEnv?.length || 0,
        startsWithHash: ytEnv?.trimStart().startsWith("#") || false,
        startsWithDot: ytEnv?.trimStart().startsWith(".") || false,
        looksBase64: !ytEnv?.trimStart().startsWith("#") && !ytEnv?.trimStart().startsWith("."),
        hasTabs: ytEnv?.includes("\t") || false,
        cookieFileCreated: !!cookiePath,
        cookieFileLines,
        cookieFirstLine: cookieFileContent.split("\n")[0]?.slice(0, 50) || "",
        cookieHasTabs: cookieFileContent.includes("\t"),
      },
      instagram: {
        envVarSet: !!igEnv,
        envVarLength: igEnv?.length || 0,
      },
    })
  } catch (error: any) {
    await cleanupCookieFile(cookiePath)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
