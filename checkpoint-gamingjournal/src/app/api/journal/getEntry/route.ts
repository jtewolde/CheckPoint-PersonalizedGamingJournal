import { NextRequest, NextResponse } from "next/server";
import { UserCollection,  JournalEntriesCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";

// This API Route is to fetch and get a selected jounral entry by using the id from a user
export async function GET(req: NextRequest){
    try{
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        // If there is no session/authencicated, return an error
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

        
        // Get entry id from query params
        const { searchParams } = new URL(req.url);
        const entryId = searchParams.get("id");

        if (!entryId) {
            return NextResponse.json({ error: "No entry id provided" }, { status: 400 });
        }

        // Try to find by _id (ObjectId) or uuid
        let journalEntry = null;

        if (ObjectId.isValid(entryId)) {
            journalEntry = await JournalEntriesCollection.findOne({ _id: new ObjectId(entryId), userId });
        }

        if (!journalEntry) {
            journalEntry = await JournalEntriesCollection.findOne({ uuid: entryId, userId });
        }

        if (!journalEntry) {
            return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
        }

        return NextResponse.json({ entry: journalEntry });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}