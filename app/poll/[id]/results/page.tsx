"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface Poll {
    id: string;
    title: string;
    candidates: { id: string; name: string; voteCount: number }[];
}

export default function PollResultsPage() {
    const params = useParams();
    const [poll, setPoll] = useState<Poll | null>(null);

    useEffect(() => {
        fetch(`/api/poll/${params.id}`)
            .then((res) => res.json())
            .then((data) => setPoll(data));
    }, [params.id]);

    if (!poll) return <div className="p-10 text-center">Loading results...</div>;

    const totalVotes = poll.candidates.reduce((acc, c) => acc + c.voteCount, 0);

    return (
        <main className="min-h-screen p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-preg-ink">{poll.title}</h1>
                    <p className="text-preg-ink/60">Live Results · {totalVotes} votes total</p>
                </header>

                <div className="space-y-4">
                    {poll.candidates.map((candidate, index) => {
                        const percent = totalVotes === 0 ? 0 : Math.round((candidate.voteCount / totalVotes) * 100);
                        return (
                            <div key={candidate.id} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium text-preg-ink">
                                    <span>{index + 1}. {candidate.name}</span>
                                    <span>{percent}% ({candidate.voteCount})</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-white/50 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        className="h-full bg-gradient-to-r from-preg-pink to-preg-mint"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl bg-white/60 p-6 text-center border border-preg-peach/30">
                    <p className="text-sm text-preg-ink/60 mb-2">Share this link to get more votes:</p>
                    <code className="block rounded bg-white p-2 text-xs text-preg-ink/80 select-all">
                        {window.location.origin}/poll/{poll.id}
                    </code>
                </div>
            </div>
        </main>
    );
}
