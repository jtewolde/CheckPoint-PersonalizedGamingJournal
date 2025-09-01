import { NextRequest, NextResponse } from "next/server";
import { UserCollection,  JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis"

// This API Route is to fetch and get the journal entries from a user
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

        // Find the user in the collection of users
        const user = await UserCollection.findOne({ _id: new ObjectId(userId)})

        if (!user){
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        // Create unique cache key based on user ID
        const cacheKey = `user_journal_entries:${userId}`;

        // Attempt to get cached data from Redis
        const cachedData = await redis.get(cacheKey);

        if(cachedData) {
            console.log('Returning cached journal entries for: ', cacheKey);
            return NextResponse.json({ journalEntries: JSON.parse(cachedData) }, { status: 200 });
        }

       // Retrieve all journal entries for the user
        const journalEntries = await JournalEntriesCollection.find({ userId: userId }).toArray();

        // Cache the games data in Redis for 30 minutes
        await redis.set(cacheKey, JSON.stringify([ ...journalEntries]), 'EX', 1800);

        // Return the journal entries
        return NextResponse.json({ journalEntries }, { status: 200 });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}