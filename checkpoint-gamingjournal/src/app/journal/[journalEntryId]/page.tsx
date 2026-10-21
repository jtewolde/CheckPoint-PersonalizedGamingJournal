"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import {
  Text,
  Badge,
  Group,
  Button,
  Image,
  Divider,
  ActionIcon,
  Tooltip,
  Paper,
  Stack,
  Box,
  Skeleton,
} from "@mantine/core";
import toast from "react-hot-toast";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import JournalEntryModal from "@/components/Modals/JournalEntryModal/EntryModal";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import classes from "./viewJournal.module.css";

export default function ViewJournalEntry() {
  const { journalEntryId } = useParams<{ journalEntryId: string }>();
  const [entry, setEntry] = useState<any>(null);

  const [entryModalOpened, { open: openEntryModal, close: closeEntryModal }] =
    useDisclosure(false);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const fetchEntry = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("bearer_token");

        const res = await fetch(`/api/journal/${journalEntryId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch journal entry");
        }

        const data = await res.json();

        if (!cancelled) {
          setEntry(data.entry);
        }
      } catch (error) {
        if (!cancelled) {
          setEntry(null);
          toast.error("Unable to load journal entry");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (journalEntryId) {
      fetchEntry();
    }

    return () => {
      cancelled = true;
    };
  }, [journalEntryId]);

  const deleteJournalEntry = async (entryId: string, gameID: string) => {
    try {
      setDeleting(true);

      const res = await fetch(`/api/journal/${entryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          journalEntryId: entryId,
          gameID,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete journal entry");
      }

      toast.success("Journal entry deleted successfully");
      router.push("/journal");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Unable to delete journal entry");
      setDeleting(false);
    }
  };

  if (loading) {
    return <GlobalLoader visible={loading} />;
  }

  if (!entry) {
    return (
      <div className={classes.wrapper}>
        <Paper className={classes.emptyState} radius="lg" p="xl">
          <BookOpen size={36} />
          <Text fw={700} size="xl" mt="md">
            Journal entry not found
          </Text>
          <Text c="dimmed" ta="center" mt="xs">
            This entry may have been deleted or is no longer available.
          </Text>
          <Button
            mt="lg"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => router.push("/journal")}
          >
            Back to Journal
          </Button>
        </Paper>
      </div>
    );
  }

  const coverImage = entry.coverImage
    ? `https:${entry.coverImage.replace("t_thumb", "t_1080p")}`
    : "/no-cover-image.png";

  return (
    <div className={classes.wrapper}>
      <main className={classes.entryContainer}>
        {/* Top navigation and actions */}
        <Group justify="space-between" className={classes.toolbar}>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<ArrowLeft size={18} />}
            onClick={() => router.back()}
          >
            Back
          </Button>

          <Group gap="sm">
            <Tooltip label="Edit Journal Entry">
              <ActionIcon
                variant="light"
                color="blue"
                size="xl"
                radius="md"
                aria-label="Edit journal entry"
                onClick={openEntryModal}
              >
                <Pencil size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Delete Journal Entry">
              <ActionIcon
                variant="light"
                color="red"
                size="xl"
                radius="md"
                aria-label="Delete journal entry"
                loading={deleting}
                disabled={deleting}
                onClick={() => deleteJournalEntry(entry._id, entry.gameId)}
              >
                <Trash2 size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <JournalEntryModal
          opened={entryModalOpened}
          onClose={closeEntryModal}
          entry={entry}
          onEntryCreated={() => {
            closeEntryModal();
            router.refresh();
          }}
        />

        {/* Entry header */}
        <Paper className={classes.headerCard} radius="lg" p="md">
          <div className={classes.header}>
            <div className={classes.coverWrapper}>
              <Image
                src={coverImage}
                alt={`${entry.gameName} cover`}
                className={classes.coverImage}
                fit="cover"
              />
            </div>

            <div className={classes.headerContent}>
              <Text className={classes.eyebrow}>JOURNAL ENTRY</Text>

              <Text className={classes.gameName}>{entry.gameName}</Text>

              <Text className={classes.title}>{entry.title}</Text>

              <Group gap="xs" className={classes.metadata}>
                <CalendarDays size={15} />
                <Text size="sm">{entry.displayDate}</Text>

                {entry.entryType && (
                  <>
                    <span className={classes.metadataDot}>•</span>
                    <Text size="sm">{entry.entryType}</Text>
                  </>
                )}
              </Group>

              {entry.tags?.length > 0 && (
                <Group gap={8} mt="md" className={classes.tagsContainer}>
                  {entry.tags.map((tag: string, index: number) => (
                    <Badge
                      key={`${tag}-${index}`}
                      variant="light"
                      color="violet"
                      radius="sm"
                      size="md"
                    >
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </div>
          </div>
        </Paper>

        <Divider className={classes.divider} />

        {/* Full journal entry */}
        <Paper
          component="article"
          className={classes.contentCard}
          radius="lg"
          p="xl"
        >
          <Group gap="sm" mb="lg">
            <Box className={classes.contentIcon}>
              <BookOpen size={20} />
            </Box>

            <div>
              <Text fw={700} size="lg">
                Journal Entry
              </Text>
              <Text size="xs" c="dimmed">
                Your thoughts and experiences
              </Text>
            </div>
          </Group>

          <Text className={classes.content}>{entry.content}</Text>
        </Paper>
      </main>
    </div>
  );
}
