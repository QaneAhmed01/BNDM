import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { advanceRound } from "@/lib/tournament";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, action } = body; // action: START, REVEAL, NEXT

        const room = await prisma.room.findUnique({
            where: { code },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        let updates: any = {};
        const bracket = JSON.parse(room.bracketState);
        const currentRound = bracket.rounds[room.currentRound];
        const currentMatch = currentRound.matches[room.currentMatch];

        if (action === "START") {
            updates.status = "VOTING";
        } else if (action === "REVEAL") {
            updates.status = "REVEAL";

            // Calculate winner for this match based on DB votes
            const votes = await prisma.vote.findMany({
                where: { matchId: currentMatch.id },
            });

            const votesA = votes.filter((v: any) => v.choice === currentMatch.nameA).length;
            const votesB = votes.filter((v: any) => v.choice === currentMatch.nameB).length;

            // Update bracket state with winner
            const winner = votesA >= votesB ? currentMatch.nameA : (currentMatch.nameB ?? currentMatch.nameA);

            currentMatch.votesA = votesA;
            currentMatch.votesB = votesB;
            currentMatch.winner = winner;

            // Save back to bracket structure
            bracket.rounds[room.currentRound].matches[room.currentMatch] = currentMatch;
            updates.bracketState = JSON.stringify(bracket);

        } else if (action === "NEXT") {
            // Check if there are more matches in this round
            if (room.currentMatch < currentRound.matches.length - 1) {
                updates.currentMatch = room.currentMatch + 1;
                updates.status = "VOTING";
            } else {
                // End of round, try to advance
                // We need to check if the WHOLE tournament is done or just the round
                // The `advanceRound` function expects a bracket where all matches in current round have winners
                // We just ensured the current match has a winner in the REVEAL step.
                // But we need to make sure we updated the bracket state correctly.

                // Let's re-verify all matches in this round have winners
                const allDone = currentRound.matches.every((m: any) => m.winner);

                if (allDone) {
                    const nextBracket = advanceRound(bracket);
                    if (nextBracket.finalWinner) {
                        updates.status = "FINISHED";
                        updates.bracketState = JSON.stringify(nextBracket);
                    } else {
                        // New round created
                        updates.currentRound = room.currentRound + 1;
                        updates.currentMatch = 0;
                        updates.status = "VOTING";
                        updates.bracketState = JSON.stringify(nextBracket);
                    }
                } else {
                    // Should not happen if logic is correct
                    return NextResponse.json({ error: "Round not complete" }, { status: 400 });
                }
            }
        }

        const updatedRoom = await prisma.room.update({
            where: { code },
            data: updates,
        });

        return NextResponse.json(updatedRoom);

    } catch (error) {
        console.error("Control action failed:", error);
        return NextResponse.json(
            { error: "Control action failed" },
            { status: 500 }
        );
    }
}
