'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid } from "@mantine/core";

import classes from './PopularSection.module.css';

import GameCard from "../GameCard/GameCard";
import GameSkeletonCard from "../GameCard/GameSkeletonCard";

export default function PopularSection(){
    // States to hold popular games data and loading status
    const [popularGames, setPopularGames] = useState<any[]>([]);
    const limit = 12; // Set the limit of games on page to 12

    // Create skeletons array which length is the value of limit
    const skeletons = Array.from({ length: limit });

    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch popular games data from backend API on component mount
    useEffect(() => {
        const fetchPopularGames = async () => {
            try {
                const res = await fetch(`/api/igdb/popular-games?limit=${limit}&sort=first_release_date`);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch popular games');
                }
                const data = await res.json();
                setPopularGames(data.games); // Store the games data in state
                console.log("Popular Games: ", data.games);
                
                } catch (error) {
                console.error('Error fetching popular games:', error);
                } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
        fetchPopularGames();
        setHasMounted(true);
    }, []);

    return (
        <SimpleGrid cols={{base: 2, sm: 3, md: 4, lg: 5, xl: 6}} className={classes.popularGamesGrid}>
            {loading
            ? skeletons.map((_, i) => (
                <GameSkeletonCard key={i} variant="compact" />
            ))
            : popularGames.map((game) => (
                <GameCard
                    key={game.id}
                    game={game}
                    variant="compact"
                />
            ))
        }
        </SimpleGrid>
    );
}