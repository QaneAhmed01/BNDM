"use client";

import { motion } from "framer-motion";
import { MatchInput } from "@/components/PlaybackPanel";

interface MatchSceneProps {
  match: MatchInput;
  commentary: {
    headline: string;
    summary: string;
    statsLine: string;
  } | null;
  loadingCommentary: boolean;
  hideWinner?: boolean; // Hide winner styling during dramatic reveal
}

export function MatchScene({ match, commentary, loadingCommentary, hideWinner = false }: MatchSceneProps) {
  const total = Math.max(1, match.votesA + match.votesB);
  const percentA = Math.round((match.votesA / total) * 100);
  const percentB = Math.round((match.votesB / total) * 100);
  const winner = match.votesA >= match.votesB ? match.nameA : (match.nameB ?? match.nameA);
  const isWinnerA = winner === match.nameA;

  // Hide winner styling during dramatic reveal
  const showWinner = !hideWinner;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] uppercase tracking-wide text-preg-ink/60">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 7h14M5 12h14M5 17h14" strokeLinecap="round" />
          </svg>
          {match.roundLabel}
        </div>
        <span className="text-[10px] text-preg-ink/40">{total} votes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NameCard name={match.nameA} percent={percentA} isWinner={showWinner && isWinnerA} align="left" />
        <NameCard name={match.nameB ?? "Bye"} percent={percentB} isWinner={showWinner && !isWinnerA} align="right" />
      </div>

      <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <VoteBar label={`${percentA}% preferred ${match.nameA}`} percent={percentA} align="left" />
        <VoteBar label={`${percentB}% preferred ${match.nameB ?? "Bye"}`} percent={percentB} align="right" />
      </div>

      <div className="mt-2 rounded-2xl bg-white/85 border border-preg-peach/80 px-3 py-3 text-[11px] text-preg-ink/85 shadow-soft">
        {loadingCommentary && <p className="text-preg-ink/50">Preglife announcer is thinking…</p>}
        {!loadingCommentary && commentary && (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-preg-ink">{commentary.headline}</p>
            <p className="text-[11px] text-preg-ink/80">{commentary.summary}</p>
            <p className="text-[11px] text-preg-ink/60">{commentary.statsLine}</p>
          </div>
        )}
        {!loadingCommentary && !commentary && (
          <p className="text-preg-ink/60">
            Both names are clearly loved. One simply had a few more votes this time.
          </p>
        )}
      </div>
    </div>
  );
}

interface NameCardProps {
  name: string;
  percent: number;
  isWinner: boolean;
  align: "left" | "right";
}

function NameCard({ name, percent, isWinner, align }: NameCardProps) {
  const baseClasses =
    "relative rounded-3xl px-4 py-3 md:px-5 md:py-4 border flex flex-col gap-1 bg-white/90";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={
        baseClasses +
        " " +
        (isWinner ? "border-preg-pink shadow-soft" : "border-preg-peach/70 shadow-sm")
      }
    >
      <div className="absolute -top-3 right-3 h-6 w-6 rounded-full bg-gradient-to-br from-preg-pink to-preg-mint text-[10px] font-semibold text-white flex items-center justify-center shadow-soft">
        {name.charAt(0)}
      </div>
      {isWinner && (
        <div className="absolute -top-2 left-3 rounded-full bg-preg-pink/80 px-2 py-0.5 text-[9px] font-semibold text-preg-ink uppercase tracking-wide">
          Winner
        </div>
      )}
      <p className="text-[11px] text-preg-ink/55">{align === "left" ? "Name A" : "Name B"}</p>
      <p className="text-base md:text-lg font-semibold text-preg-ink">{name}</p>
      <p className="text-[11px] text-preg-ink/70">{percent}% of this round</p>
    </motion.div>
  );
}

interface VoteBarProps {
  label: string;
  percent: number;
  align: "left" | "right";
}

function VoteBar({ label, percent, align }: VoteBarProps) {
  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <div className="flex justify-between items-center">
        <span className="text-preg-ink/70">{label}</span>
        <span className="text-preg-ink/50">{percent}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/80 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-preg-pink via-preg-peach to-preg-mint"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            transformOrigin: align === "left" ? "left center" : "right center",
          }}
        />
      </div>
    </div>
  );
}
