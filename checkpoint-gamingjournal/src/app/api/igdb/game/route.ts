// API Call for getting all necessary details of a specific game with id

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/utils/redis';

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
        console.log("game ID passed", id)

        if(!id){
            return NextResponse.json({ message: "Game ID is required "}, {status: 400});
        }

        // Create unique cache key based on game ID
        const cacheKey = `igdb_game_details:${id}`

        // // Try to get cached data from Redis
        const cachedData = await redis.get(cacheKey);
        if(cachedData){
          console.log("Returning cached data of game details for: ", cacheKey);
          return NextResponse.json(JSON.parse(cachedData), { status: 200 });
        }

        const accessToken = await getAccessToken();

        const igdbRes = await fetch(IGDB_URL, {
            method: 'POST',
            headers: {
                'Client-ID': process.env.IGDB_API_CLIENT_ID!,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain',
            },
            body: `fields name, summary, storyline, genres.name, platforms.name, game_modes.name, game_type.type, themes.name, involved_companies.company.name, involved_companies.company.logo.url, cover.url, rating, rating_count, aggregated_rating, aggregated_rating_count, version_title, screenshots.url, first_release_date, release_dates.human, release_dates.platform.name, similar_games.cover.url, age_ratings.rating_category.rating, age_ratings.rating_category.organization.name, collections.games.cover.url, collections.games.name, collections.games.total_rating; where id = ${id};`,
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

        // Cache the response in Redis for 5 minutes
        await redis.set(cacheKey, JSON.stringify(game[0]), 'EX', 300);

        if (!game || game.length === 0) {
          return NextResponse.json({ message: "Game not found from IGDB." }, { status: 404 });
        }

        return NextResponse.json(game[0], { status: 200 });

      } catch (err: any) {
        console.error("Error", err);
        return NextResponse.json(
          { message: 'Something went wrong', error: err.message },
          { status: 500 }
        );
      }

    }