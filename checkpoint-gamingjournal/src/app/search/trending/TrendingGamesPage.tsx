'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, redirect } from 'next/navigation';

import GameFilters from '@/components/GameFilters/GameFilters';

import { LoadingOverlay } from '@mantine/core';
import { SimpleGrid } from '@mantine/core';

import PlaceHolderImage from '../../../../public/no-cover-image.png';
import { TrendingUp } from 'lucide-react';

import classes from './Trending.module.css';

export default function TrendingPage() {

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 75; // Set the limit of games on page to 50
  const [total, setTotal] = useState(0);

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading

  // States to handle sorting and filtering search results
  const [sortOption, setSortOption] = useState<'first_release_date' | 'total_rating' | 'alphabetical' | ''>('total_rating'); // State to sort search results from release date/total_rating
  const [selectedType, setSelectedType] = useState<string[]>(['all']);
  const [selectedGenre, setSelectedGenre] = useState<string[]>(['all']);
  const [selectedTheme, setSelectedTheme] = useState<string[]>(['all']);
  const [selectedMode, setSelectedMode] = useState<string[]>(['all']);
  const [selectedPlatform, setSelectedPlatform] = useState<string[]>(['all']);

  const router = useRouter();

  // Fetch games data from the API
    useEffect(() => {
      const fetchTrendingGames = async () => {
        try {
          const res = await fetch(`/api/igdb/trendingGames?limit=${limit}`);
          
          if (!res.ok) {
            throw new Error('Failed to fetch Trending games');
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
      fetchTrendingGames();
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

    console.log("Sorted by:", sortOption, sorted.map(g => ({
      name: g.name,
      release: g.first_release_date,
      rating: g.total_rating
    })));
  
    return sorted;
  }, [games, sortOption]);
  
  // Filter the sorted games based on game types like Main Games, DLCs, and Expansions
  // Genres like Action, Adventure, RPG, etc.
  const processedGames = sortedGames.filter((game) => {

    // Handle cases where game_type or genres might be undefined
    if (!game.game_type || !game.genres || !game.themes || !game.game_modes || !game.platforms) {
      return selectedType.includes('all') && selectedGenre.includes('all') && selectedTheme.includes('all') && selectedMode.includes('all') && selectedPlatform.includes('all')
    }

    // Convert game types, genres, and platforms to lowercase for case-insensitive comparison
    const gameType = game.game_type.type.toLowerCase();
    const gameGenres = game.genres.map((genre: any) => genre.slug.toLowerCase());
    const gameThemes = game.themes.map((theme: any) => theme.slug.toLowerCase());
    const gameModes = game.game_modes.map((mode: any) => mode.slug.toLowerCase());
    const platforms = game.platforms.map((platform : any) => platform.slug.toLowerCase());

    // Check if the game matches the selected type and genre filters
    const typeMatch = selectedType.includes('all') || (gameType && selectedType.includes(gameType));
    // Check if any of the game's genres match the selected genres
    const genreMatch = selectedGenre.includes('all') || gameGenres.some((genre: any) => selectedGenre.includes(genre));
    // Check if any of the game's themes match the selected themes
    const themeMatch = selectedTheme.includes('all') || gameThemes.some((theme: any) => selectedTheme.includes(theme));
    // Check if any of the game's modes match the selected modes
    const modeMatch = selectedMode.includes('all') || gameModes.some((mode: any) => selectedMode.includes(mode));
    // Check if any of the game's platforms that it was released on matches
    const platformMatch = selectedPlatform.includes('all') || platforms.some((platform: any) => selectedPlatform.includes(platform));

    return (
      typeMatch && genreMatch && themeMatch && modeMatch && platformMatch
    );
  });

  // If the page is still loading, put a loading overlay
  if (loading) {
    return <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />
  }

  // If there are no search results for search input, redirect to not found page
  if (!games.length) {
    redirect('/not-found')
  }

  // Calculate the games to display on the current page
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div className={classes.wrapper} >

        <div className={classes.titleLogo}>
          <TrendingUp size={40} />
          <h1 className={classes.searchText}> Top 75 Trending Games of 2025:</h1>
        </div>

        <div className={classes.mainContent}>

          <h2 className={classes.numberText}>{processedGames.length} Game Results:</h2>

          <GameFilters
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
                
              </div>
            ))}
          </SimpleGrid>
          
          {/* <Pagination total={Math.ceil(total/ limit)} size='lg' style={{ justifyContent: "center" }} 
          className={classes.pagninaton} value={page} onChange={setPage} color='blue' radius="lg" /> */}

        </div>
        
    </div>
  );
}