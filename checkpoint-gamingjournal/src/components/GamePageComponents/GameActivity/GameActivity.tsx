"use client";

import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Gamepad, Timer, Calendar, Hourglass } from "lucide-react";

import SessionCalendar from "@/components/SessionComponents/SessionCalendar/SessionCalendar";
import SessionHeatmap from "@/components/SessionComponents/SessionHeatmap/SessionHeatmap";

import classes from "./GameActivity.module.css";

interface GameActivityProps {
  game: any;
  sessions: any[];
  numOfEntries: number;
  sessionStats: {
    avg: number;
    longest: string;
    totalSessions: number;
  };
}

export default function GameActivity({
  game,
  sessions,
  numOfEntries,
  sessionStats,
}: GameActivityProps) {
  // Create stat for tracking unique days played/made a play session for specific game
  const uniqueDays = new Set(
    sessions.map((session: any) => new Date(session.date).toDateString()),
  );
  const daysPlayed = uniqueDays.size;

  return (
    <div className={classes.wrapper}>
      <section className={classes.statsSection}>
        <SimpleGrid
          className={classes.activityGrid}
          spacing="md"
          cols={{ base: 2, sm: 3, md: 4 }}
        >
          <div className={classes.statCard}>
            <Gamepad size={30} />

            <Stack gap={1}>
              <Text className={classes.statValue}>
                {sessionStats.totalSessions}
              </Text>
              <Text className={classes.statLabel}>Sessions</Text>
            </Stack>
          </div>

          <div className={classes.statCard}>
            <Calendar size={30} />

            <Stack gap={1}>
              <Text className={classes.statValue}>{daysPlayed}</Text>
              <Text className={classes.statLabel}>Days Played</Text>
            </Stack>
          </div>

          <div className={classes.statCard}>
            <Timer size={30} />

            <Stack gap={1}>
              <Text className={classes.statValue}>{sessionStats.avg} Hrs</Text>
              <Text className={classes.statLabel}>Avg. Session</Text>
            </Stack>
          </div>

          <div className={classes.statCard}>
            <Hourglass size={25} />

            <Stack gap={1}>
              <Text className={classes.statValue}>
                {sessionStats.longest} Hrs
              </Text>

              <Text className={classes.statLabel}>Longest Session</Text>
            </Stack>
          </div>
        </SimpleGrid>
      </section>

      <div className={classes.heatmapContainer}>
        <Title className={classes.heatmapTitle}>Play Sessions Heatmap</Title>

        <div className={classes.heatmapWrapper}>
          <SessionHeatmap
            sessions={sessions}
            page="gamePage"
            days={120}
            mobileDays={90}
          />
        </div>
      </div>
    </div>
  );
}
