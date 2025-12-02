'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import Image from "next/image";

import classes from './TrendingSection.module.css';

import PlaceHolderImage from '../../../public/no-cover-image.png';

export default function TrendingGamesSection() {
    // States to hold trending games data and loading status
    const [trendingGames, setTrendingGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch trending games data from backend API on component mount
    useEffect(() => {
        const fetchTrendingGames = async () => {
            try {
                const res = await fetch('/api/igdb/trendingGames');
                
                if (!res.ok) {
                    throw new Error('Failed to fetch popular games');
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

    // Responsive settings for the carousel
    const trendingResponsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1, // Show one slide at a time for desktop
        },
    }

    // Show loading state while fetching data
    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className={classes.trendingSection}>
            <h2 className={classes.sectionTitle}>Trending Games</h2>

            <Carousel
            responsive={trendingResponsive}
            autoPlay={true}
            autoPlaySpeed={6000}
            infinite
            keyBoardControl
            slidesToSlide={1}
            >
                {trendingGames.map((game) => (
                    <div key={game.id} className={classes.gameCard}>
                        <img
                            src={game.cover
                                ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
                                : PlaceHolderImage.src
                            }
                            alt={game.name}
                            className={classes.gameImage}
                            onClick={() => router.push(`/games/${game.id}`)} 
                        />
                        <h3 className={classes.gameTitle}>{game.name}</h3>
                    </div>
                ))}
            </Carousel>
        </div>
    )
}