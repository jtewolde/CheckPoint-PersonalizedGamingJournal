'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

import classes from './TrendingCarousel.module.css';

import { CircleArrowRight } from "lucide-react";

import { IconBrandXbox, IconIcons, IconDevicesPc, IconBrandGoogle, IconBrandWindows, IconDeviceNintendo, IconBrandAndroid, IconBrandApple } from '@tabler/icons-react';
import GameCard from "../GameCard/GameCard";

export default function TrendingGamesCarousel() {
    // States to hold trending games data and loading status
    const [trendingGames, setTrendingGames] = useState<any[]>([]);
    const limit = 12
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    // Fetch trending games data from backend API on component mount
    useEffect(() => {
        const fetchTrendingGames = async () => {
            try {
                const res = await fetch(`/api/igdb/trending-games?limit=${limit}&sort=first_release_date`);
                
                if (!res.ok) {
                    throw new Error('Failed to fetch trending games');
                }
                const data = await res.json();
                setTrendingGames(data.games); // Store the games data in state
                console.log("Trending Games: ", data);
                
                } catch (error) {
                console.error('Error fetching trending games:', error);
                } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
        fetchTrendingGames();
        setHasMounted(true);
    }, []);


    // Function to retrieve logos for different platforms that games can be on
    const getPlatformIcon = (platformAbbreviation: string) => {

        if (platformAbbreviation.includes("Series X|S")) return <IconBrandXbox size={25} />;

        if (platformAbbreviation.includes("PS")) return <IconIcons size={25} />;

        if (platformAbbreviation.includes("PC") || platformAbbreviation.includes("win"))
        return <IconBrandWindows size={25} />;

        if (platformAbbreviation.includes("Linux")) return <IconDevicesPc size={25} />

        if (platformAbbreviation.includes("Switch")) return <IconDeviceNintendo size={25} />;

        if (platformAbbreviation.includes("Android")) return <IconBrandAndroid size={25} />;

        if (platformAbbreviation.includes("ggl")) return <IconBrandGoogle size={25} />

        if (platformAbbreviation.includes("IOS") || platformAbbreviation.includes("mac")) 
        return <IconBrandApple size={30} />;

        return null; // fallback if no match
    };

    return (
        <div className={classes.trendingSection}>

            <div className={classes.trendingLogo} >
                <h2 className={classes.sectionTitle}>Trending</h2>
                <a className={classes.viewMoreIcon} href="/search/trending"> <CircleArrowRight size={35} /> </a>
            </div>
            
            <Swiper
            centeredSlides={true}
            loop={true}
            autoplay
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            spaceBetween={50}
            slidesPerView={1.4}
            className={classes.swiperContainer}
            >
                {trendingGames.map((game) => (
                    <SwiperSlide key={game.id} className={classes.gameCard}>
                        <GameCard game={game} variant="default" key={game.id}/>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}