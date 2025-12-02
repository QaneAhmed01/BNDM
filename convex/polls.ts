import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

type PollRecord = {
  _id: Id<"polls">;
  title: string;
  expiresAt: number;
  isClosed: boolean;
  createdAt: number;
};

type CandidateRecord = {
  _id: Id<"pollCandidates">;
  pollId: Id<"polls">;
  name: string;
  voteCount: number;
};

async function loadPoll(ctx: any, pollId: Id<"polls">) {
  const poll = (await ctx.db.get(pollId)) as PollRecord | null;
  if (!poll) return null;

  const candidates = (await ctx.db
    .query("pollCandidates")
    .withIndex("by_poll", (q: any) => q.eq("pollId", pollId))
    .collect()) as CandidateRecord[];

  candidates.sort((a, b) => b.voteCount - a.voteCount);

  return {
    id: poll._id,
    title: poll.title,
    expiresAt: new Date(poll.expiresAt).toISOString(),
    isClosed: poll.isClosed,
    candidates: candidates.map((c) => ({
      id: c._id,
      name: c.name,
      voteCount: c.voteCount,
    })),
  };
}

export const create = mutation({
  args: {
    title: v.string(),
    names: v.array(v.string()),
    durationDays: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.names.length < 2) {
      throw new Error("At least 2 names are required.");
    }

    const expiresAt =
      Date.now() + Math.max(1, args.durationDays) * 24 * 60 * 60 * 1000;

    const pollId = await ctx.db.insert("polls", {
      title: args.title,
      expiresAt,
      isClosed: false,
      createdAt: Date.now(),
    });

    for (const name of args.names) {
      await ctx.db.insert("pollCandidates", {
        pollId,
        name,
        voteCount: 0,
      });
    }

    return loadPoll(ctx, pollId);
  },
});

export const get = query({
  args: { id: v.id("polls") },
  handler: async (ctx, args) => {
    return loadPoll(ctx, args.id);
  },
});

export const vote = mutation({
  args: {
    pollId: v.id("polls"),
    candidateId: v.id("pollCandidates"),
  },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.isClosed || Date.now() > poll.expiresAt) {
      throw new Error("Poll is closed");
    }

    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate || candidate.pollId !== args.pollId) {
      throw new Error("Candidate not found");
    }

    await ctx.db.patch(candidate._id, {
      voteCount: candidate.voteCount + 1,
    });

    return { success: true };
  },
});
