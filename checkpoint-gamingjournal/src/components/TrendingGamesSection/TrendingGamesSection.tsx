'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@mantine/core";

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import classes from './TrendingSection.module.css';

import PlaceHolderImage from '../../../public/no-cover-image.png';

import { CircleArrowRight, ChevronRight } from "lucide-react";

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

    return (
        <div className={classes.trendingSection}>

            <div className={classes.trendingLogo}>
                <h2 className={classes.sectionTitle}>Trending</h2>
                <a className={classes.viewMoreIcon} href='/search/trending'> <ChevronRight size={45} color="white"/> </a>
            </div>
            

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
                            <Badge color='green' size='sm' radius='sm' c='white'>{game.game_type.type}</Badge>
                            <p className={classes.gameDate}>{game.release_dates?.[0]?.human}</p>
                        </div>
                        
                    </div>
                ))}
            </Carousel>
        </div>
    )
}