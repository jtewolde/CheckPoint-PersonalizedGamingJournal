import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';


// To make sure the the API Key for Gemini is in the .env file
if(!process.env.GEMINI_API_KEY){
    console.error("There is no environment variable for GEMINI_API_KEY")
}

// Initialize Gemini with API Key
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
})

const model = google('gemini-2.0-flash')

export async function POST(req: NextRequest){
    try{
        const { messages } = await req.json();

        const result = streamText({
            model,
            system: "You are a helpful assistant.",
            messages,
        });

        return result.toDataStreamResponse();

    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json({ error: "Failed to get response from Gemini." }, { status: 500 });
    }
}

