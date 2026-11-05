import { Suspense } from "react";
import { PendingLink } from "@/components/NavigationProvider";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PapeloteLoader from "@/components/PapeloteLoader";
import Avatar from "@/components/Avatar";
import { BoardSkeleton } from "@/components/Skeleton";

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
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <PendingLink
          href="/"
          className="btn glass glass-hover !px-4 !py-2 text-sm"
        >
          <span aria-hidden>←</span> Inicio
        </PendingLink>
        <div className="flex items-center gap-3">
          <Avatar src={profile.avatar_url} name={profile.display_name} size={44} />
          <div className="leading-tight">
            <h1 className="font-display text-2xl font-semibold">
              {mine ? "Mi lista de deseos" : `Lista de ${profile.display_name}`}
            </h1>
            <p className="font-accent text-lg text-gold">
              {mine ? "Se guarda sola mientras escribes" : "Solo lectura · se actualiza en vivo"}
            </p>
          </div>
        </div>
      </div>
      {/* Papel sujeto con cinta sobre un marco de fieltro verde con filo dorado */}
      <div className="board-frame relative h-[calc(100dvh-13rem)] min-h-[420px] w-full rounded-[1.4rem] p-4">
        <span aria-hidden className="washi -left-3 top-5 -rotate-45" />
        <span aria-hidden className="washi -right-3 top-5 rotate-45" />
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-paper shadow-[inset_0_0_0_1px_rgba(43,33,24,0.15),inset_0_6px_24px_rgba(43,33,24,0.12)]">
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-5 sm:px-6">
      <Suspense fallback={<BoardSkeleton />}>
        <Board params={props.params} />
      </Suspense>
    </main>
  );
}
