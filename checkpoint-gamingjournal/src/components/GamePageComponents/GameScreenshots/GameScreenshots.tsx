"use client";

import { useState } from "react";
import Image from "next/image";

import { Button, Text, Title, ActionIcon } from "@mantine/core";
import { X } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { Navigation, Pagination, Thumbs, Keyboard } from "swiper/modules";

import classes from "./GameScreenshots.module.css";

interface GameScreenshotsProps {
  game: any;
}

export default function GameScreenshots({ game }: GameScreenshotsProps) {
  const screenshots = game.screenshots ?? [];

  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);

  const [fullScreenSwiper, setFullScreenSwiper] = useState<SwiperType | null>(
    null,
  );

  if (!screenshots.length) {
    return (
      <div className={classes.emptyState}>
        <Title order={2}>SCREENSHOTS</Title>

        <Text>No screenshots are available for this game.</Text>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      {/* Header */}
      <div className={classes.header}>
        <Title className={classes.title}>SCREENSHOTS</Title>

        <Text className={classes.description}>
          Explore screenshots from {game.name}.
        </Text>
      </div>

      {/* Screenshot Grid */}
      <div className={classes.screenshotGrid}>
        {screenshots.map((screenshot: any, index: number) => {
          const imageUrl = `https:${screenshot.url.replace(
            "t_thumb",
            "t_1080p",
          )}`;

          return (
            <button
              key={screenshot.id}
              type="button"
              className={classes.screenshotButton}
              onClick={() => {
                setSelectedScreenshotIndex(index);
                setModalOpen(true);
              }}
            >
              <Image
                src={imageUrl}
                alt={`Screenshot of ${game.name} ${index + 1}`}
                width={1280}
                height={720}
                className={classes.screenshot}
                loading="lazy"
              />

              <div className={classes.screenshotOverlay}>
                <Text>{index + 1}</Text>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Viewer */}
      {modalOpen && (
        <div className={classes.fullScreenOverlay}>
          <ActionIcon
            className={classes.closeButton}
            variant="filled"
            color="#291f30"
            size="compact-sm"
            onClick={() => {
              setModalOpen(false);
              setFullScreenSwiper(null);
            }}
            aria-label="Close screenshot viewer"
          >
            <X size={32} />
          </ActionIcon>

          <Swiper
            initialSlide={selectedScreenshotIndex}
            navigation
            loop
            pagination={{
              clickable: true,
              type: "fraction",
            }}
            keyboard={{
              enabled: true,
            }}
            modules={[Navigation, Pagination, Keyboard, Thumbs]}
            thumbs={{ swiper: fullScreenSwiper }}
            className={classes.fullscreenSwiper}
            onSlideChange={(swiper) => {
              setSelectedScreenshotIndex(swiper.realIndex);
            }}
          >
            {screenshots.map((screenshot: any, index: number) => (
              <SwiperSlide key={screenshot.id}>
                <Image
                  src={`https:${screenshot.url.replace("t_thumb", "t_1080p")}`}
                  alt={`Screenshot of ${game.name} ${index + 1}`}
                  className={classes.fullScreenImage}
                  width={1920}
                  height={1080}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnail Swiper */}
          <div className={classes.thumbnailContainer}>
            <Swiper
              onSwiper={setFullScreenSwiper}
              watchSlidesProgress
              modules={[Thumbs]}
              spaceBetween={10}
              slidesPerView={4}
              breakpoints={{
                1024: {
                  slidesPerView: 6,
                },
              }}
              className={classes.thumbnailSwiper}
            >
              {screenshots.map((screenshot: any, index: number) => {
                const imageUrl = `https:${screenshot.url.replace(
                  "t_thumb",
                  "t_1080p",
                )}`;

                return (
                  <SwiperSlide
                    key={screenshot.id}
                    className={classes.thumbnailSlide}
                  >
                    <button
                      type="button"
                      className={`${classes.thumbnailButton} ${
                        selectedScreenshotIndex === index
                          ? classes.activeThumbnail
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedScreenshotIndex(index);
                        fullScreenSwiper?.slideToLoop(index);
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        width={180}
                        height={100}
                        className={classes.thumbnail}
                      />
                    </button>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}
