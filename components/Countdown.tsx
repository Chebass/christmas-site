"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function nextChristmas(now: Date) {
  const y = now.getFullYear();
  return now >= new Date(y, 11, 26) ? new Date(y + 1, 11, 25) : new Date(y, 11, 25);
}

// Número que se desliza al cambiar de valor.
function Digits({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1.1em] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  const [isDay, setIsDay] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setIsDay(now.getMonth() === 11 && now.getDate() === 25);
      setLeft(Math.max(0, nextChristmas(now).getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) return <div className="h-[132px] sm:h-[152px]" aria-hidden />;
  if (isDay) return <p className="font-accent text-5xl text-gold">¡Feliz Navidad!</p>;

  const parts: [string, string][] = [
    [String(Math.floor(left / 86_400_000)).padStart(2, "0"), "días"],
    [String(Math.floor((left / 3_600_000) % 24)).padStart(2, "0"), "horas"],
    [String(Math.floor((left / 60_000) % 60)).padStart(2, "0"), "min"],
    [String(Math.floor((left / 1000) % 60)).padStart(2, "0"), "seg"],
  ];

  return (
    <div
      role="timer"
      aria-label="Cuenta regresiva para Navidad"
      className="flex flex-wrap justify-center gap-3 sm:gap-5"
    >
      {parts.map(([v, label], i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="glass glass-hover group flex w-[76px] flex-col items-center rounded-3xl py-3 sm:w-[112px] sm:py-5"
        >
          <span className="font-display text-4xl text-cream transition-colors group-hover:text-gold sm:text-6xl">
            <Digits value={v} />
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold/80 sm:text-xs">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
