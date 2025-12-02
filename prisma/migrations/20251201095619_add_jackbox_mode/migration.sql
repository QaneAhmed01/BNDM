-- CreateTable
CREATE TABLE "Room" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'LOBBY',
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "currentMatch" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bracketState" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    CONSTRAINT "Player_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "Room" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    CONSTRAINT "Vote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
