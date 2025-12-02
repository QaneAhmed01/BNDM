"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TournamentBracket,
  AggregatedMatchResult,
  computeWinners,
} from "@/lib/tournament";
import { VoteTallies } from "@/components/VotingArena";

export interface RevealState {
  bracket: TournamentBracket;
  aggregatedResults: AggregatedMatchResult[];
  roundWinners: string[][];
  champion: string | null;
  totalVoters: number;
}

interface RevealCinemaProps {
  setup: {
    parentNames: string;
    babyNames: string[];
    dueLabel: string;
  };
  revealState: RevealState;
}

export function buildRevealStateFromTallies(
  bracket: TournamentBracket,
  tallies: VoteTallies,
  setup: { babyNames: string[]; parentNames: string; dueLabel: string }
): RevealState {
  const aggregated: AggregatedMatchResult[] = [];
  let totalVotersApprox = 0;

  for (const round of bracket.rounds) {
    for (const match of round) {
      const key = `${match.roundIndex}-${match.matchIndex}-${match.left}-${match.right ?? "bye"}`;
      const t = tallies[key] ?? { leftVotes: 0, rightVotes: 0 };
      aggregated.push({
        roundIndex: match.roundIndex,
        matchIndex: match.matchIndex,
        left: match.left,
        right: match.right,
        leftVotes: t.leftVotes,
        rightVotes: t.rightVotes,
      });
      totalVotersApprox = Math.max(
        totalVotersApprox,
        t.leftVotes + t.rightVotes
      );
    }
  }

  const filtered = aggregated.filter(
    (match) => match.left && match.right
  );

  const winners = computeWinners(bracket, filtered);

  const scoreMap = new Map<string, number>();
  for (const match of filtered) {
    if (match.left) {
      scoreMap.set(
        match.left,
        (scoreMap.get(match.left) ?? 0) + match.leftVotes
      );
    }
    if (match.right) {
      scoreMap.set(
        match.right,
        (scoreMap.get(match.right) ?? 0) + match.rightVotes
      );
    }
  }

  let champion = winners.champion;
  if (!champion && scoreMap.size > 0) {
    champion = [...scoreMap.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0][0];
  }

  return {
    bracket,
    aggregatedResults: filtered,
    roundWinners: winners.roundWinners,
    champion: champion ?? null,
    totalVoters: totalVotersApprox,
  };
}

interface Commentary {
  commentary: string;
  statNugget: string;
}

export function RevealCinema({ setup, revealState }: RevealCinemaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const matches = revealState.aggregatedResults;
  const currentMatch = matches[currentIndex];

  useEffect(() => {
    if (!currentMatch) return;
    let cancelled = false;

    async function fetchCommentary() {
      setLoadingCommentary(true);
      try {
        const res = await fetch("/api/baby-commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            match: currentMatch,
            totalVoters: revealState.totalVoters,
            parentNames: setup.parentNames,
            dueLabel: setup.dueLabel,
          }),
        });
        const json = await res.json();
        if (!cancelled && !json.error) {
          setCommentary({
            commentary: json.commentary,
            statNugget: json.statNugget,
          });
        }
      } catch {
        if (!cancelled) {
          setCommentary(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingCommentary(false);
        }
      }
    }

    fetchCommentary();
    return () => {
      cancelled = true;
    };
  }, [currentIndex, currentMatch, revealState.totalVoters, setup]);

  function goNext() {
    setCurrentIndex((prev) =>
      prev + 1 < matches.length ? prev + 1 : prev
    );
  }

  const hasChampion = revealState.champion != null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-preg-card shadow-xl shadow-slate-200/60 p-5 md:p-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center rounded-full bg-preg-mint-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-preg-mint border border-preg-mint/40">
            Step 3 · Watch the reveal
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            How your circle voted
          </h2>
          <p className="text-[11px] text-slate-500 max-w-md">
            Each matchup is revealed with the votes it received. This is just for
            fun, and all shortlisted names remain special.
          </p>
        </div>
        <div className="text-[11px] text-right text-slate-500 space-y-1">
          {setup.parentNames && (
            <p className="font-medium text-slate-800">{setup.parentNames}</p>
          )}
          {setup.dueLabel && <p>{setup.dueLabel}</p>}
          <p>
            Approx. voters:{" "}
            <span className="font-semibold">
              {revealState.totalVoters || "N/A"}
            </span>
          </p>
        </div>
      </header>

      {currentMatch ? (
        <MatchRevealView
          match={currentMatch}
          onNext={goNext}
          index={currentIndex}
          total={matches.length}
          commentary={commentary}
          loadingCommentary={loadingCommentary}
        />
      ) : (
        <p className="text-[12px] text-slate-500">No match data to reveal.</p>
      )}

      {hasChampion && <ChampionCard name={revealState.champion!} setup={setup} />}
    </section>
  );
}

interface MatchRevealViewProps {
  match: AggregatedMatchResult;
  onNext: () => void;
  index: number;
  total: number;
  commentary: Commentary | null;
  loadingCommentary: boolean;
}

function MatchRevealView({
  match,
  onNext,
  index,
  total,
  commentary,
  loadingCommentary,
}: MatchRevealViewProps) {
  const leftVotes = match.leftVotes;
  const rightVotes = match.rightVotes;
  const totalVotes = leftVotes + rightVotes;
  const leftPct = totalVotes === 0 ? 50 : Math.round((leftVotes / totalVotes) * 100);
  const rightPct =
    totalVotes === 0 ? 50 : Math.round((rightVotes / totalVotes) * 100);

  const key = `${match.roundIndex}-${match.matchIndex}-${match.left}-${match.right ?? "bye"}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Match {index + 1} of {total}
        </span>
        <span>Round {match.roundIndex + 1}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)] items-stretch"
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Pair reveal
                </p>
                <p className="text-[12px] text-slate-500">
                  Each bar fills with the votes from your circle.
                </p>
              </div>
              <div className="text-[11px] text-right text-slate-500">
                <p>Total votes</p>
                <p className="font-semibold text-slate-800">{totalVotes}</p>
              </div>
            </div>

            <NameBar side="left" name={match.left} percent={leftPct} votes={leftVotes} />
            {match.right && (
              <NameBar
                side="right"
                name={match.right}
                percent={rightPct}
                votes={rightVotes}
              />
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 flex flex-col gap-3 text-[12px] text-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Announcer
            </p>
            {loadingCommentary && (
              <p className="text-[11px] text-slate-400">
                Preparing a short recap...
              </p>
            )}
            {commentary && (
              <>
                <p>{commentary.commentary}</p>
                <p className="text-slate-500">{commentary.statNugget}</p>
              </>
            )}
            <div className="mt-2 text-[11px] text-slate-500">
              This is just a snapshot of how people voted today. It doesn&apos;t
              have to decide anything for you.
            </div>
            <div className="mt-auto pt-2 flex justify-end">
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center rounded-2xl bg-preg-lilac px-4 py-2 text-[11px] font-semibold text-white shadow-md shadow-preg-lilac/40 hover:bg-preg-lilac/90"
              >
                Next matchup
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface NameBarProps {
  side: "left" | "right";
  name: string;
  percent: number;
  votes: number;
}

function NameBar({ side, name, percent, votes }: NameBarProps) {
  const barColor =
    side === "left" ? "from-preg-rose to-preg-lilac" : "from-preg-lilac to-preg-mint";

  return (
    <div className="flex items-center gap-3 text-[11px] text-slate-600">
      <div className="min-w-[64px] font-semibold text-slate-800">{name}</div>
      <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <div className="min-w-[60px] text-right">
        <span className="font-semibold text-slate-800">{percent}%</span>
        <span className="ml-1 text-slate-400">({votes})</span>
      </div>
    </div>
  );
}

interface ChampionCardProps {
  name: string;
  setup: { parentNames: string; dueLabel: string };
}

function ChampionCard({ name, setup }: ChampionCardProps) {
  return (
    <div className="mt-5 flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="inline-flex flex-col items-center rounded-3xl border border-preg-rose/50 bg-preg-rose-soft px-6 py-5 shadow-[0_0_40px_rgba(244,114,182,0.45)]"
      >
        <p className="text-[11px] uppercase tracking-[0.25em] text-preg-rose mb-1">
          Crowd favorite
        </p>
        <h3 className="text-xl font-semibold text-slate-900">{name}</h3>
        <p className="mt-1 text-[12px] text-slate-700 text-center max-w-sm">
          This was the name that gathered the most support today. Whether you
          choose it or not, your shortlist clearly made an impression.
        </p>
        {setup.parentNames && (
          <p className="mt-2 text-[11px] text-slate-600">
            From the circle around {setup.parentNames}
            {setup.dueLabel ? ` · ${setup.dueLabel}` : ""}
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={() => {
              const text = `${name} won ${setup.parentNames ? `for ${setup.parentNames}` : ""}!`;
              navigator.clipboard.writeText(text);
            }}
            className="rounded-full bg-white/80 px-4 py-2 font-semibold text-preg-rose shadow"
          >
            Copy announcement
          </button>
          <a
            href="https://www.preglife.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/70 px-4 py-2 font-semibold text-white bg-gradient-to-r from-preg-rose to-preg-lilac"
          >
            Continue in Preglife →
          </a>
        </div>
      </motion.div>
    </div>
  );
}
