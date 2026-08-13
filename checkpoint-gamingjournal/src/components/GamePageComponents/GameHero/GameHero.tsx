"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Group,
  Rating,
  Stack,
  Text,
  Tooltip,
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
} from "lucide-react";

import {
  FaAndroid,
  FaApple,
  FaGoogle,
  FaPlaystation,
  FaXbox,
} from "react-icons/fa";
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

  const [opened, { open, close }] = useDisclosure(false);
  const [
    playSessionModalOpened,
    { open: openPlaySessionModal, close: closePlaySessionModal },
  ] = useDisclosure(false);
  const [AddOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);

  // Format the completion date into a human-readable string for "Your Game" Section
  const completionDateString = completionDate
    ? new Date(completionDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const getImageUrl = (url?: string) => {
    if (!url) return "/no-cover-image.png";

    return `https:${url.replace("t_thumb", "t_1080p")}`;
  };

  const getPlatformIcon = (platformName: string) => {
    const platform = platformName.toLowerCase();

    if (platform.includes("xbox")) {
      return <FaXbox size={17} />;
    }

    if (platform.includes("playstation")) {
      return <FaPlaystation size={17} />;
    }

    if (
      platform.includes("pc") ||
      platform.includes("windows") ||
      platform.includes("steam")
    ) {
      return <BsPc size={17} />;
    }

    if (platform.includes("nintendo")) {
      return <BsNintendoSwitch size={17} />;
    }

    if (platform.includes("android")) {
      return <FaAndroid size={17} />;
    }

    if (platform.includes("google")) {
      return <FaGoogle size={17} />;
    }

    if (platform.includes("ios") || platform.includes("mac")) {
      return <FaApple size={17} />;
    }

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
              <h1 className={classes.title}>{game.name}</h1>

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
                  <Rating value={rating} readOnly fractions={2} size="sm" />

                  <Text className={classes.ratingValue}>
                    {rating > 0 ? `${rating}/10` : "Not rated"}
                  </Text>

                  <Text className={classes.ratingLabel}>Your Rating</Text>
                </div>
              )}

              <div className={classes.ratingCard}>
                <Text className={classes.ratingNumber}>
                  {game.rating ? Math.round(game.rating) : "—"}
                </Text>

                <Text className={classes.ratingLabel}>User Score</Text>
              </div>

              <div className={classes.ratingCard}>
                <Text className={classes.ratingNumber}>
                  {game.aggregated_rating
                    ? Math.round(game.aggregated_rating)
                    : "—"}
                </Text>

                <Text className={classes.ratingLabel}>Critic Score</Text>
              </div>
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
                    <Rating value={rating} readOnly fractions={2} size="sm" />

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
