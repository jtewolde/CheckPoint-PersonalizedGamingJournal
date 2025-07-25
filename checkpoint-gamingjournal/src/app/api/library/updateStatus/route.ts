import { NextRequest, NextResponse } from "next/server";
import { GameCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

// This API route is used to update the status of a game in the user's library
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

        //Check if the instance of the game exists and belongs to the user
        const game = await GameCollection.findOne({
            gameId: gameID, // Query as a string
            userId: userId, // Query as a string
        });

        // Update game in the games collection for only the user's instance
        const gameResult = await GameCollection.updateOne(
            { _id: game?._id,
                userId: userId
            },
            { $set: gameDetails }
        );

        // Invalidate/clear cache for the user's library after deletion
        await redis.del(`user_library:${userId}`);

        return NextResponse.json({
            message: "Game status updated successfully",
            gameResult,
        });
    } catch (error) {
        console.error("Error updating game status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    
}