import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convexServerClient";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const convex = getConvexClient();
    const pollId = params.id as Id<"polls">;
    const poll = await convex.query(api.polls.get, { id: pollId });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Failed to fetch poll:", error);
    return NextResponse.json(
      { error: "Failed to fetch poll" },
      { status: 500 },
    );
  }
}
