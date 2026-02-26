import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import { randomUUID } from "crypto"
import { tmpdir } from "os"
import { join } from "path"
import { setJob, updateJob } from "@/lib/download-store"

export async function POST(req: NextRequest) {
  try {
    const { url, formatId, filename, audioOnly } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const id = randomUUID()
    const tempPath = join(tmpdir(), `vd-${id}`)
    const ext = audioOnly ? "mp3" : "mp4"
    const outputFile = `${tempPath}.${ext}`

    // Build yt-dlp args
    const args: string[] = [
      "--newline",
      "--progress-template", "download:PROGRESS:%(progress._percent_str)s:%(progress._speed_str)s:%(progress._eta_str)s",
    ]

    if (audioOnly) {
      args.push("-f", "bestaudio")
      args.push("--extract-audio")
      args.push("--audio-format", "mp3")
      args.push("--audio-quality", "0")
    } else if (formatId) {
      args.push("-f", `${formatId}+bestaudio/best[ext=mp4]/${formatId}/best`)
      args.push("--merge-output-format", "mp4")
    } else {
      args.push("-f", "best[ext=mp4]/best")
      args.push("--merge-output-format", "mp4")
    }

    args.push("--no-warnings")
    args.push("--no-playlist")
    args.push("-o", outputFile)
    args.push(url)

    // Create job in store
    setJob(id, {
      id,
      status: "downloading",
      progress: 0,
      speed: "",
      eta: "",
      totalSize: "",
      outputFile,
    })

    // Spawn yt-dlp in background
    const ytdlp = spawn("yt-dlp", args)

    const parseOutput = (data: Buffer) => {
      const lines = data.toString().split("\n")
      for (const line of lines) {
        // Parse custom progress template: PROGRESS:  45.2%:  2.50MiB/s:00:03
        if (line.startsWith("PROGRESS:")) {
          const parts = line.split(":")
          if (parts.length >= 4) {
            const pctStr = parts[1].trim().replace("%", "")
            const pct = parseFloat(pctStr)
            const speed = parts[2].trim()
            const eta = parts.slice(3).join(":").trim()

            if (!isNaN(pct)) {
              updateJob(id, {
                progress: Math.min(pct, 100),
                speed: speed !== "N/A" && speed !== "Unknown" ? speed : "",
                eta: eta !== "N/A" && eta !== "Unknown" ? eta : "",
              })
            }
          }
          continue
        }

        // Fallback: parse standard yt-dlp progress lines
        // Matches: [download]  45.2% of ~  12.34MiB at  2.50MiB/s ETA 00:03 (frag 5/39)
        const progressMatch = line.match(/\[download\]\s+([\d.]+)%/)
        if (progressMatch) {
          const pct = parseFloat(progressMatch[1])
          if (!isNaN(pct)) {
            // Extract speed if present
            const speedMatch = line.match(/at\s+([\d.]+\S+)/)
            const etaMatch = line.match(/ETA\s+(\S+)/)
            // Extract frag info for fragment-based downloads
            const fragMatch = line.match(/\(frag\s+(\d+)\/(\d+)\)/)

            let progress = pct
            if (fragMatch) {
              const current = parseInt(fragMatch[1])
              const total = parseInt(fragMatch[2])
              if (total > 0) {
                progress = Math.round((current / total) * 100)
              }
            }

            updateJob(id, {
              progress: Math.min(progress, 100),
              speed: speedMatch?.[1] && speedMatch[1] !== "Unknown" ? speedMatch[1] : "",
              eta: etaMatch?.[1] && etaMatch[1] !== "Unknown" ? etaMatch[1] : "",
            })
          }
        }

        // Check for merge/extract step
        if (line.includes("[Merger]") || line.includes("[ExtractAudio]") || line.includes("Merging")) {
          updateJob(id, { status: "merging", progress: 100 })
        }
      }
    }

    ytdlp.stdout.on("data", parseOutput)
    ytdlp.stderr.on("data", parseOutput)

    ytdlp.on("close", (code) => {
      if (code === 0) {
        updateJob(id, { status: "complete", progress: 100 })
      } else {
        updateJob(id, {
          status: "error",
          error: "Download failed",
        })
      }
    })

    ytdlp.on("error", (err) => {
      updateJob(id, {
        status: "error",
        error: err.message,
      })
    })

    // Sanitize filename
    const safeName = (filename || "video")
      .replace(/[^a-zA-Z0-9\s\-_.]/g, "")
      .slice(0, 100)

    return NextResponse.json({
      success: true,
      id,
      filename: `${safeName}.${ext}`,
    })
  } catch (error: any) {
    console.error("Start download error:", error)
    return NextResponse.json(
      { error: "Failed to start download" },
      { status: 500 }
    )
  }
}
