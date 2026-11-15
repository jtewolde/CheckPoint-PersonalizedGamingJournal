"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@mantine/dates";
import { MonthView, ScheduleEventData } from "@mantine/schedule";
import { Image } from "@mantine/core";

import JournalEntryModal from "../../Modals/JournalEntryModal/EntryModal";
import JournalDayModal from "../JournalDayModal/JournalDayModal";
import { JournalEntry } from "@/app/types/JournalEntry";
import { entryTypeColors } from "@/hooks/getEntryTypeColors";

import classes from "./JournalCalendar.module.css";

interface JournalCalendarProps {
  entries: JournalEntry[];
  className?: string;
  displayCover?: boolean;
  fullWidth?: boolean;
  variant?: "compact" | "full";
}

interface JournalEventPayload {
  entryId: string;
  coverImage?: string;
}

export default function JournalCalendar({
  entries,
  className,
  displayCover = true,
  fullWidth = true,
  variant = "full",
}: JournalCalendarProps) {
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(entries);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [opened, setOpened] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Convert a Date into a local calendar date.
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Get the local calendar date for a journal entry.
  const getEntryDate = (entry: JournalEntry) => {
    return normalizeDate(new Date(entry.createdAt));
  };

  // Convert a calendar date into YYYY-MM-DD.
  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Get the YYYY-MM-DD key for a journal entry.
  const getEntryDateKey = (entry: JournalEntry) => {
    return getDateKey(getEntryDate(entry));
  };

  // Convert journal entries into calendar events.
  const calendarEvents: ScheduleEventData<JournalEventPayload>[] =
    localEntries.map((entry) => {
      const entryDate = getEntryDate(entry);
      const dateKey = getDateKey(entryDate);

      // End date is the beginning of the following day.
      const endDate = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate() + 1,
      );

      const endDateKey = getDateKey(endDate);

      return {
        id: entry._id,
        title: entry.title || "Journal Entry",
        start: `${dateKey} 00:00:00`,
        end: `${endDateKey} 00:00:00`,
        color: entryTypeColors[entry.entryType],
        payload: {
          entryId: entry._id,
          coverImage: entry.coverImage,
        },
      };
    });

  // Get the entries for the currently selected calendar day.
  const entriesForDate = selectedDate
    ? localEntries.filter(
        (entry) => getEntryDateKey(entry) === getDateKey(selectedDate),
      )
    : [];

  // Open the calendar to the month containing the latest entry
  const latestMonth =
    localEntries.length > 0
      ? localEntries.reduce((latest, entry) => {
          const entryDate = getEntryDate(entry);

          return entryDate > latest ? entryDate : latest;
        }, getEntryDate(localEntries[0]))
      : new Date();

  // Initialize the calendar to the month containing the latest entry.
  const [calendarDate, setCalendarDate] = useState<string>(
    getDateKey(latestMonth),
  );

  // Handle clicking a calendar day.
  //
  // The date comes directly from Mantine's renderDay dateString,
  // which guarantees that the date we display is the date we select.
  const handleDayClick = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);

    const clickedDate = new Date(year, month - 1, day);

    setSelectedDate(clickedDate);
    setOpened(true);
  };

  return (
    <>
      <div
        className={`${classes.calendarWrapper} ${
          classes[variant]
        } ${className ?? ""}`}
        style={{
          width: fullWidth ? "100%" : "auto",
        }}
      >
        <MonthView
          date={calendarDate}
          onDateChange={(value) => setCalendarDate(value)}
          events={calendarEvents}
          className={classes.calendarRoot}
          classNames={{
            monthViewWeek: classes.week,
            monthViewWeekday: classes.weekday,
            monthViewDay: classes.dayCell,
            monthViewDayLabel: classes.dayNumber,
            monthViewEvents: classes.events,
          }}
          previousControlProps={{
            className: classes.headerNavButton,
            "aria-label": "Previous month",
          }}
          nextControlProps={{
            className: classes.headerNavButton,
            "aria-label": "Next month",
          }}
          todayControlProps={{
            className: classes.todayButton,
          }}
          firstDayOfWeek={0}
          weekdayFormat="ddd"
          highlightToday
          maxEventsPerDay={1}
          consistentWeeks
          getDayProps={(dateString) => ({
            disabled: dateString > getDateKey(new Date()),
          })}
          viewSelectProps={{
            views: [],
          }}
          onDayClick={handleDayClick}
          onEventClick={(event) => {
            handleDayClick(String(event.start).slice(0, 10));
          }}
        />
      </div>

      <JournalEntryModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedEntry(null);
        }}
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
        onClose={() => {
          setOpened(false);
          setSelectedDate(null);
        }}
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
