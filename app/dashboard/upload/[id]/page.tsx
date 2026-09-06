import { redirect, notFound } from "next/navigation";
import { createClient, getUser } from "@/utils/supabase/server";
import AnalyzingStatus from "@/components/dashboard/upload/AnalyzingStatus";
import RetryAnalysis from "@/components/dashboard/upload/RetryAnalysis";
import AnalysisReveal from "@/components/AnalysisReveal";

interface UploadResultPageProps {
  params: { id: string };
}

export default async function UploadResultPage({
  params,
}: UploadResultPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, status, analysis, photo_type")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!photo) {
    notFound();
  }

  if (photo.status === "analyzing") {
    return <AnalyzingStatus />;
  }

  if (photo.status === "failed" || !photo.analysis) {
    return <RetryAnalysis photoId={photo.id} />;
  }

  // Independent of each other — fetched together instead of one after the
  // other now that both only depend on `photo`, not on each other.
  const [{ data: signed }, { data: planRow }] = await Promise.all([
    supabase.storage.from("selfies").createSignedUrl(photo.storage_path, 3600),
    // Milestone photos (day_30/60/90) never reach here in practice — they
    // never get an `analysis` written (only a baseline/comparison), so
    // they'd already have been caught by the !photo.analysis check above.
    // Checked explicitly anyway so the "update your plan?" prompt's
    // condition is self-evidently correct without relying on that
    // indirection.
    photo.photo_type
      ? Promise.resolve({ data: null })
      : supabase.from("plans").select("plan_json").eq("user_id", user.id).maybeSingle(),
  ]);

  const hasPlan = !!planRow;
  // Only offer to update when this analysis hasn't already been folded into
  // the current plan — plan_json.source_photo_id is stamped by
  // /api/generate-plan on every (re)generation, so re-visiting an analysis
  // that already produced the current plan (e.g. via the upload page's
  // "View it" link) won't re-prompt for no reason.
  const offerPlanUpdate =
    hasPlan && planRow.plan_json.source_photo_id !== photo.id;

  return (
    <AnalysisReveal
      imageUrl={signed?.signedUrl ?? ""}
      analysis={photo.analysis}
      hasPlan={hasPlan}
      offerPlanUpdate={offerPlanUpdate}
    />
  );
}
