"use client";

import {
  Modal,
  Select,
  Stack,
  Button,
  ActionIcon,
  Tooltip,
  Group,
  Switch,
  Chip,
  Fieldset,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Funnel, RefreshCcw } from "lucide-react";

import classes from "./LibraryFilters.module.css";
import { useState } from "react";

type LibraryFiltersVariant = "default" | "small";

// Define the props for the LibraryFilter component
interface LibraryFilterProps {
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "input-lg" | "input-xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant: LibraryFiltersVariant;
  buttonVariant: "outline" | "filled";
  totalGames: number;

  status: string;
  ratedOnly: boolean;
  platinumOnly: boolean;
  wishlistOnly: boolean;
  platform: string;
  platforms: string[];

  onStatusChange: (value: string) => void;
  onRatedChange: (value: boolean) => void;
  onPlatinumChange: (value: boolean) => void;
  onWishlistChange: (value: boolean) => void;
  onPlatformChange: (value: string) => void;
}

export default function LibraryFilters({
  color,
  size = "lg",
  radius = "md",
  className,
  variant,
  buttonVariant,
  totalGames,

  status,
  ratedOnly,
  platinumOnly,
  wishlistOnly,
  platform,
  platforms,

  onStatusChange,
  onRatedChange,
  onPlatinumChange,
  onWishlistChange,
  onPlatformChange,
}: LibraryFilterProps) {
  // States for managing the drawer visibility
  const [opened, { toggle, close }] = useDisclosure(false);
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  // Get the active filters
  const activeFilters = [
    status !== "all",
    ratedOnly,
    platinumOnly,
    wishlistOnly,
    platform !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    onStatusChange("all");
    onRatedChange(false);
    onPlatinumChange(false);
    onPlatformChange("all");
    onWishlistChange(false);
  };

  return (
    <div className={classes.filterContainer}>
      <div className={classes.filterTopRow}>
        {variant === "default" && (
          <Button
            className={className}
            size={size}
            radius={radius}
            color={color}
            variant={buttonVariant}
            leftSection={<Funnel size={20} />}
            onClick={toggle}
          >
            Filters
          </Button>
        )}

        {variant === "small" && (
          <Tooltip label="Apply Filters" position="top">
            <ActionIcon
              variant={buttonVariant}
              size={size}
              radius={radius}
              color={color}
              onClick={toggle}
            >
              <Funnel size={25} />
            </ActionIcon>
          </Tooltip>
        )}

        {/* Drawer component to hold the filter options, slides in from left */}
        <Modal
          opened={opened}
          onClose={close}
          centered
          size="md"
          title="Sort and Filter"
          className={classes.drawer}
          styles={{
            header: {
              borderBottom: "1px solid gray",
              marginBottom: "10px",
            },
            body: {
              display: "flex",
              flexDirection: "column",
              height: "90%",
            },
            title: {
              fontSize: "24px",
              color: "white",
              fontFamily: "Noto Sans",
              fontWeight: 300,
            },
            close: {
              color: "white",
            },
          }}
        >
          <Stack gap="lg">
            <Select
              styles={{
                option: {
                  fontFamily: "Noto Sans",
                  fontSize: "16px",
                  fontWeight: 330,
                },
                label: {
                  fontFamily: "Noto Sans",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: 300,
                },
              }}
              label="Filter by Game Status"
              placeholder="Select Game Status"
              checkIconPosition="right"
              scrollAreaProps={{
                type: "auto",
                scrollbarSize: 10,
                scrollbars: "y",
                classNames: { scrollbar: classes.scrollBar },
              }}
              data={[
                { value: "all", label: "All Games" },
                { value: "backlog", label: "Backlog" },
                { value: "playing", label: "Playing" },
                { value: "completed", label: "Completed" },
                { value: "100%", label: "100% Complete" },
                { value: "on hold", label: "On Hold" },
                { value: "dropped", label: "Dropped" },
              ]}
              value={status}
              onChange={(value) => onStatusChange(value || "all")}
              className={classes.filterDropdown}
              mb="sm"
            />

            <Fieldset
              legend="Sort by Platform:"
              radius="lg"
              variant="filled"
              styles={{
                legend: {
                  fontFamily: "Noto Sans",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: 300,
                },
              }}
            >
              <Chip.Group
                value={platform}
                onChange={onPlatformChange}
                multiple={false}
              >
                <Group gap="lg" justify="center">
                  <Chip value="all">All Platforms</Chip>
                  {platforms.map((platform) => (
                    <Chip key={platform} value={platform}>
                      {platform}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Fieldset>

            <Switch
              label="Rated Games Only"
              checked={ratedOnly}
              onChange={(event) => onRatedChange(event.currentTarget.checked)}
            />

            <Switch
              label="Platinum Games Only"
              checked={platinumOnly}
              onChange={(event) =>
                onPlatinumChange(event.currentTarget.checked)
              }
            />

            <Switch
              label="Wishlist Games Only"
              checked={wishlistOnly}
              onChange={(event) =>
                onWishlistChange(event.currentTarget.checked)
              }
            />

            <Group gap={5} align="flex-end" justify="flex-end">
              <Button
                variant="filled"
                fullWidth
                color="#cc1313"
                leftSection={<RefreshCcw size={18} />}
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            </Group>
          </Stack>
        </Modal>
      </div>
    </div>
  );
}
