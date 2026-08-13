import { Camera, FileText, CheckSquare, Star, MessageCircle, Trophy, Mail } from "lucide-react";
import FaqAccordion, { FaqEntry } from "@/components/dashboard/help/FaqAccordion";
import ReplayTourButton from "@/components/dashboard/help/ReplayTourButton";

const SUPPORT_EMAIL = "support@lumanova.app";

const HOW_IT_WORKS = [
  {
    icon: Camera,
    title: "Scan",
    body: "Upload a selfie and our AI analyzes your skin, hair, facial hair, and style.",
  },
  {
    icon: FileText,
    title: "Plan",
    body: "That analysis becomes a personalized 90-day plan with three phases.",
  },
  {
    icon: CheckSquare,
    title: "Daily Habits",
    body: "Check off a handful of small habits each day to build your streak.",
  },
  {
    icon: Star,
    title: "Milestones",
    body: "At day 30, 60, and 90, upload a progress photo to see how far you've come.",
  },
  {
    icon: MessageCircle,
    title: "Coach",
    body: "Ask your AI coach anything, grounded in your own analysis and plan.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    body: "Unlock badges as you build streaks, stay consistent, and hit your milestone photos.",
  },
];

const FAQ_ITEMS: FaqEntry[] = [
  {
    question: "How does the analysis work?",
    answer:
      "You upload a selfie and our AI looks at your skin, hair, facial hair/grooming, and style — the same way a coach would. It gives specific, actionable feedback and never rates attractiveness or gives a score. If something looks like it might need medical attention, it'll gently suggest seeing a professional instead of guessing.",
  },
  {
    question: "Is my photo private?",
    answer:
      "Yes. Your photos are stored securely and tied to your account only — they're used to generate your analysis, your plan, and milestone comparisons, and aren't shared with anyone else or used to train anything beyond your own results.",
  },
  {
    question: "How do streaks and freezes work?",
    answer:
      "Every day you check off your active habits, your streak goes up. Miss a day and it normally resets — but you can earn up to two streak freezes, which automatically cover an occasional missed day so one bad day doesn't wipe out your progress.",
  },
  {
    question: "What are milestones?",
    answer:
      "Milestones are check-in points at day 30, 60, and 90 of your plan. You upload a fresh selfie, and the AI compares it against your baseline photo to call out real improvements, what to keep working on, and what to focus on next.",
  },
  {
    question: "Can I redo my analysis or plan?",
    answer:
      "Yes — you can upload a new photo any time from the Upload Photo page to get a fresh analysis. If an analysis or plan ever fails to generate, you'll see a retry option in place, so you don't have to start over.",
  },
  {
    question: "What happens if I miss a habit?",
    answer:
      "Nothing drastic — missing a single habit on a given day just means that day doesn't count as fully \"done.\" Your streak is based on completing all of that day's active habits, and a freeze can cover you if you miss a whole day here and there.",
  },
  {
    question: "Does the AI Coach remember my history?",
    answer:
      "The coach is grounded in your latest analysis, your current plan phase, and your streak, plus recent messages in the conversation — so it can reference things like \"since your analysis flagged T-zone oil...\" instead of starting from scratch every time.",
  },
  {
    question: "Can I delete my data?",
    answer:
      `We don't have self-serve deletion built yet. If you'd like your account or data removed, email us at ${SUPPORT_EMAIL} and we'll take care of it.`,
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
      {/* Asymmetric split — sticky intro column (header + secondary actions)
          alongside a wider content column (how-it-works + FAQ), the same
          pattern HowItWorks.tsx uses on the landing page. This replaces the
          old centered max-w-3xl strip: the FAQ copy still gets a capped
          reading measure below, but the page uses the full width instead of
          leaving dead margins on wide screens. */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
        {/* Left: header + secondary actions, sticky on desktop */}
        <div className="lg:sticky lg:top-28">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-4">
            Help
          </p>
          <h1 className="font-manrope leading-[1.1] tracking-[-0.02em] text-3xl sm:text-4xl lg:text-3xl mb-4">
            <span className="font-light text-cream-ivory/80">How Lumanova</span>{" "}
            <span className="font-extrabold text-lumen-gold">works.</span>
          </h1>
          <p className="text-sm text-cream-ivory/55 leading-relaxed mb-8">
            A quick overview of the whole loop, plus answers to common
            questions.
          </p>

          <div className="flex flex-col gap-4">
            {/* Replay tour */}
            <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)]">
              <h2 className="font-manrope font-semibold text-sm text-cream-ivory">
                Want the guided tour again?
              </h2>
              <p className="text-xs text-cream-ivory/55 mt-2 leading-relaxed">
                Walk back through the streak, habits, calendar, upload,
                coach, achievements, and milestones — wherever you left off.
              </p>
              <div className="mt-5">
                <ReplayTourButton />
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)]">
              <div className="w-10 h-10 rounded-xl bg-lumen-gold/10 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-lumen-gold" />
              </div>
              <h2 className="font-manrope font-semibold text-sm text-cream-ivory">
                Still need help?
              </h2>
              <p className="text-xs text-cream-ivory/55 mt-2 leading-relaxed">
                Email us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-lumen-gold hover:underline underline-offset-4 focus-gold"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                and we&apos;ll get back to you.
              </p>
            </div>
          </div>
        </div>

        {/* Right: how-it-works spec sheet + FAQ */}
        <div className="min-w-0">
          {/* How it works — vertical spec-sheet, using the full column width
              since it's short scannable rows, not long-form copy. */}
          <section>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
              The Loop
            </p>
            <div className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
              {HOW_IT_WORKS.map(({ icon: Icon, title, body }, i) => (
                <div
                  key={title}
                  className="group flex items-start gap-4 sm:gap-5 py-5 hover:bg-lumen-gold/[0.02] transition-colors duration-200 -mx-4 px-4"
                >
                  <span className="hidden sm:block font-manrope font-extrabold text-2xl text-lumen-gold/25 group-hover:text-lumen-gold/40 transition-colors duration-200 w-8 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-lumen-gold/10 border border-lumen-gold/20 flex items-center justify-center group-hover:bg-lumen-gold/15 group-hover:border-lumen-gold/35 transition-all duration-200">
                    <Icon className="w-5 h-5 text-lumen-gold" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-manrope font-semibold text-sm text-cream-ivory">
                      {title}
                    </h3>
                    <p className="text-sm text-cream-ivory/55 mt-1 leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ — capped to a ~65-75ch reading measure even though the
              column itself is wide, per typography best practice for Q&A. */}
          <section className="mt-14 max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-3">
              FAQ
            </p>
            <h2 className="font-manrope font-bold text-xl text-cream-ivory mb-6">
              Frequently asked questions
            </h2>
            <FaqAccordion items={FAQ_ITEMS} />
          </section>
        </div>
      </div>
    </div>
  );
}
