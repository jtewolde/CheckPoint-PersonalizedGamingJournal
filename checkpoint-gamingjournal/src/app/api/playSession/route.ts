import { NextRequest, NextResponse } from "next/server";
import { PlaySessionCollection, GameCollection } from "@/utils/db";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// CREATE PLAY SESSION(POST)
// This API route is used to create a play session for a game in the user's library
//=================================
export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const { gameID, gameName, date, duration, notes, tags } = body;

        // Validate required fields for the play session object like gameID, date of session, and duration
        if(!gameID || !gameName || !date || !duration){
            return NextResponse.json({error: "Missing required fields"}, { status: 400 })
        }

        // Get the authenticated user's session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        // If user isn't authenticated, then return specific error
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if the instance of the game exists and belongs to the user and in their library
        const game = await GameCollection.findOne({
            gameId: gameID, // Query as a string
            userId: userId, // Query as a string
        });

        // Check if the game is in the user's library
        if (!game) {
            return NextResponse.json(
                { error: "Game not found in user's library" },
                { status: 404 }
            );
        }

        // Create play session object
        const playSession = {
            userId,
            gameId: gameID,
            gameName,
            duration,
            date,
            notes,
            tags
        }

        // Insert the play session into the playSession collection
        const result = await PlaySessionCollection.insertOne(playSession);
        const insertedSessionId = result.insertedId;

        // Clear cache (important for dashboard + game page)
        await redis.del(`user_library:${userId}`);
        await redis.del(`play_sessions:${userId}:${gameID}`);
        await redis.del(`play_sessions:${userId}`);

        // Return the json response for a successful creation of plays session
        return NextResponse.json({
            message: "Play session added successfully",
            playSessionId: insertedSessionId,
        });
    
    } catch (error) {
        console.error("Error adding play session:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

//=================================
// GET PLAY SESSIONS(GET_)
// This API route is used to fetch all play sessions for a game in the user's library
//=================================
export async function GET(req: NextRequest){
    try{
        // Get the authenticated user's session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        // If user isn't authenticated, then return specific error
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get the gameID from the query parameters for optional filtering of play sessions by game
        const { searchParams } = new URL(req.url);
        const gameID = searchParams.get("gameId");

        // Cache key for play sessions, if the gameID is provided, then cache key is specific to that game, otherwise it's for all sessions of the user
        const cacheKey = gameID
        ? `play_sessions:${userId}:${gameID}`
        : `play_sessions:${userId}`;

        // Attempt to get play sessions from cache first
        const cachedSessions = await redis.get(cacheKey);
        
        if (cachedSessions) {
            return NextResponse.json(JSON.parse(cachedSessions));
        }

        // Build the query for fetching play sessions, if gameID is provided, then filter by that gameID, otherwise get all play sessions for the user
        const query: any = { userId };
        if (gameID) {
            query.gameId = gameID;
        }

        // Fetch play sessions from the database based on the query
        const playSessions = await PlaySessionCollection.find(query).toArray();

        // Cache the play sessions for future requests
        await redis.set(cacheKey, JSON.stringify(playSessions), "EX", 60 * 60); // Cache for 1 hour

        // Return json response with the play sessions
        return NextResponse.json(playSessions);
        
    } catch (error) {
        console.error("Error fetching play sessions:", error);
        return NextResponse.json(
            { error: "Internal server error"},
            { status: 500}
        );
    }
}