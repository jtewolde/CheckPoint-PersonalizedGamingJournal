import { NextRequest, NextResponse } from "next/server";
import { UserCollection, GameCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";

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

        console.log("Authorization Header:", req.headers.get("authorization"));
        console.log("Session: ", session);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized", session }, { status: 401 });
        }

        const userId = session.user.id; // Extract userId from the session

        // Add game to the games collection
        const gameResult = await GameCollection.updateOne(
            { _id: gameID },
            { $set: gameDetails },
            { upsert: true }
        );

        // Add game ID to the user's games array
        const userResult = await UserCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { games: gameID } } // Prevent duplicates
        );

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