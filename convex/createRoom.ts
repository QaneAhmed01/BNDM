import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { initializeTournament } from "./tournament";

export const create = mutation({
    args: { names: v.array(v.string()) },
    handler: async (ctx, args) => {
        // Generate 4-letter code
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();

        // Initialize bracket
        const bracket = initializeTournament(args.names);

        const gameId = await ctx.db.insert("liveGames", {
            code,
            hostId: "host", // Simple for now, could be auth-based later
            status: "LOBBY",
            currentRound: 0,
            currentMatch: 0,
            bracketState: JSON.stringify(bracket),
            participants: args.names,
            createdAt: Date.now(),
        });

        return { code, gameId };
    },
});
