import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"

// To make sure the the API Key for Gemini is in the .env file
if(!process.env.GEMINI_API_KEY){
    console.error("There is no environment variable for GEMINI_API_KEY")
}

// Initialize Gemini with API Key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

export async function POST(req: NextRequest){
    try{
        const {prompt, history} = await req.json();

        // Prepare chat history if needed
        const chatHistory = history || [];

        const result
    }
}

