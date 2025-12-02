import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const game = await ctx.db
            .query("liveGames")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!game) return null;

        const players = await ctx.db
            .query("players")
            .withIndex("by_game", (q) => q.eq("gameId", game._id))
            .collect();

        return {
            ...game,
            playerCount: players.length,
            players: players.map(p => p.name),
        };
    },
});
