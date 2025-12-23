'use client'

import { useSearchParams } from "next/navigation"
import { Divider } from "@mantine/core"

import SearchResults from "@/components/SearchResults/SearchResults";
import PopularSection from "@/components/PopularSection/PopularSection";
import TrendingSection from "@/components/TrendingSection/TrendingSection";
import GameSearchBar from "@/components/GameSearchBar/GameSearchBar";

import classes from './search.module.css';

export default function SearchPage2() {
    // Get search query from URL parameters
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    // Determine if a search is being performed
    const isSearching = Boolean(query && query.trim().length > 0);

    return (
        <div className={classes.searchPageContainer}>
            {/* Search Bar at the top of the page */}
            <div className={classes.searchBarContainer}>
                <GameSearchBar
                    className={classes.searchBar}
                    size='lg'
                    radius='md'
                    placeHolder='Search for Games...'
                    autoNavigate={false}
                />
            </div>

            {/* Divider between search bar and results/sections */}
            <Divider my='lg' />
            {isSearching && query ? (
                <SearchResults query={query} />
            ) : (
                <>
                    <TrendingSection />
                    <PopularSection />
                </>
            )}
        </div>
    )
}