// API Call for getting all necessary details of a specific game with id

import { error } from 'console';
import { NextRequest, NextResponse } from 'next/server';

const IGDB_URL = 'https://api.igdb.com/v4/games';

let cachedAccessToken: string | null = null; // Store the access token
let tokenExpirationTime: number | null = null; // Store the token expiration time (in UNIX timestamp)

async function getAccessToken() {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  // Check if the token is still valid
  if (cachedAccessToken && tokenExpirationTime && currentTime < tokenExpirationTime) {
    return cachedAccessToken; // Return the cached token if it's still valid
  }

  // Fetch a new token if the current one is expired or not available
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.IGDB_API_CLIENT_ID!,
      client_secret: process.env.IGDB_API_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to fetch access token: ${data.message}`);
  }

  // Cache the new token and its expiration time
  cachedAccessToken = data.access_token;
  tokenExpirationTime = Math.floor(Date.now() / 1000) + data.expires_in; // Current time + token lifespan

  console.log("New Access Token Fetched:", cachedAccessToken);
  return cachedAccessToken;
}

// Export for GET Method for getting details of singular game
export async function GET(req: NextRequest){
    try{
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if(!id){
            return NextResponse.json({ message: "Game ID is required "}, {status: 400});
        }

        const accessToken = await getAccessToken();

        const igdbRes = await fetch(IGDB_URL, {
            method: 'POST',
            headers: {
                'Client-ID': process.env.IGDB_API_CLIENT_ID!,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain',
            },
            body: `fields name, summary, storyline, genres.name, platforms.name, involved_companies.company.name, cover.url, aggregated_rating, version_title, screenshots.url, first_release_date, similar_games.cover.url ; where id = ${id};`,
        });

        if(!igdbRes.ok){
          const errorData = await igdbRes.json()
          console.error("IGDB API Error: ", errorData)
          return NextResponse.json(
            { message: "Failed to fetch game details", error: errorData},
            {status: igdbRes.status }
          );
        }

        const game = await igdbRes.json();
        return NextResponse.json(game[0], {status: 200});
      } catch (err: any) {
        console.error("Error", err);
        return NextResponse.json(
          { message: 'Something went wrong', error: err.message },
          { status: 500 }
        );
      }

    }