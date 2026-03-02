let cachedToken: { visitorData: string; poToken: string; timestamp: number } | null = null
const TOKEN_TTL = 6 * 60 * 60 * 1000 // 6 hours (tokens last ~12h, refresh at 6h)

/**
 * Generate a YouTube Proof of Origin token.
 * This is what browsers do automatically via BotGuard to prove they're real.
 * Tokens are cached for 6 hours to avoid regenerating on every request.
 */
export async function getPoToken(): Promise<{ visitorData: string; poToken: string } | null> {
  // Return cached token if still valid
  if (cachedToken && Date.now() - cachedToken.timestamp < TOKEN_TTL) {
    return { visitorData: cachedToken.visitorData, poToken: cachedToken.poToken }
  }

  try {
    const { generate } = await import("youtube-po-token-generator")
    const result = await generate()

    if (result?.visitorData && result?.poToken) {
      cachedToken = {
        visitorData: result.visitorData,
        poToken: result.poToken,
        timestamp: Date.now(),
      }
      console.log("PO token generated successfully")
      return { visitorData: result.visitorData, poToken: result.poToken }
    }

    return null
  } catch (error) {
    console.error("Failed to generate PO token:", error)
    return null
  }
}
