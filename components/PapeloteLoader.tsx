"use client";

import dynamic from "next/dynamic";

const Papelote = dynamic(() => import("./Papelote"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-hand text-3xl text-gold">
      Desenrollando el papelote…
    </div>
  ),
});

export default Papelote;
