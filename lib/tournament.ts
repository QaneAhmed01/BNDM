export interface Match {
  id: string;
  round: number;
  roundLabel: string;
  matchIndex: number;
  nameA: string;
  nameB: string | null;
  votesA: number;
  votesB: number;
  winner: string | null;
}

export interface Round {
  round: number;
  roundLabel: string;
  matches: Match[];
}

export interface TournamentBracket {
  rounds: Round[];
  finalWinner: string | null;
}

const MAX_PARTICIPANTS = 16;
const MIN_PARTICIPANTS = 2;

/**
 * Initialize tournament with smart bracket that minimizes byes
 * Creates visually clean brackets for any participant count
 */
export function initializeTournament(names: string[]): TournamentBracket {
  const cleaned = names
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, MAX_PARTICIPANTS);

  if (cleaned.length < MIN_PARTICIPANTS) {
    throw new Error("At least two names are required.");
  }

  const count = cleaned.length;

  // For power of 2, use standard bracket
  if (isPowerOfTwo(count)) {
    return createStandardBracket(cleaned);
  }

  // For non-power of 2, create smart bracket with minimal byes
  return createSmartBracket(cleaned);
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Create standard bracket for power of 2 (2, 4, 8, 16)
 */
function createStandardBracket(names: string[]): TournamentBracket {
  const count = names.length;
  const totalRounds = Math.log2(count);
  const seedPositions = buildSeedPositions(count);
  const seeded = seedPositions.map((seed) => names[seed - 1]);

  const rounds: Round[] = [];
  const roundLabel = labelForRound(0, totalRounds);
  const matches: Match[] = [];

  for (let i = 0; i < seeded.length; i += 2) {
    matches.push({
      id: `r0-m${matches.length}`,
      round: 0,
      roundLabel,
      matchIndex: matches.length,
      nameA: seeded[i],
      nameB: seeded[i + 1],
      votesA: 0,
      votesB: 0,
      winner: null,
    });
  }

  rounds.push({ round: 0, roundLabel, matches });
  return { rounds, finalWinner: null };
}

/**
 * Create smart bracket that minimizes byes
 * Strategy: Put byes in later rounds when possible
 */
function createSmartBracket(names: string[]): TournamentBracket {
  const count = names.length;
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(count)));
  const totalRounds = Math.log2(nextPowerOfTwo);

  // Calculate how many need to play in round 1
  const byesNeeded = nextPowerOfTwo - count;
  const firstRoundPlayers = count - byesNeeded;
  const firstRoundMatches = firstRoundPlayers / 2;

  // Distribute names: first round players vs bye recipients
  const playInRound1 = names.slice(0, firstRoundPlayers);
  const byeRecipients = names.slice(firstRoundPlayers);

  const rounds: Round[] = [];
  const matches: Match[] = [];
  const roundLabel = labelForRound(0, totalRounds);

  // Create first round matches
  for (let i = 0; i < playInRound1.length; i += 2) {
    matches.push({
      id: `r0-m${matches.length}`,
      round: 0,
      roundLabel,
      matchIndex: matches.length,
      nameA: playInRound1[i],
      nameB: playInRound1[i + 1],
      votesA: 0,
      votesB: 0,
      winner: null,
    });
  }

  // Add bye recipients as auto-advanced matches
  for (const name of byeRecipients) {
    matches.push({
      id: `r0-m${matches.length}`,
      round: 0,
      roundLabel,
      matchIndex: matches.length,
      nameA: name,
      nameB: null,
      votesA: 1,
      votesB: 0,
      winner: name,
    });
  }

  rounds.push({ round: 0, roundLabel, matches });
  return { rounds, finalWinner: null };
}

function buildSeedPositions(bracketSize: number): number[] {
  if (bracketSize === 2) return [1, 2];
  if (bracketSize === 4) return [1, 4, 2, 3];
  if (bracketSize === 8) return [1, 8, 4, 5, 2, 7, 3, 6];
  if (bracketSize === 16) return [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11];
  return Array.from({ length: bracketSize }, (_, i) => i + 1);
}

export function advanceRound(bracket: TournamentBracket): TournamentBracket {
  const { rounds } = bracket;
  const currentRound = rounds[rounds.length - 1];

  const allDecided = currentRound.matches.every((m) => m.winner !== null);
  if (!allDecided) {
    return bracket;
  }

  const winners = currentRound.matches
    .map((m) => m.winner)
    .filter((w): w is string => w !== null);

  if (winners.length === 1) {
    return { ...bracket, finalWinner: winners[0] };
  }

  const nextRoundNumber = currentRound.round + 1;
  const totalRounds = Math.ceil(Math.log2(winners.length)) + currentRound.round;
  const nextRoundLabel = labelForRound(nextRoundNumber, totalRounds);
  const nextMatches: Match[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    const nameA = winners[i];
    const nameB = winners[i + 1] || null;

    if (!nameB) {
      // Auto-advance bye
      nextMatches.push({
        id: `r${nextRoundNumber}-m${nextMatches.length}`,
        round: nextRoundNumber,
        roundLabel: nextRoundLabel,
        matchIndex: nextMatches.length,
        nameA,
        nameB: null,
        votesA: 1,
        votesB: 0,
        winner: nameA,
      });
    } else {
      nextMatches.push({
        id: `r${nextRoundNumber}-m${nextMatches.length}`,
        round: nextRoundNumber,
        roundLabel: nextRoundLabel,
        matchIndex: nextMatches.length,
        nameA,
        nameB,
        votesA: 0,
        votesB: 0,
        winner: null,
      });
    }
  }

  const newRounds = [
    ...rounds,
    { round: nextRoundNumber, roundLabel: nextRoundLabel, matches: nextMatches },
  ];

  return { rounds: newRounds, finalWinner: null };
}

function labelForRound(roundNumber: number, totalRounds: number): string {
  const remaining = totalRounds - roundNumber;
  if (remaining === 0) return "Final";
  if (remaining === 1) return "Semi-Finals";
  if (remaining === 2) return "Quarter-Finals";
  if (remaining === 3) return "Round of 16";
  return `Round ${roundNumber + 1}`;
}
