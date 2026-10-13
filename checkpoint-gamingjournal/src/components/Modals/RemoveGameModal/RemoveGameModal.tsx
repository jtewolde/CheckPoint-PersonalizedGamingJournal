"use client";

import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

import GameCard from "../../Cards/GameCard/GameCard";

import {
  Modal,
  Text,
  Stack,
  Group,
  Button,
  SimpleGrid,
  Divider,
  ScrollArea,
} from "@mantine/core";

import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import classes from "./RemoveGameModal.module.css";

// Define the props for the RemoveGameModal component
interface RemoveGameModalProps {
  opened: boolean;
  onClose: () => void;
  libraryGames?: any[];
  onSuccess?: () => void;
}

export default function RemoveGameModal({
  opened,
  onClose,
  libraryGames,
  onSuccess,
}: RemoveGameModalProps) {
  const [removing, setRemoving] = useState(false);
  const isMobile = useMediaQuery("(max-width: 646px)");
  const [selectedGame, setSelectedGame] = useState<any | null>(null);

  // Function to handle removing the game from the user's library
  const handleRemoveFromLibrary = async () => {
    if (!selectedGame || removing) return;

    setRemoving(true);

    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve the Bearer token from localStorage
      const res = await fetch(`/api/library/${selectedGame.gameId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove game from library");
      }

      onSuccess?.();
      toast.error("Game removed from your library!");
    } catch (error) {
      console.error("Error removing game from library:", error);
      toast.error("Failed to remove game from your library. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      radius="md"
      closeOnClickOutside={!removing}
      closeOnEscape={!removing}
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
                Select Games to Remove
              </Modal.Title>
            </Group>

            <Text size="xs" c="white">
              Choose which games you want to delete from your collection
            </Text>
          </Stack>
          <Modal.CloseButton disabled={removing} />
        </Modal.Header>

        <Modal.Body p={isMobile ? "sm" : "md"}>
          <ScrollArea h={isMobile ? 400 : 450} scrollbars="y">
            <SimpleGrid
              cols={isMobile ? 2 : 4}
              spacing="md"
              p={isMobile ? "sm" : "md"}
            >
              {libraryGames?.map((game) => (
                <GameCard
                  variant="remove"
                  key={game._id}
                  game={{
                    id: game.gameId,
                    name: game.title,
                    cover: { url: game.coverImage },
                    genres: game.genre,
                  }}
                  libraryGame={game}
                  onRemoveFromLibrary={() => setSelectedGame(game)}
                  selectable
                  selected={selectedGame?._id === game._id}
                  onSelect={() =>
                    setSelectedGame((current: any | null) =>
                      current?._id === game._id ? null : game,
                    )
                  }
                />
              ))}
            </SimpleGrid>
          </ScrollArea>
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
            color="#de4545"
            size="md"
            leftSection={<Trash2 size={18} />}
            onClick={handleRemoveFromLibrary}
            disabled={!selectedGame || removing}
            loading={removing}
          >
            Remove
          </Button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
