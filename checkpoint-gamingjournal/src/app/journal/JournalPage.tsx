'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { authClient } from '@/lib/auth-client';

import JournalEntryCard from '@/components/JournalEntryCard/EntryCard';
import JournalEntryModal from '@/components/JournalEntryModal/EntryModal';
import JournalFilters from '@/components/JournalFilters/JournalFilters';

import { Button, Select, SimpleGrid, Pagination, Modal, Group, Stack, Title, 
    Text, Checkbox, ActionIcon, LoadingOverlay, Pill } from '@mantine/core';

import toast from 'react-hot-toast';
import { FilePlus, Bookmark, Trash2, ClipboardCheck, Gamepad, NotebookText, Link } from 'lucide-react';

import PlaceHolderImage from "../../../public/no-cover-image.png";
import HeroImage from "../../../public/cyberpunkWallpaper.jpg";

import classes from './journal.module.css';

export default function Journal() {
    // State variables for the journal entries
    const [entries, setEntries] = useState<any[]>([]);
    const [totalEntries, setTotalEntries] = useState(0);

    const [loading, setLoading] = useState(true);
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState('')

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [games, setGames] = useState<{ gameId: string, gameName: string }[]>([]);
    const [totalGames, setTotalGames] = useState(0);
    
    // State variables for the most journaled game and last journal entry for the stat cards
    const [mostJournaledGame, setMostJournaledGame] = useState<any>(null);
    const [favoriteEntryType, setFavoriteEntryType] = useState<any>(null);

    // State variables for filters based on game, entry type, tags, and sorting order
    const [gameId, setGameId] = useState('all')
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedType, setSelectedType] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // 
    const activeFilters = [
        ...(gameId !== 'all' ? [gameId] : []),
        ...(selectedType ? [selectedType] : []),
        ...selectedTags,
    ];

    // State for opening delete all modal
    const [opened, {open, close}] = useDisclosure(false);
    const [entryModalOpened, {open: openEntryModal, close: closeEntryModal}] = useDisclosure(false);

    const isMobile = useMediaQuery('(max-width: 560px)');
    const router = useRouter();

    // Check if the user is authenticated, if not redirect to auth page
    const checkAuth = async () => {
        const session = await authClient.getSession();
        if (!session.data?.user) {
            router.push('/auth/signin');
        }
    }

    // Function to fetch the list of games with journal entries for the filter dropdown
    const fetchGames = async () => {
        try{
            const token = localStorage.getItem('bearer_token');
            const res = await fetch('/api/journal/games', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch user journal entries');
            }

            const data = await res.json();
            setGames(data.games);
            setTotalGames(data.games.length);
            setMostJournaledGame(data.mostJournaled[0] || null);
            setFavoriteEntryType(data.favoriteEntryType[0] || null);
            console.log('Games with journal entries:', data.games);
            console.log('Most journaled game:', data.mostJournaled);
            console.log("Favorite Entry Type", data.favoriteEntryType[0] || null);
        } catch (error) {
            console.log('Error fetching games with journal entries', error);
        }
    }

    // Function to fetch journal entries
    const fetchEntries = async (pageNum = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token

            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '6',
                gameId: gameId !== 'all' ? gameId : '',
                type: selectedType,
                tag: selectedTags.length > 0 ? selectedTags.join(',') : '',
                order: sortOrder
            })

            const res = await fetch(`/api/journal?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch user journal entries');
            }

            const data = await res.json();
            setEntries(data.journalEntries);
            setTotalPages(data.pagination.totalPages);
            setTotalEntries(data.pagination.totalEntries)
        } catch (error) {
            console.log('Error fetching user journal entries', error);
        } finally {
            setLoading(false); // Hide loading overlay after fetching data
        }
    };

    useEffect(() => {
        fetchGames(); // Fetch games for filter dropdown 
        checkAuth(); // Check authentication on component mount
    }, [router]);

    // Refetch journal entries whenenver the page number changes
    useEffect(() => {
        fetchEntries(page);
    }, [page, gameId, selectedTags, selectedType, sortOrder]);

    // Function to delete a journal entry
    const deleteJournalEntry = async (journalEntryId: string, gameID: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/journal/${journalEntryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
                },
                body: JSON.stringify({ journalEntryId, gameID }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete journal entry');
            }

            console.log('Journal entry deleted successfully:', data.message);
            toast.success('Journal entry deleted successfully');

            // Re-fetch the journal entries to update the list
            setLoading(false);
            fetchEntries();
        } catch (error) {
            setLoading(false);
            console.error('Error deleting journal entry:', error);
            toast.error('Error deleting journal entry');
        }
    };

    // Function to delete all journal entries of a selected game
    const deleteEntriesByGame = async(gameID: string) => {
        try{
            // Set loading state to true to display overlay
            setLoading(true)

            if(!selectedGame){
                setError("Please select a game")
                return
            }

            // Call deleteEntriesByGame API Route
            const res = await fetch('/api/journal/deleteEntriesbyGame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
                },
                body: JSON.stringify({ gameID }),
            });

            // Retrieve JSON response for deletion and check for errors
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete journal entries');
            }

            console.log(`All Journal Entries for ${selectedGame} deleted successfully!`)
            toast.success(`All Journal Entries for ${selectedGame} deleted successfully!`)

            setLoading(false)
            await fetchEntries();

        } catch(error) {
            setLoading(false);
            console.error('Error deleting journal entries:', error);
            toast.error('Error deleting journal entries');
        }
    }

    // Get unique game names from entries for the dropdown
    const gameNames = Array.from(new Set(entries.map(entry => entry.gameName)));

    // Find the selected game's object in the journal entries to get the gameID
    const selectedGameObject = entries.find(e => e.gameName === selectedGame);

    return (
        <div className={classes.pageWrapper}>
            <div className={classes.journalWrapper}>
                <div className={classes.hero}>
                    <Image
                        src={HeroImage.src}
                        className={classes.heroImage}
                        alt='Gaming Journal Hero'
                        fill
                        priority
                    />

                    <div className={classes.heroOverlay}>
                        <Stack className={classes.heroContent} gap='sm' justify='center'>
                            <h2 className={classes.journalTitle}>Gaming Journal</h2>

                            <Text className={classes.description}>
                                Capture memorable moments, strategies, acheivements, endings, and more from you gaming adventures.
                            </Text>
                        </Stack>
                    </div>
                </div>

                {/* Delete Entries By Game Modal */}
                <Modal opened={opened} onClose={close} centered styles={{content: {backgroundColor: '#2c2c2dff', border: '1px solid #545454ff'}, header: {backgroundColor: '#2c2c2fff'}, close: {color: 'white'}}}>
                    <Group className={classes.modalText} mb={20} ta='left'>
                        <Title className={classes.modalTitle} order={3} ta='center'>
                            Delete All Entries of a Game
                        </Title>

                        <Text c="white" fz="md" ta="center" mb={10}>
                            This will permanently delete <b>all</b> journal entries assoicated with the selected game.  
                            This action cannot be undone.
                        </Text>

                        <Select
                            label="Select Game"
                            size='lg'
                            width={200}
                            placeholder="Choose a game to delete its entries"
                            data={gameNames.map((game) => ({ value: game, label: game }))}
                            value={selectedGame}
                            onChange={(value) => setSelectedGame(value || '')}
                            styles={{
                                input: { backgroundColor: '#212121', color: 'white' },
                                dropdown: { backgroundColor: '#2c2c2fff', color: 'white' },
                                label: { fontFamily: 'Noto Sans', color: 'white', fontSize: '18px'},
                                option: { background: '#212121'}
                            }}
                            mb="lg"
                            error={error}
                        />

                        <Checkbox radius='md' color='blue' c='white' size='md' label='I understand that I am permanently deleting my journal entries for this game' checked={checked} error={error} onChange={(event) => setChecked(event.currentTarget.checked)} />
            
                        <Button
                            className={classes.deleteEntriesButton}
                            color="#d8070b"
                            size="md"
                            mt={15}
                            radius="lg"
                            variant="filled"
                            rightSection={<Trash2 />}
                            disabled={!checked || !selectedGame}
                            loading={loading}
                            onClick={async () => {
                                if (!selectedGame) {
                                    setError('Please select a game');
                                    return;
                                }

                                if (!checked) {
                                    setError('Please confirm before deleting');
                                    return;
                                }

                                if (!selectedGameObject) {
                                    toast.error('Invalid game selection');
                                    return;
                                }

                                await deleteEntriesByGame(selectedGameObject.gameId); // ✅ Call your helper function
                                setChecked(false);
                                setSelectedGame('');
                                close(); // ✅ Close modal
                            }}
                        >
                        Delete Entries
                        </Button>
                    </Group>
                </Modal>

                <div className={classes.statsContainer}>
                    <SimpleGrid cols={{base: 2, sm: 2, md: 2, lg: 2, xl: 4}} spacing="lg" className={classes.quickStatsGrid}>
                        <div className={classes.quickStatItem}>
                            <div className={classes.quickStatContent}>
                                <ClipboardCheck size={40} color='#7c18ed' />
                                <Text className={classes.quickStatValue}>{totalEntries}</Text>
                                <Text className={classes.quickStatSubtext}>Total Entries</Text>
                            </div>
                        </div>

                        <div className={classes.quickStatItem}>
                            <div className={classes.quickStatContent}>
                                <Gamepad size={40} color='#7c18ed' />
                                <Text className={classes.quickStatValue}>{totalGames}</Text>
                                <Text className={classes.quickStatSubtext}>Games Journaled</Text>
                            </div>
                        </div>

                        <div className={classes.quickStatItem}>
                            <div className={classes.quickStatContent}>
                                <NotebookText size={40} color='#7c18ed' />
                                <div className={classes.mostJournaledContent}>
                                    <Text className={classes.mostJournaledName}>{mostJournaledGame?.gameName || 'N/A'}</Text>
                                </div>
                                <Text className={classes.quickStatSubtext}>Most Journaled Game</Text>
                            </div>
                        </div>

                        <div className={classes.quickStatItem}>
                            <div className={classes.quickStatContent}>
                                <Bookmark size={40} color='#7c18ed' />
                                <div className={classes.favoriteEntryContent}>
                                    <Text className={classes.favoriteEntryName}>{favoriteEntryType?._id || 'N/A'}</Text>
                                </div>
                                <Text className={classes.quickStatSubtext}>Favorite Entry Type</Text>
                            </div>
                        </div>
                    </SimpleGrid>
                </div>

                <div className={classes.buttonsContainer}>
                    {/* ✅ LOADING OVERLAY */}
                    <LoadingOverlay
                        visible={loading}
                        overlayProps={{ radius: 'sm', blur: 2 }}
                        loaderProps={{ size: 'lg', color: "white", type: "oval" }}
                    />

                    <JournalEntryModal
                        key={selectedGameObject?.gameId ?? 'journal-entry-modal'}
                        opened={entryModalOpened}
                        onClose={closeEntryModal}
                        gameId={selectedGameObject?.gameId ?? ''}
                        gameName={selectedGameObject?.gameName ?? ''}
                        onSuccess={() => close()}
                        onEntryCreated={fetchEntries}
                    />

                    <div className={classes.buttonGroup} >
                        <ActionIcon
                            variant='filled'
                            color='green'
                            size='xl'
                            radius= 'md'
                            className={classes.addButton}
                            onClick={openEntryModal}
                            hiddenFrom='sm'
                        >
                            <FilePlus />
                        </ActionIcon>

                        <ActionIcon
                            variant='filled'
                            color='#e01515ff'
                            size='xl'
                            radius= 'md'
                            className={classes.deleteEntriesButton}
                            onClick={open}
                            hiddenFrom='sm'
                        >
                            <Trash2 />
                        </ActionIcon>

                        <Button
                            variant='filled'
                            color='green'
                            size='md'
                            radius= 'md'
                            className={classes.addButton}
                            onClick={openEntryModal}
                            rightSection={<FilePlus />}
                            visibleFrom='sm'
                        >
                            Add Entry
                        </Button>

                        <Button
                            variant='filled'
                            color='#e01515ff'
                            size='md'
                            radius= 'md'
                            className={classes.deleteEntriesButton}
                            onClick={open}
                            rightSection={<Trash2 />}
                            hidden={isMobile}
                            visibleFrom='sm'
                        >
                            Delete All
                        </Button>
                        
                        <JournalFilters
                            className={classes.filterButton}
                            color='indigo'
                            size='md'
                            radius='md'
                            variant='default'
                            availableGames={games.map((game) => ({ id: game.gameId, name: game.gameName }))}
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

                    {activeFilters.length > 0 && (
                        <Group className={classes.activeFiltersWrapper} mb='lg' gap='xs'>
                            {gameId !== 'all' && (
                                <Pill
                                    size="lg"
                                    radius="sm"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setGameId('all');
                                        setPage(1);
                                    }}
                                >
                                    {`Game: ${games.find(g => g.gameId === gameId)?.gameName}`} ✕
                                </Pill>
                            )}

                            {selectedTags.length > 0 && (
                                <Pill
                                    className={classes.filterBadge}
                                    size="lg"
                                    radius="sm"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSelectedTags([]);
                                        setPage(1);
                                    }}
                                >
                                    {`Tags: ${selectedTags.join(', ')}`} ✕
                                </Pill>
                            )}

                            {selectedType && (
                                <Pill
                                    className={classes.filterBadge}
                                    size="lg"
                                    radius="sm"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSelectedType('');
                                        setPage(1);
                                    }}
                                >
                                    {`Type: ${selectedType}`} ✕
                                </Pill>
                            )}
                        </Group>
                    )}

                </div>
                    
                {entries.length > 0 && (
                    <SimpleGrid cols={{base: 1, sm: 2, md: 2, lg: 2}} spacing="lg" className={classes.entriesGrid}>
                        {entries.map((entry) => (
                            <JournalEntryCard key={entry._id} entry={entry} variant='journal' color='#7c18ed' />
                        ))}
                    </SimpleGrid>
                )}

                {!loading && entries.length === 0 && (
                    <p className={classes.noGamesText}>No games found for the selected tags.</p>
                )}

                {entries.length !== 0 &&(
                    <div className={classes.paginationWrapper}>
                        <Pagination
                            classNames={{
                                control: classes.paginationControl
                            }}
                            size='xl'
                            radius='xs'
                            total={totalPages}
                            value={page}
                            onChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}