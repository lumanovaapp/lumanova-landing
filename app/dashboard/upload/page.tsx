import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Scissors, Shirt, Sparkles, Wind, LucideIcon } from "lucide-react";
import { createClient, getUser } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import UploadForm from "@/components/dashboard/upload/UploadForm";

const WHAT_HAPPENS_NEXT = [
  "Upload a clear, well-lit selfie",
  "Our AI scans your skin, hair, grooming & style",
  "Get a personalized breakdown in under 20 seconds",
];

const WHAT_WE_ANALYZE: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: Sparkles, label: "Skin", desc: "Tone, texture & clarity" },
  { icon: Scissors, label: "Hair", desc: "Style, health & fit" },
  { icon: Wind, label: "Facial hair & grooming", desc: "Shape & upkeep" },
  { icon: Shirt, label: "Style & presentation", desc: "Fit & first impression" },
];

export default async function UploadPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getUserState(supabase, user.id);

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70">
        Step 1
      </p>
      <h1 className="mt-3 font-manrope leading-tight text-3xl sm:text-4xl">
        <span className="font-light text-cream-ivory/80">Upload a </span>
        <span className="font-extrabold text-lumen-gold">selfie</span>
      </h1>
      <p className="mt-3 max-w-xl font-inter text-base text-cream-ivory/55">
        Good lighting, no filters, face clearly visible. We&apos;ll analyze
        your skin, hair, grooming, and style.
      </p>

      {state.hasAnalysis && state.latestPhotoId && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-lumen-gold/20 bg-gradient-to-br from-lumen-gold/[0.07] to-transparent px-5 py-4">
          <p className="text-sm text-cream-ivory/70">
            You already have a saved analysis.
          </p>
          <Link
            href={`/dashboard/upload/${state.latestPhotoId}`}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-lumen-gold hover:underline underline-offset-4 focus-gold"
          >
            View it
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 lg:gap-10 items-start">
        {/* Explainer panel — what happens next / what we analyze */}
        <div className="order-2 lg:order-1 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-3xl shadow-[0_2px_4px_rgba(0,0,0,.3),0_16px_32px_rgba(0,0,0,.35)] p-6 sm:p-7">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-4">
            What happens next
          </p>
          <ol className="space-y-4">
            {WHAT_HAPPENS_NEXT.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-lumen-gold/10 border border-lumen-gold/20 text-lumen-gold text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-cream-ivory/70 leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <div className="h-px bg-white/[0.08] my-6" />

          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-lumen-gold/70 mb-4">
            What we analyze
          </p>
          <div className="space-y-3">
            {WHAT_WE_ANALYZE.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-lumen-gold/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-lumen-gold" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cream-ivory">
                    {label}
                  </p>
                  <p className="text-xs text-cream-ivory/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <UploadForm />
        </div>
      </div>
    </div>
  );
}
