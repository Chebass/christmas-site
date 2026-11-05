"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PendingLink, useNavigationPending } from "./NavigationProvider";

export type NavItem = { href: string; label: string };

export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { pending } = useNavigationPending();
  const current = pending ?? pathname; // el destino se marca al instante

  return (
    <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Principal">
      {items.map((it) => {
        const active = it.href === "/" ? current === "/" : current.startsWith(it.href);
        return (
          <PendingLink
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-[color,background-color,transform] duration-200 active:scale-95 ${
              active
                ? "text-ink"
                : "text-cream/80 hover:bg-cream/10 hover:text-gold"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-full bg-gold"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{it.label}</span>
          </PendingLink>
        );
      })}
    </nav>
  );
}