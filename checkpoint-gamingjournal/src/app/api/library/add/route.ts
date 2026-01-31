import { NextRequest, NextResponse } from "next/server";
import { UserCollection, GameCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

// This API route is used to add a game to the user's library
export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Parse the request body
        const { gameID, gameDetails } = body;

        // If there is no gameId or gameDetails, return error for missing fields
        if (!gameID || !gameDetails) {
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

        // Check if the game is already in the user's library
        const existingGame = await GameCollection.findOne({ userId, gameId: gameID });
        if (existingGame) {
            console.log("Game exists in your library!")
            return NextResponse.json({ message: "Game already in library" });
        }

        // Ensure that the status of a game in library is defaulted to "plan to play"
        if(!gameDetails.status){
            gameDetails.status = "No Status Given"; // Default status of game if not provided
        }

        // Ensure that the default value of platinum attribute of a game is false.
        if(!gameDetails.platinum){
            gameDetails.platinum = false;
        }

        // Create a game with the user's ID
        const game = {
            userId: userId,
            gameId: gameID,
            ...gameDetails
        }

        // Add game to the games collection
        const gameResult = await GameCollection.insertOne(game);
        const insertedGameId = gameResult.insertedId

        // Add game ID to the user's games array
        const userResult = await UserCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { games: insertedGameId } } // Prevent duplicates
        );

        // Invalidate/clear the cache for the user's library
        await redis.del(`user_library:${userId}`);

        return NextResponse.json({
            message: "Game added to library successfully",
            gameResult,
            userResult,
        });
    } catch (error) {
        console.error("Error adding game to library:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}