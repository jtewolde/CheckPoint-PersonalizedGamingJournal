import { NextRequest, NextResponse } from "next/server";
import { UserCollection, GameCollection } from "@/utils/db";
import { ObjectId } from "mongodb";

import { auth } from "@/utils/auth";

// This API route is used to get the user's library
export async function GET(req: NextRequest){
    try{
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        // If there is no session/authencicated, return an error
        console.log(session)

        if(!session?.user) {
            console.log("Unauthorized access attempt to get user's library");
            return NextResponse.json({ error: "Unauthorized"}, {status: 401});
        }

        // Get user Id from session
        const userId = session.user.id

        // Find the user in the collection of users
        const user = await UserCollection.findOne({ _id: new ObjectId(userId)})

        if (!user){
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        // Get the list of game IDs from the games field
        const gameIds = user.games || [];

        // Fetch the game details from the `games` collection
        const games = await GameCollection.find({ _id: { $in: gameIds } }).toArray();

        return NextResponse.json({ games }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user's library:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}