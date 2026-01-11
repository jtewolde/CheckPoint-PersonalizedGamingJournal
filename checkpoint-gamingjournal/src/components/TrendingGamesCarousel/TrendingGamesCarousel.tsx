'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@mantine/core";

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import classes from './TrendingCarousel.module.css';

import PlaceHolderImage from '../../../public/no-cover-image.png';

import { CircleArrowRight } from "lucide-react";

import { IconBrandXbox, IconFileDescription, IconBook, IconSwords, IconBrush, IconUsersGroup, IconDeviceGamepad2, 
IconRating18Plus, IconIcons, IconDevicesPc, IconBrandGoogle, IconDeviceNintendo, IconBrandAndroid, IconBrandApple } from '@tabler/icons-react';

export default function TrendingGamesCarousel() {
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
        tablet: {
            breakpoint: { max: 1024, min: 640 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 640, min: 0 },
            items: 1,
        },
    }


    // Function to retrieve logos for different platforms that games can be on
    const getPlatformIcon = (platformAbbreviation: string) => {

        if (platformAbbreviation.includes("Series X|S")) return <IconBrandXbox size={20} />;

        if (platformAbbreviation.includes("PS")) return <IconIcons size={20} />;

        if (platformAbbreviation.includes("PC") || platformAbbreviation.includes("win"))
        return <IconDevicesPc size={20} />;

        if (platformAbbreviation.includes("Switch")) return <IconDeviceNintendo size={20} />;

        if (platformAbbreviation.includes("And")) return <IconBrandAndroid size={20} />;

        if (platformAbbreviation.includes("ggl")) return <IconBrandGoogle size={20} />

        if (platformAbbreviation.includes("IOS") || platformAbbreviation.includes("mac")) 
        return <IconBrandApple size={20} />;

        return null; // fallback if no match
    };

    return (
        <div className={classes.trendingSection}>

            <div className={classes.trendingLogo} >
                <h2 className={classes.sectionTitle}>Trending</h2>
                <a className={classes.viewMoreIcon} href="/search/trending"> <CircleArrowRight size={35} /> </a>
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
                            
                            <div className={classes.badgeContainer}>

                                <div className={classes.genreBadges}>

                                    {game.genres?.slice(0, 2).map((genre: { name: string }) => (
                                    <Badge key={genre.name} size="md" variant="filled" color="white" radius='md' c='black'>
                                        {genre.name}
                                    </Badge>
                                    ))}

                                </div>

                                <div className={classes.platformBadges}>

                                    {game.platforms?.slice(0, 4).map((platform: { abbreviation: string }) => (
                                    <Badge key={platform.abbreviation} size="md" variant="subtle" color="gray" radius='md' c='white' leftSection={getPlatformIcon(platform.abbreviation)}>
                                        {platform.abbreviation}
                                    </Badge>
                                    ))}

                                </div>

                            </div>

                            <div className={classes.dateRatingContainer}>

                                <p className={classes.gameDate}>{game.release_dates?.[0]?.human} </p>
                            
                            </div>
                            

                        </div>
                        
                    </div>
                ))}
            </Carousel>
        </div>
    )
}