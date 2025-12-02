"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PreglifeShellProps {
  children: ReactNode;
  onReset: () => void;
}

export function PreglifeShell({ children, onReset }: PreglifeShellProps) {
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-preg-bg flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -left-28 h-72 w-72 bg-preg-rose/15 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 bg-preg-lilac/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-96 bg-preg-mint/10 blur-[140px]" />
      </div>
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-xl relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-preg-rose via-preg-lilac to-preg-mint flex items-center justify-center text-[11px] font-black text-white shadow-md shadow-preg-rose/40">
              BN
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Preglife Baby Name Tournament
              </p>
              <p className="text-[11px] text-slate-500">
                Let your circle vote. Then enjoy the reveal.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500">
            <span>{today}</span>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-[10px] text-slate-700 hover:bg-slate-100"
            >
              Start over
            </button>
          </div>
        </div>
      </header>

      <motion.div
        className="flex-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
}
