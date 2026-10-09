import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicyPage() {
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
          Refund Policy
        </h1>
        <p className="font-inter text-base text-cream-ivory/60 mt-6 leading-relaxed">
          We want you to feel confident subscribing to Lumanova. This policy explains how
          cancellations and refunds work in plain terms.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-manrope font-semibold text-lg text-cream-ivory mb-3">
              Free analysis
            </h2>
            <p className="font-inter text-base text-cream-ivory/60 leading-relaxed">
              Your initial analysis is completely free — no payment method is required and
              you will never be charged for it. Charges only ever begin if and when you
              choose to subscribe to a paid plan.
            </p>
          </section>

          <section>
            <h2 className="font-manrope font-semibold text-lg text-cream-ivory mb-3">
              Cancelling your subscription
            </h2>
            <p className="font-inter text-base text-cream-ivory/60 leading-relaxed">
              You can cancel your subscription at any time from your account settings, with
              no cancellation fees and no need to contact support. When you cancel, your
              access continues until the end of your current billing period, and you will
              not be charged again after that.
            </p>
          </section>

          <section>
            <h2 className="font-manrope font-semibold text-lg text-cream-ivory mb-3">
              Refund eligibility
            </h2>
            <p className="font-inter text-base text-cream-ivory/60 leading-relaxed">
              If you're not satisfied with your subscription, we'll consider refund requests
              made within 7 days of your initial purchase. Requests outside this window, or
              for renewal charges on a subscription you did not cancel in time, are
              evaluated on a case-by-case basis but are not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="font-manrope font-semibold text-lg text-cream-ivory mb-3">
              How to request a refund
            </h2>
            <p className="font-inter text-base text-cream-ivory/60 leading-relaxed">
              To request a refund, email{" "}
              <a
                href="mailto:support@lumanova.app"
                className="text-lumen-gold hover:underline underline-offset-4"
              >
                support@lumanova.app
              </a>{" "}
              from the address on your account, including the email you used to sign up and
              the approximate date of purchase. We aim to respond to every request within
              2 business days, and approved refunds are returned to your original payment
              method.
            </p>
          </section>

          <section>
            <h2 className="font-manrope font-semibold text-lg text-cream-ivory mb-3">
              Questions
            </h2>
            <p className="font-inter text-base text-cream-ivory/60 leading-relaxed">
              If anything here is unclear, reach out to{" "}
              <a
                href="mailto:support@lumanova.app"
                className="text-lumen-gold hover:underline underline-offset-4"
              >
                support@lumanova.app
              </a>{" "}
              — we're happy to help before you decide to subscribe.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
