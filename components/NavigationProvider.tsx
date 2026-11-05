"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import {
  BoardSkeleton,
  HomeSkeleton,
  MailboxSkeleton,
  ProfileSkeleton,
} from "./Skeleton";

type Ctx = { pending: string | null; start: (href: string) => void; clear: () => void };
const NavCtx = createContext<Ctx>({ pending: null, start: () => {}, clear: () => {} });
export const useNavigationPending = () => useContext(NavCtx);

// Muestra de inmediato el skeleton del destino al hacer click,
// sin esperar la respuesta del servidor.
export function NavigationProvider({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const start = useCallback((href: string) => setPending(href), []);
  const clear = useCallback(() => setPending(null), []);
  const value = useMemo(() => ({ pending, start, clear }), [pending, start, clear]);

  // Red de seguridad si la navegación falla.
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setPending(null), 10_000);
    return () => clearTimeout(t);
  }, [pending]);

  return (
    <NavCtx.Provider value={value}>
      {header}
      {pending && <PendingPage href={pending} />}
      <div className={pending ? "hidden" : "flex flex-1 flex-col"}>{children}</div>
    </NavCtx.Provider>
  );
}

function PendingPage({ href }: { href: string }) {
  if (href.startsWith("/lista"))
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-5 sm:px-6">
        <BoardSkeleton />
      </main>
    );
  if (href.startsWith("/cartas"))
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-4">
        <MailboxSkeleton />
      </main>
    );
  if (href.startsWith("/perfil")) return <ProfileSkeleton />;
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-12 px-5 pb-16 pt-10 text-center">
      <HomeSkeleton withCountdown />
    </main>
  );
}

export function PendingLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const { start } = useNavigationPending();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        const target = typeof href === "string" ? href : (href.pathname ?? "/");
        const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
        if (!modified && !e.defaultPrevented && window.location.pathname !== target) {
          start(target);
        }
      }}
      {...props}
    />
  );
}
