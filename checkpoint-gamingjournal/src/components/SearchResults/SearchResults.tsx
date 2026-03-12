'use client'

import { useEffect, useState, useMemo } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { SimpleGrid, Text, Pagination } from '@mantine/core';

import GameFilters from '@/components/GameFilters/GameFilters';
import GameCard from '../GameCard/GameCard';
import GlobalLoader from '../GlobalLoader/GlobalLoader';

import classes from './SearchResults.module.css';

// Define the SearchResults component that takes a query prop
interface SearchResultsProps {
    query: string;
}

export default function SearchResults({ query }: SearchResultsProps){
    const router = useRouter(); 

    const [games, setGames] = useState<any[]>([]); // State to store games data
    const [length, setLength] = useState("");

    const [loading, setLoading] = useState(true);
    const isMobile = useMediaQuery('(max-width: 490px)');

    const [page, setPage] = useState(1) // start with page 1 for pagination
    const limit = 16; // Set the limit of games on page to 12

    // Calculate total amount of games received from IGDB API request
    // Calcualte the total number of pages for pagination
    const [total, setTotal] = useState(0)
    const totalPages = Math.ceil(total/limit)

    // States to handle sorting and filtering search results
    const [sortOption, setSortOption] = useState<'first_release_date' | 'total_rating' | 'alphabetical' | ''>('first_release_date'); // State to sort search results from release date/total_rating
    const [selectedType, setSelectedType] = useState<string[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string[]>([]);
    const [selectedMode, setSelectedMode] = useState<string[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true)
                const offset = (page - 1) * limit; // calculate offset based on page

                // Create the params of URL to include the sorting and filters applied
                const params = new URLSearchParams({
                    query,
                    limit: String(limit),
                    offset: String(offset),
                    sort: sortOption,
                    types: selectedType.join(','),
                    genres: selectedGenre.join(','),
                    themes: selectedTheme.join(','),
                    modes: selectedMode.join(','),
                    platforms: selectedPlatform.join(',')
                });

                const res = await fetch(`/api/igdb/games?${params.toString()}`);

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

        fetchGames();

    }, [query, 
        page,
        sortOption,
        selectedGenre,
        selectedMode,
        selectedPlatform,
        selectedTheme,
        selectedType
    ]);

    return (

        <div className={classes.wrapper}>

            <GlobalLoader visible={loading} />

            <Text className={classes.resultsTitle}>
                Search Results for: "<span className={classes.gameResult}>{query}</span>"
            </Text>

            <GameFilters
            variant='default'
            totalGames={total}
            color="#5d2b9fff"
            size={isMobile ? 'md' : 'lg'}
            sortOption={sortOption}
            selectedType={selectedType}
            selectedGenres={selectedGenre}
            selectedThemes={selectedTheme}
            selectedModes={selectedMode}
            selectedPlatforms={selectedPlatform}
            onSortChange={(v) => {setSortOption(v as any); setPage(1)}}
            onTypeChange={(v) => {setSelectedType(v as any); setPage(1)}}
            onGenresChange={(v) => {setSelectedGenre(v as any); setPage(1)}}
            onThemesChange={(v) => {setSelectedTheme(v as any); setPage(1)}}
            onModesChange={(v) => {setSelectedMode(v as any); setPage(1)}}
            onPlatformsChange={(v) => {setSelectedPlatform(v as any); setPage(1)}}
            />

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
                        radius='lg'
                        total={totalPages}
                        value={page}
                        onChange={(newPage) => {
                            setPage(newPage);
                            router.push(`/search?query=${encodeURIComponent(query)}&page=${newPage}`);
                        }}
                    />
                </div>
            )}

        </div>
    );
}