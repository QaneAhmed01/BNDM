"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PlaybackPanel } from "@/components/PlaybackPanel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HostDashboardPage() {
    const params = useParams();
    const code = params.code as string;
    const [joinLink, setJoinLink] = useState("");

    const state = useQuery(api.getRoomState.get, { code });
    const advanceMatch = useMutation(api.advanceMatch.advance);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setJoinLink(`${window.location.origin}/join?code=${code}`);
        }
    }, [code]);

    if (!state) return <div className="p-10 text-center">Connecting to room...</div>;

    const bracket = JSON.parse(state.bracketState);
    const currentRound = bracket.rounds[state.currentRound];
    const currentMatch = currentRound?.matches[state.currentMatch];

    // Calculate live votes for current match
    // Note: In a real app, we might want to aggregate this on the server for performance
    // but for < 100 players, client-side aggregation from the `state` (if we returned votes) is okay.
    // However, getRoomState currently doesn't return votes.
    // We should probably add a separate query for votes or include them in getRoomState.
    // For now, let's assume getRoomState returns aggregated votes or we add a query.
    // Actually, the original code had `state.currentVotes`.
    // My `getRoomState` implementation didn't include `currentVotes`.
    // I should update `getRoomState` to include vote counts for the current match.
    // But for now, I'll proceed and maybe update `getRoomState` later.
    // Wait, `advanceMatch` calculates winners based on votes in the DB.
    // So the "REVEAL" step works.
    // But to show "X votes" LIVE during reveal, I need the counts.
    // I'll update `getRoomState` to return vote counts for the current match.

    return (
        <main className="min-h-screen bg-gradient-to-br from-preg-pink/10 via-white to-preg-mint/10 p-6 flex flex-col items-center">
            {/* Header / Room Code */}
            <header className="w-full max-w-6xl flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-xl font-bold text-preg-ink">Baby Name Deathmatch</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-widest text-preg-ink/50">Join Code</span>
                    <span className="text-4xl font-black text-preg-ink tracking-widest">{code}</span>
                    {joinLink && (
                        <div className="mt-4 p-3 rounded-2xl bg-white/80 border border-preg-peach/40 text-center shadow-sm">
                            <p className="text-[11px] font-semibold text-preg-ink/60 mb-2">
                                Scan to join instantly
                            </p>
                            <div className="mx-auto w-40 h-40 bg-white rounded-xl overflow-hidden border border-preg-peach/30">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinLink)}`}
                                    alt="Join QR code"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="mt-2 text-[10px] text-preg-ink/40 break-all">
                                {joinLink}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            {/* LOBBY VIEW */}
            {state.status === "LOBBY" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full max-w-4xl">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-preg-ink">Waiting for Players...</h2>
                        <p className="text-xl text-preg-ink/60">
                            Go to <span className="font-bold text-preg-ink">preglife.app/join</span> and enter code <span className="font-bold text-preg-ink">{code}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <AnimatePresence>
                            {state.players.map((name: string, i: number) => (
                                <motion.div
                                    key={`${name}-${i}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="px-6 py-3 rounded-full bg-white shadow-soft text-lg font-semibold text-preg-ink border border-preg-peach/30"
                                >
                                    {name}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {state.players.length > 0 && (
                        <button
                            onClick={() => advanceMatch({ gameId: state._id, action: "START" })}
                            className="mt-10 px-8 py-4 rounded-2xl bg-preg-ink text-white font-bold text-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            Start Tournament
                        </button>
                    )}
                </div>
            )}

            {/* GAME VIEW */}
            {(state.status === "VOTING" || state.status === "REVEAL") && currentMatch && (
                <div className="flex-1 w-full max-w-5xl flex flex-col gap-8">
                    <div className="text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/50 text-xs font-bold uppercase tracking-wide text-preg-ink/50 mb-2">
                            {currentMatch.roundLabel}
                        </span>
                        <h2 className="text-3xl font-bold text-preg-ink">Match {state.currentMatch + 1} of {currentRound.matches.length}</h2>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-8 items-center">
                        {/* Name A */}
                        <div className={`relative p-10 rounded-3xl bg-white shadow-soft border-4 transition-all duration-500 ${state.status === "REVEAL" && currentMatch.winner === currentMatch.nameA ? "border-preg-pink scale-105" : "border-transparent"}`}>
                            <h3 className="text-5xl md:text-7xl font-black text-center text-preg-ink">{currentMatch.nameA}</h3>
                            {state.status === "REVEAL" && (
                                <div className="mt-4 text-center text-2xl font-bold text-preg-pink">
                                    {currentMatch.votesA} votes
                                </div>
                            )}
                        </div>

                        {/* Name B */}
                        <div className={`relative p-10 rounded-3xl bg-white shadow-soft border-4 transition-all duration-500 ${state.status === "REVEAL" && currentMatch.winner === (currentMatch.nameB ?? currentMatch.nameA) ? "border-preg-mint scale-105" : "border-transparent"}`}>
                            <h3 className="text-5xl md:text-7xl font-black text-center text-preg-ink">{currentMatch.nameB ?? "Bye"}</h3>
                            {state.status === "REVEAL" && (
                                <div className="mt-4 text-center text-2xl font-bold text-preg-mint">
                                    {currentMatch.votesB} votes
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center pb-10">
                        {state.status === "VOTING" && (
                            <button
                                onClick={() => advanceMatch({ gameId: state._id, action: "REVEAL" })}
                                className="px-8 py-4 rounded-2xl bg-preg-ink text-white font-bold text-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                Reveal Winner
                            </button>
                        )}
                        {state.status === "REVEAL" && (
                            <button
                                onClick={() => advanceMatch({ gameId: state._id, action: "NEXT" })}
                                className="px-8 py-4 rounded-2xl bg-white text-preg-ink border-2 border-preg-ink font-bold text-xl shadow-lg hover:scale-105 transition-transform"
                            >
                                Next Match
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* FINISHED VIEW */}
            {state.status === "FINISHED" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <h2 className="text-6xl font-black text-preg-ink">Winner!</h2>
                    <div className="p-12 rounded-full bg-gradient-to-br from-preg-pink via-preg-peach to-preg-mint shadow-soft animate-bounce">
                        <span className="text-6xl font-black text-white">{bracket.finalWinner}</span>
                    </div>
                    <PlaybackPanel
                        matches={bracket.rounds.flatMap((r: any) => r.matches)}
                        rounds={bracket.rounds}
                        winnerName={bracket.finalWinner}
                        onRestart={() => { }} // No restart for now
                    />
                </div>
            )}
        </main>
    );
}
