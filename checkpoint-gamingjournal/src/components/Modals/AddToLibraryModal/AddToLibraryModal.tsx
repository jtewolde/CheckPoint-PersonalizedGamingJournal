"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useAuth } from "@/context/Authcontext";
import {
  Modal,
  Group,
  Stack,
  Button,
  Text,
  LoadingOverlay,
  Textarea,
  Select,
  Rating,
  NumberInput,
  Divider,
  Image,
  Badge,
} from "@mantine/core";

import { DatePickerInput } from "@mantine/dates";

import { toast } from "react-toastify";

import {
  Check,
  Pause,
  SaveAll,
  Trophy,
  Play,
  PowerOff,
  Clock,
  CalendarDays,
  Gem,
  Gift,
  Backpack,
} from "lucide-react";

import PlaceHolderImage from "../../../../public/no-cover-image.png";
import classes from "./AddToLibrary.module.css";

interface AddToLibraryModalProps {
  opened: boolean;
  onClose: () => void;
  game: any;
  onSuccess?: () => void;
}

export default function AddToLibraryModal({
  opened,
  onClose,
  game,
  onSuccess,
}: AddToLibraryModalProps) {
  const isMobile = useMediaQuery("(max-width: 646px)");
  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state

  // State variables for the form fields
  const [status, setStatus] = useState("Backlog");
  const [platform, setPlatform] = useState("");
  const [rating, setRating] = useState(0);
  const [isPlatinum, setIsPlatinum] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [hours, setHours] = useState<number | string>(0);
  const [startingDate, setStartingDate] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const activeGame = game;

  useEffect(() => {
    if (!opened) return;

    setStatus("Backlog");
    setPlatform("");
    setRating(0);
    setIsPlatinum(false);
    setIsWishlist(false);
    setHours(0);
    setStartingDate(null);
    setCompletionDate(null);
    setNotes("");
  }, [opened, game?.id]);

  // Define possible game statuses for the Select component in the Modal with descriptions for each status that the user can read
  const gameStatuses = [
    {
      value: "Playing",
      label: "Playing",
      description: "Currently playing and actively progressing in the game.",
      icon: <Play size={22} fill="currentColor" />,
      color: "#2281f5",
    },
    {
      value: "Completed",
      label: "Completed",
      description:
        "Finished the main story or reached the game's primary ending.",
      icon: <Check size={22} />,
      color: "#1fdf1f",
    },
    {
      value: "100%",
      label: "100% Complete",
      description:
        "Completed all major content, achievements, collectibles, and optional objectives.",
      icon: <Trophy size={22} />,
      color: "#f5c542",
    },
    {
      value: "On Hold",
      label: "On Hold",
      description: "Taking a break from the game with plans to return later.",
      icon: <Pause size={22} fill="currentColor" />,
      color: "#9c6af7",
    },
    {
      value: "Dropped",
      label: "Dropped",
      description: "Stopped playing and do not currently plan to continue.",
      icon: <PowerOff size={22} />,
      color: "#f11d1d",
    },
    {
      value: "Backlog",
      label: "Backlog",
      description:
        "Own or intend to play this game, but have not started it yet.",
      icon: <Backpack size={22} />,
      color: "#0cf4dd",
    },
  ];

  // Function to add the selected game to the user's library with the initial status and info
  const handleAddToLibrary = async () => {
    if (!isAuthenticated) {
      toast.error("You need to be signed in!");
      return;
    }

    if (!platform) {
      toast.error("Please select a platform.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");

      const res = await fetch("/api/library", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID: String(game.id),
          gameDetails: {
            title: game.name,

            genre: game.genres?.map((genre: any) => genre.name) || [],
            availablePlatforms:
              game.platforms?.map((platform: any) => platform.name) || [],
            platform: platform,

            coverImage: game.cover.url.replace("t_thumb", "t_1080p"),
            releaseDate: game.first_release_date
              ? new Date(game.first_release_date * 1000).toLocaleDateString()
              : null,

            dateAdded: new Date().toLocaleDateString(),
            status: status,
            platinum: isPlatinum,
            wishlist: isWishlist,
            rating: rating,
            hoursPLayed: hours,
            startingDate: startingDate,
            completionDate: completionDate,
            notes: notes,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success(`${activeGame?.name} has been added to your library!`);

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add game to your library.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      fullScreen={isMobile}
    >
      <Modal.Overlay />

      <Modal.Content>
        <Modal.Header
          styles={{
            header: {
              position: "relative",
              marginBottom: "10px",
              alignItems: "center",
              minHeight: "32px",
            },
          }}
        >
          <Modal.Title
            styles={{
              title: {
                fontWeight: 700,
                fontFamily: "Inter",
                fontSize: "1.1rem",
                color: "white",
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                whiteSpace: "nowrap",
              },
            }}
          >
            Add Game to Library
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body mt="md">
          <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: "sm", blur: 2 }}
            loaderProps={{ size: "lg", color: "white", type: "oval" }}
          />

          <Stack gap={isMobile ? 30 : "lg"} mb="lg">
            {/* Selected game header */}
            <Group gap="sm" wrap="nowrap" align="center">
              <Image
                src={
                  game.cover
                    ? `https:${game.cover.url.replace("t_thumb", "t_1080p")}`
                    : PlaceHolderImage.src
                }
                alt={game.name || "Game cover"}
                className={classes.gameCover}
                radius="md"
                fit="cover"
              />

              <Stack gap="xs">
                <Text className={classes.gameTitle} lineClamp={2}>
                  {game.name || "No game selected"}
                </Text>

                <Group gap={5}>
                  {activeGame?.first_release_date && (
                    <Text size="sm" c="dimmed" ff="Inter">
                      {new Date(
                        activeGame.first_release_date * 1000,
                      ).getFullYear()}
                    </Text>
                  )}

                  <Text size="xs" c="dimmed" ff="Inter">
                    •
                  </Text>

                  <div className={classes.gameDetails}>
                    <Text size="sm" c="dimmed" ff="Inter">
                      {game.involved_companies?.length
                        ? game.involved_companies
                            .filter((company: any) => company.developer)
                            .map((company: any) => company.company?.name)
                            .filter(Boolean)
                            .join(", ") || "N/A"
                        : "N/A"}
                    </Text>
                  </div>
                </Group>

                <Group gap={6} wrap="wrap">
                  {(game.genres ?? []).slice(0, 2).map((genre: any) => (
                    <Badge
                      key={genre.id}
                      size="sm"
                      variant="light"
                      color="gray"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Group>

            {/* Status */}
            <Stack gap="xs">
              <Text className={classes.sectionText}>Status</Text>

              <div className={classes.statusGrid}>
                {gameStatuses.map((gameStatus) => {
                  const isSelected = status === gameStatus.value;

                  return (
                    <Button
                      key={gameStatus.value}
                      type="button"
                      variant="default"
                      className={`${classes.statusButton} ${
                        isSelected ? classes.statusButtonSelected : ""
                      }`}
                      onClick={() => setStatus(gameStatus.value)}
                      aria-pressed={isSelected}
                      styles={{
                        root: {
                          "--status-color": gameStatus.color,
                        } as React.CSSProperties,
                      }}
                    >
                      <Stack gap={8} align="center" justify="center">
                        <div className={classes.statusIcon}>
                          {gameStatus.icon}
                        </div>

                        <Text className={classes.statusLabel}>
                          {gameStatus.label}
                        </Text>
                      </Stack>
                    </Button>
                  );
                })}
              </div>
            </Stack>

            {/* Rating */}
            <Stack gap={3}>
              <Text className={classes.sectionText}>Rating</Text>

              <Group gap={7} wrap="wrap">
                <Rating
                  size="lg"
                  count={10}
                  fractions={2}
                  value={rating}
                  onChange={setRating}
                />

                <Text size="md" c="white">
                  {rating}/10
                </Text>
              </Group>
            </Stack>

            {/* Collection & Achievements */}
            <Stack gap="xs">
              <Text className={classes.sectionText}>
                Collection & Achievements
              </Text>

              <Group gap="sm" grow>
                {/* Wishlist Toggle */}
                <Button
                  type="button"
                  size="md"
                  radius="md"
                  variant={isWishlist ? "light" : "default"}
                  color={isWishlist ? "grape" : "gray"}
                  leftSection={<Gift size={19} />}
                  onClick={() => setIsWishlist((prev) => !prev)}
                  aria-pressed={isWishlist}
                  className={classes.featureToggle}
                >
                  {isWishlist ? "Wishlisted" : "Wishlist"}
                </Button>

                {/* Platinum Toggle */}
                <Button
                  type="button"
                  size="md"
                  radius="md"
                  variant={isPlatinum ? "light" : "default"}
                  color={isPlatinum ? "blue" : "gray"}
                  leftSection={<Gem size={19} />}
                  onClick={() => setIsPlatinum((prev) => !prev)}
                  className={classes.featureToggle}
                >
                  {isPlatinum ? "Platinum Earned" : "Platinum"}
                </Button>
              </Group>
            </Stack>

            <div className={classes.fieldRow}>
              {/* Platform */}
              <Select
                className={classes.platformSelect}
                size="md"
                required
                label="Platform Played On"
                placeholder="Select"
                data={(game?.platforms ?? []).map(
                  (plat: { id: number; name: string }) => ({
                    value: plat.name,
                    label: plat.name,
                  }),
                )}
                value={platform}
                onChange={(value) => setPlatform(value || "")}
                searchable
                styles={{
                  label: {
                    color: "white",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  },
                }}
              />

              <NumberInput
                className={classes.hoursInput}
                label="Hours Played"
                size="md"
                leftSection={<Clock size={20} />}
                placeholder="Enter hours"
                min={0}
                value={hours}
                onChange={(value) => setHours(Number(value) || 0)}
                styles={{
                  label: {
                    color: "white",
                    fontSize: "16px",
                    fontFamily: "Inter",
                  },
                }}
              />
            </div>

            {/* Play period */}
            <Stack gap="xs">
              <div className={classes.fieldRow}>
                <DatePickerInput
                  className={classes.startDateSelect}
                  size="md"
                  placeholder="(e.g. 5/27/2026)"
                  label="Start Date"
                  clearable
                  leftSection={<CalendarDays size={20} />}
                  maxDate={new Date()}
                  // Convert stored string → Date ONLY for display
                  value={startingDate}
                  onChange={setStartingDate}
                  disabled={!activeGame}
                />

                <DatePickerInput
                  className={classes.completionDateSelect}
                  size="md"
                  placeholder="(e.g. 6/15/2026)"
                  label="Completion Date"
                  clearable
                  leftSection={<CalendarDays size={20} />}
                  maxDate={new Date()}
                  // Convert stored string → Date ONLY for display
                  value={completionDate}
                  onChange={setCompletionDate}
                  disabled={!activeGame}
                />
              </div>
            </Stack>

            {/* Notes */}
            <Textarea
              size="sm"
              label="Notes"
              placeholder="Add notes about this game..."
              description="Record thoughts, goals, memorable moments, achievements, or anything you'd like to remember."
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              minRows={2}
              autosize
              styles={{
                label: {
                  color: "white",
                  fontSize: "16px",
                  fontFamily: "Inter",
                },
              }}
              disabled={!activeGame}
            />
          </Stack>

          <Divider color="dimmed" mt="md" />
          {/* Footer */}
          <div className={classes.footer}>
            <Button
              className={classes.cancelButton}
              fullWidth
              size="md"
              variant="outline"
              color="gray"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              className={classes.saveButton}
              fullWidth
              size="md"
              leftSection={<SaveAll size={18} />}
              onClick={handleAddToLibrary}
            >
              Save to Library
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
