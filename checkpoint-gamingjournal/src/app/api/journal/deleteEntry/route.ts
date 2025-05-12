import { NextRequest, NextResponse } from "next/server";
import { GameCollection, JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";

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

        console.log("Authorization Header:", req.headers.get("authorization"));
        console.log("Session: ", session);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized", session }, { status: 401 });
        }

        const userId = session.user.id; // Extract userId from the session

        console.log("JournalEntryId:", journalEntryId);
        console.log("GameID:", gameID);
        console.log("UserID:", userId);

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

        console.log(gameResult.modifiedCount)

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