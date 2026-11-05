"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tldraw,
  getSnapshot,
  loadSnapshot,
  type Editor,
  type TLAssetStore,
} from "tldraw";
import "tldraw/tldraw.css";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";

type Props = {
  ownerId: string;
  readOnly: boolean;
  initialDocument: unknown | null;
};

export default function Papelote({ ownerId, readOnly, initialDocument }: Props) {
  const [supabase] = useState(createClient);
  const editorRef = useRef<Editor | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Las imágenes se guardan en Storage y el snapshot solo lleva la URL.
  const [assets] = useState<TLAssetStore>(() => ({
    async upload(_asset, file) {
      const blob = await resizeImage(file, 1600, 0.82);
      const path = `${ownerId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("wish-assets")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      return {
        src: supabase.storage.from("wish-assets").getPublicUrl(path).data.publicUrl,
      };
    },
    resolve: (asset) => asset.props.src,
  }));

  function onMount(editor: Editor) {
    editorRef.current = editor;
    editor.user.updateUserPreferences({ colorScheme: "light" });

    if (initialDocument) {
      loadSnapshot(editor.store, { document: initialDocument } as never);
    }
    editor.updateInstanceState({ isReadonly: readOnly });

    if (readOnly) return;

    // Autoguardado (dueño) con debounce.
    let timer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    const save = () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
      setStatus("saving");
      timer = setTimeout(async () => {
        const { document } = getSnapshot(editor.store);
        const { error } = await supabase.from("wishlists").upsert({
          owner_id: ownerId,
          snapshot: document,
          updated_at: new Date().toISOString(),
        });
        setStatus(error ? "error" : "saved");
        hideTimer = setTimeout(() => setStatus("idle"), 2200);
      }, 1200);
    };
    const stop = editor.store.listen(save, { scope: "document", source: "user" });
    return () => {
      clearTimeout(timer);
      stop();
    };
  }

  // Realtime (quien mira): aplicar cambios del dueño en vivo.
  useEffect(() => {
    if (!readOnly) return;
    const channel = supabase
      .channel(`wishlist-${ownerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wishlists",
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          const snap = (payload.new as { snapshot?: unknown })?.snapshot;
          const editor = editorRef.current;
          if (snap && editor) {
            loadSnapshot(editor.store, { document: snap } as never);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [readOnly, ownerId, supabase]);

  return (
    <motion.div
      className="papelote absolute inset-0"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            key={status}
            role="status"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-none absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-full bg-pine px-4 py-1.5 text-sm font-medium text-cream shadow-lg"
          >
            {status === "saving" && "Guardando…"}
            {status === "saved" && "Guardado ✓"}
            {status === "error" && "No se pudo guardar"}
          </motion.div>
        )}
      </AnimatePresence>
      <Tldraw
        assets={assets}
        onMount={onMount}
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
      />
    </motion.div>
  );
}
