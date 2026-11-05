"use client";

import { useEffect, useRef, useState } from "react";
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
    const save = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { document } = getSnapshot(editor.store);
        await supabase.from("wishlists").upsert({
          owner_id: ownerId,
          snapshot: document,
          updated_at: new Date().toISOString(),
        });
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
    <div className="papelote absolute inset-0">
      <Tldraw
        assets={assets}
        onMount={onMount}
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
      />
    </div>
  );
}
