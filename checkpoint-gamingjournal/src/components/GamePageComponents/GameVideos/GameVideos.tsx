"use client";

import { useState } from "react";
import LiteYoutubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

import { Text, Title } from "@mantine/core";
import { Play, X } from "lucide-react";

import classes from "./GameVideos.module.css";

interface GameVideosProps {
  game: any;
}

export default function GameVideos({ game }: GameVideosProps) {
  const videos = game.videos ?? [];
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  const [featuredVideoIndex, setFeaturedVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper function to handle loading videos and counting the amount of videos that needs skeletons
  const handleVideoThumbnailLoad = (index: number) => {
    setLoadedVideos((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

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
        <Title className={classes.title}>VIDEOS</Title>

        <Text className={classes.description}>
          Play videos and trailers from {game.name}.
        </Text>
      </div>

      <div className={classes.videoGrid}>
        {videos.map((video: any, index: number) => (
          <div
            key={video.id}
            className={`${classes.videoButton} ${
              featuredVideoIndex === index ? classes.activeVideo : ""
            }`}
            onClick={() => {
              setFeaturedVideoIndex(index);
              setIsPlaying(false);
            }}
          >
            <div className={classes.videoCard}>
              <LiteYoutubeEmbed
                id={video.video_id}
                title={video.name}
                lazyLoad
              />
            </div>
            <Text className={classes.videoTitle}>{video.name}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
