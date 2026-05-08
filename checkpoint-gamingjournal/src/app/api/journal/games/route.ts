import { NextRequest, NextResponse } from "next/server";
import { JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// GET GAMES OF JOURNAL ENTRIES (GET)
// This API route is used to get the list of games that have journal entries in the user's library for the journal page filter
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

        // Creating unique cache key for based on userID and the gameID
        const cacheKey = `journal_games:${userId}`;

        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json({ games: JSON.parse(cached) });
        }

        // Only fetch distinct gameIDs and gameNames from the journal entries collection for the user
        const games = await JournalEntriesCollection.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: "$gameId", gameName: { $first: "$gameName" } } },
            { $project: { _id: 0, gameId: "$_id", gameName: 1 } }
        ]).toArray();

        // Cache the games data in Redis for 30 minutes
        await redis.set(cacheKey, JSON.stringify(games), 'EX', 300);

        return NextResponse.json({games});
    } catch (error){
        console.error("Error fetching list of games with journal entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}