import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    try {
        const room = await prisma.room.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                players: true,
            },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // If we are in voting mode, we also want to know the vote counts for the current match
        let currentVotes = { A: 0, B: 0 };
        if (room.status === "VOTING" || room.status === "REVEAL") {
            const bracket = JSON.parse(room.bracketState);
            const currentRound = bracket.rounds[room.currentRound];
            // Safety check
            if (currentRound && currentRound.matches[room.currentMatch]) {
                const matchId = currentRound.matches[room.currentMatch].id;

                const votes = await prisma.vote.findMany({
                    where: { matchId },
                });

                const match = currentRound.matches[room.currentMatch];
                currentVotes.A = votes.filter((v: any) => v.choice === match.nameA).length;
                currentVotes.B = votes.filter((v: any) => v.choice === match.nameB).length;
            }
        }

        return NextResponse.json({ ...room, currentVotes });
    } catch (error) {
        console.error("Failed to fetch state:", error);
        return NextResponse.json({ error: "Failed to fetch state" }, { status: 500 });
    }
}
