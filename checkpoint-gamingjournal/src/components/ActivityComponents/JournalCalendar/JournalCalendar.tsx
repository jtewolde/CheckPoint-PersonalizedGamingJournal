"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@mantine/dates";
import { Image } from "@mantine/core";

import { isSameDay } from "@/utils/dateUtils";

import JournalEntryModal from "../../Modals/JournalEntryModal/EntryModal";
import JournalDayModal from "../JournalDayModal/JournalDayModal";
import { JournalEntry } from "@/app/types/JournalEntry";

import { CircleCheck } from "lucide-react";
import classes from "./JournalCalendar.module.css";

interface JournalCalendarProps {
  entries: JournalEntry[];
  className?: string;
  displayCover?: boolean;
  fullWidth?: boolean;
  variant?: "compact" | "full";
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

  /*
   * Convert a Date into a local calendar date.
   *
   * This removes the time portion so that calendar comparisons
   * are based only on year/month/day.
   */
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  /*
   * Get the local calendar date for a journal entry.
   */
  const getEntryDate = (entry: JournalEntry) => {
    return normalizeDate(new Date(entry.createdAt));
  };

  /*
   * Convert a calendar date into YYYY-MM-DD.
   *
   * This is used as the single source of truth for matching
   * calendar cells to journal entries.
   */
  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Get the YYYY-MM-DD key for a journal entry.
   */
  const getEntryDateKey = (entry: JournalEntry) => {
    return getDateKey(getEntryDate(entry));
  };

  /*
   * Get the entries for the currently selected calendar day.
   */
  const entriesForDate = selectedDate
    ? localEntries.filter(
        (entry) => getEntryDateKey(entry) === getDateKey(selectedDate),
      )
    : [];

  /*
   * Open the calendar to the month containing the earliest entry.
   */
  const initialMonth =
    localEntries.length > 0
      ? localEntries.reduce((earliest, entry) => {
          const entryDate = getEntryDate(entry);

          return entryDate < earliest ? entryDate : earliest;
        }, getEntryDate(localEntries[0]))
      : new Date();

  /*
   * Handle clicking a calendar day.
   *
   * The date comes directly from Mantine's renderDay dateString,
   * which guarantees that the date we display is the date we select.
   */
  const handleDayClick = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);

    const clickedDate = new Date(year, month - 1, day);

    setSelectedDate(clickedDate);
    setOpened(true);
  };

  return (
    <>
      <Calendar
        className={`${classes.calendar} ${classes[variant]} ${className ?? ""}`}
        fullWidth={fullWidth}
        highlightToday
        defaultDate={initialMonth}
        headerControlsOrder={["previous", "level", "next"]}
        maxLevel="month"
        weekdayFormat="ddd"
        maxDate={new Date()}
        renderDay={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);

          // Exact date represented by this calendar cell
          const date = new Date(year, month - 1, day);

          // Use the exact dateString as the source of truth
          const dateKey = dateString;

          const entriesForDay = localEntries.filter(
            (entry) => getEntryDateKey(entry) === dateKey,
          );

          const today = getDateKey(new Date()) === dateKey;
          const hasEntry = entriesForDay.length > 0;

          const visibleEntries = entriesForDay.slice(0, 2);

          const remainingEntries = entriesForDay.length - visibleEntries.length;

          return (
            <div
              className={[
                classes.day,
                hasEntry ? classes.hasEntry : "",
                today ? classes.today : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleDayClick(dateString)}
            >
              <div className={classes.dayNumber}>{date.getDate()}</div>

              {entriesForDay.length > 0 && (
                <div className={classes.journalActivity}>
                  {displayCover ? (
                    <>
                      {visibleEntries.map((entry) => (
                        <Image
                          key={entry._id}
                          src={entry.coverImage}
                          alt=""
                          className={classes.journalCover}
                        />
                      ))}

                      {remainingEntries > 0 && (
                        <span className={classes.moreEntries}>
                          +{remainingEntries}
                        </span>
                      )}
                    </>
                  ) : (
                    <CircleCheck size={25} color="#b46bf4" />
                  )}
                </div>
              )}
            </div>
          );
        }}
        styles={{
          calendarHeader: {
            fontSize: "1.4rem",
            color: "white",
            fontFamily: "Inter",
          },

          weekday: {
            fontSize: "1rem",
            color: "white",
            fontFamily: "Inter",
          },

          day: {
            fontSize: "1rem",
            color: "white",
            fontFamily: "Inter",
          },
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
