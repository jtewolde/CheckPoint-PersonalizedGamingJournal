"use client";

import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Heatmap } from "@mantine/charts";

import SessionDayModal from "../SessionDayModal/SessionDayModal";
import PlaySessionModal from "../../Modals/PlaySessionModal/SessionModal";

import classes from "./SessionHeatmap.module.css";

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

interface SessionHeatmapProps {
  sessions: PlaySession[];
  className?: string;
  days?: number;
  mobileDays?: number;
  rectSize?: number;
  dateRange?: "days" | "year" | "game";
  page?: "dashboard" | "gamePage";
}

export default function SessionHeatmap({
  sessions,
  className,
  days = 90,
  mobileDays,
  dateRange = "days",
  page = "dashboard",
}: SessionHeatmapProps) {
  // Sessions used internally so edits can immediately update the heatmap
  const [localSessions, setLocalSessions] = useState<PlaySession[]>(sessions);

  // Keep local sessions synchronized with the sessions passed from the parent
  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  // States for handling the session day modal
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);

  // States for handling the edit session modal
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlaySession | null>(
    null,
  );

  // Responsive design breakpoints
  const isSmallMobile = useMediaQuery("(max-width: 500px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isLaptop = useMediaQuery("(max-width: 1000px)");

  // Determine how many days to display on mobile
  const effectiveDays = isSmallMobile || isTablet ? (mobileDays ?? days) : days;

  // Determine the start and end dates based on the selected date range
  const today = new Date();
  let startDate = new Date(today);
  startDate.setDate(startDate.getDate() - effectiveDays + 1);
  let endDate = new Date(today);

  // If the date range is "year", set the start and end dates to the beginning and end of the current year.
  if (dateRange === "year") {
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = new Date(today.getFullYear(), 11, 31);

    // If it's "game", set the start and end dates based on the earliest and latest session dates.
  } else if (dateRange === "game") {
    if (localSessions.length > 0) {
      const sessionDates = localSessions
        .map((session) => new Date(session.date))
        .sort((a, b) => a.getTime() - b.getTime());

      const firstSession = sessionDates[0];
      const lastSession = sessionDates[sessionDates.length - 1];

      const gameDuration =
        (lastSession.getTime() - firstSession.getTime()) /
        (1000 * 60 * 60 * 24);

      const minimumDays = 90;

      if (gameDuration < minimumDays) {
        startDate = new Date(firstSession);
        endDate = new Date(firstSession);

        endDate.setDate(endDate.getDate() + minimumDays);
      } else {
        // Fallback if the game has no sessions
        startDate = firstSession;
        endDate = lastSession;
      }
      // Otherwise, set the start date to a number of days before today based on the effectiveDays value.
    } else {
      startDate = today;
      endDate = today;
    }
  }

  // Aggregate total playtime by date
  const heatmapData = useMemo(() => {
    const durationByDate: Record<string, number> = {};

    localSessions.forEach((session) => {
      const dateKey = session.date;

      durationByDate[dateKey] =
        (durationByDate[dateKey] || 0) + session.duration;
    });

    return durationByDate;
  }, [localSessions]);

  // Determine color scaling
  const maxDuration = Math.max(...Object.values(heatmapData), 60);

  // Determine cell size and spacing based on screen size and page context
  const dashboardRectSize = isSmallMobile
    ? 23
    : isTablet
      ? 24
      : isLaptop
        ? 28
        : 32;
  const dashboardGap = isSmallMobile ? 6 : isTablet ? 7 : isLaptop ? 8 : 10;

  const gamePageRectSize = isSmallMobile
    ? 23
    : isTablet
      ? 24
      : isLaptop
        ? 28
        : 30;
  const gamePageGap = isSmallMobile ? 6 : isTablet ? 7 : isLaptop ? 8 : 12;

  // Format duration for tooltip
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={classes.heatmapContainer}>
      <Heatmap
        className={className}
        data={heatmapData}
        domain={[0, maxDuration]}
        startDate={startDate}
        endDate={endDate}
        withMonthLabels
        withWeekdayLabels
        withTooltip
        withLegend
        rectSize={page === "dashboard" ? dashboardRectSize : gamePageRectSize}
        gap={page === "dashboard" ? dashboardGap : gamePageGap}
        rectRadius={page === "dashboard" ? 4 : 2}
        colors={[
          "var(--mantine-color-yellow-1)",
          "var(--mantine-color-yellow-2)",
          "var(--mantine-color-yellow-3)",
          "var(--mantine-color-yellow-4)",
          "var(--mantine-color-yellow-5)",
        ]}
        getTooltipLabel={({ date, value }) =>
          `${date}: ${formatDuration(value ?? 0)}`
        }
        getRectProps={({ date, value }) => ({
          style: {
            cursor: "pointer",
          },

          onClick: () => {
            if (!value) return;

            setSelectedDate(date);
            console.log("Test press");
            setOpened(true);
          },
        })}
        styles={{
          rect: {
            cursor: "pointer",
          },
        }}
      />

      <PlaySessionModal
        gameName={selectedSession?.gameName}
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedSession(null);
        }}
        gameId={selectedSession?.gameId ?? ""}
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
        sessions={localSessions.filter(
          (session) => session.date === selectedDate,
        )}
        onEditSession={(session) => {
          setOpened(false);
          setSelectedSession(session);
          setEditModalOpened(true);
        }}
      />
    </div>
  );
}
