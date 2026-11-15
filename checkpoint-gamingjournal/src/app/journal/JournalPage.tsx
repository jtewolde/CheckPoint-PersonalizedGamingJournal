"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { authClient } from "@/lib/auth-client";

import JournalEntryCard from "@/components/Cards/JournalEntryCard/EntryCard";
import JournalEntryModal from "@/components/Modals/JournalEntryModal/EntryModal";
import FindGameModal from "@/components/Modals/FindGameModal/FindGameModal";
import JournalFilters from "@/components/Filters/JournalFilters/JournalFilters";
import JournalPageSearch from "@/components/JournalPageSearch/JournalPageSearch";
import JournalCalendar from "@/components/ActivityComponents/JournalCalendar/JournalCalendar";

import {
  Button,
  Select,
  SimpleGrid,
  Pagination,
  Modal,
  Group,
  Stack,
  Text,
  Checkbox,
  Image,
  Pill,
  SegmentedControl,
  Tooltip,
  ThemeIcon,
  EmptyState,
} from "@mantine/core";

import { toast } from "react-toastify";
import { FilePlus, Trash2, List, Calendar, Notebook } from "lucide-react";

import classes from "./journal.module.css";

export default function Journal() {
  // State variables for the journal entries
  const [entries, setEntries] = useState<any[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [games, setGames] = useState<{ gameId: string; gameName: string }[]>(
    [],
  );
  const [libraryGames, setLibraryGames] = useState<any[]>([]);

  // State variables for filters based on game, entry type, tags, and sorting order
  const [gameId, setGameId] = useState("all");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Create state variable for changing the view of the journal entries, whether with 2x2 grid or calendar
  const [view, setView] = useState<"list" | "calendar">("list");

  // State for opening delete all modal
  const [opened, { open, close }] = useDisclosure(false);
  const [entryModalOpened, { open: openEntryModal, close: closeEntryModal }] =
    useDisclosure(false);
  const [findGameOpened, { open: findGameOpen, close: findGameClose }] =
    useDisclosure(false);

  const isMobile = useMediaQuery("(max-width: 560px)");
  const router = useRouter();

  // Filter the journal entries results if using search bar
  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.gameName.toLowerCase().includes(search.toLowerCase()),
  );

  // Filter the entries for the journal calendar
  const filteredCalendarEntries = calendarEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(search.toLowerCase()) ||
      entry.gameName.toLowerCase().includes(search.toLowerCase()),
  );

  const activeFilters = [
    ...(gameId !== "all" ? [gameId] : []),
    ...(selectedType ? [selectedType] : []),
    ...selectedTags,
  ];

  // Define which quick action the user is performing.
  type GameAction = "log" | "journal" | "edit" | "delete";
  const [pendingAction, setPendingAction] = useState<GameAction | null>(null);

  // Store the selected game from the user's library
  const [selectedLibraryGame, setSelectedLibraryGame] = useState<any | null>(
    null,
  );
  // Store the selected game for deletion of its entries
  const [selectedDeleteGame, setSelectedDeleteGame] = useState<any | null>(
    null,
  );

  // Store the number of journal entries for the selected game
  const [selectedGameEntryCount, setSelectedGameEntryCount] = useState<
    number | null
  >(null);
  const [countLoading, setCountLoading] = useState(false);

  // Handle the action when the user selects a game from the find game modal
  const handleFindGame = (action: GameAction) => {
    setPendingAction(action);
    findGameOpen();
  };

  // Handle the selected game based on the pending action.
  const handleGameSelected = (game: any) => {
    setSelectedLibraryGame(game);
    findGameClose();

    switch (pendingAction) {
      case "journal":
        openEntryModal();
        break;

      case "delete":
        setSelectedDeleteGame(game);
        setChecked(false);
        setError("");
        fetchSelectedGameEntryCount(game.gameId);
        break;
    }

    setPendingAction(null);
  };

  // Check if the user is authenticated, if not redirect to auth page
  const checkAuth = async () => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      router.push("/auth/signin");
    }
  };

  // Function to fetch the list of games with journal entries for the filter dropdown
  const fetchGames = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/journal/games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user journal entries");
      }

      const data = await res.json();
      setGames(data.games);
    } catch (error) {
      console.log("Error fetching games with journal entries", error);
    }
  };

  // Function to get the games that the user is currently playing from their library
  const fetchLibraryGames = async () => {
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token from local storage
      const res = await fetch("/api/library", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user library");
      }

      const data = await res.json();

      setLibraryGames(data.games);
    } catch (error) {
      console.error("Error fetching playing games: ", error);
    }
  };

  // Function to fetch journal entries with pagination support
  const fetchEntries = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "6",
        gameId: gameId !== "all" ? gameId : "",
        type: selectedType,
        tag: selectedTags.length > 0 ? selectedTags.join(",") : "",
        order: sortOrder,
      });

      const res = await fetch(`/api/journal?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user journal entries");
      }

      const data = await res.json();
      setEntries(data.journalEntries);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.log("Error fetching user journal entries", error);
    } finally {
      setLoading(false); // Hide loading overlay after fetching data
    }
  };

  // Function to fetch all of the journal entries that the user has to put on the journal calendar view
  const fetchCalendarEntries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token

      const params = new URLSearchParams({
        gameId: gameId !== "all" ? gameId : "",
        type: selectedType,
        tag: selectedTags.length > 0 ? selectedTags.join(",") : "",
        order: sortOrder,
      });

      const res = await fetch(`/api/journal/calendar?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user journal entries");
      }

      const data = await res.json();
      setCalendarEntries(data.journalEntries);
    } catch (error) {
      console.log("Error fetching user journal entries", error);
    } finally {
      setLoading(false); // Hide loading overlay after fetching data
    }
  };

  // Helper function to fetch the number of journal entries for a selected game
  const fetchSelectedGameEntryCount = async (gameID: string) => {
    try {
      setCountLoading(true);
      setSelectedGameEntryCount(null);

      const params = new URLSearchParams({
        page: "1",
        limit: "1",
        gameId: gameID,
        type: "",
        tag: "",
        order: "desc",
      });

      const res = await fetch(`/api/journal?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve game journal entries");
      }

      const data = await res.json();

      setSelectedGameEntryCount(data.pagination.totalEntries);
    } catch (error) {
      console.error("Error fetching game entry count:", error);
      setSelectedGameEntryCount(null);
    } finally {
      setCountLoading(false);
    }
  };

  // Function to delete all journal entries of a selected game and refresh the journal data
  const deleteEntriesByGame = async (gameID: string): Promise<boolean> => {
    try {
      // Set loading state to true to display overlay
      setLoading(true);

      if (!selectedDeleteGame) {
        setError("Please select a game");
        return false;
      }

      // Call deleteEntriesByGame API Route
      const res = await fetch("/api/journal/deleteEntriesbyGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({ gameID }),
      });

      // Retrieve JSON response for deletion and check for errors
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete journal entries");
      }

      console.log(
        `All Journal Entries for ${selectedDeleteGame.title} deleted successfully!`,
      );
      toast.success(
        `All Journal Entries for ${selectedDeleteGame.title} deleted successfully!`,
      );

      // Refresh the journal data
      await fetchGames();
      await fetchEntries(page);

      if (view === "calendar") {
        await fetchCalendarEntries();
      }

      return true;
    } catch (error) {
      setLoading(false);
      console.error("Error deleting journal entries:", error);
      toast.error("An error occurred while deleting journal entries");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(); // Fetch games for filter dropdown
    fetchLibraryGames(); // Fetch library games for the find game modal
    checkAuth(); // Check authentication on component mount
  }, [router]);

  useEffect(() => {
    if (view === "calendar") {
      fetchCalendarEntries();
    }
  }, [view, gameId, selectedTags, selectedType, sortOrder]);

  // Refetch journal entries whenenver the page number changes
  useEffect(() => {
    fetchEntries(page);
  }, [page, gameId, selectedTags, selectedType, sortOrder]);

  // Filter library games to only include games with journal entries
  const deleteEligibleGames = libraryGames.filter((libraryGame) =>
    games.some((journalGame) => journalGame.gameId === libraryGame.gameId),
  );

  return (
    <div className={classes.background}>
      <div className={classes.pageWrapper}>
        <div className={classes.titleDescriptionSection}>
          <div className={classes.pageHeading}>
            <ThemeIcon
              className={classes.sectionIcon}
              size={isMobile ? 40 : 50}
              radius="md"
              style={{
                color: "#914cdf",
                backgroundColor: "rgba(160, 82, 255, 0.13)",
              }}
            >
              <Notebook size={28} strokeWidth={2.2} />
            </ThemeIcon>

            <h1 className={classes.titleText}>Gaming Journal</h1>
          </div>

          <Text className={classes.description}>
            Capture memorable moments, strategies, achievements, endings, and
            more from your gaming adventures.
          </Text>
        </div>

        {/* Delete Entries By Game Modal */}
        <Modal
          opened={opened}
          onClose={close}
          centered
          size="md"
          title="Delete All Entries of a Game"
          className={classes.drawer}
          styles={{
            header: {
              marginBottom: "10px",
            },
            body: {
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
            },
            title: {
              fontSize: "18px",
              color: "white",
              fontFamily: "Noto Sans",
              fontWeight: 300,
            },
            content: {
              fontSize: "18px",
              color: "white",
              fontFamily: "Inter",
              fontWeight: 400,
            },
            close: {
              color: "white",
            },
          }}
        >
          <Stack gap="md" ta="left">
            <Text c="white" fz="md" ta="left" fw={300}>
              This will permanently delete <b>all</b> journal entries assoicated
              with the selected game. This action cannot be undone.
            </Text>

            <Button
              variant="default"
              fullWidth
              size="md"
              radius="md"
              onClick={() => handleFindGame("delete")}
            >
              <Group gap="xs">
                {selectedDeleteGame?.coverImage && (
                  <Image
                    src={selectedDeleteGame.coverImage}
                    alt={selectedDeleteGame.title}
                    w={32}
                    h={32}
                    radius="sm"
                  />
                )}
                {selectedDeleteGame?.title || "Select a Game"}
              </Group>
            </Button>

            <Checkbox
              radius="md"
              color="#e70c0c"
              c="white"
              size="md"
              fw={300}
              label={
                countLoading
                  ? "Retrieving journal entry count..."
                  : `I understand that all ${selectedGameEntryCount ?? 0} journal entries for this game will be permanently deleted.`
              }
              checked={checked}
              disabled={
                countLoading ||
                selectedGameEntryCount === null ||
                selectedGameEntryCount === 0
              }
              onChange={(event) => setChecked(event.currentTarget.checked)}
            />

            <Button
              className={classes.deleteEntriesButton}
              color="#e70c0c"
              fullWidth
              radius="md"
              variant="filled"
              rightSection={<Trash2 size={16} />}
              disabled={
                !checked ||
                !selectedDeleteGame ||
                countLoading ||
                selectedGameEntryCount === null ||
                selectedGameEntryCount === 0
              }
              loading={loading}
              onClick={async () => {
                if (!selectedDeleteGame || !checked) return;

                await deleteEntriesByGame(selectedDeleteGame.gameId);

                setChecked(false);
                setSelectedDeleteGame(null);
                setSelectedGameEntryCount(null);
                setError("");
                close();
              }}
            >
              {selectedGameEntryCount !== null
                ? `Delete ${selectedGameEntryCount} Entries`
                : "Delete Entries"}
            </Button>
          </Stack>
        </Modal>

        <div className={classes.toolbarContainer}>
          <div className={classes.toolbar}>
            <div className={classes.toolbarTop}>
              <div className={classes.searchContainer}>
                <JournalPageSearch
                  borderColor="border: 1px solid transparent"
                  size="lg"
                  radius="md"
                  value={search}
                  onChange={setSearch}
                />
              </div>

              <div className={classes.toolbarButtons}>
                <FindGameModal
                  opened={findGameOpened}
                  onClose={() => {
                    findGameClose();
                    setPendingAction(null);
                  }}
                  libraryGames={
                    pendingAction === "delete"
                      ? deleteEligibleGames
                      : libraryGames
                  }
                  onSelect={handleGameSelected}
                />

                <JournalEntryModal
                  opened={entryModalOpened}
                  onClose={() => {
                    closeEntryModal();
                    setSelectedLibraryGame(null);
                    setPendingAction(null);
                  }}
                  selectedGame={selectedLibraryGame}
                  onSuccess={() => findGameClose()}
                  onEntryCreated={fetchEntries}
                />

                <Button
                  variant="outline"
                  color="#139609"
                  size="md"
                  radius="md"
                  className={classes.addButton}
                  onClick={() => handleFindGame("journal")}
                  rightSection={<FilePlus />}
                >
                  Add Entry
                </Button>

                <Button
                  variant="outline"
                  color="#e01515ff"
                  size="md"
                  radius="md"
                  className={classes.removeButton}
                  onClick={open}
                  rightSection={<Trash2 />}
                >
                  Delete
                </Button>
              </div>

              <div className={classes.filterContainer}>
                <JournalFilters
                  className={classes.filterButton}
                  color="indigo"
                  size="md"
                  radius="md"
                  variant="default"
                  buttonVariant="outline"
                  availableGames={games.map((game) => ({
                    id: game.gameId,
                    name: game.gameName,
                  }))}
                  sortOption={sortOrder}
                  selectedGameId={gameId}
                  selectedEntryType={selectedType}
                  selectedTags={selectedTags}
                  onSortChange={setSortOrder}
                  onGameIdChange={setGameId}
                  onEntryTypeChange={setSelectedType}
                  onTagsChange={setSelectedTags}
                />
              </div>

              <div className={classes.toolbarBottom}>
                <SegmentedControl
                  size="md"
                  value={view}
                  onChange={(value) => setView(value as "list" | "calendar")}
                  data={[
                    {
                      label: (
                        <Tooltip label="List View" withArrow>
                          <span>
                            <List size={20} />
                            <Text className={classes.viewText}>List</Text>
                          </span>
                        </Tooltip>
                      ),
                      value: "list",
                    },
                    {
                      label: (
                        <Tooltip label="Calendar View" withArrow>
                          <span>
                            <Calendar size={20} />
                            <Text className={classes.viewText}>Calendar</Text>
                          </span>
                        </Tooltip>
                      ),
                      value: "calendar",
                    },
                  ]}
                />
              </div>
            </div>

            {activeFilters.length > 0 && (
              <Group className={classes.activeFiltersWrapper}>
                {gameId !== "all" && (
                  <Pill
                    size="md"
                    c="white"
                    radius="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setGameId("all");
                      setPage(1);
                    }}
                  >
                    {`Game: ${games.find((g) => g.gameId === gameId)?.gameName}`}{" "}
                    ✕
                  </Pill>
                )}

                {selectedTags.length > 0 && (
                  <Pill
                    className={classes.filterBadge}
                    size="md"
                    c="white"
                    radius="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedTags([]);
                      setPage(1);
                    }}
                  >
                    {`Tags: ${selectedTags.join(", ")}`} ✕
                  </Pill>
                )}

                {selectedType && (
                  <Pill
                    className={classes.filterBadge}
                    size="md"
                    variant="outline"
                    c="white"
                    radius="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedType("");
                      setPage(1);
                    }}
                  >
                    {`Type: ${selectedType}`} ✕
                  </Pill>
                )}
              </Group>
            )}
          </div>
        </div>

        {view === "list" ? (
          <>
            {filteredEntries.length > 0 && (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
                spacing="lg"
                className={classes.entriesGrid}
              >
                {filteredEntries.map((entry) => (
                  <JournalEntryCard
                    key={entry._id}
                    entry={entry}
                    variant="journal"
                    color="#7c18ed"
                  />
                ))}
              </SimpleGrid>
            )}

            {!loading && entries.length === 0 && (
              <p className={classes.noGamesText}>
                No games found for the selected tags.
              </p>
            )}

            {entries.length !== 0 && (
              <div className={classes.paginationWrapper}>
                <Pagination
                  classNames={{
                    control: classes.paginationControl,
                  }}
                  size={isMobile ? "sm" : "xl"}
                  radius="xs"
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className={classes.calendarContainer}>
            <JournalCalendar
              className={classes.calendar}
              entries={filteredCalendarEntries}
              fullWidth={true}
              displayCover={false}
              variant="full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
