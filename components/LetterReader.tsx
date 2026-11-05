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
    <Modal onClose={onClose} label="Carta" className="max-w-2xl">
      <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-accent text-2xl text-red-deep">De {fromName}</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">
              {letter.subject || "Sin asunto"}
            </h2>
            <p className="text-xs text-ink/50">
              {new Date(letter.deliver_at).toLocaleString("es", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <Stamp id={letter.stamp} size={48} />
        </div>
        <div className="scroll-soft font-hand mt-5 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap pr-2 text-xl leading-9 text-ink">
          {letter.body}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button onClick={onClose} className="btn !bg-ink/10 !text-ink hover:!bg-ink/15">
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
