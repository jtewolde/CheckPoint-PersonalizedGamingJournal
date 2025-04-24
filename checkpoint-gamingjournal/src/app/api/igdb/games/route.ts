import { NextRequest, NextResponse } from 'next/server';

const IGDB_URL = 'https://api.igdb.com/v4/games';

async function getAccessToken() {
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
  console.log("Access Token Respone: ", data)
  return data.access_token;
}

// Named export for the GET method
export async function GET(req: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    const igdbRes = await fetch(IGDB_URL, {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_API_CLIENT_ID!, // Use the correct environment variable
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `fields name, summary, genres, cover.url; limit 50; sort total_rating desc;`,
    });

    const games = await igdbRes.json();
    return NextResponse.json(games, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: 'Something went wrong', error: err.message },
      { status: 500 }
    );
  }
}