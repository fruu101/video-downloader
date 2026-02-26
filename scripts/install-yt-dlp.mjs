import { existsSync, mkdirSync, chmodSync } from "fs"
import { join, dirname } from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const binDir = join(__dirname, "..", "bin")
const ytdlpPath = join(binDir, "yt-dlp")

if (existsSync(ytdlpPath)) {
  console.log("yt-dlp binary already exists, skipping download")
  process.exit(0)
}

// Only download on Linux (Vercel build environment)
if (process.platform !== "linux") {
  console.log(`Skipping yt-dlp download on ${process.platform} (using system yt-dlp for local dev)`)
  process.exit(0)
}

console.log("Downloading yt-dlp binary for Linux...")
mkdirSync(binDir, { recursive: true })

execSync(
  `curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o "${ytdlpPath}"`,
  { stdio: "inherit" }
)

chmodSync(ytdlpPath, 0o755)
console.log("yt-dlp binary downloaded successfully")
