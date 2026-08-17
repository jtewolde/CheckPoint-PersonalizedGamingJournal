"use client";

import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";

import { CalendarDays, Gamepad2 } from "lucide-react";

import classes from "./GameOverview.module.css";

interface GameOverviewProps {
  game: any;
}

export default function GameOverview({ game }: GameOverviewProps) {
  return (
    <div className={classes.overviewContainer}>
      <section className={classes.section}>
        <Title className={classes.sectionTitle}>ABOUT THIS GAME</Title>

        <Stack gap="xl">
          <div className={classes.infoContainer}>
            <Title className={classes.subTitle}>Description</Title>

            <Text className={classes.description}>
              {game.summary || "No description available."}
            </Text>
          </div>
        </Stack>
      </section>

      <section className={classes.gameInfoSection}>
        <div className={classes.infoGrid}>
          {/* Release Date */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Release Date</Text>

            <p className={classes.gameDate}>
              {game.first_release_date
                ? new Date(game.first_release_date * 1000).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )
                : "N/A"}
            </p>
          </div>

          {/* Genres */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Genres</Text>

            <Group gap="xs">
              <Text className={classes.infoValue}>
                {game.genres?.length
                  ? game.genres.map((genre: any) => genre.name).join(", ")
                  : "N/A"}
              </Text>
            </Group>
          </div>

          {/* Platforms */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Platforms</Text>

            <Group gap="xs">
              <Text className={classes.infoValue}>
                {game.platforms?.length
                  ? game.platforms
                      .map((platform: any) => platform.name)
                      .join(", ")
                  : "N/A"}
              </Text>
            </Group>
          </div>

          {/* Game Modes */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Game Modes</Text>

            <Group gap="xs">
              <Text className={classes.infoValue}>
                {game.game_modes?.length
                  ? game.game_modes.map((mode: any) => mode.name).join(", ")
                  : "N/A"}
              </Text>
            </Group>
          </div>

          {/* Themes */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Themes</Text>

            <Group gap="xs">
              <Text className={classes.infoValue}>
                {game.themes?.length
                  ? game.themes.map((theme: any) => theme.name).join(", ")
                  : "N/A"}
              </Text>
            </Group>
          </div>

          {/* Developer */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Developer</Text>

            <Text className={classes.infoValue}>
              {game.involved_companies?.length
                ? game.involved_companies
                    .filter((company: any) => company.developer)
                    .map((company: any) => company.company?.name)
                    .filter(Boolean)
                    .join(", ") || "N/A"
                : "N/A"}
            </Text>
          </div>

          {/* Publisher */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Publisher</Text>

            <Text className={classes.infoValue}>
              {game.involved_companies?.length
                ? game.involved_companies
                    .filter((company: any) => company.publisher)
                    .map((company: any) => company.company?.name)
                    .filter(Boolean)
                    .join(", ") || "N/A"
                : "N/A"}
            </Text>
          </div>

          {/* Age Ratings */}
          <div className={classes.infoItem}>
            <Text className={classes.infoLabel}>Age Ratings</Text>

            <Group gap="lg">
              {game.age_ratings
                .filter(
                  (rating: any) =>
                    rating.rating_category.organization.name === "ESRB" ||
                    rating.rating_category.organization.name === "PEGI",
                )
                .map(
                  (
                    rating: any, // ESRB and PEGI ratings only
                  ) => (
                    <div key={rating.id} className={classes.releaseDate}>
                      <strong>
                        {rating.rating_category.organization.name || "N/A"}{" "}
                        -{" "}
                      </strong>
                      {rating.rating_category.rating}
                    </div>
                  ),
                )}
            </Group>
          </div>
        </div>
      </section>
    </div>
  );
}
