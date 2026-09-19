"use client";

import { useMemo } from "react";

import { Stack, Text, Title, EmptyState, SimpleGrid } from "@mantine/core";
import { Gamepad } from "lucide-react";

import JournalCalendar from "@/components/ActivityComponents/JournalCalendar/JournalCalendar";
import JournalEntryCard from "@/components/Cards/JournalEntryCard/EntryCard";

import classes from "./GameJournal.module.css";

interface GameJournalProps {
  game: any;
  entries: any[];
}

export default function GameJournal({ game, entries = [] }: GameJournalProps) {
  // Get the most recent entries for the specific game
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort(
        (a, b) =>
          new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime(),
      )
      .slice(0, 2);
  }, [entries]);

  return (
    <div className={classes.wrapper}>
      {entries.length === 0 ? (
        <div className={classes.emptyStateContainer}>
          <EmptyState
            icon={<Gamepad />}
            size="lg"
            withIndicatorBackground
            title="No journal entries yet"
            description="Create journal entries to start building your journal for this game."
          />
        </div>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Calendar */}
          <div className={classes.calendarContainer}>
            <Title order={3} className={classes.sectionTitle}>
              Journal Calendar
            </Title>

            <div className={classes.calendarWrapper}>
              <JournalCalendar
                className={classes.calendar}
                entries={entries}
                displayCover={false}
              />
            </div>
          </div>

          {/* Recent Entries */}
          <div className={classes.recentEntriesContainer}>
            <div className={classes.sectionHeader}>
              <Title order={3} className={classes.sectionTitle}>
                Recent Entries
              </Title>

              <Text component="a" href={`/journal`} className={classes.viewAll}>
                View All
              </Text>
            </div>

            <Stack gap="md">
              {recentEntries.map((entry) => (
                <JournalEntryCard
                  key={entry._id}
                  entry={entry}
                  variant="compact"
                  color="#7c18ed"
                />
              ))}
            </Stack>
          </div>
        </SimpleGrid>
      )}
    </div>
  );
}
