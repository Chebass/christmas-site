export const STAMPS = [
  { id: "estrella", emoji: "⭐", label: "Estrella" },
  { id: "arbol", emoji: "🎄", label: "Árbol" },
  { id: "corazon", emoji: "❤️", label: "Corazón" },
  { id: "regalo", emoji: "🎁", label: "Regalo" },
  { id: "copo", emoji: "❄️", label: "Copo" },
  { id: "campana", emoji: "🔔", label: "Campana" },
] as const;

export function Stamp({ id, size = 40 }: { id: string; size?: number }) {
  const s = STAMPS.find((x) => x.id === id) ?? STAMPS[0];
  return (
    <span
      aria-label={`Estampilla: ${s.label}`}
      role="img"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      className="inline-flex items-center justify-center rounded-sm border-2 border-dashed border-red-deep/60 bg-cream/80"
    >
      {s.emoji}
    </span>
  );
}
