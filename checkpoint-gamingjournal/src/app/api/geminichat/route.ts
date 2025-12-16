import { NextRequest, NextResponse } from "next/server";
import { streamText, generateText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';


// Create ratelimit variable to put a limit on amount of api calls for Gemini to 5 per min
const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '1m'),
})

// These settings are required for the edge runtime
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// To make sure the the API Key for Gemini is in the .env file
if(!process.env.GEMINI_API_KEY){
    console.error("There is no environment variable for GEMINI_API_KEY")
}

// Initialize Gemini with API Key
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!
})

const model = google('gemini-2.0-flash', { useSearchGrounding: true});

export async function POST(req: NextRequest){

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    // Check rate limit before processing
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    if (!success) {
        return NextResponse.json(
            {
                error: "Rate limit exceeded. Please try again later.",
                limit,
                remaining,
                reset
            },
            { status: 429 }
        );
    }

    try{

        const { messages } = await req.json();
        console.log("Received messages:", messages);

        const result = await generateText({
            model,
            system: "You are a friendly and expert assistant who specializes in video games. When responding, provide accurate, clear, and helpful answers based on real game data and common knowledge. Do not guess. If you're unsure, say so. Prioritize clarity over brevity.",
            messages,
        });

        console.log("Generated response: ", result);

        return NextResponse.json(result.text)

    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json({ error: "Failed to get response from Gemini." }, { status: 500 });
    }
}

