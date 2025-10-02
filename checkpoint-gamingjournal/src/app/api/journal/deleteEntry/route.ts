import { NextRequest, NextResponse } from "next/server";
import { GameCollection, JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Parse the request body
        const { journalEntryId, gameID } = body;

        // Validate required fields
        if (!journalEntryId || !gameID) {
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

        // Check if the journal entry exists and belongs to the user
        const journalEntry = await JournalEntriesCollection.findOne({
            _id: new ObjectId(journalEntryId), // Query as a string
            userId: userId, // Query as a string
        });

        if (!journalEntry) {
            console.error("Journal entry not found or unauthorized");
            return NextResponse.json(
                { error: "Journal entry not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete the journal entry from the JournalEntriesCollection
        const journalResult = await JournalEntriesCollection.deleteOne({
            _id: new ObjectId(journalEntryId), // Query as a string
        });

        if (journalResult.deletedCount === 0) {
            console.error("Failed to delete journal entry");
            return NextResponse.json(
                { error: "Failed to delete journal entry" },
                { status: 500 }
            );
        }

        // Remove the journal entry ID from the game's journalEntries field
        const gameResult = await GameCollection.updateOne(
            { _id: gameID }, // Query as a string
            { $pull: { journalEntries: journalEntry.uuid } }
        );

        //Invalidate/clear the cache of the user's journal entries after deletion
        await redis.del(`user_journal_entries:${userId}`);

        // Invalidate/clear the cache for all paginated journal entries
        // This is a simple approach; for a more efficient solution, consider tracking which pages contain the deleted entry
        const keys = await redis.keys(`user_journal_entries:${userId}:page:*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }

        return NextResponse.json({
            message: "Journal entry deleted successfully",
            journalResult,
            gameResult,
        });

    } catch (error) {
        console.error("Error deleting journal entry:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}