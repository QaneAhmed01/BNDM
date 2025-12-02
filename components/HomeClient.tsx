"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PreglifeShell } from "@/components/PreglifeShell";
import { SetupPanel, SetupData } from "@/components/SetupPanel";
import {
  VotingArena,
  VoteTallies,
  createEmptyTallies,
} from "@/components/VotingArena";
import {
  RevealCinema,
  RevealState,
  buildRevealStateFromTallies,
} from "@/components/RevealCinema";
import { TournamentBracket, buildBracket } from "@/lib/tournament";
import { StageTimeline } from "@/components/StageTimeline";
import { TournamentSummary } from "@/components/TournamentSummary";
import { HallOfFamePanel } from "@/components/HallOfFamePanel";

type Stage = "setup" | "voting" | "reveal";

const STORAGE_KEY = "preglife_baby_tournament";
const HOF_KEY = "preglife_baby_tournament_hof";

interface StoredState {
  setup: SetupData;
  tallies: VoteTallies;
}

export function HomeClient() {
  const [stage, setStage] = useState<Stage>("setup");
  const [setupData, setSetupData] = useState<SetupData>({
    parentNames: "",
    babyNames: [],
    dueLabel: "",
  });
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [tallies, setTallies] = useState<VoteTallies>({});
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const [hallOfFame, setHallOfFame] = useState<
    Array<{ name: string; timestamp: string; context?: string }>
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed.setup && parsed.setup.babyNames?.length >= 2) {
        setSetupData(parsed.setup);
        const builtBracket = buildBracket(parsed.setup.babyNames);
        setBracket(builtBracket);
        setTallies(parsed.tallies);
        setStage("voting");
      }
    } catch {
      // ignore hydration errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HOF_KEY);
      if (raw) {
        setHallOfFame(JSON.parse(raw));
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HOF_KEY, JSON.stringify(hallOfFame));
  }, [hallOfFame]);

  function persist(setup: SetupData, talliesToSave: VoteTallies) {
    if (typeof window === "undefined") return;
    try {
      const payload: StoredState = {
        setup,
        tallies: talliesToSave,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }

  function handleSetupComplete(data: SetupData, built: TournamentBracket) {
    setSetupData(data);
    setBracket(built);
    const initialTallies = createEmptyTallies(built.rounds);
    setTallies(initialTallies);
    persist(data, initialTallies);
    setStage("voting");
  }

  function handleVoteUpdate(nextTallies: VoteTallies) {
    setTallies(nextTallies);
    persist(setupData, nextTallies);
  }

  function handleStartReveal() {
    if (!bracket) return;
    const state = buildRevealStateFromTallies(bracket, tallies, setupData);
    setRevealState(state);
    setStage("reveal");
    if (state.champion) {
      setHallOfFame((prev) => [
        {
          name: state.champion!,
          timestamp: new Date().toISOString(),
          context: setupData.parentNames || undefined,
        },
        ...prev,
      ]);
    }
  }

  function handleResetAll() {
    setStage("setup");
    setBracket(null);
    setTallies({});
    setRevealState(null);
    setSetupData({
      parentNames: "",
      babyNames: [],
      dueLabel: "",
    });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const totalVotes = Object.values(tallies).reduce(
    (sum, entry) => sum + entry.leftVotes + entry.rightVotes,
    0
  );

  return (
    <PreglifeShell onReset={handleResetAll}>
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <StageTimeline current={stage} totalVotes={totalVotes} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.9fr)] items-start">
          <div className="space-y-4">
            {stage === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SetupPanel
                  initial={setupData}
                  onComplete={handleSetupComplete}
                />
              </motion.div>
            )}

            {stage === "voting" && bracket && (
              <motion.div
                key="voting"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <VotingArena
                  setup={setupData}
                  bracket={bracket}
                  tallies={tallies}
                  onTalliesChange={handleVoteUpdate}
                  onStartReveal={handleStartReveal}
                />
              </motion.div>
            )}

            {stage === "reveal" && bracket && revealState && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <RevealCinema setup={setupData} revealState={revealState} />
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <TournamentSummary
              parentNames={setupData.parentNames}
              dueLabel={setupData.dueLabel}
              nameCount={setupData.babyNames.length}
              totalVotes={totalVotes}
              stage={stage}
            />
            <HallOfFamePanel entries={hallOfFame} />
          </div>
        </div>
      </main>
    </PreglifeShell>
  );
}
