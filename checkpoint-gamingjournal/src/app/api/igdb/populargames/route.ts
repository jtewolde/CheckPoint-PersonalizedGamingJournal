
// API Call for getting top 12 popular games to display on dashboard
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/utils/redis';

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

// Named export for the GET method
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('query') || '';

    const limit = parseInt(searchParams.get('limit') || '12', 10); // Default to 12 results per page

    const page = parseInt(searchParams.get('page') || '1', 10);

    const accessToken = await getAccessToken();

    const cacheKey = `igdb_popular_games:${limit};${page}`;

    // Try to get cached data from Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Returning cached data for: ", cacheKey);
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    // Calculate the date range for the 
    const now = new Date();
    const startOfYear = Math.floor(new Date(2015, 0, 1).getTime() / 1000); // Start of the current year in seconds

    // Step 2: Fetch the game details like name and cover images for those IDs
    const gamesRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `fields name, summary, genres, genres.slug, cover.url, version_title, game_type.type, game_modes.slug, themes.slug, platforms.slug, first_release_date, total_rating; where aggregated_rating != null & total_rating > 30 & total_rating_count > 7 & game_type.type != "Bundle"; sort total_rating desc; limit ${limit};`
    });

    if (!gamesRes.ok) {
      const errorData = await gamesRes.json();
      console.error("IGDB API Error (games):", errorData);
      return NextResponse.json(
        { message: 'Failed to fetch game details from IGDB', error: errorData },
        { status: gamesRes.status }
      );
    }

    // Get response data from the games endpoint
    const games = await gamesRes.json();

    // Cache the response in Redis for 10 minutes
    await redis.set(cacheKey, JSON.stringify(games), 'EX', 600); 

    return NextResponse.json(games, { status: 200 });

  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json(
      { message: 'Something went wrong', error: err.message },
      { status: 500 }
    );
  }
}