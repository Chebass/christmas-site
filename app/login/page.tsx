"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass w-full max-w-sm rounded-3xl p-8 shadow-2xl"
      >
        <p className="font-hand text-center text-3xl text-gold">Feliz Navidad</p>
        <h1 className="font-display mt-1 text-center text-4xl font-semibold text-cream">
          Nuestra Navidad
        </h1>
        <p className="mt-2 text-center text-sm text-cream/70">
          Un rincón solo para los dos.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-cream/80">Correo</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-cream/80">Contraseña</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-[#ff9a9f]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-red mt-6 w-full disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </motion.form>
    </main>
  );
}
