"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar } from "swiper/modules";

import classes from "./TrendingCarousel.module.css";

import GameCard from "../GameCard/GameCard";
import GameSkeletonCard from "../GameCard/GameSkeletonCard";

export default function TrendingGamesCarousel() {
  // States to hold trending games data and loading status
  const [trendingGames, setTrendingGames] = useState<any[]>([]);
  const limit = 12;

  // Create skeletons array which length is the value of limit
  const skeletons = Array.from({ length: limit });

  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Create variables for tracking screen sizes to adjust how the carousel looks
  const isMobile = useMediaQuery("(max-width: 646px)");
  const isTablet = useMediaQuery("(max-width: 950px)");

  const router = useRouter();

  // Fetch trending games data from backend API on component mount
  useEffect(() => {
    const fetchTrendingGames = async () => {
      try {
        const res = await fetch(
          `/api/igdb/trending-games?limit=${limit}&sort=first_release_date`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch trending games");
        }
        const data = await res.json();
        setTrendingGames(data.games); // Store the games data in state
        console.log("Trending Games: ", data);
      } catch (error) {
        console.error("Error fetching trending games:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchTrendingGames();
    setHasMounted(true);
  }, []);

  return (
    <div className={classes.trendingSection}>
      <Swiper
        scrollbar={{ draggable: true }}
        modules={[Navigation, Pagination, Scrollbar]}
        slidesPerView={isMobile ? 2.3 : isTablet ? 3.3 : 4.3}
        spaceBetween={24}
        className={classes.swiperContainer}
      >
        {loading
          ? skeletons.map((_, i) => (
              <SwiperSlide key={i} className={classes.swiperSlide}>
                <GameSkeletonCard variant="compact" />
              </SwiperSlide>
            ))
          : trendingGames.map((game) => (
              <SwiperSlide key={game.id} className={classes.swiperSlide}>
                <GameCard
                  game={game}
                  variant={isMobile ? "compact" : "default"}
                />
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
}
