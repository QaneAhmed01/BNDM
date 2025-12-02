import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { candidateId } = body;

        if (!candidateId) {
            return NextResponse.json(
                { error: "Candidate ID is required" },
                { status: 400 }
            );
        }

        // Check if poll is open
        const poll = await prisma.poll.findUnique({
            where: { id: params.id },
        });

        if (!poll) {
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }

        if (poll.isClosed || new Date() > poll.expiresAt) {
            return NextResponse.json(
                { error: "Poll is closed" },
                { status: 403 }
            );
        }

        // Increment vote
        await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                voteCount: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to vote:", error);
        return NextResponse.json(
            { error: "Failed to vote" },
            { status: 500 }
        );
    }
}
