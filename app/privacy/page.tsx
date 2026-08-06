import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-pure-black px-6 py-16 [padding-top:max(4rem,env(safe-area-inset-top))]">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-cream-ivory/60 hover:text-lumen-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-3">
          Legal
        </p>
        <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
          Privacy Policy
        </h1>
        <p className="font-inter text-base text-cream-ivory/60 mt-6 leading-relaxed">
          This page is a placeholder. Our full privacy policy is coming soon — in the
          meantime, questions about how your data is handled can be sent to{" "}
          <a
            href="mailto:support@lumanova.app"
            className="text-lumen-gold hover:underline underline-offset-4"
          >
            support@lumanova.app
          </a>
          .
        </p>
      </div>
    </main>
  );
}
