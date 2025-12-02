"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Round } from "@/lib/tournament";

interface VotingArenaProps {
  rounds: Round[];
  onUpdate: (updatedRounds: Round[]) => void;
}

export function VotingArena({ rounds, onUpdate }: VotingArenaProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentRoundIndex = rounds.length - 1;
  const currentRound = rounds[currentRoundIndex];
  const activeMatchIndex = currentRound.matches.findIndex((m) => !m.winner);
  const activeMatch = currentRound.matches[activeMatchIndex];

  if (!activeMatch) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="inline-block p-6 rounded-full bg-gradient-to-br from-preg-mint/20 to-preg-peach/20 mb-4">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-preg-ink" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M8 6h8M8 18h8M6 2h12v4H6zM6 18h12v4H6z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-preg-ink/70">Round complete...</p>
        <p className="text-sm text-preg-ink/50 mt-2">Preparing next round</p>
      </motion.div>
    );
  }

  function handleVote(winnerName: string) {
    setSelectedChoice(winnerName);

    // Delay for animation feedback
    setTimeout(() => {
      const newRounds = [...rounds];
      const newRound = { ...newRounds[currentRoundIndex] };
      const newMatches = [...newRound.matches];
      const match = { ...newMatches[activeMatchIndex] };

      match.winner = winnerName;
      if (winnerName === match.nameA) {
        match.votesA = 1;
      } else {
        match.votesB = 1;
      }

      newMatches[activeMatchIndex] = match;
      newRound.matches = newMatches;
      newRounds[currentRoundIndex] = newRound;

      onUpdate(newRounds);
      setSelectedChoice(null);
    }, 400);
  }

  const progress = ((activeMatchIndex) / currentRound.matches.length) * 100;

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-[500px]">
      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs font-semibold text-preg-ink/60 mb-2">
          <span>Match {activeMatchIndex + 1} of {currentRound.matches.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-preg-pink via-preg-peach to-preg-mint"
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Round Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-preg-pink/20 to-preg-peach/20 px-5 py-2 border border-preg-pink/30"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-preg-ink" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 6.5l3 3M6 18l6-6M9 9l6 6" strokeLinecap="round" />
          <path d="M21 3l-6 6M3 21l6-6" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-black uppercase tracking-wider text-preg-ink">
          {activeMatch.roundLabel}
        </span>
      </motion.div>

      {/* VS Section */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-black text-preg-ink text-center"
      >
        Who do you prefer?
      </motion.h2>

      {/* Vote Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          <VoteCard
            key={`${activeMatch.id}-A`}
            name={activeMatch.nameA}
            onClick={() => handleVote(activeMatch.nameA)}
            color="pink"
            isSelected={selectedChoice === activeMatch.nameA}
            delay={0}
          />
        </AnimatePresence>

        {/* VS Divider */}
        <div className="flex items-center justify-center md:hidden">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="px-6 py-2 rounded-full bg-white shadow-md border border-preg-peach/30"
          >
            <span className="text-lg font-black text-preg-ink/40 uppercase tracking-widest">VS</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <VoteCard
            key={`${activeMatch.id}-B`}
            name={activeMatch.nameB ?? "Bye"}
            onClick={() => activeMatch.nameB && handleVote(activeMatch.nameB)}
            disabled={!activeMatch.nameB}
            color="mint"
            isSelected={selectedChoice === activeMatch.nameB}
            delay={0.1}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

function VoteCard({
  name,
  onClick,
  disabled,
  color,
  isSelected,
  delay,
}: {
  name: string;
  onClick: () => void;
  disabled?: boolean;
  color: "pink" | "mint";
  isSelected?: boolean;
  delay: number;
}) {
  const gradientClass = color === "pink"
    ? "from-preg-pink/10 to-preg-peach/10"
    : "from-preg-mint/10 to-preg-peach/10";

  const borderClass = color === "pink"
    ? "border-preg-pink/30"
    : "border-preg-mint/30";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={disabled ? {} : { scale: 1.03, y: -8 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-3xl p-6 md:p-10 text-center transition-all duration-300
        ${disabled ? "opacity-40 cursor-not-allowed bg-gray-100" : "cursor-pointer shadow-soft hover:shadow-strong"}
        ${isSelected ? "ring-4 ring-preg-pink shadow-strong scale-105" : ""}
        bg-gradient-to-br ${gradientClass} border-2 ${borderClass}
        backdrop-blur-sm
        touch-target w-full
      `}
    >
      {/* Shimmer Effect on Hover */}
      {!disabled && (
        <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity" />
      )}

      {/* Content */}
      <div className="relative z-10">
        <motion.span
          animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`text-4xl md:text-5xl font-black ${disabled ? "text-gray-400" : "text-preg-ink"}`}
        >
          {name}
        </motion.span>
        {!disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="mt-4 text-sm font-bold uppercase tracking-wider text-preg-ink/50"
          >
            {isSelected ? "Selected!" : "Tap to vote"}
          </motion.div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-preg-pink flex items-center justify-center text-white shadow-lg"
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  );
}
