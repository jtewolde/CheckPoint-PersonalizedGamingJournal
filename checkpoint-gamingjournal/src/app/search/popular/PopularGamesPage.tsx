'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';

import GameFilters from '@/components/GameFilters/GameFilters';
import GameCard from '@/components/GameCard/GameCard';

import { Text, SimpleGrid } from '@mantine/core';
import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import classes from './Popular.module.css';

export default function PopularPage() {

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 75; // Set the limit of games on page to 50
  const [total, setTotal] = useState(0);

  const isMobile = useMediaQuery('(max-width: 630px)');

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading

  // States to handle sorting and filtering search results
  const [sortOption, setSortOption] = useState<'first_release_date' | 'total_rating' | 'alphabetical' | ''>('total_rating'); // State to sort search results from release date/total_rating
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>([]);

  const router = useRouter();

  // Fetch games data from the API
  useEffect(() => {
    const fetchPopularGames = async () => {
      try {
        const res = await fetch(`/api/igdb/popular-games?limit=${limit}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch Popular games');
        }
        const data = await res.json();
        setGames(data); // Store the games data in state
        setLength(data.length);
        setTotal(data.total);
        console.log("Popular Games: ",data);
      } catch (error) {
        console.error('Error fetching popular games:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchPopularGames();
  }, []);

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
      if (sortOption === 'alphabetical'){
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  
    return sorted;
  }, [games, sortOption]);
  
  // Filter the sorted games based on game types like Main Games, DLCs, and Expansions
  // Genres like Action, Adventure, RPG, etc.
  const processedGames = sortedGames.filter((game) => {

    // Handle cases where game_type or genres might be undefined
    if (!game.game_type || !game.genres || !game.themes || !game.game_modes || !game.platforms) {
        return selectedType.length === 0 && selectedGenre.length === 0 && selectedTheme.length === 0 && selectedMode.length === 0 && selectedPlatform.length === 0
    }

    // Convert game types, genres, and platforms to lowercase for case-insensitive comparison
    const gameType = game.game_type.type.toLowerCase();
    const gameGenres = game.genres.map((genre: any) => genre.slug.toLowerCase());
    const gameThemes = game.themes.map((theme: any) => theme.slug.toLowerCase());
    const gameModes = game.game_modes.map((mode: any) => mode.slug.toLowerCase());
    const platforms = game.platforms.map((platform : any) => platform.slug.toLowerCase());

     // Check if the game matches the selected type and genre filters
    // Empty array means no filter applied (show all)
    const typeMatch = selectedType.length === 0 || (gameType && selectedType.includes(gameType));
    // Check if any of the game's genres match the selected genres
    const genreMatch = selectedGenre.length === 0 || gameGenres.some((genre: any) => selectedGenre.includes(genre));
    // Check if any of the game's themes match the selected themes
    const themeMatch = selectedTheme.length === 0 || gameThemes.some((theme: any) => selectedTheme.includes(theme));
    // Check if any of the game's modes match the selected modes
    const modeMatch = selectedMode.length === 0 || gameModes.some((mode: any) => selectedMode.includes(mode));
    // Check if any of the game's platforms that it was released on matches
    const platformMatch = selectedPlatform.length === 0 || platforms.some((platform: any) => selectedPlatform.includes(platform));

    return (
        typeMatch && genreMatch && themeMatch && modeMatch && platformMatch
    );
    
  });

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
              color='#3697d4ff'
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


          <SimpleGrid cols={6} spacing='sm' verticalSpacing='md' className={classes.gameGrid}>
            {processedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </SimpleGrid>
          
        </div>

      </div>

    </div>
  );
}