import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, names, durationDays } = body;

        if (!title || !names || !Array.isArray(names) || names.length < 2) {
            return NextResponse.json(
                { error: "Invalid input. Title and at least 2 names are required." },
                { status: 400 }
            );
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (durationDays || 1));

        const poll = await prisma.poll.create({
            data: {
                title,
                expiresAt,
                candidates: {
                    create: names.map((name: string) => ({ name })),
                },
            },
        });

        return NextResponse.json(poll);
    } catch (error) {
        console.error("Failed to create poll:", error);
        return NextResponse.json(
            { error: "Failed to create poll" },
            { status: 500 }
        );
    }
}
