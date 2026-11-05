/* eslint-disable @next/next/no-img-element */
export default function Avatar({
  src,
  name,
  size = 64,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const style = { width: size, height: size };
  return src ? (
    <img
      src={src}
      alt={name ? `Foto de ${name}` : "Foto de perfil"}
      style={style}
      className="rounded-full border-2 border-gold object-cover shadow-lg"
    />
  ) : (
    <div
      style={{ ...style, fontSize: size / 2.4 }}
      className="font-display flex items-center justify-center rounded-full border-2 border-gold/60 bg-pine text-gold"
      aria-hidden
    >
      {(name?.trim()[0] ?? "?").toUpperCase()}
    </div>
  );
}
