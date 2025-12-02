"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SetupData {
  parentNames: string;
  babyNames: string[];
  dueLabel: string;
}

interface SetupPanelProps {
  onStart: (names: string[]) => void;
}

const presetNames = [
  "Luna", "Mika", "Isla", "Nilo", "Ari", "Sana",
  "Oliver", "Emma", "Noah", "Ava", "Liam", "Sophia",
  "Elijah", "Charlotte", "James", "Amelia"
];
const MIN_NAMES = 2;
const MAX_NAMES = 16;

export function SetupPanel({ onStart }: SetupPanelProps) {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const limitReached = names.length >= MAX_NAMES;

  const availablePresets = useMemo(
    () =>
      presetNames.filter(
        (p) => !names.some((n) => n.toLowerCase() === p.toLowerCase())
      ),
    [names]
  );

  function addName(value: string) {
    const trimmed = value.trim();
    if (!trimmed || names.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    if (names.length >= MAX_NAMES) {
      setError(`You can add up to ${MAX_NAMES} names.`);
      return;
    }
    setNames((prev) => [...prev, trimmed]);
    setInputValue("");
    setError(null);
  }

  function removeName(value: string) {
    setNames((prev) => prev.filter((n) => n !== value));
    setError(null);
  }

  function handleStart() {
    if (names.length < MIN_NAMES) {
      setError(`Please add at least ${MIN_NAMES} names to start.`);
      return;
    }
    if (names.length > MAX_NAMES) {
      setError(`Please enter no more than ${MAX_NAMES} names.`);
      return;
    }
    setError(null);
    onStart(names);
  }

  return (
    <div className="flex flex-col gap-5">

      <div className="rounded-3xl border border-preg-peach/70 bg-preg-peach/30 p-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-2.5 text-preg-ink/30">
            <FeatherIcon />
          </div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addName(inputValue);
              }
            }}
            placeholder="Type a name…"
            className="w-full bg-transparent pl-8 text-[16px] text-preg-ink placeholder:text-preg-ink/30 focus:outline-none disabled:opacity-50"
            disabled={limitReached}
          />
        </div>
        <button
          type="button"
          onClick={() => addName(inputValue)}
          disabled={limitReached || inputValue.trim().length === 0}
          className={`touch-target inline-flex items-center justify-center gap-1 rounded-2xl px-5 py-2 text-sm font-semibold shadow-soft ${limitReached || inputValue.trim().length === 0
            ? "bg-white/60 text-preg-ink/40 cursor-not-allowed"
            : "bg-white/90 text-preg-ink hover:brightness-105"
            }`}
        >
          <PlusIcon />
          Add
        </button>
      </div>
      {limitReached && (
        <p className="text-[10px] text-preg-rose/70 text-right -mt-2">
          Limit reached · remove a name to add another.
        </p>
      )}

      <div className="min-h-[60px]">
        <AnimatePresence initial={false}>
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <motion.button
                key={name}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => removeName(name)}
                className="group inline-flex items-center gap-2 rounded-full border border-preg-peach/60 bg-white/90 px-4 py-2 text-sm text-preg-ink shadow-sm hover:border-preg-rose touch-target"
              >
                <span className="text-preg-ink/50">
                  <ChipIcon />
                </span>
                <span>{name}</span>
                <span className="text-preg-ink/30 group-hover:text-preg-rose p-1">
                  ×
                </span>
              </motion.button>
            ))}
            {names.length === 0 && (
              <span className="text-[11px] text-preg-ink/40">
                Drop names here to build the bracket.
              </span>
            )}
          </div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-preg-ink/50">
        {availablePresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => addName(preset)}
            className="inline-flex items-center gap-1 rounded-full border border-preg-ink/10 bg-white/80 px-3 py-1 shadow-sm hover:border-preg-rose/60 transition-colors"
          >
            <ZapIcon />
            {preset}
          </button>
        ))}
        {availablePresets.length === 0 && (
          <span className="text-[11px] text-preg-ink/30 italic">
            All preset names added
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px]">
        <span className="text-preg-ink/50">
          {names.length}/{MAX_NAMES} names added
        </span>
        <span className="text-preg-ink/40">
          Minimum {MIN_NAMES} · Maximum {MAX_NAMES}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-preg-ink/40">
          {names.length} {names.length === 1 ? "name" : "names"}
        </span>
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex items-center rounded-full bg-gradient-to-r from-preg-pink via-preg-peach to-preg-mint px-5 py-2 text-[11px] font-semibold text-preg-ink shadow-soft hover:brightness-105"
        >
          Launch bracket
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-preg-rose mt-1">{error}</p>
      )}
    </div>
  );
}

function FeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20 17.5 6.5a4.95 4.95 0 0 0-7-7L4 6v14Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 22h6" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" opacity="0.2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
