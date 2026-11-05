"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Avatar from "./Avatar";

export default function ListCard({
  id,
  name,
  avatarUrl,
  mine,
  index,
}: {
  id: string;
  name: string;
  avatarUrl: string | null;
  mine: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: index === 0 ? -2 : 2 }}
      animate={{ opacity: 1, y: 0, rotate: index === 0 ? -1.5 : 1.5 }}
      transition={{
        duration: 0.6,
        delay: 0.15 + index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{ y: -6, rotate: 0 }}
      whileTap={{ scale: 0.98 }}
      className="w-full max-w-xs"
    >
      <Link
        href={`/lista/${id}`}
        className="group relative block rounded-[1.75rem] bg-paper p-6 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]"
      >
        {/* sello de lacre */}
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-red shadow-md ring-2 ring-red-deep"
        />
        <div className="mt-3 flex flex-col items-center text-center">
          <Avatar src={avatarUrl} name={name} size={96} />
          <p className="font-hand mt-3 text-2xl text-red-deep">
            {mine ? "Mi lista de deseos" : "Su lista de deseos"}
          </p>
          <h2 className="font-display text-3xl font-semibold">{name}</h2>
          <span className="mt-4 rounded-full bg-pine px-4 py-1.5 text-sm font-medium text-cream transition-colors group-hover:bg-teal">
            {mine ? "Abrir y escribir" : "Abrir y ver"}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
