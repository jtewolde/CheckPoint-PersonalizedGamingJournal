"use client";

import { useEffect, useState } from "react";
import { isSameDay } from "@/utils/dateUtils";

import PlaySessionModal from "../../Modals/PlaySessionModal/SessionModal";
import SessionDayModal from "../SessionDayModal/SessionDayModal";
import { PlaySession } from "@/app/types/PlaySession";

import { Calendar } from "@mantine/dates";
import { Image } from "@mantine/core";
import classes from "./SessionCalendar.module.css";

interface SessionCalendarProps {
  sessions: PlaySession[];
  className?: string;
  displayCover?: boolean;
  gameCover?: string;
  fullWidth?: boolean;
}

export default function SessionCalendar({
  sessions,
  className,
  displayCover = true,
  gameCover,
  fullWidth = true,
}: SessionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlaySession | null>(
    null,
  );

  const [opened, setOpened] = useState(false);

  // Sync local sessions when parent changes
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
        className={className}
        fullWidth={fullWidth}
        maxDate={new Date()}
        getDayProps={(date) => ({
          onClick: () => {
            setSelectedDate(date);
            setOpened(true);
          },
        })}
        renderDay={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);
          const date = new Date(year, month - 1, day);

          const sessionsForDay = localSessions.filter((s) =>
            isSameDay(s.date, date),
          );

          return (
            <div className={classes.day}>
              <div className={classes.dayNumber}>{date.getDate()}</div>

              {sessionsForDay.length > 0 && (
                <div className={classes.sessionActivity}>
                  {displayCover ? (
                    sessionsForDay.map((session) => (
                      <Image
                        key={session._id}
                        src={session?.coverImage}
                        alt=""
                        width={24}
                        height={32}
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

      <PlaySessionModal
        gameName={selectedSession?.gameName}
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedSession(null);
        }}
        gameId={selectedSession?.gameId}
        session={selectedSession}
        onSuccess={(updatedSession) => {
          setLocalSessions((prev) =>
            prev.map((session) =>
              session._id === updatedSession._id ? updatedSession : session,
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
