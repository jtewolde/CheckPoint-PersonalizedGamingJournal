'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Group } from "@mantine/core";

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import GlobalLoader from "../GlobalLoader/GlobalLoader";

import classes from './TrendingSection.module.css';

import PlaceHolderImage from '../../../public/no-cover-image.png';

import { IconBrandXbox, IconIcons, IconDevicesPc, IconBrandGoogle, IconDeviceNintendo, IconBrandAndroid, IconBrandApple } from '@tabler/icons-react';

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

    // Function to retrieve logos for different platforms that games can be on
    const getPlatformIcon = (platformName: string) => {

        if (platformName.toLowerCase().includes("xbox")) return <IconBrandXbox size={20} />;

        if (platformName.toLowerCase().includes("playstation")) return <IconIcons size={20} />;

        if (platformName.toLowerCase().includes("pc") || platformName.toLowerCase().includes("windows"))
            return <IconDevicesPc size={20} />;

        if (platformName.toLowerCase().includes("nintendo")) return <IconDeviceNintendo size={20} />;

        if (platformName.toLowerCase().includes("android")) return <IconBrandAndroid size={20} />;

        if (platformName.toLowerCase().includes("google")) return <IconBrandGoogle size={20} />

        if (platformName.toLowerCase().includes("ios") || platformName.toLowerCase().includes("mac")) 
            return <IconBrandApple size={20} />;

        return null; // fallback if no match
    
    };

    return (
        <div className={classes.trendingSection}>
            <h2 className={classes.sectionTitle}>Trending Games</h2>

            <Carousel
            arrows={false}
            showDots={true}
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

                        <div className={classes.gameInfo}>
                            <h3 className={classes.gameTitle}>{game.name}</h3>
                            <p className={classes.gameRating}> <span className={classes.ratingLabel}>Rating:</span> {game.total_rating ? game.total_rating.toFixed(1) : 'N/A'}</p>
                            <p className={classes.gameDate}> <span className={classes.releaseLabel}>Released:</span> {game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        
                    </div>
                ))}
            </Carousel>
        </div>
    )
}