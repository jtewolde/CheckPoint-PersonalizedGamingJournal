'use client'

import { useState, useEffect } from "react";
import { formatDate, isSameDay } from "@/utils/dateUtils";
import { ActionIcon, Modal, Text, Tooltip, LoadingOverlay, Stack, Group, Badge } from "@mantine/core";

import { Trash2Icon, Pencil } from "lucide-react";
import toast from 'react-hot-toast';

import classes from "./SessionDayModal.module.css";

// Define the playSession object used on both calendar and modal with props
type PlaySession = {
    _id: string;
    gameId: string;
    gameName: string;
    date: string;
    duration: number;
    notes: string;
    sessionType: string[];
    mood?: string;
    platform?: string;
};

// Define the props for the SessionDayModal component
type SessionDayModalProps = {
    opened: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    sessions: PlaySession[];
    onEditSession?: (session: PlaySession) => void; // Callback for when a session is selected for editing
    onDeleteSession?: (sessionId: string) => void; // Callback for when a session is deleted
};

export default function SessionDayModal({ opened, onClose, selectedDate, sessions, onEditSession, onDeleteSession }: SessionDayModalProps){

    const [loading, setLoading] = useState(false);
    const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions);

    // Sync localSessions with sessions prop whenever it changes
    useEffect(() => {
        setLocalSessions(sessions);
    }, [sessions]);

    // Get sessions for selected date to display in modal
    const sessionsForDate = selectedDate
    ? localSessions.filter((s) =>
        isSameDay(s.date, selectedDate)
        )
    : [];

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
        <Modal opened={opened} onClose={onClose} size='xl' title={'Sessions for ' + (selectedDate ? formatDate(selectedDate) : "No Date Selected")}>
            {/* ✅ LOADING OVERLAY */}
            <LoadingOverlay
                visible={loading}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ size: 'lg', color: "white", type: "oval" }}
            />

            <Stack gap='md'>
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
                                {/*GAME TITLE */}
                                <Text fw={600} size="lg">{s.gameName}</Text>

                                {/* DURATION */}
                                <Text fw={500}>
                                    {hours}h {minutes}m
                                </Text>
                            </div>

                            {/* NOTES SECTION */}
                            <Text size="sm" c="dimmed">
                                {s.notes || "No notes"}
                            </Text>

                            <div className={classes.tagContainer}>
                                {/* ✅ TAGS SECTION */}
                                {s.sessionType && s.sessionType.length > 0 && (
                                    <Group className={classes.typeContainer}>
                                        {s.sessionType.map((type: string, index: number) => (
                                        <Badge
                                            key={index}
                                            variant="filled"
                                            color="#0d8251"
                                            radius="md"
                                            size='md'
                                        >
                                            {type}
                                        </Badge>
                                        ))}
                                    </Group>
                                )}

                                {s.mood && (
                                    <div className={classes.moodContainer}>
                                    {/*MOOD SECTION */}
                                    <Badge variant="filled" color="#07a2a7" radius='md' size="md">{s.mood}</Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Group>
                    )
                })}
            </Stack>
        </Modal>
    )
}