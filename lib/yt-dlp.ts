import { existsSync } from "fs"
import { join } from "path"

const bundledPath = join(process.cwd(), "bin", "yt-dlp")

export const YTDLP_PATH = existsSync(bundledPath) ? bundledPath : "yt-dlp"
