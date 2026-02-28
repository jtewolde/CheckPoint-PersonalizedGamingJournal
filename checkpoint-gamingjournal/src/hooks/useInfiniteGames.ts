'use client'

import { useEffect, useState } from "react"


// The purpose of this hook is to fetch games from the IGDB API for Search Results component
// Needed to implement Infinite Scroll feature for searching games instead of Pagination
export function useInfiniteGames(query: string, limit: number = 30){

    // State variables for retrieving and storing game objects from IGDB, 
    // loading overlay, and variable for determining if more games are needed
    const [games, setGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Function to fetch more games from API Endpoint
    const fetchMore = async() => {
        if(loading || !hasMore) return;

        try{
            setLoading(true)
            const res = await fetch(
                `/api/igdb/games?query=${encodeURIComponent(query)}&limit=${limit}&offset=${games.length}`
            )

            const data = await res.json();

            // Append more new games into the existing games array
            setGames(prev => [...prev, ...data.games]);

            // Don't load more games if the length of games is less than the limit
            if (data.games.length < limit) {
                setHasMore(false);
            }

        } finally {
            setLoading(false);
        }
    };

    // Reset games when the search query begins
    useEffect(() => {
        setGames([]);
        setHasMore(true);
    }, [query]);

    // Automatically fetch first batch of games(initial load)
    useEffect(() =>{
        fetchMore();
    }, [query])

    return {games, loading, hasMore, fetchMore}

}