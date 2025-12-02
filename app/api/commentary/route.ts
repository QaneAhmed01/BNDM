import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const {
    roundLabel,
    nameA,
    nameB,
    votesA,
    votesB,
  }: {
    roundLabel: string;
    nameA: string;
    nameB: string;
    votesA: number;
    votesB: number;
  } = body;

  const totalVotes = Math.max(1, votesA + votesB);
  const percentA = Math.round((votesA / totalVotes) * 100);
  const percentB = Math.round((votesB / totalVotes) * 100);

  const prompt = `
You are the playful announcer for a baby name tournament.

Round: "${roundLabel}"
Name A: "${nameA}" with ${votesA} votes (${percentA}%)
Name B: "${nameB}" with ${votesB} votes (${percentB}%)

Your job:
1) Create a short headline (max 10 words) like a commentator might say.
2) Create 1–2 friendly, warm sentences summarising what happened in the round, aimed at expectant parents and their friends.
3) Create one stats line that directly mentions the percentage split, for example:
   "36% of your voters preferred Luna over Diana."

Important:
- Keep the tone supportive, light and celebratory.
- No negativity, no judging the losing name.
- Do not mention pregnancy complications, medical advice, or anything sensitive.
- Only talk about names, preferences and votes.

Output JSON ONLY (no extra text) with this shape:
{
  "headline": string,
  "summary": string,
  "statsLine": string
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
              "You are a gentle, playful announcer for a baby name tournament, and you always respond with valid JSON matching the requested schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 260,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", text);
      return NextResponse.json(
        { error: "OpenAI API error" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content: string =
      data.choices?.[0]?.message?.content ??
      '{"headline":"A close and cosy matchup","summary":"Both names had plenty of love, but one nudged ahead in the votes.","statsLine":"52% of your voters slightly preferred one name this time."}';

    let parsed: {
      headline: string;
      summary: string;
      statsLine: string;
    };

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI:", e);
      parsed = {
        headline: "A sweet little victory",
        summary:
          "Both names clearly have fans, but one name gently stepped forward.",
        statsLine:
          "Just over half of your voters leaned towards the winning name.",
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
