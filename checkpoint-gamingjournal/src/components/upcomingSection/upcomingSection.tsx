'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid } from "@mantine/core";

import GameCard from "../GameCard/GameCard";
import GameSkeletonCard from "../GameCard/GameSkeletonCard";

import classes from './upcomingSection.module.css';

export default function UpcomingSection(){
    // States to hold upcoming games data and loading status
    const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
    const limit = 6; // Set the limit of games on page to 12
    
    // Create skeletons array which length is the value of limit
    const skeletons = Array.from({ length: limit });

    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch upcoming games data from backend API on component mount
    useEffect(() => {
        const fetchUpcomingGames = async () => {
        try {
                const res = await fetch(`/api/igdb/upcoming-releases?limit=${limit}&sort=first_release_date_oldest`);
                if (!res.ok) {
                    throw new Error('Failed to fetch Upcoming games');
                }

                const data = await res.json();
                setUpcomingGames(data.games); // Store the games data in state
                console.log("Upcoming Games: ", data.games);
                
                } catch (error) {
                    console.error('Error fetching upcoming games:', error);
                } finally {
                    setLoading(false); // Set loading to false after fetching
            }
        };
        fetchUpcomingGames();
        setHasMounted(true);
    }, []);

    return (
        <SimpleGrid cols={{base: 2, sm: 3, md: 4, lg: 5, xl: 6}} className={classes.upcomingGamesGrid}>
            {loading
                ? skeletons.map((_, i) => (
                    <GameSkeletonCard key={i} variant="compact" />
                ))
                : upcomingGames.map((game) => (
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