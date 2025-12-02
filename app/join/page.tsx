"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function JoinPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const joinRoom = useMutation(api.joinRoom.join);

    useEffect(() => {
        const preset = (searchParams.get("code") ?? "").toUpperCase();
        if (preset) {
            setCode(preset);
        }
    }, [searchParams]);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await joinRoom({ code, name });
            router.push(`/live/play/${code}?playerId=${result.playerId}`);
        } catch (error) {
            console.error(error);
            alert("Room not found or error joining.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-soft p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-preg-ink">Join Game</h1>
                    <p className="text-preg-ink/60">Enter the code on the TV</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-preg-ink/70 mb-1">Room Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABCD"
                            maxLength={4}
                            className="w-full text-center text-3xl font-black tracking-widest uppercase rounded-xl border border-preg-peach/50 p-4 focus:border-preg-pink focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-preg-ink/70 mb-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mom"
                            className="w-full rounded-xl border border-preg-peach/50 p-4 text-lg focus:border-preg-pink focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 4 || !name}
                        className="w-full rounded-xl bg-preg-ink py-4 text-lg font-bold text-white shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Joining..." : "Join"}
                    </button>
                </form>
            </div>
        </main>
    );
}
