"use client";

import { useState } from "react";

import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/navigation";

import {
  Badge,
  Text,
  Image,
  ActionIcon,
  Group,
  Menu,
  OverflowList,
  Spoiler,
} from "@mantine/core";

import { modals } from "@mantine/modals";

import PlaySessionModal from "../../Modals/PlaySessionModal/SessionModal";
import { PlaySession } from "@/app/types/PlaySession";

import {
  EllipsisVertical,
  Trash,
  Pencil,
  Eye,
  Timer,
  Calendar,
  Gamepad,
} from "lucide-react";

import PlaceHolderImage from "../../../../public/no-cover-image.png";

import { toast } from "react-toastify";

import classes from "./SessionCard.module.css";

// Dashboard = recent sessions section
// Sessions = full sessions page
// Compact = smaller session cards
type SessionCardVariant = "dashboard" | "sessions" | "compact";

// Define the props for the PlaySessionCard component
interface PlaySessionCardProps {
  session: PlaySession;
  variant?: SessionCardVariant;
  color?: string;
}

export default function PlaySessionCard({
  session,
  variant = "sessions",
  color,
}: PlaySessionCardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Determine the cover image URL or use a placeholder
  const coverImage = session.coverImage
    ? `https:${session.coverImage.replace("t_thumb", "t_1080p")}`
    : PlaceHolderImage.src;

  // Format session duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  // Format session date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Session types
  const sessionTypes =
    session.sessionType && session.sessionType.length > 0
      ? session.sessionType
      : ["Other"];

  // Confirmation modal to confirm session deletion
  const openDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation();

    modals.openConfirmModal({
      title: "Delete Play Session",
      centered: true,
      zIndex: 1000,

      children: (
        <Text size="md" mt="lg">
          Are you sure you want to delete this play session for{" "}
          <strong>{session.gameName}</strong>?
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

      styles: {
        title: {
          fontSize: "18px",
          fontWeight: 600,
          fontFamily: "Barlow",
        },
      },

      onConfirm: () => handleDeleteSession(session._id),
    });
  };

  // Delete play session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      setLoading(true);

      const toastID = toast.info("Deleting play session...");

      const token = localStorage.getItem("bearer_token");

      const res = await fetch(`/api/playSession/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete the play session");
      }

      toast.update(toastID, {
        render: "Play session deleted successfully",
        type: "success",
      });

      setLoading(false);

      router.refresh();
    } catch (error) {
      setLoading(false);

      console.error("Error removing play session:", error);

      toast.error("Failed to remove the play session. Please try again.");
    }
  };

  // View the individual session
  const handleViewSession = (e: React.MouseEvent) => {
    e.stopPropagation();

    router.push(`/sessions/${session._id}`);
  };

  // Navigate to the game's page
  const handleViewGame = (e: React.MouseEvent) => {
    e.stopPropagation();

    router.push(`/games/${session.gameId}`);
  };

  return (
    <>
      <div
        className={`${classes.sessionCard} ${
          variant === "dashboard"
            ? classes.dashboard
            : variant === "compact"
              ? classes.compact
              : classes.sessions
        }`}
        style={{
          borderLeft: `5px solid ${color || "#c7c7c7"}`,
        }}
      >
        {/* COVER IMAGE */}
        {variant === "sessions" && (
          <div className={classes.coverWrapper} onClick={handleViewGame}>
            <Image
              src={coverImage}
              alt={session.gameName}
              className={classes.coverImage}
              fit="cover"
            />
          </div>
        )}

        {/* CONTENT */}
        <div className={classes.header} onClick={(e) => e.stopPropagation()}>
          {/* TOP ROW */}
          <div className={classes.headerRow}>
            <Text className={classes.gameName} onClick={handleViewGame}>
              {session.gameName}
            </Text>

            {/* ACTION MENU */}
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
                  onClick={handleViewSession}
                >
                  View Session
                </Menu.Item>

                <Menu.Item
                  leftSection={<Gamepad size={20} />}
                  onClick={handleViewGame}
                >
                  View Game
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<Pencil size={20} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                >
                  Edit Session
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={<Trash size={20} />}
                  onClick={openDeleteModal}
                >
                  Delete Session
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          {/* DATE + DURATION */}
          <Group gap="md" wrap="wrap">
            <Group gap={5}>
              <Calendar size={15} />

              <Text className={classes.date}>{formatDate(session.date)}</Text>
            </Group>

            <Group gap={5}>
              <Timer size={15} />

              <Text className={classes.duration}>
                {formatDuration(session.duration)}
              </Text>
            </Group>

            {session.platform && (
              <Text className={classes.platform}>{session.platform}</Text>
            )}
          </Group>

          {/* SESSION TYPES */}
          <Group gap={5} wrap="wrap">
            <OverflowList
              data={sessionTypes}
              maxVisibleItems={isMobile ? 1 : 3}
              gap={5}
              renderItem={(type) => (
                <Badge
                  color="violet"
                  variant="light"
                  radius="md"
                  fw={500}
                  key={type}
                >
                  {type}
                </Badge>
              )}
              renderOverflow={(items) => (
                <Badge variant="default" color="gray" radius="md" fw={500}>
                  +{items.length}
                </Badge>
              )}
            />
          </Group>

          {/* NOTES PREVIEW */}
          {session.notes && (
            <Text component="div" className={classes.content}>
              <Spoiler maxHeight={40} showLabel="Show More" hideLabel="Hide">
                {session.notes}
              </Spoiler>
            </Text>
          )}
        </div>
      </div>

      {/* EDIT SESSION MODAL */}
      <PlaySessionModal
        opened={opened}
        onClose={close}
        gameId={session.gameId}
        gameName={session.gameName}
        session={session}
        onSuccess={() => {
          close();
          router.refresh();
        }}
      />
    </>
  );
}
