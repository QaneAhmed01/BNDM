import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
    args: { code: v.string(), name: v.string() },
    handler: async (ctx, args) => {
        const game = await ctx.db
            .query("liveGames")
            .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!game) {
            throw new Error("Room not found");
        }

        const playerId = await ctx.db.insert("players", {
            gameId: game._id,
            name: args.name,
            joinedAt: Date.now(),
        });

        return { playerId, gameId: game._id };
    },
});
