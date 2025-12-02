import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const cast = mutation({
    args: {
        gameId: v.id("liveGames"),
        matchId: v.string(),
        playerId: v.string(),
        choice: v.string(),
    },
    handler: async (ctx, args) => {
        const existingVote = await ctx.db
            .query("votes")
            .withIndex("by_player_match", (q) =>
                q
                    .eq("gameId", args.gameId)
                    .eq("matchId", args.matchId)
                    .eq("playerId", args.playerId)
            )
            .first();

        if (existingVote) {
            await ctx.db.patch(existingVote._id, {
                choice: args.choice,
                timestamp: Date.now(),
            });
        } else {
            await ctx.db.insert("votes", {
                gameId: args.gameId,
                matchId: args.matchId,
                playerId: args.playerId,
                choice: args.choice,
                timestamp: Date.now(),
            });
        }
    },
});
