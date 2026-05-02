import { NextRequest, NextResponse } from "next/server";
import { GameCollection, JournalEntriesCollection, UserCollection } from "@/utils/db";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

import { auth } from "@/utils/auth";
import { redis } from "@/utils/redis";

//=================================
// CREATE JOURNAL ENTRY(POST)
// This API route is used to create a journal entry for a game in the user's library
//=================================
export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Parse the request body
        const { gameID, title, content, tags, gameName } = body;

        console.log(body);

        // Validate required fields
        if (!gameID || !title || !content) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
        }

        // Get the authenticated user's session
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if the instance of the game exists and belongs to the user
        const game = await GameCollection.findOne({
            gameId: gameID, // Query as a string
            userId: userId, // Query as a string
        });

        console.log("Game found for journal entry:", game);

        if (!game) {
            return NextResponse.json(
                { error: "Game not found in user's library" },
                { status: 404 }
            );
        }

        // Generate a createdAt timestamp for the database to sort entries more easily
        const createdAt = new Date();

        // Convert createdAt date to user-friendly string
        const displayDate = createdAt.toLocaleString("en-US", {
            timeZone: "UTC", // Use UTC timezone
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short", // Include timezone abbreviation
        });

        // Create the journal entry
        const journalEntry = {
            uuid: uuidv4(),
            gameId: gameID,
            gameName,
            userId,
            title,
            tags,
            content,
            createdAt,
            displayDate
        };

        // Insert the journal entry into the journalEntries collection
        const result = await JournalEntriesCollection.insertOne(journalEntry);

        //Invalidate/clear the cache of the user's journal entries after deletion
        await redis.del(`user_journal_entries:${userId}`);

        // Invalidate/clear the cache for all paginated journal entries
        // This is a simple approach; for a more efficient solution, consider tracking which pages contain the deleted entry
        const keys = await redis.keys(`user_journal_entries:${userId}:page:*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }

        return NextResponse.json({
            message: "Journal entry created and appended successfully",
            result,
            journalEntryId: journalEntry.uuid
        });

    } catch (error) {
        console.error("Error creating journal entry:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

//=================================
// GET JOURNAL ENTRIES (GET)
// This API route is used to get all journal entries for a user with pagination support. 
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
        const page = parseInt(searchParams.get('page') || "1", 10)
        const limit = parseInt(searchParams.get('limit') || "10", 10)
        const skip = (page - 1) * limit;

        // Setup filter options for sorting and filtering journal entries based on query params
        const tag = searchParams.get('tag') || '';
        const gameId = searchParams.get('gameId') || '';
        const sortDirection = searchParams.get('order') === 'asc' ? 1 : -1;

        // Find the user in the collection of users
        const user = await UserCollection.findOne({ _id: new ObjectId(userId)})

        if (!user){
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        // Build the query object for filtering journal entries based on search parameters
        const query: any = { userId: userId };

        if (gameId) {
            query.gameId = gameId;
        }
        if (tag) {
            query.tags = tag; // Assuming tags is an array, this will match entries that have the specified tag
        }

        // Create unique cache key based on user ID, pagination, filters, and sorting options
        const cacheKey = `user_journal_entries:${userId}:page:${page}:limit:${limit}:game:${gameId}:tag:${tag}:order:${sortDirection}`;

        // Attempt to get cached data from Redis
        const cachedData = await redis.get(cacheKey);

        if(cachedData) {
            console.log('Returning cached journal entries for: ', cacheKey);
            return NextResponse.json(JSON.parse(cachedData), { status: 200 });
        }

        // Count all journal entries for the user
        const totalEntries = await JournalEntriesCollection.countDocuments(query);

       // Retrieve all journal entries for the user with pagination, sorting, and filtering applied
        const journalEntries = await JournalEntriesCollection.find(query).sort({ createdAt: sortDirection}).skip(skip).limit(limit).toArray();

        // Create response object that has journal entries and pagination info
        const response = {
            journalEntries,
            pagination: {
                totalEntries,
                currentPage: page,
                totalPages: Math.ceil(totalEntries / limit),
            },
        };

        // Cache the games data in Redis for 30 minutes
        await redis.set(cacheKey, JSON.stringify(response), 'EX', 1800);

        // Return the journal entries
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}