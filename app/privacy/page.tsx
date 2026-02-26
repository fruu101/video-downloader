import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "VidGrab Privacy Policy — Learn how we handle your data and protect your privacy when using our free video downloader.",
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
        Privacy Policy
      </h1>
      <p className="text-[var(--muted)] mb-10">Last updated: February 2026</p>

      <div className="space-y-8 text-[var(--muted)] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
          <p>
            VidGrab (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, and safeguard
            information when you use our website and services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
          <p>We collect minimal information to provide our service:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-white">URLs you submit</strong> — We process the video URLs
              you paste to fetch video information and facilitate downloads. URLs are not stored
              permanently.
            </li>
            <li>
              <strong className="text-white">Usage data</strong> — We may collect anonymous usage
              statistics such as page views, browser type, and device type to improve our service.
            </li>
            <li>
              <strong className="text-white">Cookies</strong> — We use essential cookies and may
              use analytics cookies (with your consent) to understand how our site is used. See
              Section 5 for details.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Process your video download requests</li>
            <li>Improve and optimize our website and services</li>
            <li>Monitor usage to prevent abuse</li>
            <li>Display relevant advertisements</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Data Retention</h2>
          <p>
            Downloaded files are temporarily stored on our servers during the download process
            and are automatically deleted shortly after. We do not retain copies of any downloaded
            content. We do not store the video URLs you submit beyond what is needed to process
            your request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. Cookies</h2>
          <p>We use the following types of cookies:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-white">Essential cookies</strong> — Required for the website
              to function properly (e.g., cookie consent preference).
            </li>
            <li>
              <strong className="text-white">Analytics cookies</strong> — Help us understand how
              visitors use our site (e.g., Google Analytics).
            </li>
            <li>
              <strong className="text-white">Advertising cookies</strong> — Used by our ad
              partners to serve relevant advertisements.
            </li>
          </ul>
          <p>
            You can manage your cookie preferences through your browser settings or through our
            cookie consent banner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">6. Third-Party Services</h2>
          <p>
            We may use third-party services for analytics and advertising (such as Google
            Analytics and Google AdSense). These services may collect information about your
            visits to our site in accordance with their own privacy policies. We encourage you
            to review the privacy policies of these third-party providers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">7. Data Security</h2>
          <p>
            We implement reasonable security measures to protect against unauthorized access,
            alteration, or destruction of data. However, no internet transmission is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">8. Children&apos;s Privacy</h2>
          <p>
            Our service is not directed to children under 13. We do not knowingly collect
            personal information from children under 13. If you believe we have collected such
            information, please contact us so we can take appropriate action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">9. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent for cookies at any time</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on
            this page with an updated &quot;Last updated&quot; date. Your continued use of VidGrab
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please visit our{" "}
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
