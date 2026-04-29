'use client'

import { useState, useEffect } from "react"
import { formatDate, isSameDay } from "@/utils/dateUtils"
import PlaySessionModal from "../PlaySessionModal/SessionModal"
import { Calendar } from "@mantine/dates"
import { Indicator, Modal, Stack, Text, Group, ActionIcon, Badge, Tooltip, LoadingOverlay } from "@mantine/core"
import { Trash2Icon, Pencil } from "lucide-react"
import toast from "react-hot-toast"
import classes from "./SessionCalendar.module.css"

type PlaySession = {
  _id: string
  gameName: string
  date: string
  duration: number
  notes: string
  tags: string[]
}

export default function SessionCalendar({ gameId, sessions }: { gameId: string, sessions: PlaySession[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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
        fullWidth
        highlightToday={true}
        withCellSpacing
        maxDate={new Date()}
        getDayProps={(dateString) => ({
          onClick: () => {
            const date = new Date(dateString)
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
        session={selectedSession}   // 👈 THIS is key
        onSuccess={(updatedSession) => {
          // update local state without refetch
          setLocalSessions(prev =>
            prev.map(s =>
              s._id === updatedSession._id ? updatedSession : s
            )
          );
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
        {/* ✅ LOADING OVERLAY */}
        <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ size: 'lg', color: "white", type: "oval" }}
        />
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
                      <Tooltip label='Delete' position='top'>
                        <ActionIcon variant='transparent' color="#dc4242" onClick={() => handleDeleteSession(s._id)}> <Trash2Icon size={20}/> </ActionIcon>
                      </Tooltip>

                      <Tooltip label='Edit' position='top'>
                        <ActionIcon 
                        variant='transparent' 
                        color="#ffffff" 
                        onClick={() => {
                          setSelectedSession(s)
                          setEditModalOpened(true)
                          setOpened(false)
                        }}
                        > 
                        <Pencil size={20}/> </ActionIcon>
                      </Tooltip>
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