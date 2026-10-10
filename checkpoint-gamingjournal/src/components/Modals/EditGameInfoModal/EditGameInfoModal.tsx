"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {
  Modal,
  Group,
  Stack,
  Button,
  Textarea,
  LoadingOverlay,
  Select,
  Rating,
  Checkbox,
  CheckboxIconComponent,
  Text,
  NumberInput,
  Divider,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { toast } from "react-toastify";

import {
  CalendarDays,
  Check,
  Pause,
  Clock,
  SaveAll,
  Gem,
  Gift,
  Trophy,
  Play,
  PowerOff,
} from "lucide-react";

import classes from "./EditGameInfoModal.module.css";

// Define the props for the Edit Game Info Modal that takes in the opened state, onClose function, game object, libraryGames array, libraryGame object, and onSuccess function
interface EditGameInfoModalProps {
  opened: boolean;
  onClose: () => void;
  game?: any;
  libraryGames?: any[];
  libraryGame?: any;
  onSuccess?: () => void;
}

export default function EditGameInfoModal({
  opened,
  onClose,
  libraryGames,
  libraryGame,
  game,
  onSuccess,
}: EditGameInfoModalProps) {
  // States for storing the selected game's Id when changing game info
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const activeGame = libraryGame || selectedGame;

  // State variables for the info of a game in the user's library
  // like game status, starting and completion date, rating, hours played, etc
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isPlatinum, setIsPlatinum] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [platform, setPlatform] = useState("");
  const [hours, setHours] = useState(0);
  const [rating, setRating] = useState(0);

  const availablePlatforms =
    activeGame?.availablePlatforms ??
    game?.platforms?.map((p: any) => p.name) ??
    [];

  const [startingDate, setStartingDate] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 510px)");

  // Populate the modal with info of the selected game in library
  useEffect(() => {
    if (!activeGame) return;

    setStatus(activeGame.status ?? "");
    setNotes(activeGame.notes ?? "");
    setIsPlatinum(activeGame.platinum ?? false);
    setIsWishlist(activeGame.wishlist ?? false);
    setPlatform(activeGame.platform ?? "");
    setRating(activeGame.rating ?? 0);
    setHours(activeGame.hours ?? "");
    setStartingDate(activeGame.startingDate ?? null);
    setCompletionDate(activeGame.completionDate ?? null);
  }, [activeGame]);

  // Function to handle updating and saving the game status, platinum, rating, notes,
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");

      const res = await fetch(`/api/library/${activeGame?.gameId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameDetails: {
            status,
            notes,
            platform,
            platinum: isPlatinum,
            wishlist: isWishlist,
            rating,
            startingDate,
            completionDate,
            hours,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to edit game info");
      }

      const data = await res.json();
      console.log("PATCH INFO: ", data);
      toast.success("Changes have been saved!");

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating game status:", error);
      toast.error("Failed to update game info. Please try again.");
    }
  };

  // Define possible game statuses for the Select component in the Modal with descriptions for each status that the user can read
  const gameStatuses = [
    {
      value: "Playing",
      label: "Playing",
      description: "Currently playing and actively progressing in the game.",
      icon: <Play size={20} color="#1969b9" fill="#1969b9" />,
      color: "#1969b9",
    },
    {
      value: "Completed",
      label: "Completed",
      description:
        "Finished the main story or reached the game's primary ending",
      icon: <Check size={20} color="#27a01c" />,
      color: "#27a01c",
    },
    {
      value: "100%",
      label: "100%",
      description:
        "Completed all major content, achievements, collectibles, and optional objectives",
      icon: <Trophy size={20} fill="yellow" color="yellow" />,
      color: "yellow",
    },
    {
      value: "On Hold",
      label: "On Hold",
      description: "Taking a break from the game with plans to return later.",
      icon: <Pause size={20} color="violet" fill="violet" />,
      color: "violet",
    },
    {
      value: "Dropped",
      label: "Dropped",
      description: "Stopped playing and do not currently plan to continue.",
      icon: <PowerOff size={20} color="red" />,
      color: "red",
    },
    {
      value: "Backlog",
      label: "Backlog",
      description:
        "Own or intend to play this game, but not have started it yet.",
      icon: <Clock size={25} color="#21eebe" />,
      color: "orange",
    },
  ];

  // Custom icon component for the Checkbox to display a diamond icon when checked
  const CheckboxIcon: CheckboxIconComponent = (others) => <Gem {...others} />;

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
        <Modal.Header className={classes.header}>
          <div className={classes.modalHeaderContent}>
            {activeGame?.coverImage && (
              <img
                src={activeGame.coverImage}
                alt={activeGame.title}
                className={classes.gameCover}
              />
            )}

            <div className={classes.gameInfo}>
              <Modal.Title className={classes.gameTitle}>
                {activeGame?.title || "Edit Game Info"}
              </Modal.Title>

              {activeGame?.releaseDate && (
                <Text size="xs" c="dimmed" ff="Inter">
                  {new Date(activeGame.releaseDate).getFullYear()}
                </Text>
              )}
            </div>
          </div>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body mt="md">
          <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: "sm", blur: 2 }}
            loaderProps={{ size: "lg", color: "white", type: "oval" }}
          />

          <Stack gap={isMobile ? 30 : "lg"} mb="lg">
            {/* Status */}
            <Stack gap="xs">
              <Text className={classes.sectionText}>Status</Text>

              <div className={classes.statusGrid}>
                {gameStatuses.map((gameStatus) => (
                  <Button
                    radius="sm"
                    key={gameStatus.value}
                    variant={
                      status === gameStatus.value ? "outline" : "default"
                    }
                    className={classes.statusButton}
                    onClick={() => setStatus(gameStatus.value)}
                    leftSection={gameStatus.icon}
                  >
                    {gameStatus.label}
                  </Button>
                ))}
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
                label="Platform Played"
                placeholder="Select"
                data={availablePlatforms.map((platform: string) => ({
                  value: platform,
                  label: platform,
                }))}
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
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
