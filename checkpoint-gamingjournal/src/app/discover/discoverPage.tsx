'use client'

import { useSearchParams } from "next/navigation";
import { ThemeIcon, Title, Tooltip, Group, Stack, Text } from "@mantine/core";

import { Flame, Star, CircleArrowRight, CalendarClock, Megaphone } from "lucide-react"

import PopularSection from "@/components/PopularSection/PopularSection";
import TrendingSection from "@/components/TrendingSection/TrendingSection";
import UpcomingSection from "@/components/upcomingSection/upcomingSection";
import AnticipatedSection from "@/components/AnticipatedSection/AnticipatedSection";

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
                                <ThemeIcon size={40} variant='gradient' gradient={{ from: '#f7971e', to: '#ffd200', deg: 20}} radius='md'>
                                    <Star size={30} />
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

                    <div className={classes.upcomingGames}>
                        <div className={classes.upcomingSection}>
                            <div className={classes.titleLogo}>
                                <ThemeIcon variant='gradient' gradient={{ from: '#05ca0b', to: '#18c973', deg: 90}} size={40}>
                                    <CalendarClock size={30} color='white'/> 
                                </ThemeIcon>
                                <h1 className={classes.gamesPlayingText}>Upcoming</h1>
                            </div>

                            <Tooltip label='View More Upcoming Games' position="top" events={{ hover: true, focus: true, touch: true }}>
                                <a className={classes.viewMoreIcon} href='/search/upcoming'> <CircleArrowRight size={35} /> </a>
                            </Tooltip>
                        </div>
                        {/* Use UpcomingSection component to display upcoming games */}
                        <UpcomingSection />
                    </div>

                    <div className={classes.anticipatedGames}>
                        <div className={classes.anticipatedSection}>
                            <div className={classes.titleLogo}>
                                <ThemeIcon variant='gradient' gradient={{ from: '#2c1ef7', to: '#5b22e1', deg: 20}} size={40}>
                                    <Megaphone size={30} color='white'/> 
                                </ThemeIcon>
                                <h1 className={classes.gamesPlayingText}>Most Anticipated</h1>
                            </div>

                            <Tooltip label='View More Anticipated Games' position="top" events={{ hover: true, focus: true, touch: true }}>
                                <a className={classes.viewMoreIcon} href='/search/most-anticipated'> <CircleArrowRight size={35} /> </a>
                            </Tooltip>
                        </div>
                        {/* Use AnticipatedSection component to display anticipated games */}
                        <AnticipatedSection />
                    </div>
                </Stack>
            </div>
        </div>
    )

}