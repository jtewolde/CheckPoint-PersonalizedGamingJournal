'use client'

import { useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import SessionDayModal from "../SessionDayModal/SessionDayModal";
import { formatDate, isSameDay } from "@/utils/dateUtils";
import { Heatmap } from "@mantine/charts";
import classes from './SessionHeatmap.module.css';

// Define the playSession object used on both calendar and modal with props
type PlaySession = {
    _id: string
    gameId: string
    gameName: string
    date: string
    duration: number
    notes: string
    sessionType: string[]
    mood?: string
    platform?: string
}

export default function SessionHeatmap(){
    // State to hold the heatmap data as a record of date to total duration
    const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
    // Fetch play sessions data for the user and store it in state
    const [sessions, setSessions] = useState<PlaySession[]>([]);

    // States for handling the session day modal
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [opened, setOpened] = useState(false);

    // Define the date range for the heatmap (e.g., last 90 days) and adjust for mobile view
    const endDate = new Date();
    const startDate = new Date();
    const mobileStartDate = new Date();
    startDate.setDate(endDate.getDate() - 90); // Show last 90 days
    mobileStartDate.setDate(endDate.getDate() - 60); // Show last 30 days on mobile

    // Responsive design breakpoints
    const isSmallMobile = useMediaQuery('(max-width: 500px)');
    const isTablet = useMediaQuery('(max-width: 768px)');
    const isLaptop = useMediaQuery('(max-width: 1000px)');

    useEffect(() => {
        // Function to fetch play sessions for the game to display on calendar and calculate total tracked playtime.
        const fetchPlaySessions = async () => {
            try {
            const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token from local storage
                const res = await fetch(`/api/playSession`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch play sessions');
                }

                const data = await res.json();
                console.log("All Sessions:", data)
                setSessions(data);
            } catch (error) {
            console.error('Error fetching recent play sessions:', error);
            }
        }
        fetchPlaySessions();
    }, []);

    // Process the sessions data to aggregate total duration for each date
    useEffect(() => {
        const durationByDate: Record<string, number> = {};

        sessions.forEach(session => {
            const dateKey = session.date; // already YYYY-MM-DD

            durationByDate[dateKey] =
                (durationByDate[dateKey] || 0) + session.duration;
        })

        setHeatmapData(durationByDate);
    }, [sessions]);
    

    // Determine rectSize and gap based on screen size
    const rectSize = isSmallMobile ? 23 : isTablet ? 24 : isLaptop ? 28 : 30;
    const gap = isSmallMobile ? 6 : isTablet ? 7 : isLaptop ? 8 : 10;

    return (
        <div className={classes.heatmapContainer}>
            <Heatmap
                data={heatmapData}
                domain={[0, Math.max(...Object.values(heatmapData), 60)]} // Set domain based on max duration, with a minimum of 60 minutes for better color scaling
                startDate={isSmallMobile ? mobileStartDate : startDate}
                endDate={endDate}
                withMonthLabels
                withWeekdayLabels
                withTooltip
                rectSize={rectSize}
                rectRadius={10}
                gap={gap}
                colors={[
                    'var(--mantine-color-yellow-1)',
                    'var(--mantine-color-yellow-2)',
                    'var(--mantine-color-yellow-3)',
                    'var(--mantine-color-yellow-4)',
                    'var(--mantine-color-yellow-5)',
                ]}
                getTooltipLabel={({date, value}) => `${date}: ${Math.floor((value ?? 0) / 60)} hours`}
                getRectProps={({ date, value }) => ({
                    style: {cursor: value ? 'pointer' : 'pointer'},

                    onClick: () => {
                        if (!value) return;

                        setSelectedDate(date);
                        setOpened(true);
                    },
                })}
            />

            <SessionDayModal
                opened={opened}
                onClose={() => setOpened(false)}
                selectedDate={selectedDate}
                sessions={sessions.filter(s => s.date === selectedDate)}
            />
        </div>
    )

}