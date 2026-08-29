"use client";

import { useState } from "react";

import LiteYoutubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import { Thumbs, Navigation, Pagination, Keyboard } from "swiper/modules";

import { Film, X } from "lucide-react";
import { Text, Title, Group, ActionIcon } from "@mantine/core";

import classes from "./GameVideos.module.css";

interface GameVideosProps {
  game: any;
}

export default function GameVideos({ game }: GameVideosProps) {
  const videos = game.videos ?? [];

  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Fullscreen modal
  const [modalOpen, setModalOpen] = useState(false);

  // Fullscreen video swiper
  const [modalVideoSwiper, setModalVideoSwiper] = useState<SwiperType | null>(
    null,
  );

  // Fullscreen thumbnail swiper
  const [modalThumbnailSwiper, setModalThumbnailSwiper] =
    useState<SwiperType | null>(null);

  if (!videos.length) {
    return (
      <div className={classes.emptyState}>
        <Title order={2}>VIDEOS</Title>

        <Text>No videos are available for this game.</Text>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      {/* Header */}
      <div className={classes.header}>
        <Group gap={8} align="center">
          <Film size={25} color="white" />

          <Title className={classes.title}>
            Videos <span className={classes.videoCount}>({videos.length})</span>
          </Title>
        </Group>

        <Text className={classes.description}>
          Play videos and trailers from {game.name}.
        </Text>
      </div>

      {/* =========================================================
          NORMAL PAGE THUMBNAIL SWIPER
          ========================================================= */}
      {videos.length > 1 && (
        <div className={classes.thumbnailContainer}>
          <Swiper
            navigation
            keyboard
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
            className={classes.thumbnailSwiper}
          >
            {videos.map((video: any, index: number) => (
              <SwiperSlide key={video.id} className={classes.thumbnailSlide}>
                <button
                  type="button"
                  className={`${classes.thumbnailButton} ${
                    selectedVideoIndex === index ? classes.activeThumbnail : ""
                  }`}
                  onClick={() => {
                    setSelectedVideoIndex(index);
                    setModalOpen(true);
                  }}
                >
                  <div className={classes.thumbnailWrapper}>
                    <img
                      src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                      alt={video.name}
                      className={classes.thumbnail}
                      loading="lazy"
                    />

                    <div className={classes.thumbnailOverlay}>
                      <div className={classes.thumbnailPlayIcon}>
                        <Film size={18} />
                      </div>

                      <Text className={classes.thumbnailTitle}>
                        {video.name}
                      </Text>
                    </div>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* =========================================================
          FULLSCREEN VIDEO MODAL
          ========================================================= */}
      {modalOpen && (
        <div className={classes.fullScreenOverlay}>
          {/* Close Button */}
          <ActionIcon
            className={classes.closeButton}
            color="#291f30"
            size="compact-sm"
            onClick={() => {
              setModalOpen(false);
              setModalVideoSwiper(null);
              setModalThumbnailSwiper(null);
            }}
            aria-label="Close video viewer"
          >
            <X size={32} />
          </ActionIcon>

          {/* =====================================================
              FULLSCREEN VIDEO SWIPER
              ===================================================== */}
          <Swiper
            onSwiper={(swiper) => {
              setModalVideoSwiper(swiper);

              // Start on the video that was clicked
              swiper.slideToLoop(selectedVideoIndex, 0);
            }}
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
            thumbs={{
              swiper: modalThumbnailSwiper,
            }}
            className={classes.fullscreenSwiper}
            onSlideChange={(swiper) => {
              setSelectedVideoIndex(swiper.realIndex);
            }}
          >
            {videos.map((video: any, index: number) => (
              <SwiperSlide key={video.id}>
                <div className={classes.videoPlayer}>
                  {selectedVideoIndex === index && (
                    <LiteYoutubeEmbed
                      id={video.video_id}
                      title={video.name}
                      lazyLoad
                      poster="hqdefault"
                    />
                  )}

                  <Text className={classes.thumbnailTitle}>{video.name}</Text>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
