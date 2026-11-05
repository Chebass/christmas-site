import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import Countdown from "@/components/Countdown";
import ListCard from "@/components/ListCard";

async function Cards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url");

  const me = profiles?.find((p) => p.id === user.id);
  // Primer ingreso: pedir nombre y foto.
  if (!me?.avatar_url) redirect("/perfil");

  const ordered = [me, ...(profiles ?? []).filter((p) => p.id !== user.id)];

  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-10">
      {ordered.map((p, i) => (
        <ListCard
          key={p.id}
          id={p.id}
          name={p.display_name}
          avatarUrl={p.avatar_url}
          mine={p.id === user.id}
          index={i}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-10 px-5 pb-16 pt-6 text-center">
        <div>
          <p className="font-hand text-3xl text-gold">Faltan para Navidad</p>
          <div className="mt-3 flex justify-center">
            <Countdown />
          </div>
        </div>
        <Suspense fallback={<div className="h-72" />}>
          <Cards />
        </Suspense>
      </main>
    </>
  );
}
