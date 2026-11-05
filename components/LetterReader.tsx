"use client";

import Modal from "./Modal";
import { Stamp } from "./Stamp";
import type { Letter } from "./Mailbox";

export default function LetterReader({
  letter,
  fromName,
  canReply,
  onClose,
  onReply,
}: {
  letter: Letter;
  fromName: string;
  canReply: boolean;
  onClose: () => void;
  onReply: () => void;
}) {
  return (
    <Modal onClose={onClose} label="Carta">
      <div className="relative p-7 sm:p-9">
        <div className="absolute right-6 top-6">
          <Stamp id={letter.stamp} size={48} />
        </div>
        <p className="font-accent text-2xl text-red-deep">De {fromName}</p>
        <h2 className="font-display mt-1 pr-16 text-2xl font-semibold">
          {letter.subject || "Sin asunto"}
        </h2>
        <p className="text-xs text-ink/50">
          {new Date(letter.deliver_at).toLocaleString("es", { dateStyle: "long", timeStyle: "short" })}
        </p>
        <div className="font-hand mt-6 whitespace-pre-wrap text-2xl leading-9 text-ink">
          {letter.body}
        </div>
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button onClick={onClose} className="btn !bg-ink/10 !text-ink">
            Cerrar
          </button>
          {canReply && (
            <button onClick={onReply} className="btn btn-red">
              Responder
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
