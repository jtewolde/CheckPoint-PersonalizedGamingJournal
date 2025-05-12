import { NextRequest, NextResponse } from "next/server";
import { GameCollection, JournalEntriesCollection, UserCollection } from "@/utils/db";
import { ObjectId } from "mongodb";
import {v4 as uuidv4} from 'uuid';
import { auth } from "@/utils/auth";

// this API route is used to create a journal entry for a game
// and append the journal entry ID to the game's journalEntries field
export async function POST(req: NextRequest) {
    try {
      const body = await req.json(); // Parse the request body
      const { gameID, title, content, date, gameName } = body;

      console.log(body);

      // Validate required fields
      if (!gameID || !title || !content || !date) {
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

      // Check if the game exists in the user's library
      const user = await UserCollection.findOne({ _id: new ObjectId(userId) });
      if (!user || !user.games || !user.games.includes(gameID)) {
        return NextResponse.json(
          { error: "Game not found in user's library" },
          { status: 404 }
        );
      }

      // Create the journal entry
      const journalEntry = {
        uuid: uuidv4(),
        gameId: gameID,
        gameName,
        userId,
        title,
        content,
        date
      };

      // Insert the journal entry into the journalEntries collection
      const result = await JournalEntriesCollection.insertOne(journalEntry);

      // Append the journal entry ID to the game's journalEntries field
      const updateGameResult = await GameCollection.updateOne(
          { _id: gameID },
          { $addToSet: { journalEntries: journalEntry.uuid } } // Prevent duplicates
      )

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