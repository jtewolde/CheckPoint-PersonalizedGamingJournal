"use client";

import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

import GameCard from "../../Cards/GameCard/GameCard";

import {
  Modal,
  Text,
  Stack,
  Group,
  Button,
  SimpleGrid,
  ScrollArea,
  TextInput,
  Center,
} from "@mantine/core";

import { Search, Gamepad2, ArrowRight } from "lucide-react";

import classes from "./FindGameModal.module.css";

// Replace any with your LibraryGame type when available.
type LibraryGame = any;

interface FindGameModalProps {
  opened: boolean;
  onClose: () => void;
  libraryGames?: LibraryGame[];
  onSelect: (game: LibraryGame) => void;
  title?: string;
  description?: string;
  actionLabel?: string;
}

export default function FindGameModal({
  opened,
  onClose,
  libraryGames = [],
  onSelect,
  title = "Select a Game",
  description = "Find and select a game from your library to continue.",
  actionLabel = "Continue",
}: FindGameModalProps) {
  const isMobile = useMediaQuery("(max-width: 48em)");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<LibraryGame | null>(null);

  // Reset the modal whenever it opens.
  useEffect(() => {
    if (opened) {
      setSearchQuery("");
      setSelectedGame(null);
    }
  }, [opened]);

  // Filter the user's library by game title.
  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return libraryGames;

    return libraryGames.filter((game) =>
      (game.title ?? "").toLowerCase().includes(query),
    );
  }, [libraryGames, searchQuery]);

  const handleContinue = () => {
    if (!selectedGame) return;

    onSelect(selectedGame);
    onClose();
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      radius="md"
    >
      <Modal.Overlay />

      <Modal.Content>
        <Modal.Header>
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="sm" align="center">
              <Modal.Title
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "Inter",
                }}
              >
                {title}
              </Modal.Title>
            </Group>

            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </Stack>

          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body p={isMobile ? "sm" : "md"}>
          <Stack gap="md">
            {/* Search */}
            <TextInput
              placeholder="Search your library..."
              leftSection={<Search size={17} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              aria-label="Search games in your library"
              radius="md"
              size="md"
            />

            {/* Game results */}
            <ScrollArea
              h={isMobile ? 400 : 450}
              scrollbars="y"
              offsetScrollbars
            >
              {filteredGames.length > 0 ? (
                <SimpleGrid
                  cols={isMobile ? 2 : 4}
                  spacing="md"
                  p={isMobile ? "xs" : "sm"}
                >
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game._id}
                      variant="select"
                      game={{
                        id: game.gameId,
                        name: game.title,
                        cover: { url: game.coverImage },
                        genres: game.genre,
                      }}
                      libraryGame={game}
                      selectable
                      selected={selectedGame?._id === game._id}
                      onSelect={() =>
                        setSelectedGame((current: LibraryGame | null) =>
                          current?._id === game._id ? null : game,
                        )
                      }
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Center mih={220}>
                  <Stack align="center" gap="xs">
                    <Gamepad2 size={32} color="var(--mantine-color-dimmed)" />

                    <Text fw={600} size="sm">
                      {libraryGames.length === 0
                        ? "Your library is empty"
                        : "No games found"}
                    </Text>

                    <Text size="xs" c="dimmed" ta="center">
                      {libraryGames.length === 0
                        ? "Add a game to your library before continuing."
                        : "Try searching with a different game title."}
                    </Text>
                  </Stack>
                </Center>
              )}
            </ScrollArea>
          </Stack>
        </Modal.Body>

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
            rightSection={<ArrowRight size={18} />}
            onClick={handleContinue}
            disabled={!selectedGame}
          >
            {actionLabel}
          </Button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
