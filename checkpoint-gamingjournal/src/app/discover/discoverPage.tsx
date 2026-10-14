"use client";

import { ThemeIcon, Title, Tooltip, Stack, Text } from "@mantine/core";

import {
  Flame,
  Star,
  ArrowUpRight,
  CalendarClock,
  Megaphone,
} from "lucide-react";

import PopularSection from "@/components/Sections/PopularSection/PopularSection";
import TrendingSection from "@/components/Sections/TrendingSection/TrendingSection";
import UpcomingSection from "@/components/Sections/upcomingSection/upcomingSection";
import AnticipatedSection from "@/components/Sections/AnticipatedSection/AnticipatedSection";

import classes from "./discoverPage.module.css";

export default function DiscoverPage() {
  return (
    <div className={classes.wrapper}>
      <div className={classes.mainContent}>
        {/* Page heading */}
        <Stack gap={8} align="flex-start">
          <Title className={classes.headerTitle}>Discover Games</Title>

          <Text className={classes.descriptionText}>
            Explore trending releases, top-rated classics, and hidden gems. Find
            your next gaming adventure.
          </Text>
        </Stack>

        {/* Game discovery sections */}
        <Stack gap="2.5rem" align="stretch">
          {/* Trending */}
          <section className={classes.trendingGames}>
            <div className={classes.trendingSection}>
              <div className={classes.titleLogo}>
                <ThemeIcon
                  className={classes.sectionIcon}
                  size={50}
                  radius="md"
                  style={{
                    color: "#ff8652",
                    backgroundColor: "rgba(255, 134, 82, 0.13)",
                  }}
                >
                  <Flame size={40} strokeWidth={2.2} />
                </ThemeIcon>

                <div className={classes.sectionText}>
                  <h2 className={classes.gamesPlayingText}>Trending</h2>
                  <p className={classes.sectionDescription}>
                    Games everyone is playing right now
                  </p>
                </div>
              </div>

              <Tooltip label="View all trending games" position="top">
                <a
                  className={classes.viewMoreIcon}
                  href="/search/trending"
                  aria-label="View all trending games"
                >
                  <span>View all</span>
                  <ArrowUpRight size={18} />
                </a>
              </Tooltip>
            </div>

            <TrendingSection />
          </section>

          {/* Popular */}
          <section className={classes.popularGames}>
            <div className={classes.popularSection}>
              <div className={classes.titleLogo}>
                <ThemeIcon
                  className={classes.sectionIcon}
                  size={50}
                  radius="md"
                  style={{
                    color: "#f7c65b",
                    backgroundColor: "rgba(247, 198, 91, 0.13)",
                  }}
                >
                  <Star size={40} strokeWidth={2.2} />
                </ThemeIcon>

                <div className={classes.sectionText}>
                  <h2 className={classes.gamesPlayingText}>Popular</h2>
                  <p className={classes.sectionDescription}>
                    Fan favorites worth checking out
                  </p>
                </div>
              </div>

              <Tooltip label="View all popular games" position="top">
                <a
                  className={classes.viewMoreIcon}
                  href="/search/popular"
                  aria-label="View all popular games"
                >
                  <span>View all</span>
                  <ArrowUpRight size={18} />
                </a>
              </Tooltip>
            </div>

            <PopularSection />
          </section>

          {/* Upcoming */}
          <section className={classes.upcomingGames}>
            <div className={classes.upcomingSection}>
              <div className={classes.titleLogo}>
                <ThemeIcon
                  className={classes.sectionIcon}
                  size={50}
                  radius="md"
                  style={{
                    color: "#59d6a0",
                    backgroundColor: "rgba(89, 214, 160, 0.13)",
                  }}
                >
                  <CalendarClock size={40} strokeWidth={2.2} />
                </ThemeIcon>

                <div className={classes.sectionText}>
                  <h2 className={classes.gamesPlayingText}>Upcoming</h2>
                  <p className={classes.sectionDescription}>
                    Releases to look forward to
                  </p>
                </div>
              </div>

              <Tooltip label="View all upcoming games" position="top">
                <a
                  className={classes.viewMoreIcon}
                  href="/search/upcoming"
                  aria-label="View all upcoming games"
                >
                  <span>View all</span>
                  <ArrowUpRight size={18} />
                </a>
              </Tooltip>
            </div>

            <UpcomingSection />
          </section>

          {/* Most Anticipated */}
          <section className={classes.anticipatedGames}>
            <div className={classes.anticipatedSection}>
              <div className={classes.titleLogo}>
                <ThemeIcon
                  className={classes.sectionIcon}
                  size={50}
                  radius="md"
                  style={{
                    color: "#c2a0ff",
                    backgroundColor: "rgba(194, 160, 255, 0.13)",
                  }}
                >
                  <Megaphone size={40} strokeWidth={2.2} />
                </ThemeIcon>

                <div className={classes.sectionText}>
                  <h2 className={classes.gamesPlayingText}>Most Anticipated</h2>
                  <p className={classes.sectionDescription}>
                    The games players are waiting for
                  </p>
                </div>
              </div>

              <Tooltip label="View all anticipated games" position="top">
                <a
                  className={classes.viewMoreIcon}
                  href="/search/most-anticipated"
                  aria-label="View all anticipated games"
                >
                  <span>View all</span>
                  <ArrowUpRight size={18} />
                </a>
              </Tooltip>
            </div>

            <AnticipatedSection />
          </section>
        </Stack>
      </div>
    </div>
  );
}
