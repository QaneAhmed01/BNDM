"use client";

import { motion } from "framer-motion";

type Stage = "setup" | "voting" | "reveal";

const steps: Array<{ id: Stage; title: string; description: string }> = [
  {
    id: "setup",
    title: "Host setup",
    description: "Add your shortlist, context, and tone.",
  },
  {
    id: "voting",
    title: "Public voting",
    description: "Pass the device and let friends tap favorites.",
  },
  {
    id: "reveal",
    title: "Cinematic reveal",
    description: "Watch the percentage bars and commentary.",
  },
];

interface StageTimelineProps {
  current: Stage;
  totalVotes: number;
}

export function StageTimeline({ current, totalVotes }: StageTimelineProps) {
  return (
    <div className="soft-card px-4 py-3 flex flex-wrap items-center gap-4">
      {steps.map((step, index) => {
        const isActive = step.id === current;
        const isCompleted =
          steps.findIndex((s) => s.id === current) > index;
        return (
          <motion.div
            key={step.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`h-10 w-10 rounded-2xl text-xs font-semibold flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-gradient-to-br from-preg-rose to-preg-lilac text-white shadow-lg shadow-preg-rose/40"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {index + 1}
            </div>
            <div className="flex flex-col text-[12px]">
              <span
                className={`font-semibold ${
                  isActive ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {step.title}
              </span>
              <span className="text-slate-500">{step.description}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`hidden sm:block w-12 h-px ${
                  isCompleted
                    ? "bg-gradient-to-r from-preg-rose to-preg-lilac"
                    : "bg-slate-200"
                }`}
              />
            )}
          </motion.div>
        );
      })}
      <div className="ml-auto text-right text-[11px] text-slate-500">
        <p>Total taps collected</p>
        <p className="text-base font-semibold text-slate-900">
          {totalVotes}
        </p>
      </div>
    </div>
  );
}
