'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';

import GameFilters from '@/components/GameFilters/GameFilters';
import GameSkeletonCard from '@/components/GameCard/GameSkeletonCard';
import GameCard from '@/components/GameCard/GameCard';

import { Text, SimpleGrid, Pagination } from '@mantine/core';

import classes from './Trending.module.css';

export default function TrendingPage() {

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 32; // Set the limit of games on page to 32
  
  // Create skeletons array which length is the value of limit
  const skeletons = Array.from({ length: limit });

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

  // Fetch the 
  useEffect(() => {
    const fetchTrendingGames = async () => {
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

            const res = await fetch(`/api/igdb/trending-games?${params.toString()}`);

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

    fetchTrendingGames();

  }, [page,
      sortOption,
      selectedGenre,
      selectedMode,
      selectedPlatform,
      selectedTheme,
      selectedType
  ]);

  return (
    <div className={classes.wrapper}>

      <div className={classes.backgroundOverlay}>

        <div className={classes.mainContent}>

          <div className={classes.headerSection}>

            <div className={classes.titleDescriptionSection}>

              <div className={classes.titleLogo}>

                <h1 className={classes.titleText}>Trending Games</h1>

              </div>

              <Text className={classes.description} size="xl">
                The most popular and buzzworthy games that are currently trending in the gaming community.
              </Text>

            </div>

            <GameFilters
              variant='default'
              totalGames={total}
              color="#546782ff"
              size={isMobile ? 'md' : 'lg'}
              radius='md'
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

          <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4 }} spacing="lg" verticalSpacing='xl' className={classes.gamesGrid}>
              {loading && games.length === 0
                ? skeletons.map((_, i) => (
                    <GameSkeletonCard
                    key={i}
                    variant={isMobile ? "small" : "default"}
                    />
                ))
                : games.map((game) =>
                    isMobile ? (
                      <GameCard key={game.id} game={game} variant="small" />
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
                      size='xl'
                      radius='md'
                      total={totalPages}
                      value={page}
                      onChange={(newPage) => {
                          setPage(newPage);
                          router.push(`/search/trending?&page=${newPage}`);
                      }}
                  />
              </div>
            )}
        </div>   
      </div>  
    </div>
  );
}