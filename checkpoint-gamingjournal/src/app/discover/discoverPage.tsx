'use client'

import { useSearchParams } from "next/navigation";
import { Divider, ThemeIcon, Title, Tooltip, Group, Stack, Text } from "@mantine/core";

import { Flame, Star } from "lucide-react"
import { CircleArrowRight, ScanSearch } from "lucide-react";

import SearchResults from "@/components/SearchResults/SearchResults";
import PopularSection from "@/components/PopularSection/PopularSection";
import TrendingSection from "@/components/TrendingSection/TrendingSection";
import GameSearchBar from "@/components/GameSearchBar/GameSearchBar";

import classes from './discoverPage.module.css';

export default function DiscoverPage() {
    // Get search query from URL parameters
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
    // Determine if a search is being performed
    const isSearching = Boolean(query && query.trim().length > 0);

    return(
        <div className={classes.wrapper}>
            <div className={classes.mainContent}>
                <Stack gap={10} align="flex-start">
                    <Title className={classes.headerTitle}>
                        Discover Games
                    </Title>

                    <Text className={classes.descriptionText}>
                        Explore trending releases, top-rated classics, and hidden gems. <br />
                        Find your next gaming adventure.
                    </Text>
                </Stack>

                {/* Search Bar at the top of the page
                <div className={classes.searchBarContainer}>
                    <GameSearchBar
                        className={classes.searchBar}
                        size='xl'
                        radius='md'
                        placeHolder='Search for Games...'
                        autoNavigate={true}
                    />
                </div> */}

                <Stack gap='xl' align="center">
                    <div className={classes.trendingGames}>
                        <div className={classes.trendingSection}>
                            <div className={classes.titleLogo}>
                                <ThemeIcon variant='gradient' gradient={{ from: '#c21500', to: '#ffc500', deg: 90}} size={40}>
                                    <Flame size={30} color='white'/> 
                                </ThemeIcon>
                                <h1 className={classes.gamesPlayingText}>Trending</h1>
                            </div>

                            <Tooltip label='View More Trending Games' position="top" events={{ hover: true, focus: true, touch: true }}>
                                <a className={classes.viewMoreIcon} href='/search/trending'> <CircleArrowRight size={35} /> </a>
                            </Tooltip>
                        </div>
                        {/* Use TrendingSection component to display trending games */}
                        <TrendingSection />
                    </div>

                    <div className={classes.popularGames}>
                        <div className={classes.popularSection}>
                            <div className={classes.titleLogo}>
                                <ThemeIcon size={50} variant='gradient' gradient={{ from: '#f7971e', to: '#ffd200', deg: 20}} radius='md'>
                                    <Star size={40} />
                                </ThemeIcon>
                                <h1 className={classes.gamesPlayingText}>Popular</h1>
                            </div>

                            <Tooltip label='View More Popular Games' position="top" events={{ hover: true, focus: true, touch: true }}>
                                <a className={classes.viewMoreIcon} href='/search/popular'><CircleArrowRight size={35} /></a>
                            </Tooltip>
                        </div>
                        
                        {/* Use PopularSection component to display popular games */}
                        <PopularSection />
                    </div>
                </Stack>
            </div>
        </div>
    )

}