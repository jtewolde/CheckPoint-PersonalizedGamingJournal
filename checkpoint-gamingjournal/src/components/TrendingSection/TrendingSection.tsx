'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid, Text, Image } from "@mantine/core";

import GameCard from "../GameCard/GameCard";

import classes from './TrendingSection.module.css';

import PlaceHolderImage from '../../../public/no-cover-image.png';

export default function TrendingSection(){
    // States to hold trending games data and loading status
    const [trendingGames, setTrendingGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch trending games data from backend API on component mount
    useEffect(() => {
        const fetchTrendingGames = async () => {
            try {
                const res = await fetch('/api/igdb/trending-games');
                
                if (!res.ok) {
                    throw new Error('Failed to fetch Trending games');
                }
                const data = await res.json();
                setTrendingGames(data); // Store the games data in state
                console.log("Trending Games: ",data);
                
                } catch (error) {
                console.error('Error fetching trending games:', error);
                } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
        fetchTrendingGames();
        setHasMounted(true);
    }, []);

    return (
        <SimpleGrid cols={{base: 2, sm: 3, md: 4, lg: 5, xl: 6}} className={classes.trendingGamesGrid}>
            {trendingGames.map((game) => (
                <GameCard key={game.id} game={game} variant="compact" />
            ))}
        </SimpleGrid>
    )

}