// API Call for getting top 5 popular games to display on dashboard

import { NextRequest, NextResponse } from 'next/server';

const IGDB_URL = 'https://api.igdb.com/v4/popularity_primitives';

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

    const accessToken = await getAccessToken();

    // Calculate the date range for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = Math.floor((now.getTime() - 45 * 24 * 60 * 60 * 1000) / 1000); // 45 days ago in seconds

    // Construct the query body
    const body = 'fields game_id,value,popularity_type; sort value desc; limit 17; where popularity_type = 1;'

    const igdbRes = await fetch(IGDB_URL, {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body,
    });

    if (!igdbRes.ok) {
      const errorData = await igdbRes.json();
      console.error("IGDB API Error:", errorData);
      return NextResponse.json(
        { message: 'Failed to fetch games from IGDB', error: errorData },
        { status: igdbRes.status }
      );
    }

    const popularGames = await igdbRes.json();
    const gameIds = popularGames.map((g: any) => g.game_id).filter(Boolean);

    if (gameIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Get the current year start and end timestamps
    const currentYearStart = new Date(new Date().getFullYear(), 0, 1).getTime() / 1000; // Jan 1st, 2025
    const currentYearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59).getTime() / 1000; // Dec 31st, 2025

    // Step 2: Fetch the game details like name and cover images for those IDs
    const gamesRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `fields id, name, cover.url, first_release_date; where id = (${gameIds.join(',')}); sort first_release_date desc;`
    });

    if (!gamesRes.ok) {
      const errorData = await gamesRes.json();
      console.error("IGDB API Error (games):", errorData);
      return NextResponse.json(
        { message: 'Failed to fetch game details from IGDB', error: errorData },
        { status: gamesRes.status }
      );
    }

    const games = await gamesRes.json();
    return NextResponse.json(games, { status: 200 });
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json(
      { message: 'Something went wrong', error: err.message },
      { status: 500 }
    );
  }
}