import { Suspense } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import NavLinks, { type NavItem } from "./NavLinks";

async function Links() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profiles } = await supabase.from("profiles").select("id, display_name");

  const items: NavItem[] = [{ href: "/", label: "Inicio" }];
  const mine = profiles?.find((p) => p.id === user?.id);
  const other = profiles?.find((p) => p.id !== user?.id);
  if (mine) items.push({ href: `/lista/${mine.id}`, label: "Mi lista" });
  if (other) items.push({ href: `/lista/${other.id}`, label: `Lista de ${other.display_name}` });
  items.push({ href: "/cartas", label: "Cartas" }, { href: "/perfil", label: "Perfil" });
  return <NavLinks items={items} />;
}

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-night/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display shrink-0 text-lg font-semibold text-cream">
          <span aria-hidden className="mr-1">🎄</span>
          <span className="hidden sm:inline">Nuestra Navidad</span>
        </Link>
        <div className="min-w-0 flex-1 overflow-x-auto sm:flex sm:justify-center">
          <Suspense fallback={<div className="h-9" />}>
            <Links />
          </Suspense>
        </div>
        <form action={signOut}>
          <button className="rounded-full px-3 py-2 text-sm text-cream/60 transition-colors hover:text-cream">
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
