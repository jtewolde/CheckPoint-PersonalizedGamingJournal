"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";
import {
  Badge,
  Text,
  Image,
  Tooltip,
  ActionIcon,
  Group,
  Stack,
  Menu,
  OverflowList,
} from "@mantine/core";
import { modals } from "@mantine/modals";

import { entryTypeColors } from "@/hooks/getEntryTypeColors";
import JournalEntryModal from "../JournalEntryModal/EntryModal";

import { EllipsisVertical, Trash, Pencil, Eye } from "lucide-react";

import PlaceHolderImage from "../../../public/no-cover-image.png";
import toast from "react-hot-toast";
import classes from "./EntryCard.module.css";

// Create type variable to determine which variant of entryCard, dashboard for recent entries section
// Journal for displaying journal entries on the page and compact for smaller cards
type EntryCardVariant = "dashboard" | "journal" | "compact";

// Define the entryCard component props that uses all of the attributes and variant of entryCard
interface JournalEntryCardProps {
  entry: {
    _id: string;
    uuid: string;
    gameId: string;
    gameName: string;
    coverImage?: string;
    title: string;
    content: string;
    entryType?: string;
    tags?: string[];
    displayDate?: string;
  };

  variant?: EntryCardVariant;
  color?: string;
}

export default function JournalEntryCard({
  entry,
  variant = "journal",
  color,
}: JournalEntryCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  // Determine the cover image URL or use a placeholder if not available
  const coverImage = entry.coverImage
    ? `https:${entry.coverImage.replace("t_thumb", "t_1080p")}`
    : PlaceHolderImage.src;

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Confirmation modal to confirm that the user wants to delete the selected journal entry
  const openDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation();

    modals.openConfirmModal({
      title: "Delete Journal Entry",
      centered: true,
      zIndex: 1000,

      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{entry.title}</strong>?
          <br />
          <br />
          This action cannot be undone.
        </Text>
      ),

      labels: {
        confirm: "Delete",
        cancel: "Cancel",
      },

      confirmProps: {
        color: "red",
        loading,
      },

      cancelProps: {
        variant: "default",
      },

      onConfirm: () => deleteJournalEntry(entry._id, entry.gameId),
    });
  };

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

      toast.success("Journal entry deleted");
      router.refresh();
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast.error("Error deleting journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${classes.entryCard} ${variant === "dashboard" ? classes.dashboard : variant === "compact" ? classes.compact : classes.journal}`}
      style={{ borderLeft: `5px solid ${color || "#c7c7c7"}` }}
    >
      {variant === "journal" && (
        <div className={classes.coverWrapper}>
          <Image
            src={coverImage}
            alt={entry.gameName}
            className={classes.coverImage}
            fit="cover"
          />
        </div>
      )}

      {/*CONTENT*/}
      <div className={classes.header} onClick={(e) => e.stopPropagation()}>
        {/* Top Meta */}
        <div className={classes.headerRow}>
          <Text className={classes.gameName}>{entry.gameName}</Text>

          <Menu shadow="md" width={180} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Item
                leftSection={<Eye size={20} />}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/journal/${entry._id}`);
                }}
              >
                View Entry
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                leftSection={<Pencil size={20} />}
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
              >
                Edit Entry
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<Trash size={20} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(e);
                }}
              >
                Delete Entry
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <JournalEntryModal
            opened={opened}
            onClose={close}
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
              close();
              router.push("/journal");
            }}
          />
        </div>

        {/*TITLE*/}
        <Text className={classes.title}>{entry.title}</Text>

        <Group gap={5} wrap="wrap">
          <Badge
            color={entryTypeColors[entry.entryType ?? "General"]}
            variant="light"
            radius="md"
            fw={500}
          >
            {entry.entryType}
          </Badge>

          <OverflowList
            data={entry.tags || []}
            maxVisibleItems={isMobile ? 1 : 2}
            gap={5}
            renderItem={(tag, index) => (
              <Badge
                color="white"
                radius="md"
                variant="default"
                fw={500}
                key={index}
                className={classes.metaBadge}
              >
                {tag}
              </Badge>
            )}
            renderOverflow={(items) => (
              <Badge variant="default" color="gray" radius="md" fw={500}>
                +{items.length}
              </Badge>
            )}
          />
        </Group>

        {/* PREVIEW TEXT */}
        <Text className={classes.content}>
          {entry.content.length > 500
            ? `${entry.content.slice(0, 800)}...`
            : entry.content}
        </Text>

        {/*FOOTER*/}
        <div className={classes.footer}>
          <Text className={classes.date}>{entry.displayDate}</Text>
        </div>
      </div>
    </div>
  );
}
