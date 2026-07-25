"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useAuth } from "@/context/Authcontext";
import {
  Modal,
  Group,
  Stack,
  Button,
  Chip,
  Text,
  Paper,
  SimpleGrid,
  Image,
  Fieldset,
  Badge,
} from "@mantine/core";

import toast from "react-hot-toast";

import {
  Check,
  Pause,
  SaveAll,
  Star,
  Trophy,
  Play,
  PowerOff,
  Backpack,
} from "lucide-react";

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
  const [status, setStatus] = useState("Backlog");
  const [platform, setPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!opened) return;

    setStatus("Backlog");
    setPlatform(null);
  }, [opened]);

  // Define possible game statuses for the Select component in the Modal with descriptions for each status that the user can read
  const gameStatuses = [
    {
      value: "Playing",
      label: "Playing",
      description: "Currently playing and actively progressing in the game.",
      icon: <Play size={25} color="#1969b9" fill="#1969b9" />,
      color: "#1969b9",
    },
    {
      value: "Completed",
      label: "Completed",
      description:
        "Finished the main story or reached the game's primary ending",
      icon: <Check size={25} color="#27a01c" />,
      color: "#27a01c",
    },
    {
      value: "100%",
      label: "100% Complete",
      description:
        "Completed all major content, achievements, collectibles, and optional objectives",
      icon: <Trophy size={25} fill="yellow" color="yellow" />,
      color: "yellow",
    },
    {
      value: "On Hold",
      label: "On Hold",
      description: "Taking a break from the game with plans to return later.",
      icon: <Pause size={25} color="violet" fill="violet" />,
      color: "violet",
    },
    {
      value: "Dropped",
      label: "Dropped",
      description: "Stopped playing and do not currently plan to continue.",
      icon: <PowerOff size={25} color="red" />,
      color: "red",
    },
    {
      value: "Wishlist",
      label: "Wishlist",
      description: "Interested in playing this game in the future.",
      icon: (
        <Star size={25} color="rgb(231, 210, 20)" fill="rgb(231, 210, 20)" />
      ),
      color: "gold",
    },
    {
      value: "Backlog",
      label: "Backlog",
      description:
        "Own or intend to play this game, but not have started it yet.",
      icon: <Backpack size={25} color="#21eebe" />,
      color: "orange",
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
            platform: platform,

            coverImage: game.cover.url,
            releaseDate: game.first_release_date
              ? new Date(game.first_release_date * 1000).toLocaleDateString()
              : null,

            dateAdded: new Date().toLocaleDateString(),
            status: status,
            platinum: game.platinum,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success("Game added to your library!");

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
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Add to Library"
      styles={{
        title: {
          fontWeight: 700,
          fontFamily: "Inter",
          fontSize: "1.1rem",
          color: "white",
        },
        header: {
          borderBottom: "1px solid #a595b7",
        },
      }}
    >
      {isMobile ? (
        <Stack align="center" gap="md" mb="lg" mt="lg">
          <Image
            src={game?.cover?.url?.replace("t_thumb", "t_cover_big")}
            w={180}
            radius="md"
            className={classes.imageCover}
          />

          <Stack gap={6} flex={1}>
            <Group gap="lg" align="center">
              <Text fw={700} size="xl">
                {game.name}
              </Text>

              <Text size="lg" c="dimmed">
                {new Date(game.first_release_date * 1000).getFullYear()}
              </Text>
            </Group>

            <Text size="sm" c="dimmed" mb="sm">
              {game.summary}
            </Text>

            <Group gap={8}>
              {/* Modes */}
              <Group gap={6}>
                {game.game_modes?.map((mode: any) => (
                  <Badge key={mode.id} variant="light" radius="xl" fw={500}>
                    {mode.name}
                  </Badge>
                ))}
              </Group>

              {/* Genres */}
              <Group gap={6}>
                {game.genres?.map((genre: any) => (
                  <Badge key={genre.id} variant="light" radius="xl" fw={500}>
                    {genre.name}
                  </Badge>
                ))}
              </Group>
            </Group>
          </Stack>
        </Stack>
      ) : (
        <Group align="flex-start" wrap="nowrap" mb="lg" mt="md">
          <Image
            src={game?.cover?.url?.replace("t_thumb", "t_cover_big")}
            w={159}
            radius="md"
          />

          <Stack gap={6} flex={1}>
            <Group gap="lg" align="center">
              <Text fw={700} size="xl">
                {game.name}
              </Text>

              <Text size="lg" c="dimmed">
                {new Date(game.first_release_date * 1000).getFullYear()}
              </Text>
            </Group>

            <Text size="sm" c="dimmed" mb="sm">
              {game.summary}
            </Text>

            <Group gap={10}>
              {/* Modes */}
              <Group gap={6}>
                {game.game_modes?.map((mode: any) => (
                  <Badge
                    key={mode.id}
                    variant="light"
                    color="blue"
                    radius="xl"
                    fw={500}
                  >
                    {mode.name}
                  </Badge>
                ))}
              </Group>

              {/* Genres */}
              <Group gap={6}>
                {game.genres?.map((genre: any) => (
                  <Badge key={genre.id} variant="light" radius="xl" fw={500}>
                    {genre.name}
                  </Badge>
                ))}
              </Group>

              {/* Themes */}
            </Group>
          </Stack>
        </Group>
      )}
      <Fieldset
        legend="Platform Played On:"
        radius="lg"
        variant="filled"
        styles={{
          legend: {
            fontWeight: 500,
            fontSize: "18px",
          },
        }}
      >
        <Chip.Group
          value={platform}
          onChange={(value) => setPlatform(value as string)}
        >
          <Group gap="sm">
            {game?.platforms?.map((plat: any) => (
              <Chip
                key={plat.id}
                value={plat.name}
                radius="xl"
                variant="filled"
                size="md"
              >
                {plat.name}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Fieldset>

      <div className={classes.statusSection}>
        <Fieldset
          legend="Game Status:"
          radius="lg"
          variant="filled"
          styles={{ legend: { fontWeight: 500, fontSize: "18px" } }}
        >
          <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="sm">
            {gameStatuses.map((statusItem) => (
              <Paper
                key={statusItem.value}
                radius="md"
                withBorder
                onClick={() => setStatus(statusItem.value)}
                className={
                  status === statusItem.value
                    ? classes.selectedCard
                    : classes.card
                }
              >
                <Stack gap={3} align="center" justify="center" ta="center">
                  {statusItem.icon}
                  <div>
                    <Text className={classes.statusText}>
                      {statusItem.label}
                    </Text>
                  </div>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Fieldset>
      </div>

      <Button
        fullWidth
        size="md"
        radius="md"
        mt="md"
        loading={loading}
        leftSection={<SaveAll size={20} />}
        onClick={handleAddToLibrary}
      >
        Add to Library
      </Button>
    </Modal>
  );
}
