'use client'

import { useEffect, useState, useMemo } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { SimpleGrid, Text, Pagination, Select, Stack } from '@mantine/core';

import GameFilters from '@/components/GameFilters/GameFilters';
import ActiveFilters from '../ActiveFilters/ActiveFilters';
import GameSearchBar from '../GameSearchBar/GameSearchBar';
import GameCard from '../GameCard/GameCard';
import GameSkeletonCard from '../GameCard/GameSkeletonCard';

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
    const limit = 36; // Set the limit of games on page to 36

    // Create skeletons array which length is the value of limit
    const skeletons = Array.from({ length: limit });

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

    // Fetch games from search query
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

            <Stack gap='xs' align='flex-start'>
                <Text className={classes.resultsTitle}>
                    Search Results
                </Text>

                <Text className={classes.description}>
                    Find games, refine your search, and discover your next favorite title.
                </Text>
            </Stack>

            <div className={classes.actionGrid}>
                
                <div className={classes.searchContainer}>
                    <GameSearchBar className={classes.searchBar} initialQuery={query} showActionIcon iconColor='#20201d'/>
                </div>

                <div className={classes.actionRow}>
                    <div className={classes.sortContainer}>
                    {/* Sort By Dropdown */}
                        <Select
                            className={classes.selectDropdown}
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
                            className={classes.filterButton}
                            color='rgb(49, 48, 48)'
                            size='md'
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

            <div className={classes.resultsContainer}>
                <Text className={classes.resultsText}>
                    Showing {games.length} of {total.toLocaleString()} games
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

            <SimpleGrid spacing="lg" verticalSpacing='xl' className={classes.resultGamesGrid}>
                {loading && games.length === 0
                    ? skeletons.map((_, i) => (
                        <GameSkeletonCard
                        key={i}
                        variant={isMobile ? "small" : "default"}
                        />
                    ))
                    : games.map((game) =>(
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