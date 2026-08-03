import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserState } from "@/lib/user-state";
import UploadForm from "@/components/dashboard/upload/UploadForm";

export default async function UploadPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getUserState(supabase, user.id);

  return (
    <div>
      {state.hasAnalysis && state.latestPhotoId && (
        <div className="max-w-xl mx-auto mb-6 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-sm text-cream-ivory/70">
            You already have a saved analysis.
          </p>
          <Link
            href={`/dashboard/upload/${state.latestPhotoId}`}
            className="text-sm font-medium text-lumen-gold hover:underline underline-offset-4 flex-shrink-0"
          >
            View it →
          </Link>
        </div>
      )}
      <UploadForm />
    </div>
  );
}
