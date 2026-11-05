import Link from "next/link";
import { signOut } from "@/app/actions";

export default function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <Link href="/" className="font-display text-xl font-semibold text-cream">
        Nuestra Navidad
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/cartas" className="btn btn-gold !px-4 !py-2">
          Cartas
        </Link>
        <Link href="/perfil" className="px-3 py-2 text-cream/80 hover:text-cream">
          Perfil
        </Link>
        <form action={signOut}>
          <button className="px-3 py-2 text-cream/60 hover:text-cream">Salir</button>
        </form>
      </nav>
    </header>
  );
}
