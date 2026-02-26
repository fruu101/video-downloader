import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "VidGrab Terms of Service — Read the terms and conditions for using our free video downloader service.",
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
        Terms of Service
      </h1>
      <p className="text-[var(--muted)] mb-10">Last updated: February 2026</p>

      <div className="space-y-8 text-[var(--muted)] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using VidGrab (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
          <p>
            VidGrab is a free online tool that allows users to download publicly available videos
            from various websites for personal, offline use. The Service provides video information
            retrieval, quality selection, and file downloading capabilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. User Responsibilities</h2>
          <p>By using VidGrab, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use the Service only for lawful purposes</li>
            <li>
              Respect the copyright and intellectual property rights of content creators and
              platform providers
            </li>
            <li>Download content only for personal, non-commercial use unless you have explicit permission from the content owner</li>
            <li>Not use the Service to download private, restricted, or paywalled content</li>
            <li>
              Comply with the terms of service of the source platforms (YouTube, Instagram, TikTok,
              etc.)
            </li>
            <li>Not attempt to abuse, overload, or disrupt the Service</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Intellectual Property</h2>
          <p>
            VidGrab does not host, store, or own any of the videos downloaded through our Service.
            All content belongs to its respective owners. VidGrab acts solely as a technical tool
            to facilitate downloading of publicly accessible media. Users are solely responsible
            for ensuring they have the right to download and use any content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. No Guarantee of Availability</h2>
          <p>
            We strive to keep VidGrab available and functional at all times, but we do not
            guarantee uninterrupted access to the Service. Features may change, and certain
            websites or video formats may not always be supported. We reserve the right to
            modify, suspend, or discontinue the Service at any time without notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">6. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, either express or implied. We do not warrant that the Service will be
            error-free, secure, or that downloaded files will be free of defects or viruses.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, VidGrab and its operators shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages arising from
            your use of the Service. This includes, but is not limited to, damages for loss of
            data, profits, or goodwill.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">8. DMCA & Copyright Claims</h2>
          <p>
            VidGrab respects the intellectual property rights of others. If you believe that
            content accessible through our Service infringes your copyright, please contact us
            through our{" "}
            <a href="/contact" className="text-violet-400 hover:underline">
              Contact page
            </a>{" "}
            with the following information:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Description of the copyrighted work</li>
            <li>The URL of the infringing content</li>
            <li>Your contact information</li>
            <li>A statement of good faith belief that the use is unauthorized</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">9. Advertising</h2>
          <p>
            VidGrab displays advertisements to support the free Service. By using VidGrab, you
            acknowledge and accept that advertisements may be displayed during your use of the
            Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">10. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms of Service at any time. Changes will be
            effective immediately upon posting to this page. Your continued use of VidGrab after
            any modifications constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws,
            without regard to conflict of law principles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">12. Contact</h2>
          <p>
            For questions about these Terms of Service, please visit our{" "}
            <a href="/contact" className="text-violet-400 hover:underline">
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
