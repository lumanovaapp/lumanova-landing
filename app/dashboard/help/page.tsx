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
    <div className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-lumen-gold font-medium mb-3">
        Help
      </p>
      <h1 className="font-manrope font-bold text-3xl sm:text-4xl text-cream-ivory leading-tight">
        How Lumanova works
      </h1>
      <p className="font-inter text-base text-cream-ivory/70 mt-2">
        A quick overview of the whole loop, plus answers to common questions.
      </p>

      {/* How it works */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-lumen-gold/10 flex items-center justify-center sm:mb-3">
                <Icon className="w-5 h-5 text-lumen-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cream-ivory/40 font-semibold sm:mb-1">
                  Step {i + 1}
                </p>
                <h3 className="font-manrope font-semibold text-sm text-cream-ivory">
                  {title}
                </h3>
                <p className="text-xs text-cream-ivory/60 mt-1 leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Replay tour */}
      <div className="mt-8 rounded-2xl border border-lumen-gold/20 bg-lumen-gold/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-manrope font-semibold text-cream-ivory">
            Want the guided tour again?
          </h2>
          <p className="text-sm text-cream-ivory/60 mt-1">
            Walk back through the streak, habits, calendar, upload, coach,
            achievements, and milestones — wherever you left off.
          </p>
        </div>
        <ReplayTourButton />
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="font-manrope font-bold text-xl text-cream-ivory mb-4">
          Frequently asked questions
        </h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </div>

      {/* Contact */}
      <div className="mt-10 mb-4 rounded-2xl border border-white/10 bg-white/5 p-6 flex items-center gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-lumen-gold/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-lumen-gold" />
        </div>
        <div>
          <h2 className="font-manrope font-semibold text-cream-ivory">
            Still need help?
          </h2>
          <p className="text-sm text-cream-ivory/60 mt-1">
            Email us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-lumen-gold hover:underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            and we&apos;ll get back to you.
          </p>
        </div>
      </div>
    </div>
  );
}
