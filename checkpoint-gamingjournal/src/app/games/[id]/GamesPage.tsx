"use client";

import { useEffect, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/Authcontext";
import { notFound } from "next/navigation";

import GameHero from "@/components/GamePageComponents/GameHero/GameHero";
import GameCard from "@/components/Cards/GameCard/GameCard";
import GameTabs from "@/components/GamePageComponents/GameTabs/GameTabs";
import GameOverview from "@/components/GamePageComponents/GameOverview/GameOverview";
import GameMedia from "@/components/GamePageComponents/GameMedia/GameMedia";
import GameActivity from "@/components/GamePageComponents/GameActivity/GameActivity";
import GameJournal from "@/components/GamePageComponents/GameJournal/GameJournal";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PlaySessionModal from "@/components/Modals/PlaySessionModal/SessionModal";
import EditGameInfoModal from "@/components/Modals/EditGameInfoModal/EditGameInfoModal";
import AddToLibraryModal from "@/components/Modals/AddToLibraryModal/AddToLibraryModal";

import { toast } from "react-toastify";
import { Text, SimpleGrid, ThemeIcon } from "@mantine/core";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import classes from "./game.module.css";

import { Gamepad } from "lucide-react";

import PlaceHolderImage from "../../../../public/no-cover-image.png";

export default function GameDetails() {
  const { id } = useParams(); // Get the game ID from the URL

  const [game, setGame] = useState<any>(null); // State to store game details
  const [libraryGame, setLibraryGame] = useState<any>(null);

  const [loading, setLoading] = useState(true); // State to handle loading

  const [addingToLibrary, setAddingToLibrary] = useState(false); // State to handle button loading
  const [isGameInLibrary, setIsInLibrary] = useState(false);

  const [status, setStatus] = useState(""); // State to handle game status
  const [isPlatinum, setIsPlatinum] = useState(false); // State to handle platinum of game
  const [rating, setRating] = useState(0); // State to handling rating of game given by user from 0-5 stars
  const [completionDate, setCompletionDate] = useState<string | null>(null); // State to handle completion date of game

  // State variable that holds a dictionary of stats used in 'Your Activity' section
  const [stats, setStats] = useState({
    avg: 0,
    longest: "",
    totalSessions: 0,
    totalHours: 0,
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [numOfEntries, setNumOfEntries] = useState(0);
  const [entries, setEntries] = useState<any[]>([]);

  const [opened, { open, close }] = useDisclosure(false);
  const [
    playSessionModalOpened,
    { open: openPlaySessionModal, close: closePlaySessionModal },
  ] = useDisclosure(false);
  const [AddOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);

  const [backgroundImage, setBackgroundImage] = useState<string>(
    PlaceHolderImage.src,
  );

  const { isAuthenticated } = useAuth(); // Access global auth state
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 650px)");

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Handler for tab change in GameTabs component
  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
    }
  };

  // Helper function to combining all screenshots and artworks of game in single array for different backgrounds
  const getAllImages = (gameData: any) => {
    const screenshots = gameData?.screenshots || [];
    const artworks = gameData?.artworks || [];

    return [...screenshots, ...artworks];
  };

  // Function to help pick a random image from screenshots and artworks of game to be
  // background for dynamic background instead of fixed image
  const getRandomImage = (gameData: any) => {
    const images = getAllImages(gameData);
    if (images.length === 0) return PlaceHolderImage.src;
    const randomIndex = Math.floor(Math.random() * images.length);
    const selected = images[randomIndex];
    return `https:${selected.url.replace("t_thumb", "t_1080p")}`;
  };

  // Fetch game details from IGDB API when component mounts or ID changes
  useEffect(() => {
    const fetchIGDBGameDetails = async () => {
      try {
        const res = await fetch(`/api/igdb/game?id=${id}`); // Fetch game details from your API
        console.log("API Response", res);
        if (!res.ok) {
          throw new Error("Failed to fetch game details");
        }
        const data = await res.json();
        setGame(data); // Store the game details in state
        console.log("Game Details Fetched:", data);
        setBackgroundImage(getRandomImage(data));
        setStatus(data.status);
      } catch (error) {
        console.error("Error fetching game details:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    // Function to fetch the journal entries for the game from the user's library if the game is in the library and user is authenticated
    // Use API call to fetch most recent journal entries
    const fetchRecentJournalEntries = async () => {
      try {
        const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token from local storage
        const res = await fetch(`/api/journal/game?gameID=${id}`, {
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

        setEntries(data.entries);
        console.log("Entries: ", data);
        setNumOfEntries(data.count);
      } catch (error) {
        console.error("Error fetching recent journal entries:", error);
      }
    };

    // Function to check if the game is in the user's library
    const checkIfInLibrary = async () => {
      try {
        const token = localStorage.getItem("bearer_token"); // Retrieve the Bearer token
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

        const isGameInLibrary = data.games.some(
          (libraryGame: any) => libraryGame.gameId === id,
        );
        const currentGame = data.games.find(
          (libraryGame: any) => libraryGame.gameId === id,
        );

        setIsInLibrary(isGameInLibrary); // Update the state
        setLibraryGame(currentGame || null); // Store the current game details in state
        setStatus(currentGame?.status);
        setIsPlatinum(currentGame?.platinum ?? false);
        setRating(currentGame?.rating ?? 0);
        setCompletionDate(currentGame?.completionDate ?? null);
      } catch (error) {
        console.error("Error checking if game is in library:", error);
      }
    };

    if (id) {
      fetchIGDBGameDetails();
      if (isAuthenticated) {
        // Only check library if user is authenticated}
        checkIfInLibrary();
        fetchRecentJournalEntries();
      } else {
        setIsInLibrary(false);
        setLibraryGame(null);
      }
    }
  }, [id, isAuthenticated]);

  // Function to fetch play sessions for the game to display on calendar and calculate total tracked playtime.
  const fetchPlaySessions = async () => {
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token from local storage
      const res = await fetch(`/api/playSession?gameID=${id}`, {
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

      // Retrieve the play sessions of the user only for the selected game
      const gameSessions = data.filter((session: any) => session.gameId === id);
      setSessions(gameSessions);

      // Calculate the total playtime of the game based on play sessions
      const totalPlaytime = gameSessions.reduce(
        (total: number, session: any) => total + session.duration,
        0,
      );
      const hoursPlayed = (totalPlaytime / 60).toFixed(1);

      // Calculate the average play session duration that a user has for the game
      const avgSessionDuration = gameSessions.length
        ? gameSessions.reduce(
            (sum: any, s: { duration: any }) => sum + s.duration,
            0,
          ) /
          gameSessions.length /
          60
        : 0;

      // Calculate the longest play session that the user has tracked for the specific game
      const longest = gameSessions.length
        ? Math.max(...gameSessions.map((s: any) => s.duration))
        : 0;
      setStats({
        avg: Number(avgSessionDuration.toFixed(1)),
        totalSessions: gameSessions.length,
        longest: (longest / 60).toFixed(2),
        totalHours: Number(hoursPlayed),
      });
    } catch (error) {
      console.error("Error fetching recent play sessions:", error);
    }
  };

  // Re-fetch play sessions of game
  useEffect(() => {
    if (id && isAuthenticated) {
      fetchPlaySessions();
    }
  }, [id, isAuthenticated]);

  // Function to handle removing the game from the user's library
  const handleRemoveFromLibrary = async () => {
    if (!game) return;

    setAddingToLibrary(true);

    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve the Bearer token from localStorage
      const res = await fetch(`/api/library/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove game from library");
      }

      toast.error("Game removed from your library!");
      setIsInLibrary(false); // Update the state to show that the game is not in the user's library
    } catch (error) {
      console.error("Error removing game from library:", error);
      toast.error("Failed to remove game from your library. Please try again.");
    } finally {
      setAddingToLibrary(false);
    }
  };

  // Update local state when the modal opens to reflect the current status, platinum, and rating of the game.
  useEffect(() => {
    if (opened && libraryGame) {
      setStatus(libraryGame.status ?? null);
      setCompletionDate(libraryGame.completionDate ?? null);
      setIsPlatinum(libraryGame.platinum ?? false);
      setRating(libraryGame.rating ?? null);
    }
  }, [opened, libraryGame]);

  // Show global loader while fetching game details
  if (loading) {
    return <GlobalLoader visible={loading} />;
  }

  // If there is no valid game that the user selected, return the notFound page
  if (!game) {
    return notFound();
  }

  // Sort the collection games by total rating in descending order
  const sortedCollections = game.collections?.[0]?.games.sort(
    (a: any, b: any) => b.total_rating - a.total_rating,
  );

  return (
    <div className={classes.background}>
      <div className={classes.wrapper}>
        <div className={classes.gameHeroContainer}>
          <GameHero
            game={game}
            libraryGame={libraryGame}
            backgroundImage={backgroundImage}
            isAuthenticated={isAuthenticated}
            isGameInLibrary={isGameInLibrary}
            isPlatinum={isPlatinum}
            rating={rating}
            completionDate={completionDate}
            sessionStats={stats}
            numOfEntries={numOfEntries}
            addingToLibrary={addingToLibrary}
            onAddToLibrary={openAddModal}
            onLogSession={openPlaySessionModal}
            onEditGame={open}
            onRemoveFromLibrary={handleRemoveFromLibrary}
          />
        </div>

        <GameTabs value={activeTab} onTabChange={handleTabChange} />

        {activeTab === "overview" && <GameOverview game={game} />}

        {activeTab === "sessions" && (
          <GameActivity
            game={game}
            sessions={sessions}
            numOfEntries={numOfEntries}
            sessionStats={stats}
          />
        )}

        {activeTab === "journal" && (
          <GameJournal game={game} entries={entries} />
        )}

        {activeTab === "achievements" && <div>Achievements content</div>}

        {activeTab === "media" && <GameMedia game={game} />}

        <EditGameInfoModal
          opened={opened}
          onClose={close}
          libraryGame={libraryGame}
          game={game}
        />

        <PlaySessionModal
          key={game.id}
          opened={playSessionModalOpened}
          onClose={closePlaySessionModal}
          gameId={game.id}
          gameName={game.name}
          onSuccess={() => close()}
        />

        <AddToLibraryModal
          opened={AddOpened}
          onClose={closeAddModal}
          game={game}
        />

        <div className={classes.gameSeries}>
          {game.collections?.[0]?.games.length > 4 && (
            <>
              <div className={classes.sectionHeader}>
                <h2 className={classes.sectionTitle}>
                  Games in the Same Series:
                </h2>
              </div>

              <SimpleGrid
                cols={{ base: 2, sm: 3, md: 5 }}
                spacing="lg"
                verticalSpacing="lg"
                className={classes.seriesGrid}
              >
                {sortedCollections.slice(0, 10).map((collection: any) => (
                  <GameCard
                    variant="compact"
                    key={collection.id}
                    game={collection}
                  />
                ))}
              </SimpleGrid>
            </>
          )}
        </div>

        <div className={classes.sectionHeader}>
          <ThemeIcon
            size={50}
            variant="gradient"
            gradient={{ from: "#0e6ce7", to: "#1d4ee2", deg: 20 }}
            radius="md"
          >
            <Gamepad size={40} />
          </ThemeIcon>
          <h2 className={classes.sectionTitle}>Similar Games: </h2>
        </div>

        <div className={classes.similarGames}>
          <Swiper
            centeredSlides={isMobile ? true : false}
            navigation={true}
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            slidesPerView={isMobile ? 1.4 : 5}
            spaceBetween={20}
            className={classes.swiperContainer}
          >
            {game.similar_games?.map((similarGame: any) => {
              return (
                <SwiperSlide
                  key={similarGame.id}
                  className={classes.similarGameSlide}
                  onClick={() => router.push(`/games/${similarGame.id}`)} // Navigate to the similar game's details page
                >
                  <GameCard
                    variant="default"
                    key={similarGame.id}
                    game={similarGame}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
