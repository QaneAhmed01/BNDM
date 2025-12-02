import { NextResponse } from "next/server";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AggregatedMatchResult {
  left: string;
  right: string | null;
  leftVotes: number;
  rightVotes: number;
  roundIndex?: number;
  matchIndex?: number;
}

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const match: AggregatedMatchResult = body.match;
  const totalVoters: number = body.totalVoters ?? 0;
  const parentNames: string = body.parentNames ?? "";
  const dueLabel: string = body.dueLabel ?? "";

  const leftName = match.left;
  const rightName = match.right ?? "";
  const leftVotes = match.leftVotes;
  const rightVotes = match.rightVotes;
  const votesTotal = Math.max(1, leftVotes + rightVotes);
  const leftPct = Math.round((leftVotes / votesTotal) * 100);
  const rightPct = Math.round((rightVotes / votesTotal) * 100);

  const prompt = `
You are narrating a baby name tournament reveal for parents and their friends and family.
Make it warm, light, and family-friendly.

Names: "${leftName}" vs "${rightName}"
Votes: ${leftVotes} vs ${rightVotes}
Percentages: ${leftPct}% vs ${rightPct}%
Total voters counted: ${votesTotal}
Parents label: "${parentNames}"
Due or event label: "${dueLabel}"

Write:
1) A short 'live commentary' line (1–2 sentences) about this matchup, as if we are watching the bar animation fill up.
2) A tiny 'stat nugget' (1 sentence) that highlights something interesting about the percentages, without being overly analytical.

Rules:
- No jokes about winning/losing children; frame it as "name ideas" only.
- Tone is gentle, excited, and inclusive.
- Do not exaggerate the significance of the vote; make it clear this is just for fun.

Your output must be JSON ONLY with:
{
  "commentary": "string",
  "statNugget": "string"
}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, playful announcer for a baby name tournament. You always respond with JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", text);
      return NextResponse.json({ error: "OpenAI API error" }, { status: 500 });
    }

    const json = await response.json();
    const content: string =
      json.choices?.[0]?.message?.content ??
      '{"commentary":"The votes gently lean in one direction, but both names clearly have fans.","statNugget":"The margin here is small, a reminder that every vote added a little story to this name."}';

    let parsed: { commentary: string; statNugget: string };
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse commentary JSON:", err);
      parsed = {
        commentary:
          "The bars climb together on the screen, showing just how many hearts each name has gathered.",
        statNugget:
          "The percentages are close, which simply means your shortlist is full of strong favorites.",
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
