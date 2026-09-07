"use client";

import { useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { Gamepad, Timer, Calendar, Hourglass, Flame } from "lucide-react";

import SessionHeatmap from "@/components/SessionComponents/SessionHeatmap/SessionHeatmap";
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
  sessions,
  sessionStats,
}: GameActivityProps) {
  const isMobile = useMediaQuery("(max-width: 646px)");

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

  return (
    <div className={classes.wrapper}>
      <section className={classes.statsSection}>
        <SimpleGrid
          className={classes.activityGrid}
          spacing="md"
          cols={{ base: 3, sm: 3, md: 6 }}
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

          <div className={classes.statCard}>
            <Hourglass size={25} />

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
          <Title className={classes.heatmapTitle}>Last 90 Days Heatmap</Title>

          <div className={classes.heatmapWrapper}>
            <SessionHeatmap
              sessions={sessions}
              page="gamePage"
              dateRange="days"
              days={90}
            />
          </div>
        </div>

        <div className={classes.sessionStatsContainer}>
          <div className={classes.sessionStatsWrapper}>
            <Stack gap={10} align="flex-start" justify="flex-start">
              <Title className={classes.heatmapTitle}>Session Types</Title>
              <DonutChart
                data={sessionTypeData}
                size={isMobile ? 200 : 250}
                thickness={45}
                paddingAngle={3}
                withTooltip
                chartLabel={`${sessionStats.totalSessions}`}
              />
            </Stack>

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
          </div>
        </div>
      </SimpleGrid>
    </div>
  );
}
