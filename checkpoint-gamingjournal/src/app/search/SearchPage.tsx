'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingOverlay } from '@mantine/core';
import { SimpleGrid, Button, Popover, Select} from '@mantine/core';

import { ListFilter } from 'lucide-react';
import PlaceHolderImage from '../../../public/no-cover-image.png';

import classes from './search.module.css';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || ''; // Get the search query from the URL

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 100; // Set the limit of games on page to 12

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading

  const [sortOption, setSortOption] = useState<'first_release_date' | 'total_rating' | ''>(''); // State to sort search results from release date/total_rating
  const [selectedType, setSelectedType] = useState('all');

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

// Function to sort out the search results of games using useMemo to sort 
  const sortedGames = useMemo(() => {
  if (!sortOption) return games;

  const sorted = [...games].sort((a, b) => {
    if (sortOption === 'first_release_date') {
      return (b.first_release_date || 0) - (a.first_release_date || 0);
    }
    if (sortOption === 'total_rating') {
      return (b.total_rating || 0) - (a.total_rating || 0);
    }
    return 0;
  });

  console.log("Sorted by:", sortOption, sorted.map(g => ({
    name: g.name,
    release: g.first_release_date,
    rating: g.total_rating
  })));

  return sorted;
}, [games, sortOption]);

  // Filter the sorted games based on game types like Main Games, DLCs, and Expansions
  const processedGames = sortedGames.filter((game) =>
    selectedType === 'all' || game.game_type.type?.toLowerCase() === selectedType
  );

  // If the page is still loading, put a loading overlay
  if (loading) {
    return <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />
  }

  // If there are no search results for search input, redirect to not found page
  if (!games.length) {
    redirect('/search/not-found')
  }

  return (
    <div className={classes.wrapper} >
      <h1 className={classes.searchText}>Search Results for "{query}"</h1>

        <div className={classes.mainContent}>

          <h2 className={classes.numberText}>{processedGames.length} Game Results:</h2>

          <div className={classes.searchButtons}>

            {/* Sort By Dropdown */}
            <Popover width={300} position='bottom-end' withArrow shadow='lg' radius='lg' styles={{dropdown: {background: '#212121', color: 'whitesmoke', fontFamily: 'Noto Sans'}}}>
                <Popover.Target>
                    <Button className={classes.filterButton} size='md' radius='lg' variant="filled" color='#d1b053ff' rightSection={<ListFilter />}>Sort By</Button>
                </Popover.Target>

                <Popover.Dropdown>
                    <Select
                      size='md'
                      label="Sort By:"
                      placeholder="Ex: Release Date"
                      checkIconPosition='left'
                      styles={{
                        dropdown: {
                          background: '#212121',
                          color: 'whitesmoke'
                        },
                        input: {
                          background: '#212121',
                          fontFamily: 'Noto Sans',
                          color: 'white'
                        },
                        option: {
                          background: '#212121',
                          fontFamily: 'Noto Sans',
                          fontSize: '16px'
                        }
                      }}
                      data={[
                          { value: 'first_release_date', label: 'Release Date' },
                          { value: 'total_rating', label: "Total Rating"},
                      ]}
                      value={sortOption}
                      onChange={(value) => setSortOption(value as any)}
                      className={classes.filterDropdown}
                      mb="md"
                    />
                </Popover.Dropdown>

            </Popover>

            {/* Filter By Game Types Dropdown */}
            <Popover width={300} position='bottom-end' withArrow shadow='lg' radius='md' closeOnClickOutside={false} styles={{dropdown: {background: '#212121', color: 'whitesmoke', fontFamily: 'Noto Sans'}}}>
                <Popover.Target>
                    <Button className={classes.filterButton} size='md' radius='lg' variant="filled" color='#b7308cff' rightSection={<ListFilter />}>Filter By</Button>
                </Popover.Target>

                <Popover.Dropdown>
                    <Select
                      size='md'
                      label="Filter Games By:"
                      placeholder="All Games"
                      checkIconPosition='left'
                      withScrollArea={false}
                      styles={{
                        dropdown: {
                          background: '#212121',
                          color: 'whitesmoke',
                          maxHeight: 200,
                          overflowY: 'auto'
                        },
                        input: {
                          background: '#212121',
                          fontFamily: 'Noto Sans',
                          color: 'white'
                        },
                        option: {
                          background: '#212121',
                          fontFamily: 'Noto Sans',
                          fontSize: '16px'
                        }
                      }}
                      data={[
                          { value: 'all', label: 'All'},
                          { value: 'main game', label: 'Main Game' },
                          { value: 'dlc', label: "DLC"},
                          { value: 'expansion', label: "Expansion"},
                          { value: 'standalone expansion', label:'Standalone Expansions'},
                          { value: 'remake', label: 'Remake'},
                          { value: 'remaster', label: 'Remaster'}
                      ]}
                      value={selectedType}
                      onChange={(value) => setSelectedType(value as any)}
                      className={classes.filterDropdown}
                      mb="md"
                    />
                </Popover.Dropdown>

            </Popover>

          </div>

          <SimpleGrid cols={6} spacing='sm' verticalSpacing='md' className={classes.gameGrid}>
            {processedGames.map((game) => (
              <div className={classes.gameContainer} key={game.id} style={{ textAlign: 'center' }} onClick={() => {console.log("Naviagating to game details ", game.id); router.push(`/games/${game.id}`) }} >
                <img
                  src={
                    game.cover
                      ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
                      : PlaceHolderImage.src
                  }
                  alt={game.name}
                  className={classes.gameImage}
                />
                <p className={classes.gameName}>{game.name} </p>
                
              </div>
            ))}
          </SimpleGrid>

        </div>
        
    </div>
  );
}