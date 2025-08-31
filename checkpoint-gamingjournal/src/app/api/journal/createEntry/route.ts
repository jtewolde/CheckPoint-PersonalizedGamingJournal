import { NextRequest, NextResponse } from "next/server";
import { GameCollection, JournalEntriesCollection, UserCollection } from "@/utils/db";
import { ObjectId } from "mongodb";
import {v4 as uuidv4} from 'uuid';

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

// this API route is used to create a journal entry for a game
// and append the journal entry ID to the game's journalEntries field
export async function POST(req: NextRequest) {
    try {
      const body = await req.json(); // Parse the request body
      const { gameID, title, content, date, gameName } = body;

      console.log(body);

      // Validate required fields
      if (!gameID || !title || !content) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Get the authenticated user's session
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = session.user.id;

      //Check if the instance of the game exists and belongs to the user
      const game = await GameCollection.findOne({
          gameId: gameID, // Query as a string
          userId: userId, // Query as a string
      });

      if (!game) {
        return NextResponse.json(
          { error: "Game not found in user's library" },
          { status: 404 }
        );
      }

      // Generate a createdAt timestamp for the database to sort entries more easily
      const createdAt = new Date();

      // Convert createdAt date to user-friendly string
      const displayDate = createdAt.toLocaleString("en-US", {
        timeZone: "UTC", // Use UTC timezone
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short", // Include timezone abbreviation
      });

      // Create the journal entry
      const journalEntry = {
        uuid: uuidv4(),
        gameId: gameID,
        gameName,
        userId,
        title,
        content,
        createdAt,
        displayDate
      };

      // Insert the journal entry into the journalEntries collection
      const result = await JournalEntriesCollection.insertOne(journalEntry);

      // Append the journal entry ID to the game's journalEntries field
      const updateGameResult = await GameCollection.updateOne(
          { gameId: gameID,
            userId: userId
           },
          { $addToSet: { journalEntries: journalEntry.uuid } } // Prevent duplicates
      )

      // Invalidate/clear the cache for the user's journal entries after creation
      await redis.del(`user_journal_entries:${userId}`);

      // Invalidate/clear the cache for the first page of journal entries
      await redis.del(`user_journal_entries:${userId}:page:1:limit:6`);

      return NextResponse.json({
        message: "Journal entry created and appended successfully",
        journalEntryId: journalEntry.uuid
      });

    } catch (error) {
      console.error("Error creating journal entry:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
  }
}