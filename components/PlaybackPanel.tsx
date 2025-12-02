"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchScene } from "@/components/MatchScene";
import { Confetti } from "@/components/Confetti";
import type { Round } from "@/lib/tournament";

export interface MatchInput {
  id: string;
  roundLabel: string;
  nameA: string;
  nameB: string | null;
  votesA: number;
  votesB: number;
}

interface PlaybackPanelProps {
  matches: MatchInput[];
  rounds: Round[];
  winnerName: string | null;
  onRestart: () => void;
}

interface Commentary {
  headline: string;
  summary: string;
  statsLine: string;
}

export function PlaybackPanel({
  matches,
  rounds,
  winnerName,
  onRestart,
}: PlaybackPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxRevealedIndex, setMaxRevealedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loadingComm, setLoadingComm] = useState(false);
  const [finalRevealReady, setFinalRevealReady] = useState(false);
  const [hasFinalRevealed, setHasFinalRevealed] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cardsFlipped, setCardsFlipped] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5x, 1x, 2x
  const finalRevealTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMatch = matches[currentIndex] ?? null;

  useEffect(() => {
    setCurrentIndex(0);
    setMaxRevealedIndex(0);
    setHasFinalRevealed(false);
    setFinalRevealReady(false);
    if (matches.length > 0) {
      setIsPlaying(true);
    }
  }, [matches]);

  useEffect(() => {
    if (!currentMatch) return;

    async function fetchCommentary() {
      setLoadingComm(true);
      try {
        const res = await fetch("/api/commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundLabel: currentMatch.roundLabel,
            nameA: currentMatch.nameA,
            nameB: currentMatch.nameB,
            votesA: currentMatch.votesA,
            votesB: currentMatch.votesB,
          }),
        });
        const json = await res.json();
        if (json.error) {
          setCommentary(null);
        } else {
          setCommentary({
            headline: json.headline,
            summary: json.summary,
            statsLine: json.statsLine,
          });
        }
      } catch {
        setCommentary(null);
      } finally {
        setLoadingComm(false);
      }
    }

    fetchCommentary();
  }, [currentMatch?.id]);

  useEffect(() => {
    if (!isPlaying || !currentMatch) return;
    const baseDelay = 4200; // Base delay in milliseconds
    const adjustedDelay = baseDelay / playbackSpeed;

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1 < matches.length ? prev + 1 : prev;
        if (next !== prev) {
          setMaxRevealedIndex((max) => Math.max(max, next));
        }
        return next;
      });
    }, adjustedDelay);
    return () => clearTimeout(timeout);
  }, [isPlaying, currentMatch, matches.length, playbackSpeed]);

  function handlePlayPause() {
    if (!currentMatch) return;
    setIsPlaying((prev) => !prev);
  }

  function handleNext() {
    setIsPlaying(false);
    setCurrentIndex((prev) => {
      const next = prev + 1 < matches.length ? prev + 1 : prev;
      setMaxRevealedIndex((max) => Math.max(max, next));
      return next;
    });
  }

  function handlePrev() {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  }

  const showFinal = currentIndex === matches.length - 1 && winnerName;
  useEffect(() => {
    if (hasFinalRevealed) {
      setFinalRevealReady(true);
      if (finalRevealTimerRef.current) {
        clearTimeout(finalRevealTimerRef.current);
        finalRevealTimerRef.current = null;
      }
      return;
    }

    if (showFinal && !hasFinalRevealed) {
      // Reset states
      setFinalRevealReady(false);
      setShowCountdown(false);
      setCountdown(3);
      setCardsFlipped(false);

      if (finalRevealTimerRef.current) {
        clearTimeout(finalRevealTimerRef.current);
      }

      // Start countdown after 2 seconds
      const timeout = setTimeout(() => {
        setShowCountdown(true);
      }, 2000);

      finalRevealTimerRef.current = timeout;
      return () => {
        clearTimeout(timeout);
      };
    }

    setFinalRevealReady(false);
    if (finalRevealTimerRef.current) {
      clearTimeout(finalRevealTimerRef.current);
      finalRevealTimerRef.current = null;
    }
  }, [showFinal, hasFinalRevealed]);

  // Countdown effect
  useEffect(() => {
    if (!showCountdown || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        // Flip cards
        setCardsFlipped(true);
        // After flip animation, reveal winner
        setTimeout(() => {
          setFinalRevealReady(true);
          setHasFinalRevealed(true);
        }, 1000);
      }
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  useEffect(() => {
    if (finalRevealReady && matches.length > 0) {
      setMaxRevealedIndex(matches.length - 1);
    }
  }, [finalRevealReady, matches.length]);
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[900px]">
      <header className="flex-none flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-preg-ink/50 text-[11px] uppercase tracking-wide">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white shadow-soft">
            2
          </span>
          <span>Playback</span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Restart" onClick={onRestart}>
            <RestartIcon />
          </IconButton>

          {/* Playback Speed Control */}
          <button
            type="button"
            onClick={() => {
              setPlaybackSpeed((prev) => {
                if (prev === 0.5) return 1;
                if (prev === 1) return 2;
                return 0.5;
              });
            }}
            className="h-10 px-3 rounded-full flex items-center justify-center gap-1 bg-white/80 text-preg-ink shadow-sm hover:brightness-105 text-xs font-semibold"
            aria-label="Playback speed"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            {playbackSpeed}x
          </button>

          <IconButton
            label={isPlaying ? "Pause" : "Play"}
            onClick={handlePlayPause}
            disabled={!currentMatch}
            highlight
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </div>
      </header>

      {/* Main Content Area - Flex Grow to fill space */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {matches.length > 0 && rounds.length > 0 && (
          <div className="flex-1 min-h-0 overflow-hidden relative rounded-3xl bg-white/50 border border-preg-peach/30 mb-4">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <BracketSVG
                matches={matches}
                rounds={rounds}
                activeMatchId={currentMatch?.id}
                revealedIndex={maxRevealedIndex}
                finalRevealReady={finalRevealReady}
                championName={winnerName}
                onSelect={(id) => {
                  const idx = matches.findIndex((m) => m.id === id);
                  if (idx >= 0) {
                    setIsPlaying(false);
                    setMaxRevealedIndex((max) => Math.max(max, idx));
                    setCurrentIndex(idx);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="flex-none rounded-3xl bg-preg-peach/40 border border-preg-peach/80 px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {currentMatch ? (
              <motion.div
                key={currentMatch.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <MatchScene
                  match={currentMatch}
                  commentary={commentary}
                  loadingCommentary={loadingComm}
                  hideWinner={!!(showFinal && !finalRevealReady)}
                />
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-preg-ink/70"
              >
                Add some names and start the tournament to see the rounds play out.
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <IconButton
                label="Previous"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
              >
                <BackIcon />
              </IconButton>
              <IconButton
                label="Next"
                onClick={handleNext}
                disabled={currentIndex >= matches.length - 1}
              >
                <NextIcon />
              </IconButton>
            </div>
            <div className="flex-1 flex items-center gap-2 sm:justify-end">
              <div className="h-1.5 w-32 rounded-full bg-white/80 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-preg-pink via-preg-peach to-preg-mint"
                  initial={false}
                  animate={{
                    width:
                      matches.length > 0
                        ? `${((currentIndex + 1) / matches.length) * 100}%`
                        : "0%",
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFinal && (
        <>
          <Confetti active={finalRevealReady} />
          {!finalRevealReady && <SpotlightOverlay />}

          {/* Countdown Display */}
          {showCountdown && countdown > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-9xl font-black text-preg-pink drop-shadow-2xl"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}

          {/* Card Flip Reveal */}
          {(showCountdown || finalRevealReady) && !finalRevealReady && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm">
              <WinnerRevealCards
                finalists={getFinalists(rounds)}
                winner={winnerName}
                flipped={cardsFlipped}
              />
            </div>
          )}

          {/* Final Winner Card */}
          {finalRevealReady ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl rounded-3xl bg-white/95 border border-preg-peach/80 px-4 py-5 md:px-8 md:py-6 overflow-hidden shadow-[0_25px_60px_rgba(249,183,194,0.5)]"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="confetti-piece absolute left-5 top-0 h-3 w-1 rounded bg-preg-pink" />
                <div className="confetti-piece absolute left-10 top-0 h-3 w-1 rounded bg-preg-mint" />
                <div className="confetti-piece absolute left-1/2 top-0 h-3 w-1 rounded bg-preg-rose" />
                <div className="confetti-piece absolute right-10 top-0 h-3 w-1 rounded bg-preg-mint" />
                <div className="confetti-piece absolute right-1/3 top-0 h-3 w-1 rounded bg-preg-pink" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-preg-ink/60 mb-2">
                    Final reveal
                  </p>
                  <div className="flex items-center gap-2 text-preg-ink">
                    <CrownIcon />
                    <h3 className="text-xl font-semibold tracking-tight">
                      {winnerName} takes the crown
                    </h3>
                  </div>
                  <p className="text-[12px] text-preg-ink/70 mt-2 max-w-md">
                    Your friends and family gave {winnerName} the most love in this little tournament. Keep the moment and choose whatever still feels right for you.
                  </p>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-preg-pink/90 via-preg-peach to-preg-mint px-5 py-4 text-[12px] text-preg-ink font-semibold shadow-soft">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-preg-ink/70">
                    Share the moment
                  </p>
                  <p className="mt-2">
                    Capture the bracket, send it to your circle, and let them celebrate the favourite.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-3xl border border-preg-peach/70 bg-white/90 px-4 py-5 md:px-8 md:py-6 text-center shadow-soft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-preg-ink/60">
                Final reveal incoming
              </p>
              <p className="mt-3 text-lg font-semibold text-preg-ink">Hold for the crowd favourite…</p>
              <p className="text-[12px] text-preg-ink/60 mt-2">Spotlight is buzzing around the bracket.</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// Helper function to get the two finalists
function getFinalists(rounds: Round[]): [string, string] {
  if (rounds.length === 0) return ["", ""];
  const finalRound = rounds[rounds.length - 1];
  if (finalRound.matches.length === 0) return ["", ""];
  const finalMatch = finalRound.matches[0];
  return [finalMatch.nameA, finalMatch.nameB || ""];
}

// Winner Reveal Cards Component
function WinnerRevealCards({
  finalists,
  winner,
  flipped,
}: {
  finalists: [string, string];
  winner: string | null;
  flipped: boolean;
}) {
  const [finalist1, finalist2] = finalists;

  return (
    <div className="relative z-30 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <RevealCard name={finalist1} isWinner={finalist1 === winner} flipped={flipped} delay={0} />
      <RevealCard name={finalist2} isWinner={finalist2 === winner} flipped={flipped} delay={0.1} />
    </div>
  );
}

// Individual Reveal Card
function RevealCard({
  name,
  isWinner,
  flipped,
  delay,
}: {
  name: string;
  isWinner: boolean;
  flipped: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="perspective-1000"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative preserve-3d w-full h-64"
      >
        {/* Card Back (Face Down) */}
        <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-preg-pink via-preg-peach to-preg-mint p-1 shadow-xl">
          <div className="h-full w-full rounded-3xl bg-white flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">❓</div>
              <p className="text-sm font-bold text-preg-ink/40 uppercase tracking-widest">
                Finalist
              </p>
            </div>
          </div>
        </div>

        {/* Card Front (Face Up) */}
        <div
          className={`absolute inset-0 backface-hidden rotateY-180 rounded-3xl p-1 shadow-2xl transition-all duration-500 ${isWinner
            ? "bg-gradient-to-br from-preg-pink via-preg-peach to-preg-mint scale-105"
            : "bg-gray-300 opacity-60"
            }`}
        >
          <div className="h-full w-full rounded-3xl bg-white flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            {isWinner && (
              <>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-preg-pink/20 via-preg-peach/20 to-preg-mint/20 animate-pulse" />
                {/* Crown */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -top-8"
                >
                  <svg viewBox="0 0 24 24" className="h-16 w-16 text-preg-pink" fill="currentColor">
                    <path d="M12 2l3 7 7-3-3 7 3 7-7-3-3 7-3-7-7 3 3-7-3-7 7 3z" />
                  </svg>
                </motion.div>
              </>
            )}
            <div className="relative z-10 text-center">
              <p className={`text-4xl md:text-5xl font-black ${isWinner ? "text-preg-ink" : "text-gray-400"}`}>
                {name}
              </p>
              {isWinner && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-3 text-sm font-bold text-preg-pink uppercase tracking-widest"
                >
                  Winner!
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  highlight,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`touch-target h-10 w-10 rounded-full flex items-center justify-center ${highlight
        ? "bg-gradient-to-r from-preg-pink via-preg-peach to-preg-mint text-preg-ink shadow-soft"
        : "bg-white/80 text-preg-ink shadow-sm"
        } ${disabled ? "opacity-40" : "hover:brightness-105"}`}
    >
      {children}
    </button>
  );
}

function SpotlightOverlay() {
  return (
    <AnimatePresence>
      <motion.div
        key="spotlight"
        className="pointer-events-none fixed inset-0 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]" />
        <div className="spotlight-circle" />
      </motion.div>
    </AnimatePresence>
  );
}

const RestartIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.7 14.5A7 7 0 0 0 12 19a7 7 0 0 0 6.3-4.5" strokeLinecap="round" />
    <path d="M18.3 9.5A7 7 0 0 0 12 5a7 7 0 0 0-6.3 4.5" strokeLinecap="round" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M9 5v14l10-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 6L9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrownIcon = () => (
  <svg viewBox="0 0 32 20" className="h-6 w-6 text-preg-rose">
    <path
      d="M4 16.5h24L28 6l-6 4-6-8-6 8-6-4z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path d="M6 16.5v1.5h20v-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

function MatchBox({
  x,
  y,
  boxWidth,
  boxHeight,
  gap,
  topName,
  bottomName,
  active,
  revealed,
  onClick,
}: {
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  gap: number;
  topName: string;
  bottomName: string | null;
  active: boolean;
  revealed: boolean;
  onClick: () => void;
}) {
  // If no opponent (bye), render single seed box
  if (!bottomName) {
    return (
      <g
        onClick={revealed ? onClick : undefined}
        className={revealed ? "cursor-pointer hover:opacity-90 transition-opacity" : "pointer-events-none opacity-40"}
      >
        <SingleBox
          x={x}
          y={y + gap / 2} // Center vertically in the slot
          width={boxWidth}
          height={boxHeight}
          label={topName}
          active={active}
          revealed={revealed}
          onClick={onClick}
        />
      </g>
    );
  }

  return (
    <g
      onClick={revealed ? onClick : undefined}
      className={revealed ? "cursor-pointer hover:opacity-90 transition-opacity" : "pointer-events-none opacity-40"}
    >
      <rect
        x={x - 6}
        y={y - 6}
        width={boxWidth + 12}
        height={boxHeight * 2 + gap + 12}
        rx={16}
        fill={active ? "#FFF5F7" : "transparent"}
        className="transition-colors duration-300"
      />

      {/* Connector line between players */}
      <path
        d={`M${x + boxWidth / 2} ${y + boxHeight} V${y + boxHeight + gap}`}
        stroke={active ? "#FF6B9D" : "#f4b8c4"}
        strokeWidth={active ? 2 : 1.2}
        className={`transition-all duration-500 ${revealed ? "opacity-100" : "opacity-0"}`}
      />

      <SingleBox
        x={x}
        y={y}
        width={boxWidth}
        height={boxHeight}
        label={topName}
        active={active}
        revealed={revealed}
        onClick={onClick}
      />
      <SingleBox
        x={x}
        y={y + boxHeight + gap}
        width={boxWidth}
        height={boxHeight}
        label={bottomName}
        active={active}
        revealed={revealed}
        onClick={onClick}
      />
    </g>
  );
}

function SingleBox({
  x,
  y,
  width,
  height,
  label,
  active,
  revealed,
  isChampion = false,
  onClick,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  active: boolean;
  revealed: boolean;
  isChampion?: boolean;
  onClick: () => void;
}) {
  return (
    <g
      onClick={revealed ? onClick : undefined}
      className={revealed ? "cursor-pointer hover:opacity-90 transition-opacity" : "pointer-events-none opacity-40"}
    >
      {/* Champion glow effect */}
      {isChampion && revealed && (
        <>
          <rect
            x={x - 4}
            y={y - 4}
            width={width + 8}
            height={height + 8}
            rx={16}
            fill="none"
            stroke="url(#championGlow)"
            strokeWidth={3}
            opacity={0.8}
          >
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-width" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <defs>
            <linearGradient id="championGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B9D" />
              <stop offset="50%" stopColor="#FFA07A" />
              <stop offset="100%" stopColor="#A8E6CF" />
            </linearGradient>
          </defs>
        </>
      )}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill={isChampion && revealed ? "url(#championBg)" : active ? "#FDD5DA" : revealed ? "#ffffff" : "#fdf0f3"}
        stroke={isChampion && revealed ? "#FF6B9D" : active ? "#FF6B9D" : "#f4b8c4"}
        strokeWidth={isChampion && revealed ? 2.5 : active ? 2 : 1.2}
      >
        {revealed && (
          <animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze" />
        )}
      </rect>
      {isChampion && revealed && (
        <defs>
          <linearGradient id="championBg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF5F7" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0FFF4" />
          </linearGradient>
        </defs>
      )}
      {isChampion && revealed && (
        <>
          <defs>
            <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f973a9" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
          </defs>
          <path
            d={`M${x + width / 2 - 26} ${y - 6} L${x + width / 2 - 18} ${y - 18
              } L${x + width / 2 - 6} ${y - 8} L${x + width / 2} ${y - 20} L${x + width / 2 + 6
              } ${y - 8} L${x + width / 2 + 18} ${y - 18} L${x + width / 2 + 26
              } ${y - 6} Z`}
            fill="url(#crownGradient)"
            stroke="#fbb6ce"
            strokeWidth={1}
          />
          <path
            d={`M${x + width / 2 - 28} ${y - 6} H${x + width / 2 + 28}`}
            stroke="#fcd34d"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <circle cx={x + width / 2 - 18} cy={y - 18} r={2.5} fill="#fcd34d" />
          <circle cx={x + width / 2 + 18} cy={y - 18} r={2.5} fill="#fcd34d" />
          <circle cx={x + width / 2} cy={y - 22} r={3} fill="#fde68a" />
          <circle cx={x + width / 2 - 30} cy={y - 12} r={2} fill="#fbb6ce" />
          <circle cx={x + width / 2 + 30} cy={y - 12} r={2} fill="#fbb6ce" />
        </>
      )}
      <text
        x={x + 12}
        y={y + height / 2 + 4}
        fontSize={height < 32 ? "10" : "11"}
        fill="#111827"
        className={`transition-all duration-500 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
      >
        {label}
      </text>
    </g>
  );
}

function BracketSVG({
  matches,
  rounds,
  activeMatchId,
  revealedIndex,
  finalRevealReady,
  championName,
  onSelect,
}: {
  matches: MatchInput[];
  rounds: Round[];
  activeMatchId?: string;
  revealedIndex: number;
  finalRevealReady: boolean;
  championName: string | null;
  onSelect: (matchId: string) => void;
}) {
  const isCompact = rounds[0]?.matches.length > 4; // > 8 participants
  const BOX_W = 150;
  const BOX_H = isCompact ? 28 : 34;
  const BASE_X = 40;
  const BASE_Y = 30;
  const COLUMN_GAP = 190;
  const GAP = isCompact ? 16 : 26;

  const matchIndexMap = useMemo(
    () => new Map(matches.map((match, idx) => [match.id, idx])),
    [matches],
  );
  const isRevealed = (match: MatchInput) => {
    const idx = matchIndexMap.get(match.id);
    return typeof idx === "number" && idx <= revealedIndex;
  };

  type Layout = {
    match: MatchInput;
    x: number;
    topY: number;
    bottomY: number;
    center: number;
  };

  const roundLayouts: Layout[][] = [];
  rounds.forEach((round, roundIdx) => {
    if (roundIdx === 0) {
      const layouts = round.matches.map((match, idx) => {
        const topY = BASE_Y + idx * (BOX_H * 2 + GAP + GAP);
        return {
          match: match as MatchInput,
          x: BASE_X,
          topY,
          bottomY: topY + BOX_H + GAP,
          center: topY + BOX_H + GAP / 2,
        };
      });
      roundLayouts.push(layouts);
    } else {
      const prev = roundLayouts[roundIdx - 1];
      const layouts = round.matches.map((match, idx) => {
        const upper = prev[idx * 2];
        const lower = prev[idx * 2 + 1];
        const center =
          upper && lower
            ? (upper.center + lower.center) / 2
            : upper?.center ?? lower?.center ?? BASE_Y;
        const topY = center - (BOX_H + GAP / 2);
        return {
          match: match as MatchInput,
          x: BASE_X + roundIdx * COLUMN_GAP,
          topY,
          bottomY: topY + BOX_H + GAP,
          center,
        };
      });
      roundLayouts.push(layouts);
    }
  });

  const finalLayouts = roundLayouts[roundLayouts.length - 1] ?? [];
  const finalLayout = finalLayouts[0];
  const championY = (finalLayout?.center ?? BASE_Y) - BOX_H / 2;
  const championLabel =
    finalRevealReady && championName ? championName : "Awaiting reveal";
  const championRevealed = finalRevealReady && Boolean(championName);

  // Calculate SVG dimensions based on actual bracket size
  const svgWidth = BASE_X + COLUMN_GAP * (roundLayouts.length + 1) + BOX_W + 60;
  const lastFirstRound = roundLayouts[0]?.[roundLayouts[0].length - 1];
  const svgHeight = lastFirstRound?.bottomY != null
    ? lastFirstRound.bottomY + BOX_H + 80
    : 420;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="max-w-full max-h-full w-auto h-auto text-preg-ink"
        preserveAspectRatio="xMidYMid meet"
      >
        {roundLayouts.map((layouts, roundIdx) =>
          layouts.map((layout, idx) => (
            <MatchBox
              key={`${roundIdx}-${idx}`}
              x={layout.x}
              y={layout.topY}
              boxWidth={BOX_W}
              boxHeight={BOX_H}
              gap={GAP}
              topName={layout.match.nameA}
              bottomName={layout.match.nameB}
              active={layout.match.id === activeMatchId}
              revealed={isRevealed(layout.match)}
              onClick={() => onSelect(layout.match.id)}
            />
          )),
        )}

        {roundLayouts.map((layouts, roundIdx) => {
          if (roundIdx === roundLayouts.length - 1) return null;
          const nextLayouts = roundLayouts[roundIdx + 1];
          return layouts.map((layout, idx) => {
            const target = nextLayouts[Math.floor(idx / 2)];
            if (!target) return null;
            const startX = layout.x + BOX_W;
            const hookX = startX + 18;
            const joinX = hookX + 24;
            const endX = target.x;
            const topCenter = layout.topY + BOX_H / 2;
            const bottomCenter = layout.topY + BOX_H + GAP + BOX_H / 2;
            const targetCenter =
              idx % 2 === 0
                ? target.topY + BOX_H / 2
                : target.topY + BOX_H + GAP + BOX_H / 2;
            const shown = isRevealed(target.match);
            return (
              <g
                key={`conn-${roundIdx}-${idx}`}
                stroke="#f4b8c4"
                strokeWidth={1.4}
                fill="none"
                className={shown ? "" : "opacity-40"}
              >
                <path d={`M${startX} ${topCenter} H ${hookX}`} />
                <path d={`M${startX} ${bottomCenter} H ${hookX}`} />
                <path d={`M${hookX} ${topCenter} V ${bottomCenter}`} />
                <path d={`M${hookX} ${(topCenter + bottomCenter) / 2} H ${joinX} V ${targetCenter} H ${endX}`} />
              </g>
            );
          });
        })}

        {finalLayout && (
          <>
            <SingleBox
              x={finalLayout.x + COLUMN_GAP}
              y={championY}
              width={BOX_W}
              height={BOX_H}
              label={championLabel}
              active={false}
              revealed={finalRevealReady && championRevealed}
              isChampion
              onClick={() => { }}
            />
            <g stroke="#f4b8c4" strokeWidth={1.4} fill="none" strokeLinecap="round">
              <path
                d={`M${finalLayout.x + BOX_W} ${finalLayout.topY + BOX_H / 2} H ${finalLayout.x + BOX_W + 16
                  } V ${finalLayout.center}`}
              />
              <path
                d={`M${finalLayout.x + BOX_W} ${finalLayout.bottomY + BOX_H / 2} H ${finalLayout.x + BOX_W + 16
                  } V ${finalLayout.center}`}
              />
              <path
                d={`M${finalLayout.x + BOX_W + 16} ${finalLayout.center} H ${finalLayout.x + BOX_W + 32
                  } V ${championY + BOX_H / 2} H ${finalLayout.x + COLUMN_GAP}`}
              />
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
