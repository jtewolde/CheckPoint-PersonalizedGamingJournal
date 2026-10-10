// API Call for getting minimum details for games during searching

import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/utils/redis";

const IGDB_URL = "https://api.igdb.com/v4/games";

let cachedAccessToken: string | null = null;
let tokenExpirationTime: number | null = null;

async function getAccessToken() {
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    cachedAccessToken &&
    tokenExpirationTime &&
    currentTime < tokenExpirationTime
  ) {
    return cachedAccessToken;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.IGDB_API_CLIENT_ID!,
      client_secret: process.env.IGDB_API_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to fetch access token: ${data.message}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpirationTime = Math.floor(Date.now() / 1000) + data.expires_in;

  return cachedAccessToken;
}

// Named export for the GET method
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const searchQuery = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Filter params
    const sort = searchParams.get("sort");

    const game_types =
      searchParams.get("types")?.split(",").filter(Boolean) || [];

    const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];

    const themes = searchParams.get("themes")?.split(",").filter(Boolean) || [];

    const modes = searchParams.get("modes")?.split(",").filter(Boolean) || [];

    const platforms =
      searchParams.get("platforms")?.split(",").filter(Boolean) || [];

    // Create a unique cache key
    const cacheKey = `igdb_games:
    ${searchQuery}:
    ${limit}:
    ${offset}:
    ${sort || ""}:
    ${game_types.join(",")}:
    ${genres.join(",")}:
    ${themes.join(",")}:
    ${modes.join(",")}:
    ${platforms.join(",")}`;

    // Try Redis cache first
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    // Get IGDB access token
    const accessToken = await getAccessToken();

    // Current date in Unix timestamp
    const now = new Date();
    const currentTimestamp = Math.floor(now.getTime() / 1000);

    // Last 30 days
    const thirtyDaysAgo = Math.floor(
      (now.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000,
    );

    // Initialize IGDB where conditions
    const whereConditions: string[] = [];

    // Always exclude game versions
    whereConditions.push("version_parent = null");

    if (searchQuery) {
      // Search both the official game name and alternative names
      whereConditions.push(
        `(name ~ *"${searchQuery}"* | alternative_names.name ~ *"${searchQuery}"*)`,
      );
      whereConditions.push("cover != null");
      whereConditions.push("age_ratings != null");
    } else {
      /*
       * HOME / DISCOVERY RESULTS
       *
       * Keep the existing behavior for non-search requests.
       */
      whereConditions.push("rating >= 80");
      whereConditions.push(`first_release_date >= ${thirtyDaysAgo}`);
      whereConditions.push(`first_release_date <= ${currentTimestamp}`);
      whereConditions.push("cover != null");
    }

    // Game type filter
    if (game_types.length) {
      whereConditions.push(
        `game_type.type = (${game_types.map((t) => `"${t}"`).join(",")})`,
      );
    }

    // Genre filter
    if (genres.length) {
      whereConditions.push(
        `genres.slug = (${genres.map((g) => `"${g}"`).join(",")})`,
      );
    }

    // Theme filter
    if (themes.length) {
      whereConditions.push(
        `themes.slug = (${themes.map((t) => `"${t}"`).join(",")})`,
      );
    }

    // Game mode filter
    if (modes.length) {
      whereConditions.push(
        `game_modes.slug = (${modes.map((m) => `"${m}"`).join(",")})`,
      );
    }

    // Platform filter
    if (platforms.length) {
      whereConditions.push(
        `platforms.slug = (${platforms.map((p) => `"${p}"`).join(",")})`,
      );
    }

    // Combine conditions
    const whereClause = whereConditions.join(" & ");

    console.log("Where Conditions:", whereConditions);

    // Sorting
    let sortClause = "";

    if (sort === "alphabetical") {
      sortClause = "sort name asc;";
    }

    if (sort === "alphabetical_reverse") {
      sortClause = "sort name desc;";
    }

    if (sort === "first_release_date") {
      sortClause = "sort first_release_date desc;";
    }

    if (sort === "first_release_date_oldest") {
      sortClause = "sort first_release_date asc;";
    }

    if (sort === "total_rating") {
      sortClause = "sort total_rating desc;";
    }

    if (sort === "total_rating_reverse") {
      sortClause = "sort total_rating asc;";
    }

    // Construct IGDB query
    const body = searchQuery
      ? `
        fields
          name,
          alternative_names.name,
          summary,
          genres.name,
          genres.slug,
          cover.url,
          version_title,
          game_type.type,
          game_modes.slug,
          game_modes.name,
          screenshots.url,
          themes.slug,
          platforms.name,
          platforms.alternative_name,
          platforms.slug,
          platforms.abbreviation,
          platforms.platform_logo.url,
          involved_companies.developer,
          first_release_date,
          release_dates.human,
          total_rating;

        where ${whereClause};

        ${sortClause}

        limit ${limit};
        offset ${offset};
      `
      : `
        fields
          name,
          summary,
          genres,
          cover.url,
          version_title;

        where
          rating >= 80 &
          first_release_date >= ${thirtyDaysAgo} &
          first_release_date <= ${currentTimestamp} &
          cover != null;

        sort rating desc;

        limit 6;
        offset ${offset};
      `;

    // Fetch games
    const igdbRes = await fetch(IGDB_URL, {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body,
    });

    // Fetch count
    const countRes = await fetch("https://api.igdb.com/v4/games/count", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_API_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body: `
        where ${whereClause};
      `,
    });

    // Handle game request errors
    if (!igdbRes.ok) {
      const errorData = await igdbRes.json();

      console.error("IGDB API Error:", errorData);

      return NextResponse.json(
        {
          message: "Failed to fetch games from IGDB",
          error: errorData,
        },
        { status: igdbRes.status },
      );
    }

    // Handle count request errors
    if (!countRes.ok) {
      const errorData = await countRes.json();

      console.error("IGDB Count Error:", errorData);

      return NextResponse.json(
        {
          message: "Failed to fetch the count of games from IGDB",
          error: errorData,
        },
        { status: countRes.status },
      );
    }

    // Parse responses
    const countData = await countRes.json();
    const games = await igdbRes.json();

    const total = countData.count || 0;

    const response = {
      games,
      total,
    };

    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(response), "EX", 600);

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error("Error:", err);

    return NextResponse.json(
      {
        message: "Something went wrong",
        error: err.message,
      },
      { status: 500 },
    );
  }
}
