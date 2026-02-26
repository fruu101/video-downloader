export interface DownloadJob {
  id: string
  status: "downloading" | "merging" | "complete" | "error"
  progress: number // 0-100
  speed: string
  eta: string
  totalSize: string
  outputFile: string
  error?: string
}

// In-memory store for active downloads
const downloads = new Map<string, DownloadJob>()

export function getJob(id: string): DownloadJob | undefined {
  return downloads.get(id)
}

export function setJob(id: string, job: DownloadJob) {
  downloads.set(id, job)
}

export function updateJob(id: string, update: Partial<DownloadJob>) {
  const job = downloads.get(id)
  if (job) {
    Object.assign(job, update)
  }
}

export function deleteJob(id: string) {
  downloads.delete(id)
}
