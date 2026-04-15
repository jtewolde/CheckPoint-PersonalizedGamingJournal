'use client'

import { useState, useEffect } from "react"
import { formatDate, isSameDay } from "@/utils/dateUtils"
import { Calendar } from "@mantine/dates"
import { Indicator, Modal, Stack, Text, Group, ActionIcon, Badge } from "@mantine/core"
import { Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"
import classes from "./SessionCalendar.module.css"

type PlaySession = {
  _id: string
  date: string
  duration: number
  notes: string
  tags: string[]
}

export default function SessionCalendar({ gameId, sessions }: { gameId: string, sessions: PlaySession[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions)
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

  // Function to handle deleting a play session using the session ID
  const handleDeleteSession = async(sessionId: string) => {
    try{
      setLoading(true)
      const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token from localStorage
      const res = await fetch(`/api/playSession/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if(!res.ok){
        throw new Error('Failed to delete the play session');
      }

      setLocalSessions(prev => prev.filter(s => s._id !== sessionId)); // ✅ remove locally
      toast.success("Play Session has been removed!")
      console.log('Play Session has been removed!')

      setLoading(false)
    } catch (error) {
      setLoading(false);
      console.error('Error removing play session!:', error);
      toast.error('Failed to remove the play session. Please try again.');
    }
  }

  return (
    <>
      <Calendar
        maxDate={new Date()}
        getDayProps={(dateString) => ({
          onClick: () => {
            const date = new Date(dateString)
            setSelectedDate(date)
            setOpened(true)
          }
        })}
        renderDay={(dateString) => {
          const date = new Date(dateString)

          const hasSession = localSessions.some(
            (s) =>
              isSameDay(s.date, date)
          )

          return hasSession ? (
            <Indicator size={10} color="red">
              <div>{date.getDate()}</div>
            </Indicator>
          ) : (
            <div>{date.getDate()}</div>
          )
        }}
      />

      {/* Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          selectedDate
            ? `Sessions for ${formatDate(selectedDate)}`
            : "Sessions"
        }
      >
        <Stack>
          {sessionsForDate.length === 0 && (
            <Text c="dimmed">No sessions</Text>
          )}

          {sessionsForDate.map((s) => {
            const hours = Math.floor(s.duration / 60)
            const minutes = s.duration % 60

            return (
              <Group key={s._id} justify="space-between">
                <div className={classes.gameSessionCard}>
                  <div className={classes.sessionHeader}>
                    {/* DURATION */}
                    <Text fw={500}>
                      {hours}h {minutes}m
                    </Text>

                    {/* ACTION ICONS (EDIT/DELETE) */}
                    <div className={classes.actionIcons}>
                      <ActionIcon variant='transparent' color="#f21616" onClick={() => handleDeleteSession(s._id)}> <Trash2Icon size={20}/> </ActionIcon>
                    </div>

                  </div>

                  {/* NOTES SECTION */}
                  <Text size="sm" c="dimmed">
                    {s.notes || "No notes"}
                  </Text>

                  <div className={classes.tagContainer}>
                     {/* ✅ TAGS SECTION */}
                      {s.tags && s.tags.length > 0 && (
                        <Group className={classes.tagsContainer}>
                            {s.tags.map((tag: string, index: number) => (
                            <Badge
                                key={index}
                                variant="filled"
                                color="#0d8251"
                                radius="md"
                                size='md'
                            >
                                {tag}
                            </Badge>
                            ))}
                        </Group>
                      )}
                  </div>
                </div>
              </Group>
            )
          })}
        </Stack>
      </Modal>
    </>
  )
}