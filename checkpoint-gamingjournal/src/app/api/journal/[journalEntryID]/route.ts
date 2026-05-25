import { NextRequest, NextResponse } from "next/server";
import { JournalEntriesCollection } from "@/utils/db";
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

//=================================
// UPDATE JOURNAL ENTRY(PATCH)
// This API Route is used to update a journal entry for a game that is in the user's library
//=================================
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ journalEntryID: string }> }){
    try{
        // Extract playSessionID from the route parameters
        const { journalEntryID } = await params;
        const body = await req.json();
        const { gameID, gameName, coverImage, title, content, tags, entryType } = body;

        // Validate required fields
        if (!gameID || !title || !content || !entryType) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        console.log("ID for Journal Entry:", journalEntryID)

        // Validate that the JournalEntryID is a valid object ID format
        if (!ObjectId.isValid(journalEntryID)) {
            return NextResponse.json({ error: "Invalid Journal Entry ID format" }, { status: 400 });
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
        const existingEntry = await JournalEntriesCollection.findOne({
            _id: new ObjectId(journalEntryID),
            userId: userId
        });

        // If the entry doesn't exist or don't belong to the user, return an error
        if (!existingEntry) {
            return NextResponse.json(
                { error: "Session not found or unauthorized" },
                { status: 404 }
            );
        }

        // Build update object with only provided fields
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (entryType !== undefined) updateData.entryType = entryType;
        if (tags !== undefined) updateData.tags = tags;

        // If no fields are provided for update, return an error
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields provided for update" }, { status: 400 });
        }

        // Update the play session
        const updateResult = await JournalEntriesCollection.updateOne(
            {
                _id: new ObjectId(journalEntryID),
                userId: userId
            },
            { $set: updateData }
        );

        // Clear cache for the user's library and journal entries for the specific game
        await redis.del(`user_journal_entries:${userId}:${existingEntry.gameId}`);
        await redis.del(`user_journal_entries:${userId}`);

        return NextResponse.json({
            message: "Journal Entry updated successfully",
            updateResult,
        });

    } catch (error) {
        console.error("Error updating journal entry:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
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
            _id: new ObjectId(journalEntryID),
            userId: userId
        })

        return NextResponse.json({ entry: journalEntry });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}