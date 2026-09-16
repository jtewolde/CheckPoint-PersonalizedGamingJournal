"use client";

import { useState, useEffect } from "react";
import { Modal, Text, LoadingOverlay, Stack } from "@mantine/core";

import JournalEntryCard from "@/components/Cards/JournalEntryCard/EntryCard";
import { JournalEntry } from "@/app/types/JournalEntry";

import classes from "./EntryDayModal.module.css";

// Define the props for the EntryDayModal component
type EntryDayModalProps = {
  opened: boolean;
  onClose: () => void;
  selectedDate: string | null;
  entries: JournalEntry[];
  onEditEntry?: (entry: JournalEntry) => void; // Callback for when an entry is selected for editing
};

export default function JournalDayModal({
  opened,
  onClose,
  selectedDate,
  entries,
}: EntryDayModalProps) {
  const [loading, setLoading] = useState(false);
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(entries);

  // Sync localEntries with entries prop whenever it changes
  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Get sessions for selected date to display in modal
  const entriesForDate = localEntries;

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
        {entriesForDate.length === 0 && <Text c="dimmed">No sessions</Text>}

        {entriesForDate.map((entry) => {
          return (
            <div key={entry._id} className={classes.cardsWrapper}>
              <JournalEntryCard
                key={entry._id}
                entry={entry}
                variant="journal"
                color="#7c18ed"
              />
            </div>
          );
        })}
      </Stack>
    </Modal>
  );
}
