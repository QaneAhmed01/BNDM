"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function CreatePollForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [names, setNames] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [duration, setDuration] = useState(7);
    const [loading, setLoading] = useState(false);

    function addName() {
        const trimmed = inputValue.trim();
        if (trimmed && !names.includes(trimmed)) {
            setNames([...names, trimmed]);
            setInputValue("");
        }
    }

    function removeName(name: string) {
        setNames(names.filter((n) => n !== name));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || names.length < 2) return;

        setLoading(true);
        try {
            const res = await fetch("/api/poll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    names,
                    durationDays: duration,
                }),
            });

            if (res.ok) {
                const poll = await res.json();
                router.push(`/poll/${poll.id}`);
            } else {
                alert("Failed to create poll");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating poll");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg mx-auto">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-preg-ink/70">Poll Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Help us name our baby!"
                    className="w-full rounded-2xl border border-preg-peach/70 bg-white/50 px-4 py-3 text-preg-ink focus:border-preg-pink focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-preg-ink/70">Add Names</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addName())}
                        placeholder="Type a name..."
                        className="flex-1 rounded-2xl border border-preg-peach/70 bg-white/50 px-4 py-3 text-preg-ink focus:border-preg-pink focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={addName}
                        className="rounded-2xl bg-white px-6 py-3 font-semibold text-preg-ink shadow-sm hover:bg-gray-50"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {names.map((name) => (
                        <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-preg-ink shadow-sm border border-preg-peach/30"
                        >
                            {name}
                            <button
                                type="button"
                                onClick={() => removeName(name)}
                                className="text-preg-ink/40 hover:text-preg-rose"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-preg-ink/70">Duration (Days)</label>
                <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full rounded-2xl border border-preg-peach/70 bg-white/50 px-4 py-3 text-preg-ink focus:border-preg-pink focus:outline-none"
                >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={loading || !title || names.length < 2}
                className="rounded-2xl bg-gradient-to-r from-preg-pink via-preg-peach to-preg-mint px-6 py-4 font-bold text-preg-ink shadow-soft hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Creating..." : "Create Poll"}
            </button>
        </form>
    );
}
