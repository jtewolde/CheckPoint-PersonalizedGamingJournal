"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import {
  Autocomplete,
  useCombobox,
  Button,
  ActionIcon,
  Combobox,
  Text,
  Image,
  TextInput,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import classes from "./GameSearchBar.module.css";

// Define the props for the GameSearchBar component
// Props include optional placeholder text, size, radius, className,
// autoNavigate flag, and initialQuery for pre-filling the search input.
type GameSearchBarProps = {
  placeHolder?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  iconColor?: string;
  className?: string;
  autoNavigate?: boolean;
  initialQuery?: string;
  showButton?: boolean;
  showActionIcon?: boolean;
};

// Define the structure of a search result returned from the API
type SearchResult = {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  first_release_date?: number;
  genres?: {
    id: number;
    name: string;
  }[];
};

export default function GameSearchBar({
  placeHolder = "Search for games...",
  iconColor = "#211f20",
  size = "lg",
  radius = "md",
  className,
  autoNavigate = true,
  initialQuery = "",
  showButton = false,
  showActionIcon = false,
}: GameSearchBarProps) {
  // State to manage the current query and search results
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, startTransition] = useTransition();

  // Ref to use as a timeout for inputting game title to search in search bar
  const DEBOUNCE_DELAY = 500;
  const MIN_QUERY_LENGTH = 3;
  const MAX_RESULTS = 8;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  // Combobox used to close dropdown when entering name in search bar.
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  // Function to get the full cover image URL from the API response
  const getCoverUrl = (url?: string) => {
    if (!url) return null;

    return url.startsWith("//")
      ? `https:${url}`.replace("t_thumb", "t_1080p")
      : url.replace("t_thumb", "t_1080p");
  };

  // Function to handle search queries and fetch results from the API
  const handleSearch = async (query: string) => {
    setQuery(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel previous API request
    abortControllerRef.current?.abort();

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setIsSearching(true);
        const res = await fetch(
          `/api/igdb/games?query=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await res.json();
        const games = data.games;
        console.log("IGDB Results", data.games);

        // Remove duplicate game names
        const uniqueResults = games.filter(
          (game: any, index: number, self: any[]) =>
            index === self.findIndex((g) => g.name === game.name),
        );

        console.log("Unique Results", uniqueResults);

        setSearchResults(uniqueResults.slice(0, MAX_RESULTS)); // Update search results with unique values
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching search results", error);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_DELAY);
  };

  // Function to navigate to the search results page
  const navigateToSearch = (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    // Cancel pending autocomplete requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    abortControllerRef.current?.abort();

    combobox.closeDropdown();

    startTransition(() => {
      router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    });
  };

  // Cleanup effect to clear debounce timeout and abort any ongoing fetch request on component unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className={classes.wrapper}>
      <Combobox
        store={combobox}
        onOptionSubmit={(value) => {
          const selectedGame = searchResults.find(
            (game) => game.id.toString() === value,
          );

          if (selectedGame) {
            setQuery(selectedGame.name);
          }

          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <TextInput
            className={className}
            radius={radius}
            size={size}
            variant="filled"
            placeholder={placeHolder}
            value={query}
            onChange={(event) => handleSearch(event.currentTarget.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                combobox.openDropdown();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && autoNavigate) {
                e.preventDefault();
                navigateToSearch(query);
              }
            }}
            leftSection={<IconSearch size={20} />}
            rightSection={isSearching ? <Loader size="xs" /> : null}
            rightSectionPointerEvents="none"
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            <ScrollArea.Autosize type="hover" mah={500} scrollbars="y">
              {searchResults.map((game) => {
                const coverUrl = getCoverUrl(game.cover?.url);

                return (
                  <Combobox.Option value={game.id.toString()} key={game.id}>
                    <div
                      className={classes.option}
                      onClick={() => router.push(`/games/${game.id}`)}
                    >
                      <Image
                        src={coverUrl}
                        alt={`${game.name} cover`}
                        className={classes.optionImage}
                        radius="sm"
                        fit="cover"
                        fallbackSrc="/images/game-placeholder.png"
                      />

                      <div className={classes.gameInfo}>
                        <Text size="sm" fw={600} lineClamp={1}>
                          {game.name}
                        </Text>

                        {game.first_release_date && (
                          <Text size="xs" c="dimmed">
                            {new Date(
                              game.first_release_date * 1000,
                            ).getFullYear()}
                          </Text>
                        )}

                        {game.genres && game.genres.length > 0 && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {game.genres.map((genre) => genre.name).join(", ")}
                          </Text>
                        )}
                      </div>
                    </div>
                  </Combobox.Option>
                );
              })}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      {showButton && (
        <Button
          className={classes.button}
          color="white"
          c="black"
          size={size}
          radius={radius}
          onClick={() => autoNavigate && navigateToSearch(query)}
        >
          Search
        </Button>
      )}

      {showActionIcon && (
        <ActionIcon
          className={classes.iconButton}
          variant="filled"
          color={iconColor}
          c="white"
          size="input-lg"
          radius={radius}
          onClick={() => autoNavigate && navigateToSearch(query)}
        >
          <IconSearch size={25} />
        </ActionIcon>
      )}
    </div>
  );
}
