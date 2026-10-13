import { NextRequest, NextResponse } from "next/server";

import { JournalEntriesCollection, UserCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// GET JOURNAL CALENDAR ENTRIES (GET)
// Returns all journal entries for the authenticated user
// with filtering and sorting support.
//=================================
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get filter options from query params
    const { searchParams } = new URL(req.url);

    const tag = searchParams.get("tag") || "";
    const type = searchParams.get("type") || "";
    const gameId = searchParams.get("gameId") || "";

    const sortDirection = searchParams.get("order") === "asc" ? 1 : -1;

    // Find the user in the collection of users
    const user = await UserCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the query
    const query: any = {
      userId,
    };

    // Filter by game
    if (gameId) {
      query.gameId = gameId;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by entry type
    if (type) {
      query.entryType = type;
    }

    // Create a cache key based on the filters and sorting
    const cacheKey = `user_journal_calendar:${userId}:game:${gameId}:tag:${tag}:type:${type}:order:${sortDirection}`;

    // Check Redis cache
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Returning cached journal calendar entries:", cacheKey);

      return NextResponse.json(JSON.parse(cachedData), {
        status: 200,
      });
    }

    // Get ALL matching journal entries
    const journalEntries = await JournalEntriesCollection.find(query)
      .sort({ createdAt: sortDirection })
      .toArray();

    // Create response
    const response = {
      journalEntries,
    };

    // Cache for 30 minutes
    await redis.set(cacheKey, JSON.stringify(response), "EX", 1800);

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching journal calendar entries:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
