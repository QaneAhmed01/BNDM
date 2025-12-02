import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const poll = await prisma.poll.findUnique({
            where: { id: params.id },
            include: {
                candidates: {
                    orderBy: {
                        voteCount: "desc",
                    },
                },
            },
        });

        if (!poll) {
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }

        return NextResponse.json(poll);
    } catch (error) {
        console.error("Failed to fetch poll:", error);
        return NextResponse.json(
            { error: "Failed to fetch poll" },
            { status: 500 }
        );
    }
}
