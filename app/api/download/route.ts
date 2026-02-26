import { NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import { YTDLP_PATH } from "@/lib/yt-dlp"

const execFileAsync = promisify(execFile)

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { url, formatId, audioOnly } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const args: string[] = ["--get-url", "--no-warnings", "--no-playlist"]

    if (audioOnly) {
      args.push("-f", "bestaudio/best")
    } else if (formatId) {
      args.push("-f", `${formatId}/best`)
    } else {
      args.push("-f", "best")
    }

    args.push(url)

    const { stdout } = await execFileAsync(YTDLP_PATH, args, {
      timeout: 55000,
    })

    const downloadUrl = stdout.trim().split("\n")[0]

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Could not get download URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, downloadUrl })
  } catch (error: any) {
    console.error("Download URL error:", error)
    return NextResponse.json(
      { error: "Failed to get download URL. Please try again." },
      { status: 500 }
    )
  }
}
