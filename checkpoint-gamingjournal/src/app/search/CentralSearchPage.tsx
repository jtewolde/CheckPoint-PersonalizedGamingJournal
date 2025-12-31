'use client'

import { useSearchParams } from "next/navigation"
import { Divider, ThemeIcon, Title } from "@mantine/core"
import { Flame, Star } from "lucide-react"
import { CircleArrowRight, ScanSearch } from "lucide-react";


import SearchResults from "@/components/SearchResults/SearchResults";
import PopularSection from "@/components/PopularSection/PopularSection";
import TrendingSection from "@/components/TrendingSection/TrendingSection";
import GameSearchBar from "@/components/GameSearchBar/GameSearchBar";

import classes from './centralSearch.module.css';

export default function CentralSearchPage() {
    // Get search query from URL parameters
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
    // Determine if a search is being performed
    const isSearching = Boolean(query && query.trim().length > 0);

    return (
        <div className={isSearching ? classes.noBackground : classes.background}>

            <div className={classes.backgroundOverlay}>

                <div className={classes.searchPageContainer}>
                    {/* Search Bar at the top of the page */}
                    <div className={classes.searchBarContainer}>

                        <div className={classes.titleLogo}>

                            <ThemeIcon size={50} variant='gradient' gradient={{ from: '#b61ee0ff', to: '#4a12a4ff', deg: 20}} radius='md'>
                                <ScanSearch size={40} />
                            </ThemeIcon>

                            <Title className={classes.searchTitle}>Search Games</Title>

                        </div>

                        <GameSearchBar
                            className={classes.searchBar}
                            size='xl'
                            radius='lg'
                            placeHolder='Search for Games...'
                            autoNavigate={true}
                        />

                    </div>

                    {/* Divider between search bar and results/sections */}
                    <Divider my='sm' />
                    
                    {isSearching && query ? (
                        <SearchResults query={query} />
                    ) : (
                    <div className={classes.sectionsContainer}>
                        <div className={classes.trendingGames}>

                            <div className={classes.trendingSection}>
                            
                                <div className={classes.titleLogo}>
                                    <ThemeIcon variant='gradient' gradient={{ from: '#c21500', to: '#ffc500', deg: 90}} size={40}>
                                        <Flame size={30} color='white'/> 
                                    </ThemeIcon>

                                    <h1 className={classes.gamesPlayingText}>Trending</h1>

                                </div>

                                <a className={classes.viewMoreIcon} href='/search/trending'> <CircleArrowRight size={35} /> </a>

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

                                <a className={classes.viewMoreIcon} href='/search/popular'><CircleArrowRight size={35} /></a>

                            </div>
                            
                            {/* Use PopularSection component to display popular games */}
                            <PopularSection />

                        </div>

                    </div>
                    )}
                </div>

            </div>

        </div>
        
    )
}