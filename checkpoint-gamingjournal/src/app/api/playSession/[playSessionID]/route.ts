import { NextRequest, NextResponse } from "next/server";
import { PlaySessionCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

// This API Route is used to delete a play session for a game that is in the user's library
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ playSessionID: string }> }){
    try{
        // Extract playsSessionID from the route parameters
        const { playSessionID } = await params;

        // Validate that play session 
        if (!playSessionID){
            return NextResponse.json({error: "Session ID is required"}, {status: 400})
        }

        // Validate that the playSessionID is a valid object ID format
        if (!ObjectId.isValid(playSessionID)) {
            return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
        }

        // Get the authenticated user's session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized", session }, { status: 401 });
        }

        const userId = session.user.id; // Extract userId from the session

        // Check if the play session exists and belongs to the user
        const existingSession = await PlaySessionCollection.findOne({
            _id: new ObjectId(playSessionID),
            userId: userId
        });

        // If the session doesn't exist or don't belong to the user, return an error
        if (!existingSession) {
            return NextResponse.json(
                { error: "Session not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete the play session from the collection
        const deleteResult = await PlaySessionCollection.deleteOne({
            _id: new ObjectId(playSessionID),
            userId: userId
        });

        // Clear cache for the user's library and play sessions for the specific gme
        await redis.del(`play_sessions:${userId}:${existingSession.gameId}`);

        return NextResponse.json({
            message: "Play session deleted successfully",
            deleteResult,
        });

    } catch (error) {
        console.error("Error deleting play session:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}