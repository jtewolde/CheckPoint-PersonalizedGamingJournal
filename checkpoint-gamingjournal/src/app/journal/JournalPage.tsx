'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { authClient } from '@/lib/auth-client';

import JournalEntryCard from '@/components/JournalEntryCard/EntryCard';
import JournalEntryModal from '@/components/JournalEntryModal/EntryModal';

import { Button, Select, SimpleGrid, Pagination, SegmentedControl, Modal, Group, Stack, Title, 
    Text, Checkbox, ActionIcon, MultiSelect, LoadingOverlay, Drawer, Pill } from '@mantine/core';

import toast from 'react-hot-toast';
import { FilePlus, ListFilter, Trash2, Eye, RotateCcw } from 'lucide-react';

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

    // State variables for filters based on game, entry type, tags, and sorting order
    const [gameId, setGameId] = useState('all')
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedType, setSelectedType] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Draft filters (inside the drawer)
    const [draftGameId, setDraftGameId] = useState('all');
    const [draftType, setDraftType] = useState("")
    const [draftTags, setDraftTags] = useState<string[]>([]);

    // Compute active filters for display in the UI
    const activeFilters = (gameId !== 'all'? [`Game: ${games.find(g => g.gameId === gameId)?.gameName}`]: []).concat(
        selectedType ? [`Type: ${selectedType}`] : [],
        selectedTags.length > 0
            ? [`Tags: ${selectedTags.join(', ')}`]
            : []
    );

    // State for opening delete all modal
    const [opened, {open, close}] = useDisclosure(false);
    const [entryModalOpened, {open: openEntryModal, close: closeEntryModal}] = useDisclosure(false);
    const [drawerOpened, { toggle, close: closeDrawer }] = useDisclosure(false);

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
            console.log('Games with journal entries:', data.games);
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

                <div className={classes.heroSection}>
                    <Stack gap='sm' justify='center'>
                        <h2 className={classes.journalTitle}>Your Journal</h2>

                        <Text className={classes.description}>
                            Capture memorable moments, strategies, acheivements, endings, and more from you gaming adventures.
                        </Text>
                    </Stack>
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

                <div className={classes.mainSection}>

                    {/* ✅ LOADING OVERLAY */}
                    <LoadingOverlay
                        visible={loading}
                        overlayProps={{ radius: 'sm', blur: 2 }}
                        loaderProps={{ size: 'lg', color: "grape", type: "bars" }}
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
                            color='#854bcb'
                            size='xl'
                            radius= 'md'
                            className={classes.filterButton}
                            onClick={toggle}
                            hiddenFrom='sm'
                        >
                            <ListFilter />
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
                            className={classes.filterButton} 
                            size='md' 
                            color='#854bcb' 
                            radius='md' 
                            variant="filled" 
                            rightSection={<ListFilter />}
                            onClick={toggle}
                            hidden={!isMobile}
                            visibleFrom='sm'
                        >
                        Filters
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

                        {/* Drawer component to hold the filter options, slides in from left */}
                        <Drawer
                            opened={drawerOpened}
                            onClose={closeDrawer}
                            position='left'
                            size="300px"
                            title='Sort and Filter'
                            className={classes.drawer}
                            styles={{
                                header: {
                                    borderBottom: '1px solid gray',
                                    marginBottom: '10px'
                                },
                                body: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '90%',
                                },
                                title: {
                                    fontSize: '24px',
                                    color: 'white',
                                    fontFamily: 'Noto Sans',
                                    fontWeight: 300
                                },
                                close: {
                                    color: 'white'
                                }
                            }}
                        >
                            <Stack justify='space-between' h='100%'>
                                <Stack gap='md'>
                                    <Select
                                        styles={{
                                            dropdown: {
                                                background: '#212121',
                                                color: 'whitesmoke'
                                            },
                                            input: {
                                                background: '#212121',
                                                fontFamily: 'Noto Sans',
                                                color: 'white'
                                            },
                                            option: {
                                                fontFamily: 'Noto Sans',
                                                fontSize: '16px',
                                                fontWeight: 330
                                            },
                                            label: {
                                                fontFamily: 'Noto Sans',
                                                color: 'white',
                                                fontSize: '20px',
                                                fontWeight: 300
                                            }
                                        }}
                                        label="Filter by Game"
                                        placeholder="Select Game"
                                        checkIconPosition='right'
                                        scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                                        data={[
                                            { value: 'all', label: 'All Games' },
                                            ...games.map((game) => ({
                                                value: game.gameId,
                                                label: game.gameName
                                            }))
                                        ]}
                                        value={draftGameId}
                                        onChange={(value) => setDraftGameId(value || 'all')}
                                        className={classes.filterDropdown}
                                        mb="md"
                                    />

                                    <Select
                                        label="Filter by Entry Type"
                                        placeholder="Select Entry Type"
                                        styles={{
                                            dropdown: {
                                                background: '#212121',
                                                color: 'whitesmoke'
                                            },
                                            input: {
                                                background: '#212121',
                                                fontFamily: 'Noto Sans',
                                                color: 'white'
                                            },
                                            option: {
                                                fontFamily: 'Noto Sans',
                                                fontSize: '16px',
                                                fontWeight: 330
                                            },
                                            label: {
                                                fontFamily: 'Noto Sans',
                                                color: 'white',
                                                fontSize: '20px',
                                                fontWeight: 300
                                            }
                                        }}
                                        data={[
                                            "First Impressions",
                                            "Progress Update",
                                            "Boss Fight",
                                            "Achievement",
                                            "Story Reaction",
                                            "Review",
                                            "Ending Thoughts",
                                            "General",
                                        ]}
                                        value={draftType}
                                        onChange={(value) => setDraftType(value || '')}
                                        className={classes.filterDropdown}
                                        mb="md"
                                        clearable
                                    />

                                    <MultiSelect
                                        label="Filter by Tags"
                                        placeholder="Select Tags"
                                        styles={{
                                            dropdown: {
                                                background: '#212121',
                                                color: 'whitesmoke'
                                            },
                                            input: {
                                                background: '#212121',
                                                fontFamily: 'Noto Sans',
                                                color: 'white'
                                            },
                                            option: {
                                                fontFamily: 'Noto Sans',
                                                fontSize: '16px',
                                                fontWeight: 330
                                            },
                                            label: {
                                                fontFamily: 'Noto Sans',
                                                color: 'white',
                                                fontSize: '20px',
                                                fontWeight: 300
                                            }
                                            }}
                                            checkIconPosition='left'
                                            data={[
                                                "Story",
                                                "Boss Fight",
                                                "Exploration",
                                                "Multiplayer",
                                                "Grinding",
                                                "Side Quest",
                                                "Achievement",
                                                "Review",
                                            ]}
                                            value={draftTags}
                                            onChange={(value) => setDraftTags(value || 'all')}
                                            scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                                            className={classes.filterDropdown}
                                            mb="md"
                                    />

                                    <SegmentedControl
                                        fullWidth
                                        value={sortOrder}
                                        size='md'
                                        mb="md"
                                        onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                                        data={[
                                            { label: 'Newest', value: 'desc' },
                                            { label: 'Oldest', value: 'asc' }
                                        ]}
                                    >
                                        Sort: {sortOrder === 'desc' ? 'Newest → Oldest' : 'Oldest → Newest'}
                                    </SegmentedControl>
                                </Stack>
                                
                                <Stack gap='sm'>
                                    <div style={{ borderTop: '1px solid #6c6c6c', paddingTop: '0.5rem', gap: '0.5rem'}}>
                                        <Button
                                            fullWidth
                                            variant='subtle'
                                            color='white'
                                            leftSection={<RotateCcw size={18} />}
                                            mb='sm'
                                            onClick={() => {
                                                setGameId('all');
                                                setSelectedType('');
                                                setSelectedTags([]);

                                                setDraftGameId('all');
                                                setDraftType('');
                                                setDraftTags([]);

                                                setPage(1);
                                            }}
                                        >
                                            Clear Filters
                                        </Button>

                                        <Button
                                            fullWidth
                                            variant='filled'
                                            color="blue"
                                            onClick={() => {
                                                setGameId(draftGameId);
                                                setSelectedTags(draftTags);
                                                setSelectedType(draftType)
                                                setPage(1);
                                                closeDrawer();
                                            }}
                                        >
                                            Apply Filters
                                        </Button>

                                    </div>
                                </Stack>
                            </Stack>
                        </Drawer>
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

                            {draftTags.length > 0 && (
                                <Pill
                                    className={classes.filterBadge}
                                    size="lg"
                                    radius="sm"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setDraftTags([]);
                                        setSelectedTags([]);
                                        setPage(1);
                                    }}
                                >
                                    {`Tags: ${draftTags.join(', ')}`} ✕
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
                                        setDraftType('');
                                        setPage(1);
                                    }}
                                >
                                    {`Type: ${selectedType}`} ✕
                                </Pill>
                            )}
                        </Group>
                    )}
                    
                    {entries.length > 0 && (
                        <SimpleGrid cols={{base: 1, sm: 2, md: 2, lg: 3}} spacing="lg" className={classes.entriesGrid}>
                            {entries.map((entry) => (
                                <JournalEntryCard key={entry._id} entry={entry} variant='journal'/>
                            ))}
                        </SimpleGrid>
                    
                    )}
                </div>

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