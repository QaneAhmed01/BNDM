"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PlayerControllerPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const code = params.code as string;
    const playerId = searchParams.get("playerId") ?? "unknown";

    const state = useQuery(api.getRoomState.get, { code });
    const castVote = useMutation(api.castVote.cast);

    const [votedChoice, setVotedChoice] = useState<string | null>(null);

    // Reset vote when status changes to VOTING (new match)
    const [lastMatchId, setLastMatchId] = useState("");
    if (state && state.status === "VOTING") {
        const bracket = JSON.parse(state.bracketState);
        const currentMatch = bracket.rounds[state.currentRound].matches[state.currentMatch];
        if (currentMatch.id !== lastMatchId) {
            setLastMatchId(currentMatch.id);
            setVotedChoice(null); // Reset for new match
        }
    }

    async function handleVote(choice: string) {
        if (!state) return;
        const bracket = JSON.parse(state.bracketState);
        const currentMatch = bracket.rounds[state.currentRound].matches[state.currentMatch];

        setVotedChoice(choice); // Optimistic update

        await castVote({
            gameId: state._id,
            matchId: currentMatch.id,
            playerId,
            choice,
        });
    }

    if (!state) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse text-preg-ink/50 font-bold">Connecting...</div>
        </div>
    );

    const bracket = JSON.parse(state.bracketState);
    const currentMatch = bracket.rounds[state.currentRound]?.matches[state.currentMatch];

    return (
        <main className="min-h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-white shadow-sm z-10">
                <div className="text-xs font-black text-preg-ink/40 tracking-widest uppercase">ROOM {code}</div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-preg-ink/60">LIVE</span>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>

            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    {state.status === "LOBBY" && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="h-24 w-24 rounded-full bg-white shadow-soft flex items-center justify-center mb-6 animate-bounce-slow">
                                <svg viewBox="0 0 24 24" className="h-12 w-12 text-preg-pink" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M7 13c0-2 1-3 3-3s3 1 3 3M14 13c0-2 1-3 3-3s3 1 3 3" strokeLinecap="round" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-preg-ink mb-2">You're in!</h2>
                            <p className="text-preg-ink/60">Waiting for host to start...</p>
                        </motion.div>
                    )}

                    {state.status === "VOTING" && currentMatch && (
                        <motion.div
                            key="voting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col p-4 gap-4"
                        >
                            <div className="text-center py-2">
                                <h2 className="text-xl font-black text-preg-ink">Vote now!</h2>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                <VoteButton
                                    name={currentMatch.nameA}
                                    color="pink"
                                    isSelected={votedChoice === currentMatch.nameA}
                                    isDimmed={votedChoice !== null && votedChoice !== currentMatch.nameA}
                                    onClick={() => handleVote(currentMatch.nameA)}
                                />
                                <VoteButton
                                    name={currentMatch.nameB ?? "Bye"}
                                    color="mint"
                                    isSelected={votedChoice === (currentMatch.nameB ?? "Bye")}
                                    isDimmed={votedChoice !== null && votedChoice !== (currentMatch.nameB ?? "Bye")}
                                    onClick={() => currentMatch.nameB && handleVote(currentMatch.nameB)}
                                    disabled={!currentMatch.nameB}
                                />
                            </div>

                            {votedChoice && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-2 text-sm font-bold text-preg-ink/40 uppercase tracking-widest"
                                >
                                    Vote cast!
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {state.status === "REVEAL" && currentMatch && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="mb-2 text-sm font-bold text-preg-ink/40 uppercase tracking-widest">Winner</div>
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className={`text-5xl font-black mb-6 ${currentMatch.winner === currentMatch.nameA ? "text-preg-pink" : "text-preg-mint"}`}
                            >
                                {currentMatch.winner}
                            </motion.div>
                            <div className="text-preg-ink/50 text-sm">Look at the big screen!</div>
                        </motion.div>
                    )}

                    {state.status === "FINISHED" && (
                        <motion.div
                            key="finished"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-preg-pink to-preg-peach flex items-center justify-center mb-6 shadow-lg">
                                <svg viewBox="0 0 24 24" className="h-12 w-12 text-white" fill="currentColor">
                                    <path d="M12 2l3 7 7-3-3 7 3 7-7-3-3 7-3-7-7 3 3-7-3-7 7 3z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-preg-ink mb-2">Tournament Over!</h2>
                            <p className="text-preg-ink/60">Thanks for playing.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function VoteButton({ name, color, isSelected, isDimmed, onClick, disabled }: any) {
    const bgClass = color === "pink"
        ? isSelected ? "bg-preg-pink text-white" : "bg-white text-preg-ink border-preg-pink/20"
        : isSelected ? "bg-preg-mint text-white" : "bg-white text-preg-ink border-preg-mint/20";

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            className={`
                flex-1 rounded-3xl border-4 shadow-soft flex items-center justify-center relative overflow-hidden
                ${bgClass}
                ${isDimmed ? "opacity-30 grayscale" : "opacity-100"}
                ${disabled ? "opacity-20 cursor-not-allowed" : ""}
                transition-all duration-300
            `}
        >
            <span className="text-3xl font-black z-10">{name}</span>
            {isSelected && (
                <motion.div
                    layoutId="check"
                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white text-preg-ink flex items-center justify-center shadow-sm"
                >
                    ✓
                </motion.div>
            )}
        </motion.button>
    );
}
