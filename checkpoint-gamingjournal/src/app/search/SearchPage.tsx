'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import classes from './search.module.css';

import { LoadingOverlay } from '@mantine/core';
import { Pagination, SimpleGrid, Text } from '@mantine/core';
import PlaceHolderImage from '../../../public/no-cover-image.png';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || ''; // Get the search query from the URL

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 80; // Set the limit of games on page to 12

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const offset = (page - 1) * limit; // calculate offset based on page
        const res = await fetch(`/api/igdb/games?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);

        if (!res.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await res.json();
        setGames(data);
        setLength(data.length);
        console.log(data.length)
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchGames();
    }
  }, [query, page]);

  if (loading) {
    return <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />
  }

  if (!games.length) {
    return <div>No games found for "{query}"</div>; // Show a message if no games are found
  }

    // Calculate the games to display on the current page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div className={classes.wrapper} >
      <h1 className={classes.searchText}>Search Results for "{query}"</h1>
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
        
        {games.length > limit && (
        <Pagination total={Math.ceil(games.length/ limit)} size='lg' style={{ justifyContent: "center" }} 
        className={classes.pagninaton} value={page} onChange={setPage} color='blue' radius="lg" />
        )}
    </div>
  );
}