'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { authClient } from '@/lib/auth-client';

import { Badge, Button, List, Select, SimpleGrid, Pagination, ThemeIcon, Modal, Group, Stack, Title, 
    Text, Checkbox, ActionIcon, MultiSelect, LoadingOverlay, Drawer } from '@mantine/core';

import toast from 'react-hot-toast';
import { FilePlus, ListFilter, Trash2, X } from 'lucide-react';

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

    const [gameId, setGameId] = useState('all')
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Draft filters (inside popover)
    const [draftGameId, setDraftGameId] = useState('all');
    const [draftTags, setDraftTags] = useState<string[]>([]);

    // State for opening delete all modal
    const [opened, {open, close}] = useDisclosure(false);

    const [drawerOpened, { toggle, close: closeDrawer }] = useDisclosure(false);

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
                tag: selectedTags.length > 0 ? selectedTags.join(',') : '',
                order: 'desc'
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
    }, [page, gameId, selectedTags]);

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
        <div className={classes.background}>

            <div className={classes.backgroundOverlay}>

                <div className={classes.journalWrapper}>

                    <div className={classes.journalHeader}>

                        <div className={classes.titleLogo}>
                            <h2 className={classes.journalTitle}>Your Journal</h2>
                        </div>

                        <Text className={classes.description} size="xl" mt="xl">
                            Reflect on your gaming journey by managing your journal entries here. Here you can:
                        </Text>

                        <List className={classes.descriptionList} spacing='sm' size='md' >
                            <List.Item
                                icon={
                                    <ThemeIcon size={30} radius="xl" variant='filled' color='#45B649'>
                                        <FilePlus size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <span className={classes.bold}>Add</span> new journal entries to document your gaming experiences.
                            </List.Item>

                            <List.Item
                                icon={
                                    <ThemeIcon size={30} radius="xl" variant="filled" color='#8b2ad4ff'>
                                        <ListFilter size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <span className={classes.bold}>Filter</span> entries by game to easily find specific reflections.
                            </List.Item>

                            <List.Item
                                icon={
                                    <ThemeIcon size={30} radius="xl" variant="filled" color='#d31919ff'>
                                        <Trash2 size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <span className={classes.bold}>Delete</span> individual entries or all entries for a specific game to keep your journal organized.
                            </List.Item>
                        </List>

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

                                console.log("Game Id", selectedGameObject.gameId)

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

                        <div className={classes.buttonGroup} >

                            <Button
                            variant='filled'
                            color='green'
                            size='md'
                            radius= 'md'
                            className={classes.addButton}
                            onClick={() => router.push('/journalForm')}
                            rightSection={<FilePlus />}
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
                            >
                            Filters
                            </Button>

                                {/* Drawer component to hold the filter options, slides in from left */}
                                <Drawer
                                    opened={drawerOpened}
                                    onClose={closeDrawer}
                                    position='left'
                                    size="330px"
                                    title='Sort and Filter'
                                    className={classes.drawer}
                                    styles={{
                                        content: {
                                            backgroundColor: '#252525ff'
                                        },
                                        header: {
                                            backgroundColor: '#252525ff',
                                            borderBottom: '1px solid gray',
                                            marginBottom: '10px'
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
                                    <Stack gap='xs'>
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
                                                    background: '#212121',
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
                                                    background: '#212121',
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

                                        <Button
                                            fullWidth
                                            mt="md"
                                            color="violet"
                                            onClick={() => {
                                                setGameId(draftGameId);
                                                setSelectedTags(draftTags);
                                                setPage(1);
                                                closeDrawer();
                                            }}
                                        >
                                            Apply Filters
                                        </Button>
                                    </Stack>
                                </Drawer>

                            <Button
                            variant='filled'
                            color='#e01515ff'
                            size='md'
                            radius= 'md'
                            className={classes.deleteEntriesButton}
                            onClick={open}
                            rightSection={<Trash2 />}
                            >
                                Delete All
                            </Button>

                        </div>
                        
                        {entries.length > 0 && (
                            <SimpleGrid cols={3} spacing="lg" className={classes.entriesGrid}>
                                {entries.map((entry) => (
                                    <div key={entry.uuid} className={classes.entryCard} onClick={() => router.push(`/journal/${entry.uuid}`)}>

                                        <div className={classes.entryHeader}>

                                            <h3 className={classes.entryGame}>{entry.gameName}</h3>

                                            <ActionIcon
                                                className={classes.deleteButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteJournalEntry(entry._id, entry.gameId)}
                                                }
                                                radius='md'
                                                size='lg'
                                                variant='filled'
                                                color='#e01515ff'
                                                loading={loading}
                                            >
                                                <Trash2 size={20} />
                                            </ActionIcon>

                                        </div>

                                        <div className={classes.entryInfoContainer}>

                                            <h3 className={classes.entryTitle}>{entry.title}</h3>

                                            <p className={classes.entryContent}>
                                                {entry.content.length > 150
                                                    ? `${entry.content.slice(0, 200)}...` // Truncate long content
                                                    : entry.content}
                                            </p>

                                            {/* ✅ TAGS SECTION */}
                                            {entry.tags && entry.tags.length > 0 && (
                                                <Group className={classes.tagsContainer}>
                                                    {entry.tags.map((tag: string, index: number) => (
                                                    <Badge
                                                        key={index}
                                                        variant="filled"
                                                        color="#854bcb"
                                                        radius="md"
                                                        size='lg'
                                                    >
                                                        {tag}
                                                    </Badge>
                                                    ))}
                                                </Group>
                                            )}
                                                
                                            <p className={classes.entryDate}>{entry.displayDate}</p>

                                        </div>
                                        
                                    </div>
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

        </div>
    );
}