import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function Greeting() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <h1 className="font-display text-5xl font-semibold">{user?.email}</h1>;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="font-hand text-3xl text-gold">Hola</p>
      <Suspense fallback={<div className="h-14" />}>
        <Greeting />
      </Suspense>
      <p className="text-cream/70">Sesión iniciada. El home viene en la siguiente fase.</p>
    </main>
  );
}
