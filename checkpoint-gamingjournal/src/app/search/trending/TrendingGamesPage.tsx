'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingOverlay } from '@mantine/core';
import { Pagination, SimpleGrid } from '@mantine/core';

import PlaceHolderImage from '../../../../public/no-cover-image.png';
import { TrendingUp } from 'lucide-react';

import classes from './Trending.module.css';

export default function TrendingPage() {

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 61; // Set the limit of games on page to 60
  const [total, setTotal] = useState(0);

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading
  const router = useRouter();

  // Fetch games data from the API
    useEffect(() => {
      const fetchPopularGames = async () => {
        try {
          const res = await fetch(`/api/igdb/populargames?limit=${limit}&page=${page}`);
          
          if (!res.ok) {
            throw new Error('Failed to fetch popular games');
          }
          const data = await res.json();
          setGames(data); // Store the games data in state
          setLength(data.length);
          setTotal(data.total);
          console.log("Popular Games: ",data);
          console.log("Total Games: ", data.total)
        } catch (error) {
          console.error('Error fetching popular games:', error);
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      };
      fetchPopularGames();
    }, []);

  if (loading) {
    return <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />
  }

  if (!games.length) {
    return <div>No games found </div>; // Show a message if no games are found
  }

    // Calculate the games to display on the current page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div className={classes.wrapper} >

        <div className={classes.titleLogo}>
          <TrendingUp size={40} />
          <h1 className={classes.searchText}> Top 60 Trending Games:</h1>
        </div>

        <h2 className={classes.numberText}>{length} Game Results:</h2>

        <SimpleGrid cols={6} spacing='sm' verticalSpacing='md' className={classes.gameGrid}>
          {games.map((game) => (
            <div className={classes.gameContainer} key={game.id} style={{ textAlign: 'center' }} onClick={() => {console.log("Naviagating to game details ", game.id); router.push(`/games/${game.id}`) }} >
              <img
                src={
                  game.cover
                    ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
                    : PlaceHolderImage.src
                }
                alt={game.name}
                className={classes.gameImage}
              />
              <p className={classes.gameName}>{game.name} </p>
              
            </div>
          ))}
        </SimpleGrid>
        
        <Pagination total={Math.ceil(total/ limit)} size='lg' style={{ justifyContent: "center" }} 
        className={classes.pagninaton} value={page} onChange={setPage} color='blue' radius="lg" />
    </div>
  );
}