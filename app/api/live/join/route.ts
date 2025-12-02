import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, name } = body;

        if (!code || !name) {
            return NextResponse.json(
                { error: "Room code and name are required." },
                { status: 400 }
            );
        }

        const room = await prisma.room.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!room) {
            return NextResponse.json(
                { error: "Room not found." },
                { status: 404 }
            );
        }

        const player = await prisma.player.create({
            data: {
                name,
                roomCode: room.code,
            },
        });

        return NextResponse.json(player);
    } catch (error) {
        console.error("Failed to join room:", error);
        return NextResponse.json(
            { error: "Failed to join room" },
            { status: 500 }
        );
    }
}
