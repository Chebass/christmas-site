"use client";

import { useEffect, useState } from "react";

function nextChristmas(now: Date) {
  const y = now.getFullYear();
  const xmas = new Date(y, 11, 25, 0, 0, 0);
  return now >= new Date(y, 11, 26) ? new Date(y + 1, 11, 25) : xmas;
}

export default function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  const [isDay, setIsDay] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const day = now.getMonth() === 11 && now.getDate() === 25;
      setIsDay(day);
      setLeft(Math.max(0, nextChristmas(now).getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) return <div className="h-[88px]" aria-hidden />;
  if (isDay)
    return <p className="font-hand text-4xl text-gold">¡Feliz Navidad!</p>;

  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left / 3_600_000) % 24);
  const m = Math.floor((left / 60_000) % 60);
  const s = Math.floor((left / 1000) % 60);
  const parts: [number, string][] = [
    [d, "días"],
    [h, "horas"],
    [m, "min"],
    [s, "seg"],
  ];

  return (
    <div role="timer" aria-label="Cuenta regresiva para Navidad" className="flex gap-3">
      {parts.map(([v, label]) => (
        <div
          key={label}
          className="glass flex w-[68px] flex-col items-center rounded-2xl py-2"
        >
          <span className="font-display text-2xl tabular-nums text-cream">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-gold/80">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
