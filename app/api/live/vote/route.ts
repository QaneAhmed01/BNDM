import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { playerId, matchId, choice } = body;

        if (!playerId || !matchId || !choice) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Upsert vote (allow changing mind)
        // We need to find if this player already voted for this match
        const existingVote = await prisma.vote.findFirst({
            where: {
                playerId,
                matchId,
            },
        });

        if (existingVote) {
            await prisma.vote.update({
                where: { id: existingVote.id },
                data: { choice },
            });
        } else {
            await prisma.vote.create({
                data: {
                    playerId,
                    matchId,
                    choice,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to cast vote:", error);
        return NextResponse.json(
            { error: "Failed to cast vote" },
            { status: 500 }
        );
    }
}
