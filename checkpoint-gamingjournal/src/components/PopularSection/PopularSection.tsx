'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid, Text, Image } from "@mantine/core";

import classes from './PopularSection.module.css';

import PlaceHolderImage from '../../../public/no-cover-image.png';

export default function PopularSection(){
    // States to hold popular games data and loading status
    const [popularGames, setPopularGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch popular games data from backend API on component mount
    useEffect(() => {
        const fetchPopularGames = async () => {
            try {
                const res = await fetch('/api/igdb/popular-games');
                
                if (!res.ok) {
                    throw new Error('Failed to fetch popular games');
                }
                const data = await res.json();
                setPopularGames(data); // Store the games data in state
                console.log("Popular Games: ", data);
                
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
        <SimpleGrid cols={7} spacing="lg" verticalSpacing='xl' className={classes.popularGamesGrid}>
            {popularGames.map((game) => (
                <div key={game.id} className={classes.gameCard} onClick={() => router.push(`/games/${game.id}`)}>

                    <div className={classes.imageWrapper}>

                        <Image 
                        src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}` : PlaceHolderImage.src } 
                        alt={game.name} 
                        className={classes.cover}  
                        />

                        <div className={classes.overlay}>

                            <Text className={classes.gameName}>{game.name}</Text>

                        </div>

                    </div>

                </div>
            ))}
        </SimpleGrid>
    );
}