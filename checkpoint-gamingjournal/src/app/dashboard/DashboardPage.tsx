"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Link from "next/link";

import {
  SimpleGrid,
  Image,
  Paper,
  Text,
  ThemeIcon,
  Tooltip,
  Rating,
  Group,
  Avatar,
  Button,
  ActionIcon,
  EmptyState,
  Stack,
} from "@mantine/core";
import { DonutChart, BarChart, LineChart } from "@mantine/charts";

import SessionHeatmap from "@/components/ActivityComponents/SessionHeatmap/SessionHeatmap";
import JournalEntryCard from "@/components/Cards/JournalEntryCard/EntryCard";
import GameCard from "@/components/Cards/GameCard/GameCard";
import PlaySessionModal from "@/components/Modals/PlaySessionModal/SessionModal";
import EditGameInfoModal from "@/components/Modals/EditGameInfoModal/EditGameInfoModal";
import JournalEntryModal from "@/components/Modals/JournalEntryModal/EntryModal";

import PlaceHolderImage from "../../../public/no-cover-image.png";

import {
  Trophy,
  Star,
  ClipboardCheck,
  Edit,
  Notebook,
  Gamepad,
  BookText,
  NotebookPen,
} from "lucide-react";

import classes from "./dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)"); // Check if the screen width is less than or equal to 768px to determine if the user is on a mobile device

  const [user, setUser] = useState<{ name?: string; image?: string } | null>(
    null,
  ); // State to store user information such as name and profile image

  const [playingGames, setPlayingGames] = useState<any[]>([]); // State to store games that the user is currently playing
  const [libraryGames, setLibraryGames] = useState<any[]>([]); // State to store all of the games that the user has in their library

  // State variables to hold the count of each game's status in the user's library for graph
  const [playGamesLength, setPlayGamesLength] = useState(0);
  const [noStatusLength, setNoStatusLength] = useState(0);
  const [completedLength, setCompletedLength] = useState(0);
  const [fullyDoneLength, setfullyDoneLength] = useState(0);
  const [wishlistLength, setWishlistLength] = useState(0);
  const [backlogLength, setBacklogLength] = useState(0);
  const [onHoldLength, setOnHoldLength] = useState(0);

  // State variables to store data for the profile stats section of the dashboard
  const [numOfGames, setNumOfGames] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [numEntries, setNumEntries] = useState(0);
  const [numPlatinumedGames, setNumPlatinumedGames] = useState(0);
  const [topRatedGame, setTopRatedGame] = useState<any | null>(null);

  const [completedPercentage, setCompletedPercentage] = useState(0);

  const [sessions, setSessions] = useState<any[]>([]);
  const [recentEntries, setRecentEntries] = useState<any[]>([]); // State to store recent journal entries
  const [journalActivityData, setJournalActivityData] = useState<
    { month: string; entries: number }[]
  >([]); // State to store data from journal entries over time chart
  const [ratingDistributionData, setRatingDistributionData] = useState<
    { rating: number; count: number }[]
  >([]); // State to store data for game ratings distribution chart

  // State variables for doing quick actions by opening modals for editing, log play session, and create journal entry
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: editOpen, close: editClose }] =
    useDisclosure(false);
  const [logOpened, { open: logOpen, close: logClose }] = useDisclosure(false);
  const [journalOpened, { open: journalOpen, close: journalClose }] =
    useDisclosure(false);

  const [selectedGame, setSelectedGame] = useState<{
    gameId: string;
    title: string;
    cover: string;
    platforms: string[];
  } | null>(null);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push("/auth/signin");
      } else {
        setUser({
          name: data.user.name,
          image: data.user.image || undefined,
        });
      }
    };

    checkAuth();
  }, [router]);

  // Function to get the games that the user is currently playing from their library
  const fetchPlayingGames = async () => {
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token from local storage
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

      setRatingDistributionData(calculateRatingDistribution(data.games)); // Calculate the distribution of game ratings
      setAvgRating(calculateAverageRating(data.games)); // Calculate the average rating of the user's games
      setTopRatedGame(calculateTopRatedGame(data.games));

      const playingGames = data.games
        .filter((game: any) => game.status === "Playing")
        .slice(0, 6); // Filter games that are currently being played with the first 6 games
      const platinumedGames = data.games.filter(
        (game: any) => game.platinum === true,
      ).length; // Filter games that have been platinumed and get the count
      setNumPlatinumedGames(platinumedGames); // Store the number of platinumed games in state
      setPlayingGames(playingGames); // Store the playing games in state
      setLibraryGames(data.games);

      const totalGames = data.games.length; // Store total number of games

      const backlog = data.games.filter(
        (game: any) => game.status === "Backlog",
      ).length;
      const wishlist = data.games.filter(
        (game: any) => game.status === "Wishlist",
      ).length;
      const playing = data.games.filter(
        (game: any) => game.status === "Playing",
      ).length;
      const completed = data.games.filter(
        (game: any) => game.status === "Completed",
      ).length;
      const fullCompleted = data.games.filter(
        (game: any) => game.status === "100%",
      ).length;
      const noStatus = data.games.filter(
        (game: any) => game.status === "No Status Given",
      ).length;
      const onHold = data.games.filter(
        (game: any) => game.status === "On Hold",
      ).length;

      // Get the completation Rate of the user's completed games compared to total games in their library
      const completationRate = Math.round((completed / totalGames) * 100);

      setBacklogLength(backlog);
      setPlayGamesLength(playing);
      setCompletedLength(completed);
      setfullyDoneLength(fullCompleted);
      setWishlistLength(wishlist);
      setNoStatusLength(noStatus);
      setOnHoldLength(onHold);
      setNumOfGames(totalGames);
      setCompletedPercentage(completationRate);
    } catch (error) {
      console.error("Error fetching playing games: ", error);
    }
  };

  // Function to fetch play sessions for the game to display on calendar and calculate total tracked playtime.
  const fetchPlaySessions = async () => {
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token from local storage
      const res = await fetch(`/api/playSession`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch play sessions");
      }

      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching recent play sessions:", error);
    }
  };

  // Use API call to fetch most recent journal entries
  const fetchRecentJournalEntries = async () => {
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token from local storage
      const res = await fetch("/api/journal?limit=100", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch journal entries");
      }

      const data = await res.json();
      setNumEntries(data.pagination.totalEntries); // Store total number of journal entries

      const sortedEntries = data.journalEntries.slice(0, 4); // Limit to the 5 most recent entries
      setRecentEntries(sortedEntries); // Store the recent entries in state

      setJournalActivityData(
        buildJournalEntriesOverTimeData(data.journalEntries),
      ); // Build the data for the journal entries over time chart using the user's journal entries
    } catch (error) {
      console.error("Error fetching recent journal entries:", error);
    }
  };

  // Function to build out the data for the journal entries activity over time chart.
  // This will show the user how mmany journal entries they have made each month for the past 6 months. This will be based on the date of the journal entry and will be displayed in a line chart.
  const buildJournalEntriesOverTimeData = (entries: any[]) => {
    const currentDate = new Date();

    // Create an array of the past 6 months with labels and keys for counting entries
    const pastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );

      return {
        label: `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
        key: `${date.getFullYear()}-${date.getMonth()}`,
      };
    }).reverse();

    const counts: Record<string, number> = {};

    pastSixMonths.forEach((m) => {
      counts[m.key] = 0;
    });

    entries.forEach((entry) => {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (counts[key] !== undefined) {
        counts[key]++;
      }
    });

    return pastSixMonths.map((m) => ({
      month: m.label,
      entries: counts[m.key],
    }));
  };

  // Function to calculate the distribution of game ratings for the user's library games. This will be used to display a bar chart of the user's game ratings.
  const calculateRatingDistribution = (games: any[]) => {
    const ratingBuckets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const distribution: Record<number, number> = {};

    ratingBuckets.forEach((rating) => {
      distribution[rating] = 0;
    });

    games.forEach((game) => {
      const rating = game.rating;

      if (typeof rating === "number" && rating >= 1 && rating <= 10) {
        distribution[Math.floor(rating)]++;
      }
    });

    return ratingBuckets.map((rating) => ({
      rating,
      count: distribution[rating],
    }));
  };

  // Function to calculate the average rating of the user's games. This will be used to display as a quick stat card on the dashboard.
  const calculateAverageRating = (games: any[]) => {
    // Filter out unrated games in the user's library to get an accurate average rating.
    const ratedGames = games.filter(
      (game) => game.rating >= 1 && game.rating <= 10,
    );

    if (ratedGames.length === 0) {
      return 0;
    }

    let totalRating = 0;
    ratedGames.forEach((game) => {
      totalRating += game.rating;
    });

    return totalRating / ratedGames.length;
  };

  // Function to calculate the top rated game in the user's library. This will be used to display as a quick stat card
  const calculateTopRatedGame = (games: any[]) => {
    const ratedGames = games.filter(
      (game) =>
        typeof game.rating === "number" &&
        game.rating >= 1 &&
        game.rating <= 10,
    );

    if (ratedGames.length === 0) {
      return null;
    }

    return ratedGames.reduce((topGame, game) =>
      game.rating > topGame.rating ? game : topGame,
    );
  };

  // Calcualte the data for the game status donut chart legend
  const gameStatusData = useMemo(
    () => [
      {
        name: "Backlog",
        value: backlogLength,
        color: "orange",
        cssColor: "var(--mantine-color-orange-6)",
      },
      {
        name: "Wishlist",
        value: wishlistLength,
        color: "pink",
        cssColor: "var(--mantine-color-pink-6)",
      },
      {
        name: "On Hold",
        value: onHoldLength,
        color: "red",
        cssColor: "var(--mantine-color-red-6)",
      },
      {
        name: "Playing",
        value: playGamesLength,
        color: "blue",
        cssColor: "var(--mantine-color-blue-6)",
      },
      {
        name: "No Status Given",
        value: noStatusLength,
        color: "lightgrey",
        cssColor: "var(--mantine-color-gray-4)",
      },
      {
        name: "Completed",
        value: completedLength,
        color: "green",
        cssColor: "var(--mantine-color-green-6)",
      },
      {
        name: "100%",
        value: fullyDoneLength,
        color: "gold",
        cssColor: "var(--mantine-color-yellow-5)",
      },
    ],
    [
      backlogLength,
      wishlistLength,
      onHoldLength,
      playGamesLength,
      noStatusLength,
      completedLength,
      fullyDoneLength,
    ],
  );

  // Calculate total number of entries to display on line chart
  const recentPeriodEntryCount = useMemo(
    () =>
      journalActivityData.reduce((total, month) => total + month.entries, 0),
    [journalActivityData],
  );

  // useEffect to fetch journal entries, playing games, and play sessions when the component mounts.
  useEffect(() => {
    fetchPlayingGames();
    fetchRecentJournalEntries();
    fetchPlaySessions();
  }, []);

  return (
    <div className={classes.background}>
      <div className={classes.backgroundOverlay}>
        <div className={classes.wrapper}>
          <div className={classes.dashboardHeader}>
            <div className={classes.heroContainer}>
              <Group gap={14} align="center" wrap="nowrap">
                <Avatar
                  radius="xl"
                  size={isMobile ? 44 : 56}
                  src={user?.image || undefined}
                  alt={user?.name || "User"}
                  className={classes.headerAvatar}
                  onClick={() => router.push("/settings/profile")}
                />

                <div className={classes.welcomeContent}>
                  <Text className={classes.dashboardEyebrow}>
                    YOUR GAMING SPACE
                  </Text>

                  <h1 className={classes.dashboardTitle}>
                    Welcome back,{" "}
                    <span className={classes.username}>
                      {user?.name || "Gamer"}!
                    </span>
                  </h1>
                </div>
              </Group>

              <Text className={classes.welcomeText}>
                Track your gaming progress, review your latest activity, and
                jump back into your library.
              </Text>
            </div>

            <div className={classes.quickActionGroup}>
              <EditGameInfoModal
                opened={editOpened}
                onClose={editClose}
                libraryGames={libraryGames}
              />
              <Tooltip
                label="Edit Game Info"
                position="top"
                events={{ hover: true, focus: true, touch: true }}
              >
                <Button
                  className={classes.quickActionBtn}
                  size="md"
                  radius="sm"
                  leftSection={<Edit size={20} />}
                  onClick={editOpen}
                >
                  Edit
                </Button>
              </Tooltip>

              <PlaySessionModal
                opened={logOpened}
                onClose={logClose}
                gameId={selectedGame?.gameId}
                gameName={selectedGame?.title}
              />
              <Tooltip
                label="Log Play Session"
                position="top"
                events={{ hover: true, focus: true, touch: true }}
              >
                <Button
                  className={classes.quickActionBtn}
                  color="teal"
                  size="md"
                  radius="sm"
                  leftSection={<BookText size={20} />}
                  onClick={logOpen}
                >
                  Log
                </Button>
              </Tooltip>

              <JournalEntryModal
                opened={journalOpened}
                onClose={journalClose}
                gameId={selectedGame?.gameId}
                gameName={selectedGame?.title}
              />
              <Tooltip
                label="Create Journal Entry"
                position="top"
                events={{ hover: true, focus: true, touch: true }}
              >
                <Button
                  className={classes.quickActionBtn}
                  color="pink"
                  size="md"
                  variant="filled"
                  radius="sm"
                  leftSection={<NotebookPen size={20} />}
                  onClick={journalOpen}
                >
                  Journal
                </Button>
              </Tooltip>
            </div>
          </div>

          <div className={classes.statCards}>
            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 4 }}
              spacing="md"
              className={classes.quickStatsGrid}
            >
              {/* Average Rating */}
              <Paper
                shadow="sm"
                radius="lg"
                className={`${classes.quickStatItem} ${classes.ratingStat}`}
              >
                <div className={classes.statAccent} />

                <div className={classes.quickStatHeader}>
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    color="indigo"
                    className={classes.statIcon}
                  >
                    <ClipboardCheck size={22} />
                  </ThemeIcon>

                  <Text className={classes.quickStatLabel}>Average Rating</Text>
                </div>

                <div className={classes.quickStatBody}>
                  <div className={classes.statNumberRow}>
                    <Text className={classes.quickStatValue}>
                      {avgRating.toFixed(1)}
                    </Text>
                    <Text className={classes.quickStatUnit}>/10</Text>
                  </div>

                  <Text className={classes.quickStatSubtext}>
                    {
                      libraryGames.filter(
                        (game) => game.rating >= 1 && game.rating <= 10,
                      ).length
                    }{" "}
                    rated{" "}
                    {libraryGames.filter(
                      (game) => game.rating >= 1 && game.rating <= 10,
                    ).length === 1
                      ? "game"
                      : "games"}{" "}
                    in your library
                  </Text>
                </div>
              </Paper>

              {/* Games Platinumed */}
              <Paper
                shadow="sm"
                radius="lg"
                className={`${classes.quickStatItem} ${classes.platinumStat}`}
              >
                <div className={classes.statAccent} />

                <div className={classes.quickStatHeader}>
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    color="yellow"
                    className={classes.statIcon}
                  >
                    <Trophy size={22} />
                  </ThemeIcon>

                  <Text className={classes.quickStatLabel}>
                    Games Platinumed
                  </Text>
                </div>

                <div className={classes.quickStatBody}>
                  <Text className={classes.quickStatValue}>
                    {numPlatinumedGames}
                  </Text>

                  <Text className={classes.quickStatSubtext}>
                    {numPlatinumedGames === 1
                      ? "Platinum trophy earned"
                      : "Platinum trophies earned"}
                  </Text>
                </div>
              </Paper>

              {/* Journal Entries */}
              <Paper
                shadow="sm"
                radius="lg"
                className={`${classes.quickStatItem} ${classes.entriesStat}`}
              >
                <div className={classes.statAccent} />

                <div className={classes.quickStatHeader}>
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    color="grape"
                    className={classes.statIcon}
                  >
                    <Notebook size={22} />
                  </ThemeIcon>

                  <Text className={classes.quickStatLabel}>
                    Journal Entries
                  </Text>
                </div>

                <div className={classes.quickStatBody}>
                  <Text className={classes.quickStatValue}>{numEntries}</Text>

                  <Text className={classes.quickStatSubtext}>
                    {numEntries === 1
                      ? "Entry in your gaming journal"
                      : "Entries in your gaming journal"}
                  </Text>
                </div>
              </Paper>

              {/* Top Rated Game */}
              <Paper
                shadow="sm"
                radius="lg"
                className={`${classes.quickStatItem} ${classes.topRatedStat}`}
              >
                <div className={classes.statAccent} />

                <div className={classes.quickStatHeader}>
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    color="teal"
                    className={classes.statIcon}
                  >
                    <Star size={22} />
                  </ThemeIcon>

                  <Text className={classes.quickStatLabel}>Top Rated Game</Text>
                </div>

                {topRatedGame ? (
                  <Link
                    href={`/games/${topRatedGame.gameId}`}
                    className={classes.topRatedContent}
                    aria-label={`View ${topRatedGame.title}, rated ${topRatedGame.rating} out of 10`}
                  >
                    <Image
                      src={
                        topRatedGame.coverImage
                          ? `https:${topRatedGame.coverImage.replace(
                              "t_thumb",
                              "t_1080p",
                            )}`
                          : PlaceHolderImage.src
                      }
                      alt={topRatedGame.title || "Game cover"}
                      className={classes.topRatedCover}
                      fit="cover"
                    />

                    <div className={classes.topRatedDetails}>
                      <Text className={classes.topRatedTitle} lineClamp={2}>
                        {topRatedGame.title}
                      </Text>

                      <Group
                        gap={6}
                        align="center"
                        className={classes.topRatedScore}
                      >
                        <Star size={17} fill="currentColor" />
                        <Text className={classes.topRatedRating}>
                          {Number(topRatedGame.rating).toFixed(1)}
                        </Text>
                        <Text className={classes.topRatedOutOf}>/10</Text>
                      </Group>

                      <Text className={classes.topRatedHint}>
                        View Game Details
                      </Text>
                    </div>
                  </Link>
                ) : (
                  <div className={classes.topRatedEmpty}>
                    <Star size={24} />
                    <Text className={classes.topRatedEmptyTitle}>
                      No rated games yet
                    </Text>
                    <Text className={classes.quickStatSubtext}>
                      Rate a game to see it featured here.
                    </Text>
                  </div>
                )}
              </Paper>
            </SimpleGrid>

            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
              spacing="sm"
              className={classes.statusGrid}
            >
              <Paper shadow="md" radius="lg" className={classes.statusCard}>
                <p className={classes.statusTitle}>Game Status Breakdown</p>
                <div className={classes.chartWrapper}>
                  <DonutChart
                    size={300}
                    strokeColor="black"
                    strokeWidth={2}
                    thickness={45}
                    paddingAngle={3}
                    chartLabel={`${numOfGames} Games`}
                    data={gameStatusData}
                    styles={{
                      label: {
                        color: "white",
                        fontFamily: "Inter",
                        fontWeight: 600,
                        fontSize: "18px",
                      },
                      tooltip: {
                        border: "1px solid black",
                      },
                      tooltipItemName: {
                        color: "white",
                      },
                      tooltipItemData: {
                        color: "white",
                      },
                    }}
                  />

                  {!isMobile ? (
                    <div className={classes.sessionTypeLegend}>
                      {gameStatusData
                        .filter((item) => item.value > 0)
                        .map((item) => {
                          const percentage =
                            numOfGames > 0
                              ? Math.round((item.value / numOfGames) * 100)
                              : 0;

                          return (
                            <div key={item.name} className={classes.legendItem}>
                              <div className={classes.legendName}>
                                <span
                                  className={classes.legendDot}
                                  style={{
                                    backgroundColor: item.cssColor,
                                  }}
                                />

                                <Text className={classes.legendName}>
                                  {item.name}
                                </Text>
                              </div>

                              <Text className={classes.legendValue}>
                                {item.value} ({percentage}%)
                              </Text>
                            </div>
                          );
                        })}
                    </div>
                  ) : null}
                </div>
              </Paper>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>
                <p className={classes.statusTitle}>Journal Entries Activity</p>

                <Text className={classes.chartSummary}>
                  {recentPeriodEntryCount} entries in the last six months
                </Text>

                <div className={classes.chartWrapper}>
                  <LineChart
                    h={300}
                    w="100%"
                    dataKey="month"
                    yAxisLabel="# of Entries"
                    xAxisLabel="Months"
                    strokeWidth={2}
                    data={journalActivityData}
                    series={[{ name: "entries", color: "blue" }]}
                    styles={{
                      axisLabel: {
                        fill: "white",
                        fontFamily: "Inter",
                        fontSize: "12px",
                      },
                      axis: {
                        fill: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                      },
                      tooltipLabel: {
                        color: "white",
                      },
                      tooltipItemName: {
                        color: "white",
                        fontFamily: "Poppins",
                        fontSize: "16px",
                      },
                      tooltipItemData: {
                        color: "white",
                        fontFamily: "Poppins",
                        fontSize: "16px",
                      },
                    }}
                  />
                </div>
              </Paper>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>
                <p className={classes.statusTitle}>Game Ratings</p>
                <div className={classes.chartWrapper}>
                  <BarChart
                    h={320}
                    w="100%"
                    dataKey="rating"
                    yAxisLabel="Games"
                    xAxisLabel="Rating (/10)"
                    data={ratingDistributionData}
                    series={[{ name: "count", color: "red" }]}
                    yAxisProps={{
                      allowDecimals: false,
                    }}
                    styles={{
                      axisLabel: {
                        fill: "white",
                        fontFamily: "Inter",
                        fontSize: "14px",
                      },
                      axis: {
                        fill: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                      },
                      tooltipLabel: {
                        color: "white",
                      },
                      tooltipItemName: {
                        color: "white",
                        fontFamily: "Poppins",
                        fontSize: "16px",
                      },
                      tooltipItemData: {
                        color: "white",
                        fontFamily: "Poppins",
                        fontSize: "16px",
                      },
                    }}
                  />
                </div>
              </Paper>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>
                <p className={classes.statusTitle}>Session Heatmap</p>
                <div className={classes.heatmapWrapper}>
                  <SessionHeatmap sessions={sessions} page="dashboard" />
                </div>
              </Paper>
            </SimpleGrid>
          </div>

          {/*QUICK LOG SESSION MODAL*/}
          <PlaySessionModal
            opened={opened}
            onClose={() => {
              close();
              setSelectedGame(null);
            }}
            gameId={selectedGame?.gameId || ""}
            gameName={selectedGame?.title || ""}
            onSuccess={() => {
              close();
            }}
          />

          <div className={classes.playingGames}>
            <div className={classes.sectionHeader}>
              <Group gap="md" wrap="nowrap">
                <ThemeIcon size={44} radius="lg" variant="light" color="orange">
                  <Gamepad size={24} />
                </ThemeIcon>

                <div className={classes.sectionHeadingContent}>
                  <Text className={classes.sectionHeading}>Playing Games</Text>
                  <Text className={classes.sectionSubtitle}>
                    Pick up where you left off
                  </Text>
                </div>

                <Text className={classes.sectionCount}>
                  {playGamesLength} {playGamesLength === 1 ? "game" : "games"}
                </Text>
              </Group>

              <Link href="/library" className={classes.viewAllLink}>
                View library
              </Link>
            </div>

            {playingGames.length === 0 ? (
              <EmptyState
                icon={<Gamepad size={20} />}
                size="md"
                variant="light"
                withIndicatorBackground
                title="No games to display"
                description="Currently, you have no games that you are playing"
              />
            ) : (
              <>
                <SimpleGrid cols={5} spacing="lg" className={classes.gamesGrid}>
                  {playingGames.map((game) => (
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
                        hours: game.hours,
                        platform: game.platform,
                      }}
                      libraryGame={game}
                    />
                  ))}
                </SimpleGrid>
              </>
            )}
          </div>

          <div className={classes.recentEntries}>
            <div className={classes.sectionHeader}>
              <Group gap="md" wrap="nowrap">
                <ThemeIcon size={44} radius="lg" variant="light" color="grape">
                  <Notebook size={24} />
                </ThemeIcon>

                <div className={classes.sectionHeadingContent}>
                  <Text className={classes.sectionHeading}>Recent Entries</Text>
                  <Text className={classes.sectionSubtitle}>
                    Your latest gaming thoughts
                  </Text>
                </div>

                <Text className={classes.sectionCount}>
                  {recentEntries.length}{" "}
                  {recentEntries.length === 1 ? "entry" : "entries"}
                </Text>
              </Group>

              <Link href="/journal" className={classes.viewAllLink}>
                View journal
              </Link>
            </div>

            {recentEntries.length === 0 ? (
              <EmptyState
                icon={<Notebook size={20} />}
                size="lg"
                variant="light"
                withIndicatorBackground
                title="No journal entries displayed"
                description="Currently, you have no journal entries created."
              />
            ) : (
              <SimpleGrid cols={2} spacing="lg" className={classes.entriesGrid}>
                {recentEntries.map((entry) => (
                  <JournalEntryCard
                    key={entry._id}
                    entry={entry}
                    variant="journal"
                    color="#7c18ed"
                  />
                ))}
              </SimpleGrid>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
