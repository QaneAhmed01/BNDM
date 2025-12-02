
import { PrismaClient } from "@prisma/client";
import { initializeTournament } from "./lib/tournament";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting debug...");
    try {
        const names = ["Alice", "Bob", "Charlie", "Dave"];
        console.log("Initializing tournament with names:", names);

        const bracket = initializeTournament(names);
        console.log("Bracket initialized successfully.");

        const code = "TEST";
        console.log("Creating room with code:", code);

        // Clean up previous test if exists
        try {
            await prisma.room.delete({ where: { code } });
        } catch { }

        const room = await prisma.room.create({
            data: {
                code,
                status: "LOBBY",
                bracketState: JSON.stringify(bracket),
            },
        });

        console.log("Room created successfully:", room);
    } catch (error) {
        console.error("ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
