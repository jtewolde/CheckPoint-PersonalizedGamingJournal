'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay, SimpleGrid, Image } from '@mantine/core';
import { authClient } from '@/lib/auth-client';

import PlaceHolderImage from "../../../public/no-cover-image.png"
import classes from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [hasMounted, setHasMounted] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
      }
    };

    checkAuth();
  }, [router]);

  // Fetch games data from the API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/igdb/games');
        if (!res.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await res.json();
        setGames(data); // Store the games data in state
        console.log(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchGames();
    setHasMounted(true);
  }, []);

  if (loading || !hasMounted) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}/>// Show a loading indicator while fetching data
  }

  // Define responsive settings for carousel
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3, // Show one slide at a time
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3, // Show one slide at a time
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1, // Show one slide at a time
    },
  };

  return (
    <div className={classes.wrapper}>
      <h1 className={classes.trendingText}>Top 6 Trending Games from Last 30 Days</h1>

      <div className={classes.trendingGames}>
        {loading && <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
        <SimpleGrid cols={6} spacing="lg" >
          {games.map((game) => (
            <div key={game.id} className={classes.gameCard}>
              <Image src={
              game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : PlaceHolderImage.src } 
              alt={game.name} 
              className={classes.cover} 
              onClick={() => router.push(`/games/${game.id}`)} 
              />
            </div>
          ))}
        </SimpleGrid>
      </div>

        


    </div>
  );
}