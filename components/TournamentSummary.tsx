"use client";

import { motion } from "framer-motion";

interface Props {
  parentNames: string;
  dueLabel: string;
  nameCount: number;
  totalVotes: number;
  stage: "setup" | "voting" | "reveal";
}

const moodCopy: Record<Props["stage"], string> = {
  setup: "Define your shortlist to unlock the arena.",
  voting: "Hand the device to each voter and tap through the bracket.",
  reveal: "Dim the lights, hit play, and enjoy the commentary.",
};

export function TournamentSummary({
  parentNames,
  dueLabel,
  nameCount,
  totalVotes,
  stage,
}: Props) {
  return (
    <motion.section
      className="soft-card p-4 space-y-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-preg-lilac font-semibold">
            Tournament summary
          </p>
          <p className="text-sm text-slate-500">{moodCopy[stage]}</p>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <p>{nameCount} names</p>
          <p>{totalVotes} taps</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 text-[12px] space-y-1">
        <p className="text-slate-500">Host</p>
        <p className="text-slate-900 font-semibold">
          {parentNames || "Add names during setup"}
        </p>
        <p className="text-slate-400">{dueLabel || "Add due date context"}</p>
      </div>

      <p className="text-[11px] text-slate-500">
        Need inspiration? Mention cultural notes, family traditions, or vibes in
        the description so voters get in the mood.
      </p>
    </motion.section>
  );
}
