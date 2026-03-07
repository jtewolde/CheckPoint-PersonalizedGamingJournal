'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';

import GameFilters from '@/components/GameFilters/GameFilters';
import GameCard from '@/components/GameCard/GameCard';

import { Text, SimpleGrid, Pagination } from '@mantine/core';
import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import classes from './Popular.module.css';

export default function PopularPage() {

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 32; // Set the limit of games on page to 50

  // Calculate total amount of games received from IGDB API request
  // Calcualte the total number of pages for pagination
  const [total, setTotal] = useState(0)
  const totalPages = Math.ceil(total/limit)

  const isMobile = useMediaQuery('(max-width: 520px)');

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading

  // States to handle sorting and filtering search results
  const [sortOption, setSortOption] = useState<'first_release_date' | 'total_rating' | 'alphabetical' | ''>('first_release_date'); // State to sort search results from release date/total_rating
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>([]);

  const router = useRouter();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    sortOption,
    selectedType,
    selectedGenre,
    selectedTheme,
    selectedMode,
    selectedPlatform
  ]);

  useEffect(() => {
        const fetchPopularGames = async () => {
            try {
                setLoading(true)
                const offset = (page - 1) * limit; // calculate offset based on page

                // Create the params of URL to include the sorting and filters applied
                const params = new URLSearchParams({
                    limit: String(limit),
                    offset: String(offset),
                    sort: sortOption,
                    types: selectedType.join(','),
                    genres: selectedGenre.join(','),
                    themes: selectedTheme.join(','),
                    modes: selectedMode.join(','),
                    platforms: selectedPlatform.join(',')
                });

                const res = await fetch(`/api/igdb/popular-games?${params.toString()}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch games');
                }

                const data = await res.json();

                setGames(data.games);
                setLength(data.length);
                setTotal(data.total)

                console.log("Game Results", data.games)
                console.log("Total Count", data.total)
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularGames();

    }, [page,
        sortOption,
        selectedGenre,
        selectedMode,
        selectedPlatform,
        selectedTheme,
        selectedType
    ]);

  // If the page is still loading, put a loading overlay
  if (loading) {
    return <GlobalLoader visible={loading} />
  }

  // If there are no popular games results, redirect the user to the not-found page
  if (!games.length) {
    redirect('/search/not-found')
  }

  return (
    <div className={classes.wrapper} >

      <div className={classes.backgroundOverlay}>

        <div className={classes.mainContent}>

          <div className={classes.headerSection}>

            <div className={classes.titleDescriptionSection}>

              <div className={classes.titleLogo}>

                <h1 className={classes.titleText}>Popular Games:</h1>

              </div>

              <Text className={classes.description} size="xl">
                Explore the most popular games that define today’s gaming scene. 
              </Text>

            </div>

            <GameFilters
              variant='default'
              color='#3697d4ff'
              size={isMobile ? 'md' : 'lg'}
              radius='md'
              totalGames={total}
              sortOption={sortOption}
              selectedType={selectedType}
              selectedGenres={selectedGenre}
              selectedThemes={selectedTheme}
              selectedModes={selectedMode}
              selectedPlatforms={selectedPlatform}
              onSortChange={(v) => setSortOption(v as any)}
              onTypeChange={(v) => setSelectedType(v as any)}
              onGenresChange={(v) => setSelectedGenre(v as any)}
              onThemesChange={(v) => setSelectedTheme(v as any)}
              onModesChange={(v) => setSelectedMode(v as any)}
              onPlatformsChange={(v) => setSelectedPlatform(v as any)}
            />

          </div>


          <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4 }} spacing="lg" verticalSpacing='xl' className={classes.resultGamesGrid}>
                {games.map((game) => 
                    isMobile ? (
                        <GameCard key={game.id} game={game} variant='small' />
                    ) : (
                        <GameCard key={game.id} game={game} />
                    )
                )}
            </SimpleGrid>

            {total == 0 && (
                <p className={classes.noResultsText}>No games were found.</p>
            )}
            
            {totalPages > 1 && (
                <div className={classes.paginationWrapper}>
                    <Pagination
                        size='lg'
                        radius='md'
                        total={totalPages}
                        value={page}
                        onChange={(newPage) => {
                            setPage(newPage);
                            router.push(`/search/popular?&page=${newPage}`);
                        }}
                    />
                </div>
            )}
          
        </div>

      </div>

    </div>
  );
}