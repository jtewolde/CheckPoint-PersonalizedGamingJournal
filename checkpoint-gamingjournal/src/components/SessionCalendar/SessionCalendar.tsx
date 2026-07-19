'use client'

import { useState, useEffect } from "react";
import { formatDate, isSameDay } from "@/utils/dateUtils";

import PlaySessionModal from "../PlaySessionModal/SessionModal";
import SessionDayModal from "../SessionDayModal/SessionDayModal";

import { Calendar } from "@mantine/dates"
import { Indicator } from "@mantine/core";
import classes from "./SessionCalendar.module.css";

// Define the playSession object used on both calendar and modal with props
type PlaySession = {
    _id: string
    gameId: string
    gameName: string
    date: string
    duration: number
    notes: string
    sessionType: string[]
    mood?: string[]
    platform?: string
}

export default function SessionCalendar({ gameId, sessions }: { gameId: string, sessions: PlaySession[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions)

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlaySession | null>(null);

  const [opened, setOpened] = useState(false)
  const [loading, setLoading] = useState(false);

  // Sync up current play sessions of game when parent changes
  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  // Get sessions for selected date
  const sessionsForDate = selectedDate
    ? localSessions.filter(
        (s) =>
          isSameDay(s.date, selectedDate)
      )
    : []

  return (
    <>
      <Calendar
        fullWidth
        highlightToday={true}
        withCellSpacing
        maxDate={new Date()}
        getDayProps={(date) => ({
          onClick: () => {
            setSelectedDate(date)
            setOpened(true)
          }
        })}
        renderDay={(dateString) => {
          const [year, month, day] = dateString.split('-').map(Number);
          const date = new Date(year, month - 1, day); // local date, no UTC shift

          const hasSession = localSessions.some(
            (s) =>
              isSameDay(s.date, date)
          )

          return hasSession ? (
            <div className={classes.daySession}>
              <Indicator size={15} color="green">
                <div>{date.getDate()}</div>
              </Indicator>
            </div>
          ) : (
            <div>{date.getDate()}</div>
          )
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
          setLocalSessions(prev =>
            prev.map(s =>
              s._id === updatedSession._id ? updatedSession : s
            )
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

          setOpened(false)
        }}
      />

    </>
  )
}