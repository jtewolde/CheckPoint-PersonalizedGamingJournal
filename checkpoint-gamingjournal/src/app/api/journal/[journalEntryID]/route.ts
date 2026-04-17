import { NextRequest, NextResponse } from "next/server";
import { JournalEntriesCollection, UserCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// DELETE JOURNAL ENTRY(DELETE)
// This API route is used to delete a journal entry for a game in the user's library
//=================================
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ journalEntryID: string }> }){
    try {
        const { journalEntryID } = await params;

        // Validate required fields
        if (!journalEntryID) {
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
            _id: new ObjectId(journalEntryID), // Query as a string
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
            _id: new ObjectId(journalEntryID), // Query as a string
        });

        if (journalResult.deletedCount === 0) {
            console.error("Failed to delete journal entry");
            return NextResponse.json(
                { error: "Failed to delete journal entry" },
                { status: 500 }
            );
        }

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
        });

    } catch (error) {
        console.error("Error deleting journal entry:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ===================================
// GET JOURNAL ENTRY BY ID (GET)
// This API route is used to get a specific journal entry by its ID for a user
// ===================================
export async function GET(req: NextRequest, { params }: { params: Promise<{ journalEntryID: string }> }){
    try{
        const { journalEntryID } = await params;

         // Validate required fields
        if (!journalEntryID) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const session = await auth.api.getSession({
            headers: req.headers,
        });

        // If there is no session/authencicated, return an error
        if(!session?.user) {
            return NextResponse.json({ error: "Unauthorized"}, {status: 401});
        }

        // Get user Id from session
        const userId = session.user.id

        // Find the journal entry in the journalEntries collection by uuid and userID
        const journalEntry = await JournalEntriesCollection.findOne({
            uuid: journalEntryID,
            userId: userId
        })

        return NextResponse.json({ entry: journalEntry });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}