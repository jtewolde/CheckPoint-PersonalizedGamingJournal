"use client";

import { useState, useEffect } from "react";
import { formatDate, isSameDay } from "@/utils/dateUtils";

import PlaySessionModal from "../../Modals/PlaySessionModal/SessionModal";
import SessionDayModal from "../SessionDayModal/SessionDayModal";
import { PlaySession } from "@/app/types/PlaySession";

import { Calendar } from "@mantine/dates";
import { Image } from "@mantine/core";
import classes from "./SessionCalendar.module.css";

export default function SessionCalendar({
  gameId,
  gameCover,
  sessions,
}: {
  gameId: string;
  gameCover: string;
  sessions: PlaySession[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlaySession | null>(
    null,
  );

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync up current play sessions of game when parent changes
  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  // Get sessions for selected date
  const sessionsForDate = selectedDate
    ? localSessions.filter((s) => isSameDay(s.date, selectedDate))
    : [];

  return (
    <>
      <Calendar
        fullWidth
        maxDate={new Date()}
        getDayProps={(date) => ({
          onClick: () => {
            setSelectedDate(date);
            setOpened(true);
          },
        })}
        renderDay={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);
          const date = new Date(year, month - 1, day); // local date, no UTC shift

          const hasSession = localSessions.some((s) => isSameDay(s.date, date));

          return (
            <div className={classes.day}>
              <div className={classes.dayNumber}>{date.getDate()}</div>

              {hasSession && (
                <div className={classes.sessionIndicator}>
                  <Image src={gameCover} alt="" width={32} height={44} />
                </div>
              )}
            </div>
          );
        }}
      />

      <PlaySessionModal
        gameName={selectedSession?.gameName}
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedSession(null);
        }}
        gameId={gameId}
        session={selectedSession}
        onSuccess={(updatedSession) => {
          // update local state without refetch
          setLocalSessions((prev) =>
            prev.map((s) =>
              s._id === updatedSession._id ? updatedSession : s,
            ),
          );
        }}
      />

      <SessionDayModal
        opened={opened}
        onClose={() => setOpened(false)}
        selectedDate={selectedDate}
        sessions={sessionsForDate}
        onEditSession={(session) => {
          setSelectedSession(session);
          setEditModalOpened(true);

          setOpened(false);
        }}
      />
    </>
  );
}
