"use client";

import { Text, Title, Group, EmptyState } from "@mantine/core";
import { X, Gamepad, Gamepad2 } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Keyboard } from "swiper/modules";

import GameCard from "../../Cards/GameCard/GameCard";
import GameSkeletonCard from "../../Cards/GameCard/GameSkeletonCard";

import classes from "./RelatedGames.module.css";

// Props to pass to the RelatedGames component, which includes arrays of similar games and same series games
interface RelatedGamesProps {
  similarGames: any[];
  sameSeriesGames: any[];
}

export default function RelatedGames({
  similarGames,
  sameSeriesGames,
}: RelatedGamesProps) {
  return (
    <div className={classes.wrapper}>
      <div className={classes.similarGamesWrapper}>
        {/* Header */}
        <div className={classes.header}>
          <Group gap={8} align="center">
            <Gamepad size={25} color="white" />

            <Title className={classes.title}>
              Similar Games{" "}
              <span className={classes.videoCount}>
                ({similarGames.length})
              </span>
            </Title>
          </Group>

          <Text className={classes.description}>
            Games that are similar to this one, based on genre, gameplay, and
            other
          </Text>
        </div>

        {/* Similar Games */}
        {similarGames.length > 0 ? (
          <div className={classes.similarGames}>
            <Swiper
              navigation
              keyboard
              watchOverflow
              slidesPerView={2}
              spaceBetween={20}
              breakpoints={{
                900: {
                  slidesPerView: 4,
                },
                1200: {
                  slidesPerView: 6,
                },
              }}
              modules={[Navigation, Keyboard]}
              className={classes.normalSwiper}
            >
              {similarGames.map((game) => (
                <SwiperSlide key={game.id}>
                  <GameCard game={game} variant="default" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className={classes.emptyState}>
            <EmptyState
              icon={<Gamepad />}
              size="md"
              withIndicatorBackground
              title="No similar games found"
              description="This game doesn't have any similar games in our database."
            />
          </div>
        )}
      </div>

      <div className={classes.sameSeriesGamesWrapper}>
        {/* Same Series Games */}
        <div className={classes.header}>
          <Group gap={8} align="center">
            <Gamepad2 size={25} color="white" />

            <Title className={classes.title}>
              Same Series{" "}
              <span className={classes.videoCount}>
                ({sameSeriesGames.length})
              </span>
            </Title>
          </Group>

          <Text className={classes.description}>
            Games that are part of the same series as this one, including
            sequels, prequels, and spin-offs.
          </Text>
        </div>

        {/* Same Series Games Carousel */}
        {sameSeriesGames.length > 0 ? (
          <div className={classes.sameSeriesGames}>
            <Swiper
              navigation
              keyboard
              watchOverflow
              slidesPerView={2}
              spaceBetween={20}
              breakpoints={{
                900: {
                  slidesPerView: 4,
                },
                1200: {
                  slidesPerView: 6,
                },
              }}
              modules={[Navigation, Keyboard]}
              className={classes.normalSwiper}
            >
              {sameSeriesGames.map((game) => (
                <SwiperSlide key={game.id}>
                  <GameCard game={game} variant="default" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className={classes.emptyState}>
            <EmptyState
              icon={<Gamepad />}
              size="md"
              withIndicatorBackground
              title="No same series games found"
              description="This game doesn't have any same series games in our database."
            />
          </div>
        )}
      </div>
    </div>
  );
}
