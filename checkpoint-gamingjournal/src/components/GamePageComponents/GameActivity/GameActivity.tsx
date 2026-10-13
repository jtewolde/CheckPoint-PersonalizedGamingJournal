"use client";

import { useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { SimpleGrid, Stack, Text, Title, EmptyState } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import {
  Gamepad,
  Timer,
  Calendar,
  Hourglass,
  Flame,
  CalendarClock,
} from "lucide-react";

import SessionHeatmap from "@/components/ActivityComponents/SessionHeatmap/SessionHeatmap";
import { calculateCurrentStreak } from "@/utils/dateUtils";

import classes from "./GameActivity.module.css";

interface GameActivityProps {
  game: any;
  sessions: any[];
  numOfEntries: number;
  sessionStats: {
    avg: number;
    longest: string;
    totalSessions: number;
    totalHours: number;
  };
}

export default function GameActivity({
  sessions = [],
  sessionStats,
}: GameActivityProps) {
  const isMobile = useMediaQuery("(max-width: 748px)");

  // Create stat for tracking unique days played/made a play session for specific game
  const uniqueDays = new Set(
    sessions.map((session: any) => new Date(session.date).toDateString()),
  );
  const daysPlayed = uniqueDays.size;
  const currentStreak = calculateCurrentStreak(sessions);

  // Calculate session type distribution for donut chart
  const sessionTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};

    sessions.forEach((session) => {
      const types =
        session.sessionType && session.sessionType.length > 0
          ? session.sessionType
          : ["Other"];

      types.forEach((type: string) => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });

    const colors = [
      {
        chart: "violet.7",
        css: "var(--mantine-color-violet-7)",
      },
      {
        chart: "violet.5",
        css: "var(--mantine-color-violet-5)",
      },
      {
        chart: "yellow.5",
        css: "var(--mantine-color-yellow-5)",
      },
      {
        chart: "yellow.3",
        css: "var(--mantine-color-yellow-3)",
      },
      {
        chart: "violet.3",
        css: "var(--mantine-color-violet-3)",
      },
    ];

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length].chart,
        cssColor: colors[index % colors.length].css,
      }));
  }, [sessions]);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [sessions]);

  return (
    <div className={classes.wrapper}>
      {sessions.length === 0 ? (
        <div className={classes.emptyStateContainer}>
          <EmptyState
            icon={<Gamepad />}
            size="lg"
            withIndicatorBackground
            title="No session data yet"
            description="Create play sessions to see your activity patterns, session types, and play history here."
          />
        </div>
      ) : (
        <>
          <section className={classes.statsSection}>
            <SimpleGrid
              className={classes.activityGrid}
              spacing="md"
              cols={{ base: 2, sm: 3, md: 6 }}
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
                  <Text className={classes.statLabel}>Total Days Played</Text>
                </Stack>
              </div>

              <div className={classes.statCard}>
                <Timer size={30} />

                <Stack gap={1}>
                  <Text className={classes.statValue}>
                    {sessionStats.avg} Hrs
                  </Text>
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

              <div className={classes.statCard}>
                <CalendarClock size={25} />

                <Stack gap={1}>
                  <Text className={classes.statValue}>
                    {sessionStats.totalHours} Hrs
                  </Text>

                  <Text className={classes.statLabel}>Total Hours Tracked</Text>
                </Stack>
              </div>

              <div className={classes.streakCard}>
                <Flame size={25} color="#ff8c00" fill="#ff8c00" />

                <Stack gap={1}>
                  <Text className={classes.statValue}>{currentStreak}</Text>
                  <Text className={classes.statLabel}>Day Streak</Text>
                </Stack>
              </div>
            </SimpleGrid>
          </section>
          <SimpleGrid
            className={classes.activityGrid}
            spacing="md"
            cols={{ base: 1, sm: 2, md: 2 }}
          >
            <div className={classes.heatmapContainer}>
              <Title className={classes.heatmapTitle}>
                Game Sessions Heatmap
              </Title>
              <div className={classes.heatmapWrapper}>
                <SessionHeatmap
                  sessions={sessions}
                  page="gamePage"
                  dateRange="game"
                  days={120}
                />
              </div>
            </div>

            <div className={classes.sessionsContainer}>
              {/* Session Types */}
              <Title className={classes.heatmapTitle}>Session Types</Title>
              <div className={classes.sessionStatsWrapper}>
                <DonutChart
                  data={sessionTypeData}
                  size={250}
                  thickness={45}
                  paddingAngle={3}
                  withTooltip
                  chartLabel={`${sessionStats.totalSessions}`}
                  styles={{
                    label: {
                      fontFamily: "Barlow",
                      fontSize: "24px",
                      fontWeight: "600",
                    },
                  }}
                />
                {!isMobile ? (
                  <div className={classes.sessionTypeLegend}>
                    {sessionTypeData.map((item) => {
                      const total = sessionTypeData.reduce(
                        (sum, type) => sum + type.value,
                        0,
                      );

                      const percentage =
                        total > 0 ? Math.round((item.value / total) * 100) : 0;

                      return (
                        <div key={item.name} className={classes.legendItem}>
                          <div className={classes.legendName}>
                            <span
                              className={classes.legendDot}
                              style={{
                                backgroundColor: item.cssColor,
                              }}
                            />

                            <Text>{item.name}</Text>
                          </div>

                          <Text className={classes.legendValue}>
                            {item.value} ({percentage}%)
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </SimpleGrid>
        </>
      )}
    </div>
  );
}
