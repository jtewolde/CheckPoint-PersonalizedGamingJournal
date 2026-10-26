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
  Select,
  Image,
  MultiSelect,
  TagsInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { PlaySession } from "@/app/types/PlaySession";

import { toast } from "react-toastify";

import classes from "./SessionModal.module.css";

import {
  Smile,
  CalendarDays,
  NotebookPen,
  Gamepad2,
  Clock,
  LibraryBig,
} from "lucide-react";

// Define the props for the PlaySessionModal component
type PlaySessionModalProps = {
  opened: boolean;
  onClose: () => void;
  gameId?: string;
  gameName?: string;
  coverImage?: string;
  session?: PlaySession | null;
  onSuccess?: (session: PlaySession) => void;
  onSessionCreated?: () => void;
};

export default function PlaySessionModal({
  opened,
  onClose,
  gameId,
  session,
  gameName,
  coverImage,
  onSessionCreated,
}: PlaySessionModalProps) {
  // State variables to hold info on play time duration using hours and minutes inputs
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const duration = hours * 60 + minutes;

  // State variables to hold play session details such as notes, date, session type, mood, and platform for the form inputs in the modal
  const [playSessionNotes, setPlaySessionNotes] = useState("");
  const [playSessionDate, setPlaySessionDate] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 650px)");

  // State variables to hold selected game and user's game library for the select dropdown in the modal
  const [selectedGameName, setSelectedGameName] = useState(gameName || "");
  const [gameCover, setGameCover] = useState(coverImage || "");
  const [selectedGameId, setSelectedGameId] = useState(gameId || "");
  const [userGames, setUserGames] = useState<any[]>([]);

  // Helper function to quickly reset the all of the info on the form
  const resetForm = () => {
    setHours(0);
    setMinutes(0);
    setPlaySessionNotes("");
    setPlaySessionDate(null);
    setSessionType([]);
    setMood([]);
  };

  // Fetch the user's library of games to populate the select dropdown
  useEffect(() => {
    if (!gameId && opened) {
      const fetchUserGames = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token
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
          setUserGames(data.games); // Store the games in state
          console.log(data.games);
        } catch (error) {
          console.error("Error fetching user library:", error);
        } finally {
          setLoading(false); // Hide loading overlay after fetching data
        }
      };
      fetchUserGames();
    }
  }, [opened, gameId]);

  // Update selected game name and ID when the modal is opened with a specific game, or when the library game data changes
  useEffect(() => {
    if (!opened) return;

    if (session) {
      // Editing an existing session
      setSelectedGameId(session.gameId || "");
      setSelectedGameName(session.gameName || "");

      setGameCover(session.coverImage || "");

      setSessionType(session.sessionType || []);
      setPlaySessionNotes(session.notes || "");
      setPlaySessionDate(session.date ?? null);
      setMood(session.mood || []);

      setHours(Math.floor(session.duration / 60));
      setMinutes(session.duration % 60);

      return;
    }

    // Creating a new session from a GameCard
    if (gameId) {
      setSelectedGameId(gameId);
      setSelectedGameName(gameName || "");
      setGameCover(coverImage || "");

      return;
    }

    // Creating a new Quick Log session
    setSelectedGameId("");
    setSelectedGameName("");
    setGameCover("");
  }, [opened, session, gameId, gameName, coverImage]);

  // Function to handle creating or updating a play session for a game
  // This will involve opening a modal with a form to input play session details such as duration and notes,
  // and then making an API call to save the play session to the database and associate it with the game and user's library.
  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Validate required fields and show error toast if any are missing
      if (!selectedGameId || !playSessionDate || duration <= 0) {
        toast.error("Please fill out all required fields.");
        return;
      }

      // Receive session token for authenication and determine if play session is being edited or not
      const token = localStorage.getItem("bearer_token");
      const isEditing = !!session;

      // Create custom URL for updating or creating play session
      const url = isEditing
        ? `/api/playSession/${session._id}`
        : `/api/playSession`;

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
        body: JSON.stringify({
          gameID: String(selectedGameId),
          gameName: selectedGameName,
          coverImage: gameCover,
          duration,
          notes: playSessionNotes,
          sessionType: sessionType,
          mood,
          date: playSessionDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to log play session");
      }

      // Show success toast and reset form fields after successful logging
      toast.success(isEditing ? "Session updated!" : "Session created!");
      resetForm();
      setLoading(false);
      onSessionCreated?.();
      onClose();
    } catch (error) {
      setLoading(false);
      console.error("Error logging play session:", error);
      toast.error("Failed to log play session. Please try again.");
    }
  };

  // Custom close handler that will display window to user if modal close button is clicked on
  // This is to prevent changes/additions to notes, tags, session type to be lost
  const handleClose = () => {
    const hasUnsavedChanges =
      playSessionNotes ||
      playSessionDate ||
      sessionType.length > 0 ||
      mood ||
      hours > 0 ||
      minutes > 0;

    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      fullScreen={isMobile}
      centered
      title="Log Play Session"
      withCloseButton
      closeOnClickOutside={false}
      closeOnEscape={false}
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
        header: {
          position: "relative",
          marginBottom: "10px",
          alignItems: "center",
          minHeight: "32px",
        },
      }}
    >
      {/* ✅ LOADING OVERLAY */}
      <LoadingOverlay
        visible={loading}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ size: "lg", color: "white", type: "oval" }}
      />

      <Stack gap="lg">
        {/* Selected game header */}
        <Group gap="sm" wrap="nowrap" align="center">
          <Image
            src={coverImage || session?.coverImage || undefined}
            alt={session?.gameName || gameName || "Game cover"}
            className={classes.gameCover}
            radius="md"
            fit="cover"
          />

          <Text className={classes.gameTitle} lineClamp={2}>
            {gameName || "No game selected"}
          </Text>
        </Group>

        {/* Session fields */}
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

        <Textarea
          className={classes.textInput}
          size="md"
          minRows={3}
          maxRows={10}
          maxLength={2500}
          autosize
          label="Session Summary"
          placeholder="Enter play session notes... "
          description={`${playSessionNotes.length}/2500 characters`}
          value={playSessionNotes}
          onChange={(e) => setPlaySessionNotes(e.target.value)}
          mt={10}
        />

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
            onChange={(value) => {
              setMood(value || []);
            }}
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

        <div className={classes.durationContainer}>
          <NumberInput
            label="Time Played (Hours)"
            leftSection={<Clock size={20} />}
            placeholder="Enter hours"
            min={0}
            value={hours}
            onChange={(value) => setHours(Number(value) || 0)}
          />

          <NumberInput
            label="Minutes"
            placeholder="Enter minutes"
            min={0}
            max={59}
            value={minutes}
            onChange={(value) => setMinutes(Number(value) || 0)}
          />
        </div>

        <Divider
          styles={{ label: { color: "white" } }}
          labelPosition="center"
          color="dimmed"
          mt="md"
        />

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
            onClick={() => {
              handleSubmit();
            }}
          >
            {session ? "Update" : "Create"}
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
