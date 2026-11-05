"use client";

import { motion } from "framer-motion";

// Se vuelve a montar en cada navegación: entrada suave de cada módulo.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
