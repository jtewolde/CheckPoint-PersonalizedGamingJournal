"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";

import GamePageSearch from "@/components/GamePageSearch/GamePageSearch";
import LibraryFilters from "@/components/LibraryFilters/LibraryFilters";

import { SimpleGrid, LoadingOverlay, Select } from "@mantine/core";

import classes from "./library.module.css";
import GameCard from "@/components/GameCard/GameCard";

export default function Library() {
  // State variables for going through user's games and loading state
  const [games, setGames] = useState<any[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  // State variables for filtering library based on status, rating, and platinum
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [filterRating, setFilterRating] = useState(false);
  const [filterPlatinum, setFilterPlatinum] = useState(false);
  const [sortOption, setSortOption] = useState("release_date_newest");

  const isMobile = useMediaQuery("(max-width: 646px)");
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Check If the user is authenticated, if not redirect to signin page
  useEffect(() => {
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (!session.data?.user) {
        router.push("/auth/signin");
      }
    };
    checkAuth();
  }, [router]);

  // Fetch User's Game Library
  useEffect(() => {
    const fetchUserGames = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("bearer_token");
        const res = await fetch("/api/library", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user library");
        }

        const data = await res.json();
        setGames(data.games);
        console.log(data.games);
        setTotalGames(data.games.length);
      } catch (error) {
        console.log("Error fetching user library", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserGames();
  }, []);

  const filteredGames = games
    .filter((game) => {
      // Search
      if (!game.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Status
      if (
        selectedStatus !== "all" &&
        game.status?.toLowerCase() !== selectedStatus
      ) {
        return false;
      }

      // Rated
      if (filterRating && (!game.rating || game.rating <= 0)) {
        return false;
      }

      // Platinum
      if (filterPlatinum && !game.platinum) {
        return false;
      }

      if (selectedPlatform !== "all" && game.platform !== selectedPlatform) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "alphabetical":
          return a.title.localeCompare(b.title);

        case "alphabetical_reverse":
          return b.title.localeCompare(a.title);

        case "release_date_newest":
          return (
            new Date(b.releaseDate ?? 0).getTime() -
            new Date(a.releaseDate ?? 0).getTime()
          );

        case "release_date_oldest":
          return (
            new Date(a.releaseDate ?? 0).getTime() -
            new Date(b.releaseDate ?? 0).getTime()
          );

        case "rating_high":
          return (b.rating ?? 0) - (a.rating ?? 0);

        case "rating_low":
          return (a.rating ?? 0) - (b.rating ?? 0);

        case "hours_high":
          return (b.hours ?? 0) - (a.hours ?? 0);

        case "hours_low":
          return (a.hours ?? 0) - (b.hours ?? 0);

        case "recent":
        default:
          return 0;
      }
    });

  // Helper function to get all of the available platforms that the user played their games in their library
  const availablePlatforms = [
    ...new Set(games.map((game) => game.platform).filter(Boolean)),
  ].sort();

  return (
    <div className={classes.background}>
      <div className={classes.wrapper}>
        <div className={classes.libraryHeader}>
          <div className={classes.titleLogo}>
            <h2 className={classes.title}>Your Library</h2>
          </div>
          <p className={classes.subtitle}>
            {" "}
            Manage your collection and track your progress.{" "}
          </p>
        </div>

        <div className={classes.toolbar}>
          <div className={classes.searchContainer}>
            <GamePageSearch
              size="lg"
              radius="md"
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className={classes.actionRow}>
            <div className={classes.sortContainer}>
              {/* Sort By Dropdown */}
              <Select
                className={classes.filterDropdown}
                size="lg"
                variant="filled"
                placeholder="Select an option"
                checkIconPosition="left"
                data={[
                  { value: "alphabetical", label: "Alphabetical (A-Z)" },
                  {
                    value: "alphabetical_reverse",
                    label: "Alphabetical (Z-A)",
                  },
                  {
                    value: "release_date_newest",
                    label: "Release Date (Newest)",
                  },
                  {
                    value: "release_date_oldest",
                    label: "Release Date (Oldest)",
                  },
                  { value: "rating_high", label: "Your Rating (High-Low)" },
                  {
                    value: "rating_low",
                    label: "Your Rating (Low-High)",
                  },
                  { value: "hours_high", label: "Hours Played (High-Low)" },
                  { value: "hours_low", label: "Hours Played (Low-High)" },
                ]}
                value={sortOption}
                onChange={(value) => setSortOption(value || "recent")}
              />
            </div>

            <div className={classes.filterContainer}>
              <LibraryFilters
                className={classes.filterButton}
                size={isMobile ? "xl" : "lg"}
                variant={isMobile ? "small" : "default"}
                buttonVariant="filled"
                totalGames={totalGames}
                status={selectedStatus}
                ratedOnly={filterRating}
                platinumOnly={filterPlatinum}
                platform={selectedPlatform}
                platforms={availablePlatforms}
                onStatusChange={setSelectedStatus}
                onRatedChange={setFilterRating}
                onPlatinumChange={setFilterPlatinum}
                onPlatformChange={setSelectedPlatform}
              />
            </div>
          </div>
        </div>

        {filteredGames.length > 0 && (
          <div className={classes.library}>
            {/* ✅ LOADING OVERLAY */}
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: "sm", blur: 2 }}
              loaderProps={{ size: "lg", color: "grape", type: "bars" }}
            />

            <SimpleGrid
              cols={{ base: 2, xs: 2, sm: 3, md: 4, lg: 5, xl: 5 }}
              spacing="lg"
              verticalSpacing="xl"
              className={classes.responsiveGrid}
            >
              {filteredGames.map((game) => (
                <GameCard
                  variant="library"
                  key={game._id}
                  game={{
                    id: game.gameId,
                    name: game.title,
                    cover: { url: game.coverImage },
                    genres: game.genre,
                  }}
                  libraryMeta={{
                    status: game.status,
                    rating: game.rating,
                    platinum: game.platinum,
                    platform: game.platform,
                    hours: game.hours,
                  }}
                  libraryGame={game}
                />
              ))}
            </SimpleGrid>
          </div>
        )}

        {!loading && filteredGames.length === 0 && (
          <p className={classes.noGamesText}>
            No games found for the selected status.
          </p>
        )}
      </div>
    </div>
  );
}
