import { NextRequest, NextResponse } from "next/server";
import { JournalEntriesCollection } from "@/utils/db";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// GET JOURNAL STATS & GAMES (GET)
// Returns:
// - List of games for filter dropdown
// - Total games journaled
// - Most journaled game
// - Last journal entry
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
            return NextResponse.json(JSON.parse(cached));
        }

        // -----------------------------------------
        // Games for filter dropdown
        // Only fetch distinct gameIDs and gameNames from the journal entries collection for the user
        // -----------------------------------------
        const games = await JournalEntriesCollection.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: "$gameId", gameName: { $first: "$gameName" } } },
            { $project: { _id: 0, gameId: "$_id", gameName: 1 } }
        ]).toArray();

        //--------------------------------------------------------
        // Get the most journaled game that the user has
        //--------------------------------------------------------
        const mostJournaled = await JournalEntriesCollection.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: "$gameId", gameName: { $first: "$gameName" }, coverImage: {$first: "$coverImage"}, count: { $sum: 1 } } },
            { $sort: { count: -1}}
        ]).toArray();

        //--------------------------------------------------------
        // Get the favorite entry type that the user uses
        //--------------------------------------------------------
        const favoriteEntryType = await JournalEntriesCollection.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: "$entryType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        const response = {
            games,
            mostJournaled,
            favoriteEntryType
        }

        // Cache the games data in Redis for 30 minutes
        await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);

        return NextResponse.json(response);
    } catch (error){
        console.error("Error fetching list of games with journal entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}