"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Group,
  Rating,
  Stack,
  Text,
  Tooltip,
  RingProgress,
} from "@mantine/core";

import {
  CalendarDays,
  Check,
  Edit3,
  NotebookPen,
  Trophy,
  Trash2,
  Pause,
  PowerOff,
  Star,
  Backpack,
  Play,
  Timer,
} from "lucide-react";

import {
  FaXbox,
  FaWindows,
  FaApple,
  FaAndroid,
  FaSteam,
  FaLinux,
  FaTrophy,
  FaGoogle,
} from "react-icons/fa";
import {
  SiPlaystation,
  SiPlaystation2,
  SiPlaystation3,
  SiPlaystation4,
  SiPlaystation5,
  SiPlaystationportable,
  SiPlaystationvita,
} from "react-icons/si";
import { BsNintendoSwitch, BsPc } from "react-icons/bs";

import classes from "./GameHero.module.css";

interface GameHeroProps {
  game: any;
  libraryGame: any;
  backgroundImage: string;

  isAuthenticated: boolean;
  isGameInLibrary: boolean;

  isPlatinum: boolean;
  rating: number;
  completionDate: string | null;

  sessionStats: any;
  numOfEntries: number;

  addingToLibrary: boolean;

  onAddToLibrary: () => void;
  onLogSession: () => void;
  onEditGame: () => void;
  onRemoveFromLibrary: () => void;
}

export default function GameHero({
  game,
  libraryGame,
  backgroundImage,
  isAuthenticated,
  isGameInLibrary,
  isPlatinum,
  rating,
  completionDate,
  addingToLibrary,
  sessionStats,
  numOfEntries,
  onAddToLibrary,
  onLogSession,
  onEditGame,
  onRemoveFromLibrary,
}: GameHeroProps) {
  const router = useRouter();

  // Format the completion date into a human-readable string for "Your Game" Section
  const completionDateString = completionDate
    ? new Date(completionDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Format the time to beat time codes into a hour/min that can be read
  const formatTimeToBeat = (seconds?: number | null) => {
    if (!seconds) return "—";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours} Hrs`;
  };

  const getImageUrl = (url?: string) => {
    if (!url) return "/no-cover-image.png";

    return `https:${url.replace("t_thumb", "t_1080p")}`;
  };

  // Helper function that maps the specific platform name to the associated logo to put on card
  const getPlatformIcon = (platform: string) => {
    const name = platform.toLowerCase();

    // Windows / PC
    if (name.includes("windows") || name === "pc")
      return <FaWindows size={18} />;

    // Apple
    if (name.includes("mac")) return <FaApple size={18} />;

    // Google Stadia
    if (name.includes("google stadia")) return <FaGoogle size={18} />;

    // Linux
    if (name.includes("linux")) return <FaLinux size={18} />;

    // Steam
    if (name.includes("steam")) return <FaSteam size={18} />;

    // Android
    if (name.includes("android")) return <FaAndroid size={18} />;

    // iOS
    if (name.includes("ios")) return <FaApple size={18} />;

    // Nintendo
    if (name.includes("switch") || name.includes("nintendo"))
      return <BsNintendoSwitch size={18} />;

    // PlayStation
    if (name.includes("playstation 5") || name.includes("ps5"))
      return <SiPlaystation5 size={30} />;

    if (name.includes("playstation 4") || name.includes("ps4"))
      return <SiPlaystation4 size={30} />;

    if (name.includes("playstation 3") || name.includes("ps3"))
      return <SiPlaystation3 size={30} />;

    if (name.includes("playstation 2") || name.includes("ps2"))
      return <SiPlaystation2 size={30} />;

    if (name.includes("playstation")) return <SiPlaystation size={30} />;

    if (name.includes("playstation vita"))
      return <SiPlaystationvita size={18} />;

    if (name.includes("playstation portable"))
      return <SiPlaystationportable size={18} />;

    // Xbox
    if (
      name.includes("xbox") ||
      name.includes("series x") ||
      name.includes("series s")
    )
      return <FaXbox size={18} />;

    return null;
  };

  // Convert the release date from a timestamp to a year
  const releaseDate =
    game.first_release_date || game.release_dates?.[0]?.date
      ? new Date(
          (game.first_release_date || game.release_dates?.[0]?.date) * 1000,
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  // Helper function to style game status badge depending on the status of the game
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case "Playing":
        return {
          color: "#67baea",
          textColor: "#79b8f3",
          icon: <Play size={14} />,
        };

      case "Completed":
        return {
          color: "#0de40a",
          textColor: "#72eb74",
          icon: <Check size={14} />,
        };

      case "100%":
        return {
          color: "#f2e422",
          textColor: "#f9ed83",
          icon: <Trophy size={14} />,
        };

      case "On Hold":
        return {
          color: "#c88cf3",
          icon: <Pause size={14} />,
        };

      case "Dropped":
        return {
          color: "red",
          icon: <PowerOff size={14} />,
        };

      case "Wishlist":
        return {
          color: "yellow",
          icon: <Star size={14} />,
        };

      case "Backlog":
        return {
          color: "#f7bf5e",
          icon: <Backpack size={14} />,
        };

      default:
        return {
          color: "gray",
          icon: null,
        };
    }
  };

  // Get the correct associating status info for the current game's card
  const statusInfo = getStatusInfo(libraryGame?.status);

  return (
    <section
      className={classes.hero}
      style={
        {
          "--hero-background": `url(${backgroundImage})`,
        } as React.CSSProperties
      }
    >
      <div className={classes.heroOverlay} />

      <div className={classes.heroContent}>
        {/* Back navigation */}
        <button
          className={classes.backButton}
          onClick={() => router.back()}
          type="button"
        >
          ← Back
        </button>

        <div className={classes.heroGrid}>
          {/* Game Cover */}
          <div className={classes.coverWrapper}>
            <img
              src={getImageUrl(game.cover?.url)}
              alt={`${game.name} cover`}
              className={classes.cover}
            />
          </div>

          {/* Main Game Information */}
          <div className={classes.gameInformation}>
            <div className={classes.titleRow}>
              <Stack gap={1} justify="center" align="flex-start">
                <Text className={classes.developerName}>
                  {game.involved_companies?.length
                    ? game.involved_companies
                        .filter((company: any) => company.developer)
                        .map((company: any) => company.company?.name)
                        .filter(Boolean)
                        .join(", ") || "N/A"
                    : "N/A"}
                </Text>

                <h1 className={classes.title}>{game.name}</h1>
              </Stack>

              {game.game_type?.type && (
                <Badge
                  className={classes.typeBadge}
                  variant="light"
                  radius="sm"
                  size="lg"
                >
                  {game.game_type.type}
                </Badge>
              )}
            </div>

            <Group className={classes.metadata} gap="xs">
              {releaseDate && (
                <Text className={classes.metadataText}>{releaseDate}</Text>
              )}

              {game.genres?.length > 0 && (
                <>
                  <span className={classes.separator}>•</span>

                  <Text className={classes.metadataText}>
                    {game.genres
                      .slice(0, 3)
                      .map((genre: any) => genre.name)
                      .join(", ")}
                  </Text>
                </>
              )}

              {game.themes?.length > 0 && (
                <>
                  <span className={classes.separator}>•</span>

                  <Text className={classes.metadataText}>
                    {game.themes[0].name}
                  </Text>
                </>
              )}
            </Group>

            {/* Ratings */}
            <div className={classes.ratingGrid}>
              {isGameInLibrary && (
                <div className={classes.ratingCard}>
                  <Rating value={rating / 2} readOnly fractions={4} size="md" />

                  <Text className={classes.ratingValue}>
                    {rating > 0 ? `${rating}/10` : "Not rated"}
                  </Text>
                  <Text className={classes.ratingLabel}>Your Rating</Text>
                </div>
              )}

              <div className={classes.ratingCard}>
                <RingProgress
                  size={80}
                  thickness={5}
                  sections={[
                    { value: game.rating || 0, color: "#782fbd" },
                    { value: 100 - (game.rating || 0), color: "gray" },
                  ]}
                  label={
                    <Text className={classes.ratingNumber}>
                      {game.rating ? Math.round(game.rating) : "—"}
                    </Text>
                  }
                />
                <Text className={classes.ratingLabel}>User Score</Text>
              </div>

              <div className={classes.ratingCard}>
                <RingProgress
                  size={80}
                  thickness={5}
                  sections={[
                    { value: game.rating || 0, color: "#f4cb13" },
                    { value: 100 - (game.rating || 0), color: "gray" },
                  ]}
                  label={
                    <Text className={classes.criticRatingNumber}>
                      {game.aggregated_rating
                        ? Math.round(game.aggregated_rating)
                        : "—"}
                    </Text>
                  }
                />
                <Text className={classes.ratingLabel}>Critic Score</Text>
              </div>

              <div className={classes.timeCard}>
                <Timer size={30} color="white" />

                <Text className={classes.timeToBeatNumber}>
                  {formatTimeToBeat(game.time_to_beats?.normally)}
                </Text>

                <Text className={classes.ratingLabel}>Average Run</Text>
              </div>

              {!isGameInLibrary && (
                <div className={classes.timeCard}>
                  <Timer size={30} color="white" />

                  <Text className={classes.timeToBeatNumber}>
                    {formatTimeToBeat(game.time_to_beats?.completely)}
                  </Text>

                  <Text className={classes.ratingLabel}>Completionist Run</Text>
                </div>
              )}
            </div>

            {/* Platforms */}
            {game.platforms?.length > 0 && (
              <div className={classes.platformSection}>
                <Text className={classes.platformLabel}>Available on</Text>

                <Group gap="xs" className={classes.platformIcons}>
                  {game.platforms.slice(0, 6).map((platform: any) => {
                    const icon = getPlatformIcon(platform.name);

                    return (
                      <Tooltip
                        key={platform.id}
                        label={platform.name}
                        position="bottom"
                      >
                        <div className={classes.platformIcon}>{icon}</div>
                      </Tooltip>
                    );
                  })}

                  {game.platforms.length > 6 && (
                    <div className={classes.platformMore}>
                      +{game.platforms.length - 6}
                    </div>
                  )}
                </Group>
              </div>
            )}
          </div>

          {/* Your Game */}
          <div className={classes.yourGameCard}>
            <div className={classes.cardHeader}>
              <div className={classes.cardTitle}>
                <span className={classes.cardDot} />
                <Text>Your Game</Text>
              </div>
            </div>

            {isAuthenticated && isGameInLibrary ? (
              <Stack gap="md">
                {/* Status */}
                <div className={classes.statusRow}>
                  <div>
                    <Text className={classes.statLabel}>Status</Text>

                    <Badge
                      className={classes.libraryBadge}
                      color={statusInfo.color}
                      leftSection={statusInfo.icon}
                      variant="outline"
                      size="lg"
                      radius="sm"
                    >
                      {libraryGame?.status || "No Status"}
                    </Badge>
                  </div>

                  <div className={classes.statusIcons}>
                    <Tooltip
                      label={
                        isPlatinum
                          ? "Platinum achieved"
                          : "Platinum not achieved"
                      }
                    >
                      <div
                        className={`${classes.iconStatus} ${
                          isPlatinum ? classes.iconStatusActive : ""
                        }`}
                      >
                        <Trophy size={18} />
                      </div>
                    </Tooltip>

                    {completionDateString && (
                      <Tooltip label={`Completed ${completionDateString}`}>
                        <div
                          className={`${classes.iconStatus} ${classes.iconStatusActive}`}
                        >
                          <CalendarDays size={18} />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Your Rating */}
                {rating > 0 && (
                  <div className={classes.yourRating}>
                    <Rating
                      value={rating / 2}
                      readOnly
                      fractions={4}
                      size="sm"
                    />

                    <Text className={classes.ratingValue}>{rating}/10</Text>
                  </div>
                )}

                {/* Activity Stats */}
                <div className={classes.statsGrid}>
                  <div>
                    <Text className={classes.statValue}>
                      {libraryGame.hours
                        ? `${libraryGame.hours} Hours`
                        : "— Hours"}
                    </Text>
                    <Text className={classes.statLabel}>Playtime</Text>
                  </div>

                  <div>
                    <Text className={classes.statValue}>
                      {sessionStats?.totalSessions || "—"}
                    </Text>
                    <Text className={classes.statLabel}>Sessions</Text>
                  </div>

                  <div>
                    <Text className={classes.statValue}>
                      {numOfEntries || "—"}
                    </Text>
                    <Text className={classes.statLabel}>Journal Entries</Text>
                  </div>

                  <div>
                    <Text className={classes.statValue}>
                      {isPlatinum ? <Check size={20} /> : "—"}
                    </Text>

                    <Text className={classes.statLabel}>Completion</Text>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  className={classes.primaryButton}
                  leftSection={<NotebookPen size={18} />}
                  onClick={onLogSession}
                  fullWidth
                >
                  Log Play Session
                </Button>

                <div className={classes.secondaryActions}>
                  <Button
                    variant="default"
                    leftSection={<Edit3 size={17} />}
                    onClick={onEditGame}
                    className={classes.editButton}
                  >
                    Edit Game
                  </Button>

                  <Button
                    variant="light"
                    color="red"
                    leftSection={<Trash2 size={17} />}
                    onClick={onRemoveFromLibrary}
                    loading={addingToLibrary}
                    className={classes.removeButton}
                  >
                    Remove
                  </Button>
                </div>
              </Stack>
            ) : isAuthenticated ? (
              <Stack gap="md">
                <Text className={classes.emptyTitle}>
                  Track this game with Checkpoint
                </Text>

                <Text className={classes.emptyDescription}>
                  Add this game to your library to track sessions, journal
                  entries, ratings, and progress.
                </Text>

                <Button
                  className={classes.primaryButton}
                  leftSection={<NotebookPen size={18} />}
                  onClick={onAddToLibrary}
                  loading={addingToLibrary}
                  fullWidth
                >
                  Add to Library
                </Button>
              </Stack>
            ) : (
              <Stack gap="md">
                <Text className={classes.emptyTitle}>
                  Start tracking this game
                </Text>

                <Text className={classes.emptyDescription}>
                  Create an account to add games, track your progress, and log
                  your gaming sessions.
                </Text>

                <Button
                  className={classes.primaryButton}
                  onClick={() => router.push("/auth/signup")}
                  fullWidth
                >
                  Create an Account
                </Button>
              </Stack>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
