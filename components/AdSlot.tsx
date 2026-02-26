interface AdSlotProps {
  size: "leaderboard" | "rectangle" | "banner"
  className?: string
}

const sizeMap = {
  leaderboard: { width: 728, height: 90, label: "728 x 90" },
  rectangle: { width: 300, height: 250, label: "300 x 250" },
  banner: { width: 468, height: 60, label: "468 x 60" },
}

export function AdSlot({ size, className = "" }: AdSlotProps) {
  const config = sizeMap[size]

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="border border-dashed border-[var(--card-border)] rounded-lg flex flex-col items-center justify-center text-[var(--muted)] bg-[var(--card)]/30 overflow-hidden"
        style={{ width: "100%", maxWidth: config.width, height: config.height }}
      >
        {/* Replace this div's contents with your ad script */}
        <span className="text-[10px] uppercase tracking-widest opacity-40">Advertisement</span>
        <span className="text-[10px] opacity-30 mt-1">{config.label}</span>
      </div>
    </div>
  )
}
