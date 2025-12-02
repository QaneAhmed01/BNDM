import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Live Multiplayer Games (Jackbox Mode)
    liveGames: defineTable({
        code: v.string(),           // 4-letter room code
        hostId: v.string(),         // Host identifier
        status: v.string(),         // LOBBY, VOTING, REVEAL, FINISHED
        currentRound: v.number(),   // Current round index
        currentMatch: v.number(),   // Current match index in the round
        bracketState: v.string(),   // JSON string of the full bracket structure
        participants: v.array(v.string()), // List of player names/IDs
        createdAt: v.number(),
    }).index("by_code", ["code"]),

    // Players joined in the room (Voters)
    players: defineTable({
        gameId: v.id("liveGames"),
        name: v.string(),
        joinedAt: v.number(),
    }).index("by_game", ["gameId"]),

    // Real-time Votes for Live Games
    votes: defineTable({
        gameId: v.id("liveGames"),
        matchId: v.string(),        // ID of the match within the bracket
        playerId: v.string(),       // Player who voted
        choice: v.string(),         // Name they voted for
        timestamp: v.number(),
    }).index("by_match", ["gameId", "matchId"])
        .index("by_player_match", ["gameId", "matchId", "playerId"]),

    // Async Polls
    asyncPolls: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        options: v.array(v.string()), // List of names to vote on
        votes: v.array(v.object({     // Embedded votes for simpler async logic
            voterName: v.string(),
            choices: v.array(v.string()), // Ranked choices or approved choices
            timestamp: v.number(),
        })),
        createdAt: v.number(),
    }),
});
