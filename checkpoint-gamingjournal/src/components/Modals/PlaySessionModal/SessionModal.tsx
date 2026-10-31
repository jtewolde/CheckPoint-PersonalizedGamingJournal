"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {
  Modal,
  Divider,
  Stack,
  Group,
  Button,
  Text,
  LoadingOverlay,
  NumberInput,
  Image,
  MultiSelect,
  TagsInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { PlaySession } from "@/app/types/PlaySession";
import { Game } from "@/app/types/Game";

import { toast } from "react-toastify";
import classes from "./SessionModal.module.css";
import { Smile, CalendarDays, NotebookPen, Clock } from "lucide-react";

type PlaySessionModalProps = {
  opened: boolean;
  onClose: () => void;
  selectedGame?: Game | null;
  session?: PlaySession | null;
  onSuccess?: (session: PlaySession) => void;
  onSessionCreated?: () => void;
};

export default function PlaySessionModal({
  opened,
  onClose,
  session,
  selectedGame,
  onSessionCreated,
}: PlaySessionModalProps) {
  // Play session duration
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const duration = hours * 60 + minutes;

  // Play session details
  const [playSessionNotes, setPlaySessionNotes] = useState("");
  const [playSessionDate, setPlaySessionDate] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 650px)");

  // Selected game information
  const selectedGameId = selectedGame?.gameId ?? session?.gameId ?? "";
  const selectedGameName = selectedGame?.title ?? session?.gameName ?? "";
  const selectedGameCover =
    selectedGame?.coverImage ?? session?.coverImage ?? "";

  // Game metadata
  const releaseYear = selectedGame?.releaseDate
    ? new Date(selectedGame.releaseDate).getFullYear()
    : null;

  const genres = selectedGame?.genre ?? [];
  const availablePlatforms = selectedGame?.availablePlatforms ?? [];

  // Reset form fields
  const resetForm = () => {
    setHours(0);
    setMinutes(0);
    setPlaySessionNotes("");
    setPlaySessionDate(null);
    setSessionType([]);
    setMood([]);
  };

  // Initialize form when opening or switching sessions
  useEffect(() => {
    if (!opened) return;

    if (session) {
      setSessionType(session.sessionType || []);
      setPlaySessionNotes(session.notes || "");
      setPlaySessionDate(session.date ?? null);
      setMood(session.mood || []);

      setHours(Math.floor(session.duration / 60));
      setMinutes(session.duration % 60);
    } else {
      resetForm();
    }
  }, [opened, session]);

  // Create or update a play session
  const handleSubmit = async () => {
    if (!selectedGameId || !playSessionDate || duration <= 0) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("bearer_token");
      const isEditing = !!session;

      const url = isEditing
        ? `/api/playSession/${session._id}`
        : "/api/playSession";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameID: String(selectedGameId),
          gameName: selectedGameName,
          coverImage: selectedGameCover,
          duration,
          notes: playSessionNotes,
          sessionType,
          mood,
          date: playSessionDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to log play session");
      }

      const data = await res.json();

      toast.success(isEditing ? "Session updated!" : "Session created!");

      resetForm();

      onSessionCreated?.();
      onClose();
    } catch (error) {
      console.error("Error logging play session:", error);
      toast.error("Failed to log play session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={handleClose}
      size="lg"
      fullScreen={isMobile}
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Modal.Overlay />

      <Modal.Content>
        {/* Modal Header */}
        <Modal.Header className={classes.modalHeader}>
          <Group
            gap="md"
            wrap="nowrap"
            align="center"
            className={classes.modalGameHeader}
          >
            <Image
              src={selectedGameCover.replace("t_thumb", "t_1080p") || undefined}
              alt={selectedGameName || "Game cover"}
              className={classes.headerCover}
              radius="md"
              fit="cover"
            />

            <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
              <Modal.Title className={classes.headerGameTitle}>
                {selectedGameName || "Play Session"}
              </Modal.Title>

              <Group gap={5}>
                {releaseYear && (
                  <Text size="sm" c="dimmed">
                    {releaseYear}
                  </Text>
                )}
              </Group>

              <Text size="sm" c="dimmed">
                Log a Play Session
              </Text>
            </Stack>
          </Group>

          <Modal.CloseButton />
        </Modal.Header>

        {/* Modal Body */}
        <Modal.Body mt="md">
          <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: "sm", blur: 2 }}
            loaderProps={{ size: "lg", color: "white", type: "oval" }}
          />

          <Stack gap="lg">
            {/* Session Focus */}
            <MultiSelect
              label="Session Focus"
              placeholder="Select or add a focus..."
              description="What did you focus on during this session?"
              data={[
                "Story Progress",
                "Exploration",
                "Boss Fight",
                "Side Quest",
                "Grinding",
                "Achievement Hunting",
                "Build Testing",
                "Multiplayer",
                "Casual Play",
              ]}
              value={sessionType}
              onChange={setSessionType}
              searchable
              size="md"
            />

            {/* Session Summary */}
            <Textarea
              className={classes.textInput}
              size="md"
              minRows={3}
              maxRows={10}
              maxLength={2500}
              autosize
              label="Session Summary"
              placeholder="Enter play session notes..."
              description={`${playSessionNotes.length}/2500 characters`}
              value={playSessionNotes}
              onChange={(e) => setPlaySessionNotes(e.target.value)}
              mt={10}
            />

            {/* Mood and Date */}
            <div className={classes.fieldRow}>
              <TagsInput
                className={classes.moodSelect}
                leftSection={<Smile size={20} />}
                maxDropdownHeight={300}
                data={[
                  "Relaxed",
                  "Focused",
                  "Competitive",
                  "Frustrated",
                  "Excited",
                  "Fun",
                  "Chill",
                ]}
                scrollAreaProps={{
                  type: "auto",
                  scrollbarSize: 16,
                  scrollbars: "y",
                  color: "black",
                  classNames: { scrollbar: classes.scrollBar },
                }}
                size="md"
                label="Mood"
                description="How did you feel during this session?"
                placeholder="(e.g. Fun, Frustrating)"
                value={mood}
                onChange={setMood}
              />

              <DatePickerInput
                className={classes.dateField}
                size="md"
                label="Session Date"
                placeholder="Select session date"
                description="When did you play?"
                clearable
                required
                leftSection={<CalendarDays size={20} />}
                maxDate={new Date()}
                value={playSessionDate}
                onChange={setPlaySessionDate}
              />
            </div>

            {/* Duration */}
            <Stack gap="xs" className={classes.durationSection}>
              <Group gap={6}>
                <Clock size={18} />
                <Text size="sm" fw={600}>
                  Time Played
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                How long did you play during this session?
              </Text>

              <div className={classes.durationContainer}>
                <NumberInput
                  className={classes.durationInput}
                  placeholder="00"
                  leftSection={<Clock size={20} />}
                  min={0}
                  max={999}
                  value={hours}
                  onChange={(value) => setHours(Number(value) || 0)}
                  suffix=" hrs"
                  size="md"
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />

                <NumberInput
                  className={classes.durationInput}
                  placeholder="00"
                  leftSection={<Clock size={20} />}
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(value) => setMinutes(Number(value) || 0)}
                  suffix=" min"
                  size="md"
                  hideControls
                  allowDecimal={false}
                  allowNegative={false}
                />
              </div>

              <Text size="xs" c="dimmed">
                Total duration: {hours}h {minutes}m
              </Text>
            </Stack>

            <Divider
              styles={{ label: { color: "white" } }}
              labelPosition="center"
              color="dimmed"
              mt="md"
            />

            {/* Actions */}
            <div className={classes.buttonGroup}>
              <Button
                className={classes.cancelButton}
                fullWidth
                color="#cf1b1b"
                size="md"
                variant="filled"
                onClick={handleClose}
              >
                Cancel
              </Button>

              <Button
                className={classes.logButton}
                fullWidth
                variant="filled"
                color="#009c10"
                leftSection={<NotebookPen size={20} />}
                size="md"
                disabled={!selectedGameId || !playSessionDate || duration <= 0}
                loading={loading}
                onClick={handleSubmit}
              >
                {session ? "Update" : "Create"}
              </Button>
            </div>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
