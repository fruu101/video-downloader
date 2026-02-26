import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with VidGrab — report bugs, request features, or send copyright notices for our free video downloader.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
