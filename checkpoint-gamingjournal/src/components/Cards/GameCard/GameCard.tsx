"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { useLibraryGame } from "@/hooks/useLibraryGame";
import { useAuth } from "@/context/Authcontext";

import PlaySessionModal from "../../Modals/PlaySessionModal/SessionModal";
import EditGameInfoModal from "../../Modals/EditGameInfoModal/EditGameInfoModal";
import AddToLibraryModal from "../../Modals/AddToLibraryModal/AddToLibraryModal";

import {
  Badge,
  Image,
  Tooltip,
  Rating,
  Button,
  Text,
  ThemeIcon,
  Group,
} from "@mantine/core";
import { toast } from "react-toastify";

import {
  Plus,
  Trophy,
  ClipboardEdit,
  Star,
  Check,
  PowerOff,
  Backpack,
  Pause,
  Play,
  Timer,
  CalendarDays,
  Gem,
  Gift,
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
import { SiPlaystation } from "react-icons/si";
import { GiDiamondTrophy } from "react-icons/gi";
import { BsNintendoSwitch } from "react-icons/bs";

import PlaceHolderImage from "../../../../public/no-cover-image.png";
import classes from "./GameCard.module.css";

// Create type variable to determine which variant of gameCard, default for search results and more info
// Compact for Popular and Trending games sections with less info
type GameCardVariant =
  | "default"
  | "compact"
  | "small"
  | "library"
  | "upcoming"
  | "remove";

// Define the GameCard component that takes a game prop and attributes
interface GameCardProps {
  game: {
    id: string;
    name: string;
    cover?: { url: string };
    game_type?: { type: string };
    genres?: { name: string }[];
    platforms?: { name: string; abbreviation?: string }[];
    release_dates?: { human: string }[];
    first_release_date?: number;
    total_rating?: number;
    status?: string;
  };

  // Optional props for if the game is in the user's library
  libraryMeta?: {
    title?: string;
    status?: string;
    rating?: number;
    hours?: number;
    platform: string;
    platinum?: boolean;
    wishlist?: boolean;
    completionDate?: string;
  };

  libraryGame?: any;

  onQuickLog?: (game: {
    gameId: string;
    title: string;
    cover?: string;
  }) => void;
  onAddToLibrary?: (game: any) => void;
  onSuccess?: () => void;
  onRemoveFromLibrary?: (gameId: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (gameId: string) => void;
  variant?: GameCardVariant;
}

export default function GameCard({
  game,
  libraryGame,
  variant = "default",
  libraryMeta,
  onSuccess,
  selectable = false,
  selected = false,
  onSelect,
}: GameCardProps) {
  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state
  const isMobile = useMediaQuery("(max-width: 646px)");
  const [opened, { open, close }] = useDisclosure(false);

  const [editOpened, { open: editOpen, close: editClose }] =
    useDisclosure(false);
  const [AddOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);

  const anyModalOpen = opened || editOpened || AddOpened || deleteOpened;

  const router = useRouter();

  // State variables for determing if current gameCard is in the user's library
  const { isInLibrary } = useLibraryGame(game.id);
  const [loading, setLoading] = useState(false);
  const [addingToLibrary, setAddingtoLibrary] = useState(false);

  const shouldRenderAddModal = variant !== "library";

  // Function to handle removing the game from the user's library
  const handleRemoveFromLibrary = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("bearer_token");

      const gameId = libraryGame?.gameId ?? game.id;

      const res = await fetch(`/api/library/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove game.");
      }

      toast.success("Game Removed from library!");
      router.push("/library");

      onSuccess?.();
    } catch (err) {
      toast.error("Failed to remove game.");
      console.error("Error removing game from library:", err);
    } finally {
      setLoading(false);
    }
  };

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
          color: "#0cf4dd",
          icon: <Backpack size={14} />,
        };

      default:
        return {
          color: "gray",
          icon: null,
        };
    }
  };

  // Variable to determine if game info should be displayed
  const showGameInfo = variant === "default" || variant === "upcoming";

  // Get the correct associating status info for the current game's card
  const statusInfo = getStatusInfo(libraryMeta?.status);

  // Helper function that maps the specific platform name to the associated logo to put on card
  const getPlatformIcon = (platform: string) => {
    const name = platform.toLowerCase();

    // Windows / PC
    if (name.includes("windows") || name === "pc")
      return <FaWindows size={15} />;

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

    // PlayStation — use one consistent icon for every generation
    if (
      name.includes("playstation") ||
      /\bps[2354]\b/.test(name) ||
      name.includes("ps vita") ||
      name.includes("psp")
    ) {
      return <SiPlaystation size={20} />;
    }

    // Xbox
    if (
      name.includes("xbox") ||
      name.includes("series x") ||
      name.includes("series s")
    )
      return <FaXbox size={15} />;

    return null;
  };

  // Function to help with identifying whether user is authenticated or not and whether to open add modal depending on it
  const handleQuickLibraryAction = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("You must be signed in to add games to your library.");
      return;
    }

    if (isInLibrary) {
      handleRemoveFromLibrary();
    } else {
      openAddModal();
    }
  };

  return (
    <div
      key={game.id}
      className={`${classes.gameCard} ${
        variant === "remove"
          ? classes.remove
          : variant === "compact"
            ? classes.compact
            : variant === "small"
              ? classes.small
              : variant === "library"
                ? classes.library
                : classes.default
      } ${selected ? classes.selected : ""}`}
    >
      <div
        className={`${classes.imageWrapper} ${
          selectable
            ? classes.nonClickable
            : variant === "remove"
              ? classes.removeImageWrapper
              : ""
        }`}
        onClick={() => {
          if (selectable) {
            onSelect?.(game.id);
            return;
          }

          if (anyModalOpen) return;

          router.push(`/games/${game.id}`);
        }}
      >
        {variant === "remove" && selected && (
          <div className={classes.selectionIndicator}>
            <Check size={20} color="white" />
          </div>
        )}

        <Image
          src={
            game.cover
              ? `https:${game.cover.url.replace("t_thumb", "t_1080p")}`
              : PlaceHolderImage.src
          }
          alt={game.name}
          className={classes.cover}
        />

        {showGameInfo && (
          <>
            {variant === "default" && (
              <Badge
                className={classes.ratingBadge}
                classNames={{ root: classes.root }}
                radius={2}
                size="md"
                variant="dot"
                color={
                  game.total_rating && game.total_rating >= 80
                    ? "#1ace3b"
                    : game.total_rating && game.total_rating >= 70
                      ? "yellow"
                      : "#f01e1e"
                }
              >
                <Group gap={5} align="center">
                  {game.total_rating
                    ? `${Math.round(game.total_rating)}`
                    : "N/A"}
                </Group>
              </Badge>
            )}

            {showGameInfo && game.game_type?.type !== "Main Game" && (
              <Badge
                className={classes.gameTypeBadge}
                size="sm"
                variant="outline"
                radius={2}
                color={
                  game.game_type?.type == "Expansion"
                    ? "grape"
                    : game.game_type?.type == "Remake"
                      ? "#7ab3f0"
                      : game.game_type?.type == "Remaster"
                        ? "#f1a4a4"
                        : game.game_type?.type == "Mod"
                          ? "green"
                          : game.game_type?.type == "Standalone Expansion"
                            ? "#d46edf"
                            : "#e1d966"
                }
              >
                {game.game_type?.type}
              </Badge>
            )}
          </>
        )}

        {variant === "library" && (
          <>
            <Badge
              className={classes.libraryBadge}
              color={statusInfo.color}
              leftSection={statusInfo.icon}
              variant="outline"
              size="md"
              radius="sm"
            >
              {libraryMeta?.status || "No Status"}
            </Badge>

            {/* Collection & Achievement Indicators */}
            <div className={classes.collectionIcons}>
              {libraryMeta?.wishlist === true && (
                <Tooltip label="On Wishlist" position="top" withArrow>
                  <ThemeIcon
                    className={classes.wishlistIcon}
                    size="md"
                    radius={2}
                    variant="filled"
                    color="dark"
                    aria-label="On Wishlist"
                  >
                    <Gift size={17} color="#E879F9" />
                  </ThemeIcon>
                </Tooltip>
              )}

              {libraryMeta?.platinum === true && (
                <Tooltip label="Platinum Achieved" position="top" withArrow>
                  <ThemeIcon
                    className={classes.platinumIcon}
                    size="md"
                    radius={2}
                    variant="filled"
                    color="dark"
                    aria-label="Platinum Achieved"
                  >
                    <GiDiamondTrophy size={17} color="#F5C542" />
                  </ThemeIcon>
                </Tooltip>
              )}
            </div>

            {libraryMeta?.platform && (
              <Tooltip label={libraryMeta.platform} position="top" withArrow>
                <ThemeIcon
                  className={classes.platformIcon}
                  size="lg"
                  radius={2}
                  variant="outline"
                  color="white"
                >
                  {getPlatformIcon(libraryMeta.platform)}
                </ThemeIcon>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {variant === "library" && (
        <div className={classes.libraryGameInfo}>
          <h3 className={classes.gameTitle}>{game.name}</h3>

          <div className={classes.ratingSection}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap={4} align="center">
                <Timer size={isMobile ? 10 : 15} color="white" />
                <Text className={classes.hoursPlayedText}>
                  {libraryMeta?.hours || 0} Hours
                </Text>
              </Group>

              <Group gap={6} align="center" wrap="nowrap">
                <Rating
                  value={(libraryMeta?.rating ?? 0) / 2}
                  readOnly
                  fractions={2}
                  size="sm"
                  count={1}
                />

                <Text className={classes.ratingText}>
                  {libraryMeta?.rating}/10
                </Text>
              </Group>
            </Group>
          </div>

          <div className={classes.cardButtons}>
            <PlaySessionModal
              key={game.id}
              opened={opened}
              onClose={close}
              gameId={game.id}
              gameName={game.name}
              coverImage={
                game.cover
                  ? `${game.cover.url.replace("t_thumb", "t_1080p")}`
                  : undefined
              }
              onSuccess={() => close()}
            />

            <EditGameInfoModal
              opened={editOpened}
              onClose={editClose}
              libraryGame={libraryGame}
              onSuccess={() => close()}
            />

            <Button
              size="xs"
              fullWidth
              className={classes.logAction}
              variant="filled"
              leftSection={<CalendarDays size={isMobile ? 10 : 17} />}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              Log
            </Button>

            <Button
              className={classes.editAction}
              size="xs"
              fullWidth
              variant="outline"
              leftSection={<ClipboardEdit size={isMobile ? 10 : 17} />}
              onClick={(e) => {
                e.stopPropagation();
                editOpen();
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      )}

      {variant === "remove" && (
        <div className={classes.gameInfo}>
          <h3 className={classes.removeGameTitle}>{game.name}</h3>
        </div>
      )}

      {showGameInfo && (
        <div className={classes.gameInfo}>
          <h3 className={classes.gameTitle}>{game.name}</h3>

          <Badge size="md" variant="default" c="white" radius="sm" fw={500}>
            {game.genres?.[0]?.name || "N/A"}
          </Badge>

          <p className={classes.gameDate}>
            {game.first_release_date
              ? new Date(game.first_release_date * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )
              : "N/A"}
          </p>

          <div className={classes.cardButtons}>
            {shouldRenderAddModal && (
              <AddToLibraryModal
                opened={AddOpened}
                onClose={closeAddModal}
                game={game}
                onSuccess={() => {
                  closeAddModal();
                  onSuccess?.();
                }}
              />
            )}
            <Button
              className={classes.addAction}
              size="xs"
              fullWidth
              variant="outline"
              color={loading ? "gray" : isInLibrary ? "#e65656" : "#24f149"}
              disabled={loading || addingToLibrary}
              leftSection={<Plus size={17} />}
              onClick={handleQuickLibraryAction}
            >
              {isInLibrary ? "Remove" : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
