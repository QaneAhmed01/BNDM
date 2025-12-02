"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SetupPanel } from "@/components/SetupPanel";
import { PlaybackPanel, MatchInput } from "@/components/PlaybackPanel";
import { VotingArena } from "@/components/VotingArena";
import { initializeTournament, advanceRound, Round } from "@/lib/tournament";

export type Mode = "setup" | "voting" | "playback";

const steps = [
  { label: "Seed", icon: SeedIcon },
  { label: "Play", icon: PlayIcon },
  { label: "Crown", icon: CrownIcon },
];

export function TournamentApp() {
  const [mode, setMode] = useState<Mode>("setup");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchInput[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem("bn_tournament_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mode && parsed.rounds) {
          setMode(parsed.mode);
          setRounds(parsed.rounds);
          setWinnerName(parsed.winnerName);
          const flattened = parsed.rounds.flatMap((r: Round) => r.matches);
          setMatches(flattened);
        }
      } catch (e) {
        console.error("Failed to load tournament state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (!isLoaded) return;
    const state = { mode, rounds, winnerName };
    localStorage.setItem("bn_tournament_state", JSON.stringify(state));
  }, [mode, rounds, winnerName, isLoaded]);

  function handleStartTournament(names: string[]) {
    try {
      const bracket = initializeTournament(names);
      setRounds(bracket.rounds);
      setWinnerName(null);
      setMatches([]);
      setMode("voting");
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function handleRestart() {
    setMode("setup");
    setMatches([]);
    setWinnerName(null);
    setRounds([]);
    localStorage.removeItem("bn_tournament_state");
  }

  function handleVoteUpdate(updatedRounds: Round[]) {
    setRounds(updatedRounds);
    const currentRound = updatedRounds[updatedRounds.length - 1];
    const allDecided = currentRound.matches.every((m) => m.winner !== null);

    if (allDecided) {
      const nextBracket = advanceRound({ rounds: updatedRounds, finalWinner: null });
      if (nextBracket.finalWinner) {
        setWinnerName(nextBracket.finalWinner);
        setRounds(nextBracket.rounds);
        const flattened = nextBracket.rounds.flatMap(r => r.matches);
        setMatches(flattened);
        setMode("playback");
      } else {
        setRounds(nextBracket.rounds);
      }
    }
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-preg-pink/10 via-white to-preg-mint/10" />

      {/* Animated Orbs */}
      <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full orb orb--pink" />
      <div className="absolute top-1/3 -right-10 h-52 w-52 rounded-full orb orb--mint" />
      <div className="absolute bottom-10 left-8 h-48 w-48 rounded-full orb orb--peach" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-8">
        {/* Enhanced Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-preg-peach/30 pb-6"
        >
          <div className="flex items-center gap-4">
            <Link href="/" className="group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-preg-pink via-preg-peach to-preg-mint flex items-center justify-center text-xl font-black text-white shadow-lg cursor-pointer group-hover:shadow-xl transition-shadow"
              >
                BN
              </motion.div>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-preg-ink tracking-tight">
                Baby Name Tournament
              </h1>
              <p className="text-sm text-preg-ink/60">Pass & Play Edition</p>
            </div>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              {steps.map(({ label, icon: Icon }, index) => {
                const isActive =
                  (mode === "setup" && label === "Seed") ||
                  (mode === "voting" && label === "Play") ||
                  (mode === "playback" && label === "Crown");

                return (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                      ? "bg-gradient-to-r from-preg-pink to-preg-peach text-white shadow-lg scale-105"
                      : "bg-white/50 text-preg-ink/40 border border-preg-peach/20"
                      }`}
                  >
                    <Icon className={isActive ? "animate-pulse" : ""} />
                    <span>{label}</span>
                  </motion.div>
                );
              })}
            </div>
            <span className="text-xs uppercase tracking-widest text-preg-ink/40 font-bold">
              {today}
            </span>
          </div>
        </motion.header>

        {/* Enhanced Content Section */}
        <AnimatePresence mode="wait">
          <motion.section
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            layout
            className="rounded-3xl bg-white/90 backdrop-blur-md shadow-soft border border-preg-peach/30 p-6 md:p-8"
          >
            {mode === "setup" && <SetupPanel onStart={handleStartTournament} />}
            {mode === "voting" && (
              <VotingArena
                rounds={rounds}
                onUpdate={handleVoteUpdate}
              />
            )}
            {mode === "playback" && (
              <PlaybackPanel
                matches={matches}
                rounds={rounds}
                winnerName={winnerName}
                onRestart={handleRestart}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3 7 7-3-3 7 3 7-7-3-3 7-3-7-7 3 3-7-3-7 7 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
