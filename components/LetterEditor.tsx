"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import SchedulePicker from "./SchedulePicker";
import { STAMPS } from "./Stamp";
import type { Letter } from "./Mailbox";

function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export default function LetterEditor({
  meId,
  partner,
  replyTo,
  onClose,
  onSent,
}: {
  meId: string;
  partner: { id: string; display_name: string };
  replyTo?: Letter;
  onClose: () => void;
  onSent: () => void;
}) {
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject ?? ""}`.trim() : "");
  const [body, setBody] = useState("");
  const [stamp, setStamp] = useState("estrella");
  const [scheduled, setScheduled] = useState(false);
  const [when, setWhen] = useState(defaultDate);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return setError("Escribe algo en tu carta.");
    const deliverAt = scheduled ? when : new Date();
    if (scheduled && deliverAt.getTime() <= Date.now() + 60_000)
      return setError("Elige una fecha y hora futuras.");

    setSending(true);
    setError(null);
    const { error } = await createClient().from("letters").insert({
      sender_id: meId,
      recipient_id: partner.id,
      subject: subject.trim(),
      body: body.trim(),
      stamp,
      reply_to_id: replyTo?.id ?? null,
      deliver_at: deliverAt.toISOString(),
    });
    if (error) {
      setError("No se pudo enviar la carta. Intenta de nuevo.");
      setSending(false);
      return;
    }
    onSent();
  }

  const whenLabel = when.toLocaleString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal onClose={onClose} label="Escribir carta" className="max-w-3xl">
      <form onSubmit={send} className="flex min-h-0 flex-1 flex-col p-6 sm:p-8">
        <p className="font-accent text-2xl text-red-deep">Para {partner.display_name},</p>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto de la carta"
          maxLength={80}
          aria-label="Asunto"
          className="font-display mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-xl outline-none transition-colors placeholder:font-accent placeholder:text-ink/35 focus-visible:border-red"
        />

        {/* Solo esta zona hace scroll */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Querida mía, hoy quería contarte…"
          aria-label="Contenido de la carta"
          autoFocus
          className="scroll-soft font-hand mt-3 min-h-[110px] w-full flex-1 resize-none bg-[linear-gradient(transparent_35px,rgba(43,33,24,0.13)_36px)] bg-[length:100%_36px] bg-local pr-2 text-xl leading-9 outline-none placeholder:font-accent placeholder:text-ink/35"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Estampilla</legend>
            <span className="font-accent mr-1 text-lg text-red-deep" aria-hidden>
              Estampilla
            </span>
            {STAMPS.map((s) => (
              <button
                type="button"
                key={s.id}
                aria-label={s.label}
                aria-pressed={stamp === s.id}
                onClick={() => setStamp(s.id)}
                className={`h-10 w-10 rounded-lg text-lg transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 active:scale-90 ${
                  stamp === s.id ? "bg-red/20 ring-2 ring-red" : "bg-ink/5 hover:bg-ink/10"
                }`}
              >
                {s.emoji}
              </button>
            ))}
          </fieldset>

          <button
            type="button"
            role="switch"
            aria-checked={scheduled}
            onClick={() => setScheduled((v) => !v)}
            className="group flex items-center gap-3 text-sm font-medium"
          >
            <span
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                scheduled ? "bg-red" : "bg-ink/20"
              }`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 600, damping: 32 }}
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow ${
                  scheduled ? "right-0.5" : "left-0.5"
                }`}
              />
            </span>
            Programar entrega
          </button>
        </div>

        <AnimatePresence initial={false}>
          {scheduled && (
            <motion.div
              key="schedule"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl bg-ink/5 p-3">
                <p className="font-accent mb-1 text-center text-lg capitalize text-red-deep">
                  Se abrirá el {whenLabel}
                </p>
                <SchedulePicker value={when} onChange={setWhen} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-deep">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn !bg-ink/10 !text-ink hover:!bg-ink/15">
            Cancelar
          </button>
          <button type="submit" disabled={sending} className="btn btn-red disabled:opacity-60">
            {sending ? "Enviando…" : scheduled ? "Programar" : "Enviar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
