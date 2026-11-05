"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Envelope from "./Envelope";
import LetterEditor from "./LetterEditor";
import LetterReader from "./LetterReader";

export type Letter = {
  id: string;
  sender_id?: string;
  recipient_id?: string;
  subject: string | null;
  body: string | null;
  stamp: string;
  reply_to_id: string | null;
  deliver_at: string;
  opened_at: string | null;
  sealed?: boolean;
};
type Partner = { id: string; display_name: string; avatar_url: string | null } | null;

export default function Mailbox({
  meId,
  partner,
  inbox,
  sent,
}: {
  meId: string;
  partner: Partner;
  inbox: Letter[];
  sent: Letter[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [reading, setReading] = useState<{ letter: Letter; mine: boolean } | null>(null);
  const [writing, setWriting] = useState<{ replyTo?: Letter } | null>(null);

  // Refresca cuando llega una carta nueva o se entrega una programada.
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("letters-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "letters" }, () =>
        router.refresh(),
      )
      .subscribe();
    const poll = setInterval(() => router.refresh(), 60_000); // entrega programada
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [router]);

  const list = tab === "inbox" ? inbox : sent;
  const unread = useMemo(() => inbox.filter((l) => !l.sealed && !l.opened_at).length, [inbox]);

  async function open(letter: Letter, mine: boolean) {
    if (!mine && !letter.sealed && !letter.opened_at) {
      await createClient().rpc("open_letter", { letter_id: letter.id });
      router.refresh();
    }
    if (!letter.sealed) setReading({ letter, mine });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="font-hand text-3xl text-gold">Nuestro buzón</p>
          <h1 className="font-display text-4xl font-semibold">Cartas</h1>
        </div>
        <button
          className="btn btn-red"
          disabled={!partner}
          onClick={() => setWriting({})}
        >
          ✉ Escribir carta
        </button>
      </div>

      <div className="glass inline-flex rounded-full p-1 text-sm" role="tablist">
        {(["inbox", "sent"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              tab === t ? "bg-gold text-ink" : "text-cream/80"
            }`}
          >
            {t === "inbox" ? `Recibidas${unread ? ` (${unread})` : ""}` : "Enviadas"}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {list.map((l, i) => (
            <motion.li
              key={`${tab}-${l.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <Envelope
                letter={l}
                mine={tab === "sent"}
                partnerName={partner?.display_name ?? ""}
                onOpen={() => open(l, tab === "sent")}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {list.length === 0 && (
        <p className="font-hand mt-10 text-center text-2xl text-cream/60">
          {tab === "inbox" ? "Aún no hay cartas por aquí…" : "Todavía no has enviado ninguna."}
        </p>
      )}

      <AnimatePresence>
        {reading && (
          <LetterReader
            key="reader"
            letter={reading.letter}
            fromName={reading.mine ? "Tú" : partner?.display_name ?? ""}
            canReply={!reading.mine}
            onClose={() => setReading(null)}
            onReply={() => {
              const l = reading.letter;
              setReading(null);
              setWriting({ replyTo: l });
            }}
          />
        )}
        {writing && partner && (
          <LetterEditor
            key="editor"
            meId={meId}
            partner={partner}
            replyTo={writing.replyTo}
            onClose={() => setWriting(null)}
            onSent={() => {
              setWriting(null);
              setTab("sent");
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
