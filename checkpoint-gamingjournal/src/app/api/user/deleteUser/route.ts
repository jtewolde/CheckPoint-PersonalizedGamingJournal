import { NextRequest, NextResponse } from "next/server";
import { UserCollection, GameCollection, JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";

// This API route is for deleting users and their data from the database
export async function POST(req: NextRequest){
    try{

        // Get the authenticated user's session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized", session }, { status: 401 });
        }

        const userId = session.user.id; // Extract userId from the session
        const objectId = new ObjectId(userId)

        // Step 1: Delete the user from the user collection:
        const userResult = await UserCollection.deleteOne(
            {_id: objectId}
        )

        // Step 2: Delete all of the games that the user has in their library
        const gamesResult = await GameCollection.deleteMany({
            userId: userId
        })

        // Step 3: Delete all Journal entries of that user
        const entriesResult = await JournalEntriesCollection.deleteMany({
            userId: userId
        })

       return NextResponse.json({
        message: "User and all associated data deleted successfully",
        deletedUser: userResult.deletedCount,
        deletedGames: gamesResult.deletedCount,
        deletedEntries: entriesResult.deletedCount,
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting user and data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}