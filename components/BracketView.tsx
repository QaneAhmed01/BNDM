/* 
We are re-implementing the Baby Name Tournament bracket view with these required principles:

- Use a 4-column responsive grid with column widths minmax(220px,1fr).
- Each column represents a round.
- Each matchup card has rounded corners (20px), light pastel pink background (#FDE8EC),
  soft shadow, padding 12px vertical / 16px horizontal, and fixed height (64px).
- Connectors are SVG paths with stroke #F4A9BB, stroke width 2, rounded caps, and gentle Bezier curves.
- Strict vertical rhythm: match height 64px with 32px gaps; each subsequent round doubles the spacing.
- Final round uses same card but visually acts as hero.
- Animations: cards fade in + slight slide from bottom with 0.15s stagger; connectors animate stroke dashoffset.
*/

"use client";

import { motion } from "framer-motion";

const MATCH_HEIGHT = 64;
const MATCH_GAP = 32;
const COLUMN_WIDTH = 260;
const BASE_X = 160;
const BASE_Y = 140;
const CARD_WIDTH = 200;

interface BracketMatch {
  id: string;
  nameA: string;
  nameB: string;
  winner: "A" | "B";
}

interface BracketRound {
  roundLabel: string;
  matches: BracketMatch[];
}

interface BracketViewProps {
  rounds: BracketRound[];
}

export default function BracketView({ rounds }: BracketViewProps) {
  return (
    <div className="relative w-full overflow-x-auto py-8 bg-gradient-to-b from-[#FFE6E9] to-[#FDF5F6]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-12 px-6 min-w-max">
        {rounds.map((round, rIndex) => (
          <div key={round.roundLabel} className="flex flex-col gap-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-preg-ink/60 uppercase">
              {round.roundLabel}
            </p>

            {round.matches.map((match, mIndex) => {
              const winner = match.winner === "A" ? match.nameA : match.nameB;
              const loser = match.winner === "A" ? match.nameB : match.nameA;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * mIndex }}
                  className="relative bg-[#FDE8EC] border border-[#F4A9BB] rounded-2xl shadow-soft py-3 px-4 h-16 flex flex-col justify-center gap-1"
                >
                  <p className="text-sm font-semibold text-preg-ink">{winner}</p>
                  <p className="text-xs text-preg-ink/50 line-through">{loser}</p>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <svg className="pointer-events-none absolute inset-0 w-full h-full">
        {rounds.map((round, rIndex) => {
          if (rIndex === rounds.length - 1) return null;

          return round.matches.map((match, mIndex) => {
            const nextMatchIndex = Math.floor(mIndex / 2);
            const start = getNodePosition(rIndex, mIndex);
            const end = getNodePosition(rIndex + 1, nextMatchIndex);
            const path = `M ${start.x} ${start.y} C ${(start.x + end.x) / 2} ${
              start.y
            }, ${(start.x + end.x) / 2} ${end.y}, ${end.x} ${end.y}`;

            return (
              <motion.path
                key={`${match.id}-connector`}
                d={path}
                fill="none"
                stroke="#F4A9BB"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.1 * mIndex }}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}

function getNodePosition(roundIndex: number, matchIndex: number) {
  const x =
    BASE_X +
    roundIndex * COLUMN_WIDTH +
    (roundIndex === 0 ? CARD_WIDTH : CARD_WIDTH / 2);
  const y =
    BASE_Y +
    matchIndex * (MATCH_HEIGHT + MATCH_GAP) +
    MATCH_HEIGHT / 2;
  return { x, y };
}
