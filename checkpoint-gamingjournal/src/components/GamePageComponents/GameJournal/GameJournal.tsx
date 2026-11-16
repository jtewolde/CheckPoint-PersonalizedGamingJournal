"use client";

import { useMemo } from "react";

import {
  Stack,
  Text,
  Title,
  EmptyState,
  SimpleGrid,
  Paper,
} from "@mantine/core";
import { Gamepad } from "lucide-react";

import JournalCalendar from "@/components/ActivityComponents/JournalCalendar/JournalCalendar";
import JournalEntryCard from "@/components/Cards/JournalEntryCard/EntryCard";

import classes from "./GameJournal.module.css";

interface GameJournalProps {
  game: any;
  entries: any[];
}

export default function GameJournal({ game, entries = [] }: GameJournalProps) {
  // Sort entries from newest to oldest
  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) =>
        new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime(),
    );
  }, [entries]);

  // Get the three most recent entries
  const recentEntries = useMemo(() => {
    return sortedEntries.slice(0, 3);
  }, [sortedEntries]);

  // Calculate journal statistics for days logged, total entries, and last entry date
  const journalStats = useMemo(() => {
    const uniqueDays = new Set(
      entries
        .map((entry) => new Date(entry.displayDate))
        .filter((date) => !isNaN(date.getTime()))
        .map((date) => date.toDateString()),
    );

    const latestEntry = sortedEntries[0];

    const lastEntryDate = latestEntry
      ? new Date(latestEntry.displayDate)
      : null;

    return {
      totalEntries: entries.length,
      daysLogged: uniqueDays.size,
      lastEntry:
        lastEntryDate && !isNaN(lastEntryDate.getTime())
          ? lastEntryDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
    };
  }, [entries, sortedEntries]);

  return (
    <div className={classes.wrapper}>
      {/* Journal Overview */}
      <div className={classes.overviewContainer}>
        <Stack gap={4} mb="lg">
          <Title order={3} ff="Inter">
            Your Gaming Journal
          </Title>
          <Text size="sm" c="dimmed">
            Keep track of your gaming experiences, milestones, and memories.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
          <Paper withBorder radius="md" p="md">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Total Entries
              </Text>
              <Title order={2}>{journalStats.totalEntries}</Title>
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Days Logged
              </Text>
              <Title order={2}>{journalStats.daysLogged}</Title>
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Last Entry
              </Text>
              <Title order={3}>{journalStats.lastEntry}</Title>
            </Stack>
          </Paper>
        </SimpleGrid>
      </div>

      {/* Calendar and Recent Entries */}
      {entries.length > 0 ? (
        <SimpleGrid cols={{ base: 1, md: 1 }} spacing="xl">
          {/* Journal Calendar */}
          <div className={classes.calendarContainer}>
            <Title order={3} className={classes.sectionTitle}>
              Journal Calendar
            </Title>

            <div className={classes.calendarWrapper}>
              <JournalCalendar
                className={classes.calendar}
                entries={entries}
                displayCover={false}
                variant="full"
                fullWidth={true}
              />
            </div>
          </div>
        </SimpleGrid>
      ) : (
        <div className={classes.emptyStateContainer}>
          <EmptyState
            icon={<Gamepad />}
            size="md"
            withIndicatorBackground
            title="No journal entries yet"
            description="Create your first journal entry to start documenting your gaming journey."
          />
        </div>
      )}
    </div>
  );
}
