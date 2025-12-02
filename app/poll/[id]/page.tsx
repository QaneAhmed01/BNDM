"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Poll {
    id: string;
    title: string;
    expiresAt: string;
    candidates: { id: string; name: string; voteCount: number }[];
}

export default function PollPage() {
    const params = useParams();
    const router = useRouter();
    const [poll, setPoll] = useState<Poll | null>(null);
    const [voted, setVoted] = useState(false);

    useEffect(() => {
        fetch(`/api/poll/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    setPoll(data);
                }
            });
    }, [params.id]);

    async function handleVote(candidateId: string) {
        try {
            const res = await fetch(`/api/poll/${params.id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidateId }),
            });
            if (res.ok) {
                setVoted(true);
                router.push(`/poll/${params.id}/results`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (!poll) return <div className="p-10 text-center">Loading poll...</div>;

    return (
        <main className="min-h-screen p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <div className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-preg-ink/50">
                        Vote for your favorite
                    </div>
                    <h1 className="text-3xl font-bold text-preg-ink">{poll.title}</h1>
                    <p className="text-sm text-preg-ink/50">
                        Poll closes on {new Date(poll.expiresAt).toLocaleDateString()}
                    </p>
                </header>

                <div className="grid gap-4">
                    {poll.candidates.map((candidate) => (
                        <motion.button
                            key={candidate.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleVote(candidate.id)}
                            className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-preg-peach/30 hover:border-preg-pink hover:shadow-md transition-all"
                        >
                            <span className="text-lg font-semibold text-preg-ink">{candidate.name}</span>
                            <span className="rounded-full bg-preg-peach/30 px-4 py-2 text-xs font-bold text-preg-ink/70 uppercase tracking-wide">
                                Vote
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </main>
    );
}
