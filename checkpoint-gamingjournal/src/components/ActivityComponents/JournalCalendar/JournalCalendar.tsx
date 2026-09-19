"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@mantine/dates";
import { Image } from "@mantine/core";

import { isSameDay } from "@/utils/dateUtils";

import JournalEntryModal from "../../Modals/JournalEntryModal/EntryModal";
import JournalDayModal from "../JournalDayModal/JournalDayModal";
import { JournalEntry } from "@/app/types/JournalEntry";

import classes from "./JournalCalendar.module.css";

interface JournalCalendarProps {
  entries: JournalEntry[];
  className?: string;
  displayCover?: boolean;
  fullWidth?: boolean;
}

export default function JournalCalendar({
  entries,
  className,
  displayCover = true,
  fullWidth = true,
}: JournalCalendarProps) {
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(entries);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Get all of the journal entries on a specific date
  const entriesForDate = selectedDate
    ? localEntries.filter((entry) =>
        isSameDay(new Date(entry.displayDate), selectedDate),
      )
    : [];

  // Get the initial month where the entries for a specific game was created
  const initialMonth =
    localEntries.length > 0
      ? localEntries.reduce((earliest, entry) => {
          const entryDate = new Date(entry.displayDate);

          return entryDate < earliest ? entryDate : earliest;
        }, new Date(localEntries[0].displayDate))
      : new Date();

  return (
    <>
      <Calendar
        className={className}
        fullWidth={fullWidth}
        highlightToday={true}
        maxDate={new Date()}
        getDayProps={(date) => {
          const today = isSameDay(date, new Date());
          return {
            onClick: () => {
              setSelectedDate(date);
              setOpened(true);
            },
            className: today ? classes.today : undefined,
          };
        }}
        renderDay={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);
          const date = new Date(year, month - 1, day);

          const entriesForDay = localEntries.filter((entry) =>
            isSameDay(new Date(entry.displayDate), date),
          );

          return (
            <div className={classes.day}>
              <div className={classes.dayNumber}>{date.getDate()}</div>

              {entriesForDay.length > 0 && (
                <div className={classes.sessionActivity}>
                  {displayCover ? (
                    entriesForDay.map((entry) => (
                      <Image
                        key={entry._id}
                        src={entry?.coverImage}
                        alt=""
                        className={classes.sessionCover}
                      />
                    ))
                  ) : (
                    <div className={classes.sessionIndicator} />
                  )}
                </div>
              )}
            </div>
          );
        }}
      />

      <JournalEntryModal
        gameName={selectedEntry?.gameName}
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedEntry(null);
        }}
        gameId={selectedEntry?.gameId}
        entry={selectedEntry}
        onSuccess={(updatedEntry) => {
          setLocalEntries((prev) =>
            prev.map((entry) =>
              entry._id === updatedEntry._id
                ? { ...entry, ...updatedEntry }
                : entry,
            ),
          );
        }}
      />

      <JournalDayModal
        opened={opened}
        onClose={() => setOpened(false)}
        selectedDate={selectedDate}
        entries={entriesForDate}
        onEditEntry={(entry) => {
          setSelectedEntry(entry);
          setEditModalOpened(true);
          setOpened(false);
        }}
      />
    </>
  );
}
