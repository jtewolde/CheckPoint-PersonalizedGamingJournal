'use client'

import { useState, useEffect } from "react";
import { formatDate, isSameDay } from "@/utils/dateUtils";
import { ActionIcon, Modal, Text, Tooltip, LoadingOverlay, Stack, Group, Badge, Spoiler } from "@mantine/core";

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
    mood?: string[];
    platform?: string;
};

// Define the props for the SessionDayModal component
type SessionDayModalProps = {
    opened: boolean;
    onClose: () => void;
    selectedDate: string | null;
    sessions: PlaySession[];
    onEditSession?: (session: PlaySession) => void; // Callback for when a session is selected for editing
};

export default function SessionDayModal({ opened, onClose, selectedDate, sessions, onEditSession }: SessionDayModalProps){

    const [loading, setLoading] = useState(false);
    const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions);

    // Sync localSessions with sessions prop whenever it changes
    useEffect(() => {
        setLocalSessions(sessions);
    }, [sessions]);

    // Get sessions for selected date to display in modal
    const sessionsForDate = localSessions;

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
        <Modal opened={opened} onClose={onClose} size='xl' title={'Play Sessions on ' + (selectedDate || "No Date Selected")}>
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
                        <div key={s._id} className={classes.gameSessionCard}>
                            <div className={classes.sessionHeader}>
                                <div className={classes.titleDurationGroup}>
                                    {/*GAME TITLE */}
                                    <Text className={classes.titleText}>{s.gameName}</Text>

                                    <Group gap={6} align="center">
                                        {/* DURATION */}
                                        <Text className={classes.durationText} c='dimmed'>
                                            {hours}h {minutes}m
                                        </Text>

                                        {s.platform && (
                                            <>
                                                <Text size="sm" c="dimmed">•</Text>
                                                <Text size="sm" c="dimmed">
                                                    {s.platform}
                                                </Text>
                                            </>
                                        )}

                                        {s.mood && s.mood.length > 0 && (
                                            <Group gap={6} align="center" justify="center">
                                                {s.mood.map((mood: string, index: number) => (
                                                    <>
                                                        <Text size="sm" c="dimmed">•</Text>
                                                        <Text key={index} size="sm" c="dimmed">
                                                            {mood}
                                                        </Text>
                                                    </>
                                                ))}
                                            </Group>
                                        )}
                                    </Group>

                                    {/* ✅ SESSION TYPES */}
                                    {s.sessionType && s.sessionType.length > 0 && (
                                        <div className={classes.tagContainer}>
                                                <Group className={classes.typeContainer}>
                                                    {s.sessionType.map((type: string, index: number) => (
                                                    <Badge
                                                        key={index}
                                                        variant="light"
                                                        color="green"
                                                        radius="md"
                                                        size='md'
                                                    >
                                                        {type}
                                                    </Badge>
                                                    ))}
                                                </Group>
                                        </div>
                                    )}
                                </div>

                                <Group gap={4}>
                                    <Tooltip label="Edit session">
                                        <ActionIcon
                                            variant="light"
                                            size='lg'
                                            color="blue"
                                            onClick={() => onEditSession?.(s)}
                                        >
                                            <Pencil size={20} />
                                        </ActionIcon>
                                    </Tooltip>

                                    <Tooltip label="Delete session">
                                        <ActionIcon
                                            variant="light"
                                            size='lg'
                                            color="red"
                                            onClick={() => handleDeleteSession(s._id)}
                                        >
                                            <Trash2Icon size={20} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </div>
                            
                            <div className={classes.notesContainer}>
                                {s.notes ? (
                                    <Spoiler maxHeight={100} showLabel="Show more" hideLabel="Show less" styles={{ control: { color: '#b9b5b5', fontWeight: 500, fontSize: '14px', marginBottom: '0.5rem'}}}>
                                        <Text size="sm" c="dimmed">
                                            {s.notes || "No notes"}
                                        </Text>
                                    </Spoiler>
                                ): (
                                    <Text size="sm" c='dimmed'>
                                        No notes recorded.
                                    </Text>
                                )}
                            </div>
                        </div>
                    )
                })}
            </Stack>
        </Modal>
    )
}