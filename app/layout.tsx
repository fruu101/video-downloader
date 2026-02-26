import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { CookieConsent } from "@/components/CookieConsent"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "VidGrab - Free Video Downloader | YouTube, Instagram, TikTok",
    template: "%s | VidGrab",
  },
  description:
    "Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ sites for free. Choose quality, extract MP3 audio, no registration required.",
  keywords: [
    "video downloader",
    "youtube downloader",
    "instagram downloader",
    "tiktok downloader",
    "free video downloader",
    "online video downloader",
    "mp4 downloader",
    "mp3 converter",
    "download youtube video",
    "download instagram reel",
  ],
  authors: [{ name: "VidGrab" }],
  openGraph: {
    title: "VidGrab - Free Video Downloader",
    description:
      "Download videos from YouTube, Instagram, TikTok and 1000+ sites. Free, fast, no registration.",
    type: "website",
    siteName: "VidGrab",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VidGrab - Free Video Downloader",
    description:
      "Download videos from YouTube, Instagram, TikTok and 1000+ sites. Free, fast, no registration.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "VidGrab",
              description:
                "Free online video downloader supporting YouTube, Instagram, TikTok, and 1000+ sites.",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  )
}
