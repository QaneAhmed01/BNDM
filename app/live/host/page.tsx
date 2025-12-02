"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SetupPanel } from "@/components/SetupPanel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HostSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const createRoom = useMutation(api.createRoom.create);

    async function handleStart(names: string[]) {
        setLoading(true);
        try {
            const room = await createRoom({ names });
            router.push(`/live/host/${room.code}`);
        } catch (error) {
            console.error(error);
            alert("Failed to create room");
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
