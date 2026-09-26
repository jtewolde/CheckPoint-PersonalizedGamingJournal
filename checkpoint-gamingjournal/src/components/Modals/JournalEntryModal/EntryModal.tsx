"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {
  Modal,
  Divider,
  Stack,
  Button,
  TextInput,
  LoadingOverlay,
  Select,
  Textarea,
  Text,
  Group,
  Chip,
  Pill,
} from "@mantine/core";

import { JournalEntry } from "@/app/types/JournalEntry";

import { TAG_CATEGORIES } from "@/hooks/getTagsCategories";

import { toast } from "react-toastify";

import { NotebookPen, Gamepad2, Captions, LibraryBig } from "lucide-react";

import classes from "./EntryModal.module.css";

// Define the props for the JournalEntryModal component
type JournalEntryModalProps = {
  opened: boolean;
  onClose: () => void;
  gameId?: string;
  gameName?: string;
  entry?: JournalEntry | null;
  onSuccess?: (Entry: JournalEntry) => void;
  onEntryCreated?: () => void;
};

export default function JournalEntryModal({
  opened,
  onClose,
  gameId,
  gameName,
  entry,
  onSuccess,
  onEntryCreated,
}: JournalEntryModalProps) {
  // State variables for the journal form like name, content, associated tags, and entry type
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 650px)");

  // State variables to hold selected game and user's game library for the select dropdown in the modal
  const [selectedGameName, setSelectedGameName] = useState(gameName || "");
  const [gameCover, setGameCover] = useState("");
  const [selectedGameId, setSelectedGameId] = useState(gameId || "");
  const [userGames, setUserGames] = useState<any[]>([]);

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
  // Populate form when editing an existing entry
  useEffect(() => {
    if (opened && entry) {
      setTitle(entry.title || "");
      setContent(entry.content || "");
      setEntryType(entry.entryType || "");
      setTags(entry.tags || []);

      setSelectedGameId(entry.gameId || "");
      setSelectedGameName(entry.gameName || "");

      // If journal entry has a cover image, use the existing one,
      // Otherwise, find the matching game from library and set cover image for entry
      if (entry.coverImage) {
        setGameCover(entry.coverImage);
      } else {
        const matchingGame = userGames.find(
          (game) => game.gameId === entry.gameId,
        );

        if (matchingGame?.coverImage) {
          setGameCover(matchingGame.coverImage);
        }
      }
    }

    // Reset form when creating a new entry
    if (opened && !entry) {
      setTitle("");
      setContent("");
      setEntryType("");
      setTags([]);

      setSelectedGameId(gameId || "");
      setSelectedGameName(gameName || "");
      setGameCover("");
    }
  }, [opened, entry, gameId, gameName, userGames]);

  // Function to handle creating or updating a journal entry
  // This will involve opening a modal with a form to input play session details such as duration and notes,
  // and then making an API call to save the play session to the database and associate it with the game and user's library.
  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Validate required fields and show error toast if any are missing
      if (!selectedGameId || !title || !content || !entryType) {
        toast.error("Please fill out all required fields.");
        return;
      }

      // Receive session token for authenication and determine if play session is being edited or not
      const token = localStorage.getItem("bearer_token");
      const isEditing = !!entry;

      // Create custom URL for updating or creating play session
      const url = isEditing ? `/api/journal/${entry._id}` : `/api/journal`;

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
          title,
          content,
          entryType,
          tags,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create journal entry");
      }

      // Show success toast and reset form fields after successful logging
      toast.success(
        isEditing ? "Journal Entry updated!" : "Journal Entry created!",
      );
      setTitle("");
      setContent("");
      setLoading(false);
      onEntryCreated?.();
      onClose();
    } catch (error) {
      setLoading(false);
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry. Please try again.");
    }
  };

  // Function to help with toggling multiple tags that user wants on entry
  const toggleTag = (tag: string) => {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag],
    );
  };

  // Function for users to create their own custom tag if no tags are available.
  const addCustomTag = () => {
    const newTag = customTag.trim();

    if (!newTag) return;

    // Prevent duplicate tags
    if (tags.some((tag) => tag.toLowerCase() === newTag.toLowerCase())) {
      toast.info("This tag has already been added.");
      return;
    }

    setTags((current) => [...current, newTag]);
    setCustomTag("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={900}
      fullScreen={isMobile}
      title={gameId ? `${gameName} - Journal Entry` : `Create Journal Entry`}
      centered
      withCloseButton
      withinPortal
      styles={{
        title: {
          fontWeight: 700,
          fontFamily: "Inter",
          fontSize: "1.1rem",
          color: "white",
        },
        header: {
          marginBottom: "10px",
        },
      }}
    >
      {/* ✅ LOADING OVERLAY */}
      <LoadingOverlay
        visible={loading}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ size: "lg", color: "white", type: "oval" }}
      />

      <Stack gap="md">
        <div className={classes.fieldRow}>
          {entry ? (
            <TextInput
              className={classes.gameSelect}
              size="md"
              label="Game"
              description="Game you're creating an entry for"
              required
              value={selectedGameName}
              readOnly
              leftSection={<Gamepad2 size={20} />}
            />
          ) : (
            <Select
              leftSection={<Gamepad2 size={20} />}
              maxDropdownHeight={300}
              className={classes.gameSelect}
              data={userGames.map((game: any) => ({
                value: game.gameId,
                label: game.title,
              }))}
              scrollAreaProps={{
                type: "auto",
                scrollbarSize: 16,
                scrollbars: "y",
                color: "black",
                classNames: { scrollbar: classes.scrollBar },
              }}
              size="md"
              label="Game"
              description="Choose a game from your library"
              placeholder="(e.g. God of War)"
              value={selectedGameId}
              onChange={(value, option) => {
                setSelectedGameId(value || "");
                setSelectedGameName(option?.label || "");

                const selectedGame = userGames.find(
                  (game) => game.gameId === value,
                );

                setGameCover(selectedGame?.coverImage || "");
              }}
              searchable
              required
            />
          )}

          <Select
            className={classes.entrySelect}
            leftSection={<LibraryBig size={20} />}
            size="md"
            required
            label="Entry Type"
            description="Choose the kind of experience you're documenting"
            placeholder="Select an entry type"
            data={[
              "First Impressions",
              "Progress Milestone",
              "Reflection",
              "Story Reaction",
              "Build & Strategy",
              "Game Completion",
              "Review",
            ]}
            value={entryType}
            onChange={(value) => setEntryType(value || "")}
            searchable
          />
        </div>

        <TextInput
          size="md"
          label="Title"
          description="Give this entry a short memorable title"
          placeholder="(e.g. Defeated Malenia After 20 Attempts)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          leftSection={<Captions size={18} />}
          required
        />

        <Textarea
          className={classes.textInput}
          size="md"
          minRows={3}
          autosize
          required
          label="Journal Entry"
          description="Write about what happened, how you felt, or what stood out during your session"
          placeholder="Today I finally defeated the final boss after upgrading my build and learning the attack patterns..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginTop: "1rem" }}
        />

        <Stack gap="sm">
          <Stack gap={1}>
            <Text fw={600}>Tags</Text>
            <Text size="sm" c="dimmed">
              Choose the topics covered in this entry.
            </Text>
          </Stack>

          <div className={classes.tagStack}>
            {TAG_CATEGORIES.map((category) => (
              <Stack key={category.title} gap="sm">
                <Text fw={500} c={category.color}>
                  {category.title}
                </Text>

                <Group gap="xs" mb="md">
                  {category.tags.map((tag) => (
                    <Chip
                      color={category.color}
                      key={tag}
                      checked={tags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    >
                      {tag}
                    </Chip>
                  ))}
                </Group>
              </Stack>
            ))}
          </div>

          {/* Custom Tags */}
          <Stack gap="sm">
            <Stack gap={1}>
              <Text fw={500} c="gray">
                Custom Tag
              </Text>

              <Text size="xs" c="dimmed">
                Add a tag that isn't included in the predefined categories.
              </Text>
            </Stack>

            <Group align="flex-end" gap="xs">
              <TextInput
                flex={1}
                size="sm"
                placeholder="Create your own tag..."
                value={customTag}
                onChange={(event) => setCustomTag(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomTag();
                  }
                }}
              />

              <Button
                size="sm"
                variant="filled"
                onClick={addCustomTag}
                disabled={!customTag.trim()}
              >
                Add Tag
              </Button>
            </Group>
          </Stack>

          <Text fw={500}>Selected Tags:</Text>

          <Group gap="xs">
            {tags.length === 0 ? (
              <Text c="dimmed">No tags selected</Text>
            ) : (
              tags.map((tag) => (
                <Pill
                  key={tag}
                  color="blue"
                  variant="light"
                  size="lg"
                  fw={500}
                  withRemoveButton
                  onRemove={() =>
                    setTags((current) => current.filter((t) => t !== tag))
                  }
                >
                  {tag}
                </Pill>
              ))
            )}
          </Group>
        </Stack>

        <Divider c="#4c4c4c" />

        <div className={classes.buttonGroup}>
          <Button
            className={classes.cancelButton}
            color="#cf1b1b"
            size="md"
            variant="filled"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className={classes.logButton}
            variant="filled"
            fullWidth
            color="#009c10"
            leftSection={<NotebookPen size={20} />}
            size="md"
            disabled={!selectedGameId || !content || !title}
            onClick={() => {
              handleSubmit();
            }}
          >
            {entry ? "Update" : "Create"}
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
