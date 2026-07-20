'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid } from "@mantine/core";

import GameCard from "../GameCard/GameCard";
import GameSkeletonCard from "../GameCard/GameSkeletonCard";

import classes from './AnticipatedSection.module.css';

export default function AnticipatedSection(){
    // States to hold anticipated games data and loading status
    const [anticipatedGames, setAnticipatedGames] = useState<any[]>([]);
    const limit = 6; // Set the limit of games on page to 6
    
    // Create skeletons array which length is the value of limit
    const skeletons = Array.from({ length: limit });

    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch anticipated games data from backend API on component mount
    useEffect(() => {
        const fetchAnticipatedGames = async () => {
        try {
                const res = await fetch(`/api/igdb/most-anticipated?limit=${limit}&sort=hypes`);
                if (!res.ok) {
                    throw new Error('Failed to fetch anticipated games');
                }

                const data = await res.json();
                setAnticipatedGames(data.games); // Store the games data in state
                
                } catch (error) {
                    console.error('Error fetching anticipated games:', error);
                } finally {
                    setLoading(false); // Set loading to false after fetching
            }
        };
        fetchAnticipatedGames();
        setHasMounted(true);
    }, []);

    return (
        <SimpleGrid cols={{base: 2, sm: 3, md: 4, lg: 5, xl: 6}} className={classes.anticipatedGamesGrid}>
            {loading
                ? skeletons.map((_, i) => (
                    <GameSkeletonCard key={i} variant="compact" />
                ))
                : anticipatedGames.map((game) => (
                    <GameCard
                        key={game.id}
                        game={game}
                        variant="upcoming"
                    />
                ))
            }
        </SimpleGrid>
    )
}