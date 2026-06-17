'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';

import GameFilters from '@/components/GameFilters/GameFilters';
import GamePageSearch from '@/components/GamePageSearch/GamePageSearch';
import ActiveFilters from '@/components/ActiveFilters/ActiveFilters';
import GameSkeletonCard from '@/components/GameCard/GameSkeletonCard';
import GameCard from '@/components/GameCard/GameCard';

import { Text, SimpleGrid, Pagination, Select } from '@mantine/core';

import classes from './Trending.module.css';

export default function TrendingPage() {

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 36; // Set the limit of games on page to 32
  
  // Create skeletons array which length is the value of limit
  const skeletons = Array.from({ length: limit });

  // Calculate total amount of games received from IGDB API request
  // Calcualte the total number of pages for pagination
  const [total, setTotal] = useState(0)
  const totalPages = Math.ceil(total/limit)

  const [search, setSearch] = useState('');

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

  // Filter the popular games results if using search bar
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={classes.wrapper} >

        <div className={classes.mainContent}>

          <div className={classes.headerSection}>

            <div className={classes.titleDescriptionSection}>

              <div className={classes.titleLogo}>

                <h1 className={classes.titleText}>Trending Games</h1>

              </div>

              <Text className={classes.description}>
                  Explore the hottest games capturing attention today.
                  From breakout hits to rising favorites, see what's trending across the gaming world.
              </Text>

            </div>

            <div className={classes.toolbar}>
              
              <div className={classes.searchContainer}>
                <GamePageSearch size='lg' radius='md' value={search} onChange={setSearch}/>
              </div>

              <div className={classes.actionRow}>

                <div className={classes.sortContainer}>
                  {/* Sort By Dropdown */}
                    <Select
                      className={classes.filterDropdown}
                      size='lg'
                      variant='filled'
                      placeholder="Select an option"
                      checkIconPosition='left'
                      data={[
                          { value: 'alphabetical', label: 'Alphabetical (A-Z)'},
                          { value: 'first_release_date', label: 'Release Date' },
                          { value: 'total_rating', label: "Total Rating"},
                      ]}
                      value={sortOption}
                      onChange={(value) => setSortOption(value as 'first_release_date' | 'total_rating' | 'alphabetical' | '')}
                      styles={{
                        input:{
                            backgroundColor: '#1b1b1b',
                            color: 'white',
                            border: '1px solid #2a2828'
                        }
                      }}
                    />
                </div>
                
                <div className={classes.filterContainer}>

                  <GameFilters
                    variant='default'
                    color='rgb(49, 48, 48)'
                    size= 'lg'
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
                
              </div>

            </div>

          </div>

          <div className={classes.resultsContainer}>

            <Text className={classes.resultsText}>
              Showing {filteredGames.length} of {total.toLocaleString()} games
            </Text>

            <ActiveFilters
              selectedTypes={selectedType}
              selectedGenres={selectedGenre}
              selectedThemes={selectedTheme}
              selectedModes={selectedMode}
              selectedPlatforms={selectedPlatform}
              onTypeChange={setSelectedType}
              onGenresChange={setSelectedGenre}
              onThemesChange={setSelectedTheme}
              onModesChange={setSelectedMode}
              onPlatformsChange={setSelectedPlatform}
              onClearAll={() => {
                  setSelectedType([]);
                  setSelectedGenre([]);
                  setSelectedTheme([]);
                  setSelectedMode([]);
                  setSelectedPlatform([]);
              }}
            />

          </div>

          <SimpleGrid spacing="lg" verticalSpacing='xl' className={classes.gamesGrid}>
            {loading && games.length === 0
              ? skeletons.map((_, i) => (
                  <GameSkeletonCard
                  key={i}
                  variant={isMobile ? "small" : "default"}
                  />
              ))
              : filteredGames.map((game) =>(
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
                          router.push(`/search/popular?&page=${newPage}`);
                      }}
                  />
              </div>
            )}
        </div>
    </div>
  );
}