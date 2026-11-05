import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import { ProfileSkeleton } from "@/components/Skeleton";

async function Profile() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex flex-1 flex-col">
      <ProfileForm
        uid={user.id}
        initialName={data?.display_name ?? ""}
        initialAvatarUrl={data?.avatar_url ?? null}
      />
    </main>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
}