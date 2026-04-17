import { NextRequest, NextResponse } from "next/server";
import { JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";


//=================================
// GET COUNT OF JOURNAL ENTRIES (GET)
// This API route is used to get the exact count of the journal entries of a game in the game details page
// It also implements caching with Redis to optimize performance.
//=================================
export async function GET(req: NextRequest){
    try{
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if(!session?.user) {
            return NextResponse.json({ error: "Unauthorized"}, {status: 401});
        }

        // Get user Id from session
        const userId = session.user.id

        // Setup pagination for journal entries
        const { searchParams } = new URL(req.url);
        const gameID = searchParams.get('gameID')
        console.log("GameID from params", gameID)

        // See if there is a gameID on the search params URL
        if(!gameID){
            return NextResponse.json({error: 'gameID is required'}, {status: 400})
        }

        // Creating unique cache key for based on userID and the gameID
        const cacheKey = `journal_count:${userId}:${gameID}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json({ count: Number(cached) });
        }

        // Only count the number of journal entries of the specific game
        const count = await JournalEntriesCollection.countDocuments({
            userId,
            gameId: gameID
        });

        // Cache the games data in Redis for 30 minutes
        await redis.set(cacheKey, count.toString(), 'EX', 300);

        return NextResponse.json({count})
    } catch (error){
        console.error("Error fetching count of journal entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}