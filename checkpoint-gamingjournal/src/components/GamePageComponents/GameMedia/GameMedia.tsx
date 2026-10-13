"use client";

import { useState } from "react";

import GameVideos from "../GameVideos/GameVideos";
import GameScreenshots from "../GameScreenshots/GameScreenshots";

import { Text, Title } from "@mantine/core";

import classes from "./GameMedia.module.css";

interface GameMediaProps {
  game: any;
}

export default function GameMedia({ game }: GameMediaProps) {
  return (
    <div className={classes.wrapper}>
      <GameVideos game={game} />
      <GameScreenshots game={game} />
    </div>
  );
}
