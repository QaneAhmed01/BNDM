import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { advanceRound } from "./tournament";

export const advance = mutation({
    args: {
        gameId: v.id("liveGames"),
        action: v.string(), // START, REVEAL, NEXT
    },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId);
        if (!game) throw new Error("Game not found");

        const bracket = JSON.parse(game.bracketState);
        const currentRound = bracket.rounds[game.currentRound];
        const currentMatch = currentRound.matches[game.currentMatch];

        if (args.action === "START") {
            await ctx.db.patch(game._id, { status: "VOTING" });
        } else if (args.action === "REVEAL") {
            // Calculate winner
            const votes = await ctx.db
                .query("votes")
                .withIndex("by_match", (q) =>
                    q.eq("gameId", game._id).eq("matchId", currentMatch.id)
                )
                .collect();

            const votesA = votes.filter((v) => v.choice === currentMatch.nameA).length;
            const votesB = votes.filter((v) => v.choice === currentMatch.nameB).length;

            // Determine winner (tie-breaker: nameA or nameB if exists, else nameA)
            const winner = votesA >= votesB ? currentMatch.nameA : (currentMatch.nameB ?? currentMatch.nameA);

            // Update match in bracket
            currentMatch.votesA = votesA;
            currentMatch.votesB = votesB;
            currentMatch.winner = winner;
            bracket.rounds[game.currentRound].matches[game.currentMatch] = currentMatch;

            await ctx.db.patch(game._id, {
                status: "REVEAL",
                bracketState: JSON.stringify(bracket),
            });
        } else if (args.action === "NEXT") {
            if (game.currentMatch < currentRound.matches.length - 1) {
                // Next match in same round
                await ctx.db.patch(game._id, {
                    currentMatch: game.currentMatch + 1,
                    status: "VOTING",
                });
            } else {
                // End of round, advance tournament
                const nextBracket = advanceRound(bracket);

                if (nextBracket.finalWinner) {
                    await ctx.db.patch(game._id, {
                        status: "FINISHED",
                        bracketState: JSON.stringify(nextBracket),
                    });
                } else {
                    // Start next round
                    await ctx.db.patch(game._id, {
                        currentRound: game.currentRound + 1,
                        currentMatch: 0,
                        status: "VOTING",
                        bracketState: JSON.stringify(nextBracket),
                    });
                }
            }
        }
    },
});
