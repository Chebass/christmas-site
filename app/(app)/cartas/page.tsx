import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import Mailbox, { type Letter } from "@/components/Mailbox";
import { MailboxSkeleton } from "@/components/Skeleton";

async function Data() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/login");

  const [{ data: profiles }, { data: inbox }, { data: sent }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url"),
    supabase.rpc("my_inbox"),
    supabase
      .from("letters")
      .select("id, recipient_id, subject, body, stamp, reply_to_id, deliver_at, opened_at")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const partner = profiles?.find((p) => p.id !== user.id) ?? null;

  return (
    <Mailbox
      meId={user.id}
      partner={partner}
      inbox={(inbox ?? []) as Letter[]}
      sent={(sent ?? []) as Letter[]}
    />
  );
}

export default function CartasPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-4">
      <Suspense fallback={<MailboxSkeleton />}>
        <Data />
      </Suspense>
    </main>
  );
}
