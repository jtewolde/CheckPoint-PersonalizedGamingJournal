"use client";

import { Tabs } from "@mantine/core";
import classes from "./GameTabs.module.css";

// Props for the GameTabs component, including the current tab value and a callback for when the tab changes.
interface GameTabsProps {
  value: string;
  onTabChange: (value: string | null) => void;
}

export default function GameTabs({ value, onTabChange }: GameTabsProps) {
  return (
    <Tabs
      value={value}
      variant="default"
      onChange={onTabChange}
      classNames={{
        root: classes.root,
        list: classes.list,
        tab: classes.tab,
        panel: classes.panel,
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
        <Tabs.Tab value="journal">Journal</Tabs.Tab>
        <Tabs.Tab value="media">Media</Tabs.Tab>
        <Tabs.Tab value="achievements">Achievements</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
