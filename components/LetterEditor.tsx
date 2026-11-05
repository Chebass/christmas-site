"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "./Modal";
import { STAMPS } from "./Stamp";
import type { Letter } from "./Mailbox";

function localInputValue(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
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
  const [when, setWhen] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return localInputValue(d);
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return setError("Escribe algo en tu carta.");
    const deliverAt = scheduled ? new Date(when) : new Date();
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

  return (
    <Modal onClose={onClose} label="Escribir carta">
      <form onSubmit={send} className="p-7 sm:p-9">
        <p className="font-hand text-2xl text-red-deep">Querido/a {partner.display_name},</p>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto"
          maxLength={80}
          aria-label="Asunto"
          className="font-display mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-xl outline-none focus-visible:border-red"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe aquí tu carta…"
          aria-label="Contenido de la carta"
          rows={9}
          autoFocus
          className="font-hand mt-3 w-full resize-none bg-[repeating-linear-gradient(transparent,transparent_35px,rgba(43,33,24,0.12)_36px)] text-2xl leading-9 outline-none"
        />

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-medium text-ink/70">Estampilla</legend>
          <div className="flex flex-wrap gap-2">
            {STAMPS.map((s) => (
              <button
                type="button"
                key={s.id}
                aria-label={s.label}
                aria-pressed={stamp === s.id}
                onClick={() => setStamp(s.id)}
                className={`h-11 w-11 rounded-lg text-xl transition-transform active:scale-95 ${
                  stamp === s.id ? "bg-red/20 ring-2 ring-red" : "bg-ink/5"
                }`}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 rounded-2xl bg-ink/5 p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={scheduled}
              onChange={(e) => setScheduled(e.target.checked)}
              className="h-5 w-5 accent-[#b3363d]"
            />
            Programar para que se abra más adelante
          </label>
          {scheduled && (
            <input
              type="datetime-local"
              value={when}
              min={localInputValue(new Date())}
              onChange={(e) => setWhen(e.target.value)}
              aria-label="Fecha y hora de entrega"
              className="mt-3 rounded-lg border border-ink/20 bg-cream px-3 py-2 text-base"
            />
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-deep">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn !bg-ink/10 !text-ink">
            Cancelar
          </button>
          <button type="submit" disabled={sending} className="btn btn-red disabled:opacity-60">
            {sending ? "Enviando…" : scheduled ? "Programar ✉" : "Enviar ✉"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
