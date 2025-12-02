import { NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convexServerClient";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, names, durationDays } = body;

    if (!title || !Array.isArray(names) || names.length < 2) {
      return NextResponse.json(
        { error: "Invalid input. Title and at least 2 names are required." },
        { status: 400 },
      );
    }

    const convex = getConvexClient();
    const poll = await convex.mutation(api.polls.create, {
      title,
      names,
      durationDays: typeof durationDays === "number" ? durationDays : 1,
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Failed to create poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 },
    );
  }
}
