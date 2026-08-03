import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, status, analysis")
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

  const { data: signed } = await supabase.storage
    .from("selfies")
    .createSignedUrl(photo.storage_path, 3600);

  return (
    <AnalysisReveal imageUrl={signed?.signedUrl ?? ""} analysis={photo.analysis} />
  );
}
