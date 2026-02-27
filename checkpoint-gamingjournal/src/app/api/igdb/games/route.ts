// API Call for getting minimum details for games during searching

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/utils/redis';
import { count } from 'console';

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

// Named export for the GET method
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '12', 10); // Default to 12 results per page
    const offset = parseInt(searchParams.get('offset') || '0', 10); // Default to 0 offset

    // Create a unique cache key based on search parameters, limit and offset
    const cacheKey = `igdb_games:${searchQuery}:${limit}:${offset}`;

    // Try to get cached data from Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Returning cached data for: ", cacheKey);
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    // Get new access token
    const accessToken = await getAccessToken();

    // Calculate the date range for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = Math.floor((now.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000); // 45 days ago in seconds

    // Initialize two clauses to centralize searchQuery and filters with WHERE to be used in both games and count API
    let whereClause = ''
    let searchClause = ''

    if(searchQuery){
      searchClause = `search "${searchQuery}";`;
      whereClause = `version_parent = null & total_rating >= 30`;
    } else {
      whereClause = `rating >= 80 & first_release_date >= ${thirtyDaysAgo} & first_release_date <= ${Math.floor(now.getTime() / 1000)} & cover != null`;
    }

    // Construct the query body for getting games
    const body = searchQuery
      ? `${searchClause} fields name, summary, genres.name, genres.slug, cover.url, version_title, game_type.type, game_modes.slug, screenshots.url, themes.slug, platforms.slug, first_release_date, release_dates.human, total_rating; where ${whereClause}; limit ${limit}; offset ${offset};`
      : `fields name, summary, genres, cover.url, version_title; where rating >= 80 & first_release_date >= ${thirtyDaysAgo} & first_release_date <= ${Math.floor(now.getTime() / 1000)} & cover != null; sort rating desc; limit 6; offset ${offset};`;

    // Call API Request for getting specific info on searched games
    const igdbRes = await fetch(IGDB_URL, {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body,
    });

    // Call API Request for getting the count of all games with those parameters for pagination
    const countRes = await fetch('https://api.igdb.com/v4/games/count', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `
        ${searchClause}
        where ${whereClause};
      `,
    });

    // Handle errors for when IGDB Games API Request fails
    if (!igdbRes.ok) {
      const errorData = await igdbRes.json();
      console.error("IGDB API Error:", errorData);
      return NextResponse.json(
        { message: 'Failed to fetch games from IGDB', error: errorData },
        { status: igdbRes.status }
      );
    }

    // Handle errors for getting the count for searching for game fails
    if (!countRes.ok) {
      const errorData = await countRes.json();
      console.error("IGDB Count Error:", errorData);
      return NextResponse.json(
        { message: 'Failed to fetch the count of games from IGDB', error: errorData },
        { status: countRes.status }
      );
    }

    // Store the JSON Data from count request and the games request
    const countData = await countRes.json();
    const total = countData.count || 0;
    const games = await igdbRes.json();

    // Group the games and total count together to form the complete response
    const response = {games, total}

    // Cache the response in Redis for 10 minutes
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 600); 

    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json(
      { message: 'Something went wrong', error: err.message },
      { status: 500 }
    );
  }
}