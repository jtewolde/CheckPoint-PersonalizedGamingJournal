"use client";

import { useState, useEffect } from "react";
import { Modal, Text, LoadingOverlay, Stack } from "@mantine/core";

import { PlaySession } from "@/app/types/PlaySession";
import PlaySessionCard from "@/components/Cards/SessionCard/SessionCard";

import classes from "./SessionDayModal.module.css";

// Define the props for the SessionDayModal component
type SessionDayModalProps = {
  opened: boolean;
  onClose: () => void;
  selectedDate: string | null;
  sessions: PlaySession[];
  onEditSession?: (session: PlaySession) => void; // Callback for when a session is selected for editing
};

export default function SessionDayModal({
  opened,
  onClose,
  selectedDate,
  sessions,
}: SessionDayModalProps) {
  const [loading, setLoading] = useState(false);
  const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions);

  // Sync localSessions with sessions prop whenever it changes
  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  // Get sessions for selected date to display in modal
  const sessionsForDate = localSessions;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={"Play Sessions on " + (selectedDate || "No Date Selected")}
      styles={{
        title: {
          fontFamily: "Barlow",
          fontSize: "18px",
          fontWeight: "600",
        },
        header: {
          marginBottom: "0.5rem",
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
        {sessionsForDate.length === 0 && <Text c="dimmed">No sessions</Text>}

        {sessionsForDate.map((s) => {
          return (
            <div key={s._id} className={classes.cardsWrapper}>
              <PlaySessionCard session={s} variant="compact" />
            </div>
          );
        })}
      </Stack>
    </Modal>
  );
}
