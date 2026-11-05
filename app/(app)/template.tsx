"use client";

import { useEffect } from "react";
import { useNavigationPending } from "@/components/NavigationProvider";

// Se monta cuando la nueva ruta ya está lista: retira el skeleton inmediato.
export default function Template({ children }: { children: React.ReactNode }) {
  const { clear } = useNavigationPending();
  useEffect(() => {
    clear();
  }, [clear]);
  return <div className="flex flex-1 flex-col">{children}</div>;
}
