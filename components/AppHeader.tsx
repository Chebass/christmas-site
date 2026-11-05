import { Suspense } from "react";
import { PendingLink } from "./NavigationProvider";
import { signOut } from "@/app/actions";
import NavLinks, { type NavItem } from "./NavLinks";

const ITEMS: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/cartas", label: "Cartas" },
  { href: "/perfil", label: "Perfil" },
];

// Vive en el layout compartido: no se vuelve a montar al cambiar de módulo.
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-night/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <PendingLink
          href="/"
          className="font-display group shrink-0 text-lg font-semibold text-cream"
        >
          <span
            aria-hidden
            className="mr-1 inline-block transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125"
          >
            🎄
          </span>
          <span className="hidden sm:inline">Nuestra Navidad</span>
        </PendingLink>
        <Suspense
          fallback={
            <nav className="flex items-center gap-1">
              {ITEMS.map((it) => (
                <span key={it.href} className="px-4 py-2 text-sm font-medium text-cream/80">
                  {it.label}
                </span>
              ))}
            </nav>
          }
        >
          <NavLinks items={ITEMS} />
        </Suspense>
        <form action={signOut}>
          <button className="rounded-full px-3 py-2 text-sm text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream active:scale-95">
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
