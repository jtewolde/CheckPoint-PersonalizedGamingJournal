import { NextRequest, NextResponse } from "next/server";
import { JournalEntriesCollection } from "@/utils/db";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// GET COUNT OF JOURNAL ENTRIES (GET)
// This API route is used to get the exact count of the journal entries of a game in the game details page
// It also implements caching with Redis to optimize performance.
//=================================
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user Id from session
    const userId = session.user.id;

    // Setup pagination for journal entries
    const { searchParams } = new URL(req.url);
    const gameID = searchParams.get("gameID");
    console.log("GameID from params", gameID);

    // See if there is a gameID on the search params URL
    if (!gameID) {
      return NextResponse.json(
        { error: "gameID is required" },
        { status: 400 },
      );
    }

    // Unique cache key based on user ID and game ID
    const cacheKey = `journal_entries:${userId}:${gameID}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Get all journal entries for the specific game
    const entries = await JournalEntriesCollection.find({
      userId,
      gameId: gameID,
    })
      .sort({ date: -1 })
      .toArray();

    // Get the entrire length of all of the entries for this specific game
    const count = entries.length;

    // Combine both the entries and the length for the final result to be returned
    const result = {
      count,
      entries,
    };

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
