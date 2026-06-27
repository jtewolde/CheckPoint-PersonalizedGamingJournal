'use client'

import { useSearchParams } from "next/navigation";
import { Divider, ThemeIcon, Title, Tooltip } from "@mantine/core";

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
        <div className={classes.wrapper}>
            <div className={classes.mainContent}>        
                {isSearching && query ? (
                    <SearchResults query={query} />
                ) : (
                <>
                </>
                )}
            </div>
        </div>
    )
}