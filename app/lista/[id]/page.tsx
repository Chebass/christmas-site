import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import PapeloteLoader from "@/components/PapeloteLoader";
import Avatar from "@/components/Avatar";

async function Board({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: list }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url").eq("id", id).maybeSingle(),
    supabase.from("wishlists").select("snapshot").eq("owner_id", id).maybeSingle(),
  ]);
  if (!profile) notFound();

  const mine = id === user.id;

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Avatar src={profile.avatar_url} name={profile.display_name} size={44} />
        <div className="leading-tight">
          <h1 className="font-display text-2xl font-semibold">
            {mine ? "Mi lista de deseos" : `Lista de ${profile.display_name}`}
          </h1>
          <p className="font-hand text-xl text-gold">
            {mine ? "Se guarda sola mientras escribes" : "Solo lectura · se actualiza en vivo"}
          </p>
        </div>
      </div>
      {/* Marco tipo carta aérea: borde de rayas rojas y azules */}
      <div className="airmail-frame relative h-[calc(100dvh-13rem)] min-h-[420px] w-full rounded-2xl p-3 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)]">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-paper">
          <PapeloteLoader
            ownerId={id}
            readOnly={!mine}
            initialDocument={list?.snapshot ?? null}
          />
        </div>
      </div>
    </>
  );
}

export default function ListaPage(props: PageProps<"/lista/[id]">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-5 sm:px-6">
        <Suspense fallback={<div className="p-8 font-hand text-2xl text-gold">Abriendo…</div>}>
          <Board params={props.params} />
        </Suspense>
      </main>
    </>
  );
}
