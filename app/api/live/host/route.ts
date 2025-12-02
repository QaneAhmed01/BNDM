import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeTournament } from "@/lib/tournament";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { names } = body;

        if (!names || !Array.isArray(names) || names.length < 2) {
            return NextResponse.json(
                { error: "Invalid input. At least 2 names are required." },
                { status: 400 }
            );
        }

        // Generate 4-letter code
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();

        // Initialize bracket
        const bracket = initializeTournament(names);

        const room = await prisma.room.create({
            data: {
                code,
                status: "LOBBY",
                bracketState: JSON.stringify(bracket),
            },
        });

        return NextResponse.json(room);
    } catch (error) {
        console.error("Failed to create room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}
