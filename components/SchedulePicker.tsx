"use client";

import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

const pad = (n: number) => String(n).padStart(2, "0");

// Calendario + hora con el estilo del papel (sin el control nativo del navegador).
export default function SchedulePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function setDay(day?: Date) {
    if (!day) return;
    const d = new Date(day);
    d.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(d);
  }
  function setTime(h: number, m: number) {
    const d = new Date(value);
    d.setHours(h, m, 0, 0);
    onChange(d);
  }

  const select =
    "rounded-lg border border-ink/15 bg-cream px-3 py-2 text-base font-medium outline-none transition-colors hover:border-red/50 focus-visible:ring-2 focus-visible:ring-red";

  return (
    <div className="paper-calendar flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center">
      <DayPicker
        mode="single"
        locale={es}
        selected={value}
        onSelect={setDay}
        defaultMonth={value}
        disabled={{ before: today }}
        showOutsideDays
      />
      <div className="flex flex-col items-center gap-2 pt-2">
        <span className="font-accent text-lg text-red-deep">Hora</span>
        <div className="flex items-center gap-1.5">
          <select
            aria-label="Hora"
            className={select}
            value={value.getHours()}
            onChange={(e) => setTime(Number(e.target.value), value.getMinutes())}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {pad(h)}
              </option>
            ))}
          </select>
          <span className="font-semibold">:</span>
          <select
            aria-label="Minutos"
            className={select}
            value={value.getMinutes() - (value.getMinutes() % 5)}
            onChange={(e) => setTime(value.getHours(), Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
              <option key={m} value={m}>
                {pad(m)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
