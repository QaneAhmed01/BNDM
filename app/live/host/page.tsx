"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SetupPanel } from "@/components/SetupPanel";

export default function HostSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleStart(names: string[]) {
        setLoading(true);
        try {
            const res = await fetch("/api/live/host", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ names }),
            });

            if (res.ok) {
                const room = await res.json();
                router.push(`/live/host/${room.code}`);
            } else {
                alert("Failed to create room");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating room");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen p-6 md:p-10 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-preg-ink">Host a Live Tournament</h1>
                    <p className="text-preg-ink/60">
                        Enter names below. Your phone will be the controller. This screen is the main display.
                    </p>
                </header>

                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-preg-peach/50">
                    <SetupPanel onStart={handleStart} />
                </div>
            </div>
        </main>
    );
}
