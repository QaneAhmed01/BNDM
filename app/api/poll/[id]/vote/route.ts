import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convexServerClient";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 },
      );
    }

    const convex = getConvexClient();
    await convex.mutation(api.polls.vote, {
      pollId: params.id as Id<"polls">,
      candidateId: candidateId as Id<"pollCandidates">,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to vote:", error);
    const message = error?.message ?? "Failed to vote";
    const status = message === "Poll is closed" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
