'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { authClient } from '@/lib/auth-client';
import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import { Button, List, Popover, Select, SimpleGrid, Pagination, ThemeIcon, Modal, Group, Title, Text, Checkbox } from '@mantine/core';

import toast from 'react-hot-toast';
import { FilePlus, DeleteIcon, Eye, ListFilter, Trash2, Notebook } from 'lucide-react';

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

    const [gameName, setGameName] = useState('all')
    const [selectedGame, setSelectedGame] = useState('');

    const [opened, {open, close}] = useDisclosure(false);

    const router = useRouter();

    // Check if the user is authenticated, if not redirect to auth page
    const checkAuth = async () => {
        const session = await authClient.getSession();
        if (!session.data?.user) {
            router.push('/auth/signin');
        }
    }

    // Function to fetch journal entries
    const fetchEntries = async (pageNum = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token
            const res = await fetch(`/api/journal/getEntries?page=${pageNum}&limit=6`, {
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
            console.log('Journal Entries', data.journalEntries);
            console.log('Pagination', data.pagination);
            console.log('Total Entries from API:', data.pagination.totalEntries);
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
        checkAuth(); // Check authentication on component mount
    }, [router]);

    useEffect(() => {
        fetchEntries(page);
    }, [page]);

    // Function to delete a journal entry
    const deleteJournalEntry = async (journalEntryId: string, gameID: string) => {
        try {
            setLoading(true);
            const res = await fetch('/api/journal/deleteEntry', {
                method: 'POST',
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

    // Derived Filtered List
    const filteredEntries = entries.filter(
    (entry) => gameName === 'all' || entry.gameName === gameName).slice()

    // Find the selected game's object in the journal entries to get the gameID
    const selectedGameObject = entries.find(e => e.gameName === selectedGame);

     // If the loading state is true, display the loading overlay on screen
    if (loading) {
        return <GlobalLoader visible={loading} />;
    }

    return (
        <div className={classes.background}>

            {loading && <GlobalLoader visible={loading} />}

            <div className={classes.backgroundOverlay}>

                <div className={classes.journalWrapper}>

                    <div className={classes.journalHeader}>

                        <div className={classes.titleLogo}>
                            <h2 className={classes.journalTitle}>Your Journal</h2>
                        </div>

                        <Text className={classes.description} size="xl" mt="xl">
                            Reflect on your gaming journey by managing your journal entries here. Here you can:
                        </Text>

                        <List className={classes.descriptionList} spacing='sm' size='md' withPadding>
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

                        <div className={classes.buttonGroup} >

                            <Button
                            variant='filled'
                            color='green'
                            size='md'
                            radius= 'lg'
                            className={classes.addButton}
                            onClick={() => router.push('/journalForm')}
                            rightSection={<FilePlus />}
                            >
                                Add Entry
                            </Button>
                            

                            <Popover width={300} position='bottom' withArrow shadow='lg'>
                                <Popover.Target>
                                    <Button className={classes.filterButton} size='md' color='#854bcb' radius='lg' variant="filled" rightSection={<ListFilter />}>Filter</Button>
                                </Popover.Target>

                                <Popover.Dropdown styles={{dropdown: {backgroundColor: '#212121', color: 'white', border: '2px solid #424040ff'}}}>
                                    <Select
                                    styles={{
                                        wrapper: { color: '#212121'}, 
                                        input: { color: 'white', background: '#212121'}, 
                                        dropdown: { background: '#212121', color: 'whitesmoke'},
                                        option: { background: '#202020'}
                                    }}
                                    label="Choose a game to filter your journal by:"
                                    placeholder="Filter by Game"
                                    checkIconPosition='right'
                                    data={[
                                        { value: 'all', label: 'All Games' },
                                        ...gameNames.map((gameName) => ({
                                            value: gameName,
                                            label: gameName
                                        }))
                                    ]}
                                    value={gameName}
                                    onChange={(value) => setGameName(value || 'all')}
                                    className={classes.filterDropdown}
                                    mb="md"
                                    />
                                </Popover.Dropdown>

                            </Popover>

                            <Button
                            variant='filled'
                            color='#e01515ff'
                            size='md'
                            radius= 'lg'
                            className={classes.deleteEntriesButton}
                            onClick={open}
                            rightSection={<Trash2 />}
                            >
                                Delete All
                            </Button>

                        </div>
                        
                        <SimpleGrid cols={3} spacing="lg" className={classes.entriesGrid}>
                            {filteredEntries.map((entry) => (
                                <div key={entry._id} className={classes.entryCard} >
                                    <h3 className={classes.entryGame}>{entry.gameName}</h3>
                                    <h3 className={classes.entryTitle}>{entry.title}</h3>
                                    <p className={classes.entryContent}>
                                        {entry.content.length > 150
                                            ? `${entry.content.slice(0, 200)}...` // Truncate long content
                                            : entry.content}
                                    </p>
                                    <p className={classes.entryDate}>{entry.displayDate}</p>

                                    <div className={classes.entryActions}>
                                        <Button
                                            className={classes.viewButton}
                                            onClick={() => router.push(`/viewJournalEntry/${entry._id}`)}
                                            color="blue"
                                            radius="md"
                                            variant="filled"
                                            style={{ marginRight: 8 }}
                                            rightSection={<Eye />}
                                        >
                                            View
                                        </Button>

                                        <Button
                                            className={classes.deleteButton}
                                            onClick={() => deleteJournalEntry(entry._id, entry.gameId)}
                                            rightSection={<DeleteIcon />}
                                            radius='md'
                                            variant='filled'
                                            color='#e01515ff'
                                            loading={loading}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </SimpleGrid>                    

                    </div>

                    <div className={classes.paginationWrapper}>
                        <Pagination
                            size='lg'
                            radius='lg'
                            total={totalPages}
                            value={page}
                            onChange={setPage}
                        />
                    </div>

                </div>

            </div>

        </div>
    );
}