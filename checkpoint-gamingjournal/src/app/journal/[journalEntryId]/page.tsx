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
} from "@mantine/core";
import toast from "react-hot-toast";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import JournalEntryModal from "@/components/JournalEntryModal/EntryModal";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import classes from "./viewJournal.module.css";

export default function ViewJournalEntry() {
  const { journalEntryId } = useParams();
  const [entry, setEntry] = useState<any>(null);
  const [entryModalOpened, { open: openEntryModal, close: closeEntryModal }] =
    useDisclosure(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the data for the specific journal entry
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const res = await fetch(`/api/journal/${journalEntryId}`, {
          headers: { Authorization: `Bearer ${token}` },
          method: "GET",
        });

        if (!res.ok) throw new Error("Failed to fetch entry");
        const data = await res.json();
        console.log("Journal Entry: ", data);
        setEntry(data.entry);
      } catch (err) {
        setEntry(null);
      } finally {
        setLoading(false);
      }
    };
    if (journalEntryId) fetchEntry();
  }, [journalEntryId]);

  // Function to delete a journal entry
  const deleteJournalEntry = async (journalEntryId: string, gameID: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/journal/${journalEntryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({ journalEntryId, gameID }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete journal entry");
      }

      console.log("Journal entry deleted successfully:", data.message);
      toast.success("Journal entry deleted successfully");
      router.push("/journal");
    } catch (error) {
      setLoading(false);
      console.error("Error deleting journal entry:", error);
      toast.error("Error deleting journal entry");
    }
  };

  // Render Global Loader while fetching journal entry data
  if (loading) {
    return <GlobalLoader visible={loading} />;
  }

  return (
    <div className={classes.wrapper}>
      <main className={classes.entryContainer}>
        {/* Navigation + Actions */}
        <Group justify="space-between" className={classes.toolbar}>
          <Button
            variant="outline"
            leftSection={<ArrowLeft size={18} />}
            onClick={() => router.back()}
          >
            Back to Journal
          </Button>

          <JournalEntryModal
            opened={entryModalOpened}
            onClose={closeEntryModal}
            entry={{
              _id: entry._id,
              gameId: entry.gameId,
              gameName: entry.gameName,
              coverImage: entry.coverImage,
              title: entry.title,
              content: entry.content,
              entryType: entry.entryType ?? "",
              tags: entry.tags ?? [],
            }}
            onEntryCreated={() => {
              closeEntryModal();
              router.refresh();
            }}
          />

          <Group gap="xs">
            <Tooltip label="Edit">
              <ActionIcon
                variant="light"
                color="blue"
                size="xl"
                onClick={openEntryModal}
              >
                <Pencil size={27} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Delete">
              <ActionIcon
                variant="light"
                color="red"
                size="xl"
                onClick={() => deleteJournalEntry(entry._id, entry.gameId)}
              >
                <Trash2 size={27} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Entry Header */}
        <header className={classes.header}>
          <div className={classes.headerContent}>
            <Text className={classes.gameName}>{entry.gameName}</Text>

            <Text className={classes.title}>{entry.title}</Text>

            <Group gap="xs" className={classes.metadata}>
              <Text>{entry.displayDate}</Text>

              {entry.entryType && (
                <>
                  <Text>•</Text>
                  <Text>{entry.entryType}</Text>
                </>
              )}
            </Group>

            {entry.tags?.length > 0 && (
              <Group gap="xs" mt="md" className={classes.tagsContainer}>
                {entry.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="light" radius="sm">
                    {tag}
                  </Badge>
                ))}
              </Group>
            )}
          </div>

          <div className={classes.coverWrapper}>
            <Image
              src={
                entry.coverImage
                  ? `https:${entry.coverImage.replace("t_thumb", "t_1080p")}`
                  : "/no-cover-image.png"
              }
              alt={entry.gameName}
              className={classes.coverImage}
              fit="cover"
            />
          </div>
        </header>

        <Divider my="lg" />

        {/* Journal Content */}
        <article className={classes.content}>{entry.content}</article>
      </main>
    </div>
  );
}
