import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href="/" className="btn glass !px-4 !py-2 text-sm">
          ← Volver
        </Link>
        <Avatar src={profile.avatar_url} name={profile.display_name} size={40} />
        <div className="leading-tight">
          <h1 className="font-display text-lg font-semibold">
            {mine ? "Mi lista de deseos" : `Lista de ${profile.display_name}`}
          </h1>
          <p className="text-xs text-cream/60">
            {mine ? "Se guarda sola mientras escribes" : "Solo lectura · se actualiza en vivo"}
          </p>
        </div>
      </header>
      <div className="relative flex-1">
        <PapeloteLoader
          ownerId={id}
          readOnly={!mine}
          initialDocument={list?.snapshot ?? null}
        />
      </div>
    </>
  );
}

export default function ListaPage(props: PageProps<"/lista/[id]">) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<div className="p-8 font-hand text-2xl text-gold">Abriendo…</div>}>
        <Board params={props.params} />
      </Suspense>
    </main>
  );
}
