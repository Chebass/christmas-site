"use client";

import { motion } from "framer-motion";
import type { Letter } from "./Mailbox";
import { Stamp } from "./Stamp";

function fmt(d: string) {
  return new Date(d).toLocaleString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Envelope({
  letter,
  mine,
  partnerName,
  onOpen,
}: {
  letter: Letter;
  mine: boolean;
  partnerName: string;
  onOpen: () => void;
}) {
  const sealed = letter.sealed || (mine && new Date(letter.deliver_at) > new Date());
  const unread = !mine && !sealed && !letter.opened_at;

  return (
    <motion.button
      onClick={onOpen}
      disabled={!!letter.sealed}
      whileHover={letter.sealed ? undefined : { y: -4 }}
      whileTap={letter.sealed ? undefined : { scale: 0.98 }}
      className="relative block w-full rounded-2xl bg-paper p-5 pt-16 text-left text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] disabled:cursor-default"
    >
      {/* solapa del sobre */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-14 rounded-t-2xl bg-[#e8d5a9]"
        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
      />
      <span
        aria-hidden
        className={`absolute left-1/2 top-9 h-6 w-6 -translate-x-1/2 rounded-full ring-2 ring-red-deep ${
          sealed ? "bg-red-deep" : "bg-red"
        }`}
      />
      <div className="absolute right-3 top-3">
        <Stamp id={letter.stamp} size={34} />
      </div>
      {unread && (
        <span className="absolute left-3 top-3 rounded-full bg-red px-2 py-0.5 text-xs font-semibold text-cream">
          Nueva
        </span>
      )}

      <p className="font-accent text-xl text-red-deep">
        {mine ? `Para ${partnerName}` : `De ${partnerName}`}
      </p>
      <p className="font-display mt-1 truncate text-lg font-semibold">
        {letter.sealed ? "Carta sellada 🔒" : letter.subject || "Sin asunto"}
      </p>
      <p className="mt-1 text-xs text-ink/60">
        {letter.sealed
          ? `Se abrirá el ${fmt(letter.deliver_at)}`
          : sealed
            ? `Programada para el ${fmt(letter.deliver_at)}`
            : fmt(letter.deliver_at)}
      </p>
    </motion.button>
  );
}
