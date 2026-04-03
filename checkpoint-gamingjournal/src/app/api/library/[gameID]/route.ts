import { NextRequest, NextResponse } from "next/server";
import { GameCollection } from "@/utils/db";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

// This API route is used to remove a game from the user's library
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ gameID: string }> }){
    try {
        const { gameID } = await params;

        // If there is no gameId or gameDetails, return error for missing fields
        if (!gameID){
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

        if (!game) {
            console.error("This game not found or unauthorized");
            return NextResponse.json(
                { error: "This game not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete game from the games collection
        const gameResult = await GameCollection.deleteOne(
            { _id: game._id }
        );

        // Invalidate/clear cache for the user's library after deletion
        await redis.del(`user_library:${userId}`);

        return NextResponse.json({
            message: "Game deleted from library successfully",
            gameResult,
        });

    } catch (error) {
        console.error("Error adding game to library:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// This API route is used to update the status/rating/trophy of a game in the user's library using PATCH method
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ gameID: string }> }){
    try {
        const { gameID } = await params;
        const body = await req.json(); // Parse the request body
        const { gameDetails } = body;

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