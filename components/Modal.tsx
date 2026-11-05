"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Modal({
  onClose,
  label,
  className = "max-w-xl",
  children,
}: {
  onClose: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ opacity: 0, y: 40, scale: 0.94, rotateX: -8 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-3xl bg-paper text-ink shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${className}`}
        style={{ transformPerspective: 900 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
