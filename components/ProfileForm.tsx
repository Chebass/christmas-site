"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/image";
import Avatar from "@/components/Avatar";

export default function ProfileForm({
  uid,
  initialName,
  initialAvatarUrl,
}: {
  uid: string;
  initialName: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [name, setName] = useState(initialName);
  const [avatarUrl] = useState<string | null>(initialAvatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (!file && !avatarUrl) return setError("Elige una foto para tu perfil.");
    setSaving(true);
    setError(null);

    let url = avatarUrl;
    if (file) {
      try {
        const blob = await resizeImage(file);
        const path = `${uid}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      } catch {
        setError("No se pudo subir la foto. Intenta con otra.");
        setSaving(false);
        return;
      }
    }

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ display_name: name.trim(), avatar_url: url })
      .eq("id", uid);
    if (dbErr) {
      setError("No se pudo guardar tu perfil.");
      setSaving(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <motion.form
        onSubmit={onSave}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl"
      >
        <p className="font-accent text-3xl text-gold">Un poco sobre ti</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Tu perfil</h1>

        <label className="group mx-auto mt-6 block w-fit cursor-pointer">
          <Avatar src={preview ?? avatarUrl} name={name} size={128} />
          <span className="mt-3 block text-sm text-gold underline-offset-4 group-hover:underline">
            {preview || avatarUrl ? "Cambiar foto" : "Elegir foto"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={onPick}
            className="sr-only"
          />
        </label>

        <label className="mt-6 block text-left">
          <span className="mb-1 block text-sm text-cream/80">Tu nombre</span>
          <input
            className="input"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm text-[#ff9a9f]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn btn-red mt-6 w-full disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar y entrar"}
        </button>
      </motion.form>
    </div>
  );
}

