"use client";

import { useState } from "react";
import Image from "next/image";

import { Text, Title, ActionIcon, Skeleton, Group } from "@mantine/core";
import { X, Camera } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { Navigation, Pagination, Thumbs, Keyboard } from "swiper/modules";

import classes from "./GameScreenshots.module.css";

interface GameScreenshotsProps {
  game: any;
}

export default function GameScreenshots({ game }: GameScreenshotsProps) {
  const screenshots = game.screenshots ?? [];

  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  // Helper function to handle loading screenshots and counting the amount of images that needs skeletons
  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [fullScreenSwiper, setFullScreenSwiper] = useState<SwiperType | null>(
    null,
  );

  if (!screenshots.length) {
    return (
      <div className={classes.emptyState}>
        <Title className={classes.title} order={2}>
          Screenshots
        </Title>

        <Text>No screenshots are available for this game.</Text>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      {/* Header */}
      <div className={classes.header}>
        <Group gap={8} align="center">
          <Camera size={25} color="white" />

          <Title className={classes.title}>
            Screenshots{" "}
            <span className={classes.videoCount}>({screenshots.length})</span>
          </Title>
        </Group>

        <Text className={classes.description}>
          Explore screenshots from {game.name}.
        </Text>
      </div>

      {/* =========================================================
    NORMAL PAGE SCREENSHOT SWIPER
    ========================================================= */}
      {screenshots.length > 1 && (
        <div className={classes.normalContainer}>
          <Swiper
            navigation
            keyboard
            loop
            slidesPerView={2}
            spaceBetween={12}
            breakpoints={{
              900: {
                slidesPerView: 3,
              },
              1200: {
                slidesPerView: 4,
              },
            }}
            modules={[Navigation, Keyboard]}
            className={classes.normalSwiper}
          >
            {screenshots.map((screenshot: any, index: number) => {
              const imageUrl = `https:${screenshot.url.replace(
                "t_thumb",
                "t_1080p",
              )}`;

              return (
                <SwiperSlide
                  key={screenshot.id}
                  className={classes.normalSlide}
                >
                  <button
                    type="button"
                    className={classes.thumbnailButton}
                    onClick={() => {
                      setSelectedScreenshotIndex(index);
                      setModalOpen(true);
                    }}
                  >
                    <div className={classes.normalWrapper}>
                      {!loadedImages.has(index) && (
                        <Skeleton
                          className={classes.screenshotSkeleton}
                          radius="md"
                        />
                      )}

                      <Image
                        src={imageUrl}
                        alt={`Screenshot of ${game.name} ${index + 1}`}
                        width={1280}
                        height={720}
                        className={`${classes.thumbnail} ${
                          loadedImages.has(index)
                            ? classes.screenshotLoaded
                            : ""
                        }`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(index)}
                      />

                      <div className={classes.screenshotOverlay}>
                        <Text>{index + 1}</Text>
                      </div>
                    </div>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

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
              loop
              watchSlidesProgress
              modules={[Thumbs]}
              spaceBetween={10}
              slidesPerView={2.5}
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
                    className={classes.modalSlide}
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
