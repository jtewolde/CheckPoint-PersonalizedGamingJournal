import { NextRequest, NextResponse } from "next/server";
import { GameCollection, JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Parse the request body
        const { gameID } = body;

         // Validate required fields
        if (!gameID) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get the authenticated user's session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized", session }, { status: 401 });
        }

        const userId = session.user.id; // Extract userId from the session

        // Step 1: Verify that the user has the game in their library
        const game = await GameCollection.findOne({_id: gameID, userId})
        if (!game) {
            return NextResponse.json(
                { error: "Game not found or owned by the user" },
                { status: 404}
            )
        }

        // Step 2: Find all journal entries for this user and associated game
        const entries = await JournalEntriesCollection.find({
            userId: userId,
            gameId: gameID,
        }).toArray();

        if (entries.length === 0) {
            return NextResponse.json(
                { message: "No journal entries found for this game" },
                { status: 200 }
            );
        }
        
        // Collect the UUIDs (if stored in the GameCollection)
        const entryUUIDs = entries.map((entry) => entry.uuid);

        // Step 3: Delete all journal entries for this user and game
        const deleteResult = await JournalEntriesCollection.deleteMany({
            userId,
            gameId: gameID,
        });

        // Step 4: Update the GameCollection to remove all entry UUID references
        const gameUpdateResult = await GameCollection.updateMany(
            { gameId: gameID, userId: userId },
            { $pull: { journalEntries: { $in: entryUUIDs } } } as any
        );

        // Step 5: Clear cached journal entries in Redis
        await redis.del(`user_journal_entries:${userId}`);
        const cacheKeys = await redis.keys(`user_journal_entries:${userId}:page:*`);
        if (cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
        }

        return NextResponse.json(
        {
            message: `Deleted ${deleteResult.deletedCount} journal entries for game ${game.name || gameID}`,
            deletedEntries: deleteResult.deletedCount,
            gameUpdateResult,
        },
        { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting journal entries by game:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}