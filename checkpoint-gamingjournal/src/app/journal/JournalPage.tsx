'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

import classes from './journal.module.css';

import { Table, Button, LoadingOverlay, Overlay, Popover, Select, SimpleGrid, Pagination } from '@mantine/core';

import toast from 'react-hot-toast';
import { FilePlus, DeleteIcon, Eye, ListFilter } from 'lucide-react';


export default function Journal() {
    // State variables for the journal entries
    const [entries, setEntries] = useState<any[]>([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [gameName, setGameName] = useState('all')
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

    // Get unique game names from entries for the dropdown
    const gameNames = Array.from(new Set(entries.map(entry => entry.gameName)));

    // Derived Filtered List
    const filteredEntries = entries.filter(
    (entry) => gameName === 'all' || entry.gameName === gameName
    )
    .slice()

    // Function to delete a journal entry
    const deleteJournalEntry = async (journalEntryId: string, gameID: string) => {
        try {
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
            fetchEntries();
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            toast.error('Error deleting journal entry');
        }
    };

    if (loading) {
        return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
    }

    return (
        <div className={classes.container}>

            <Overlay
                gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgb(94, 94, 94) 90%)"
                opacity={0.5}
                zIndex={0}
            />

            <div className={classes.journalWrapper}>

                <h2 className={classes.journalTitle}>Your Journal Entries</h2>

                <div className={classes.buttonGroup} >

                    <Button
                    variant='filled'
                    color='lime'
                    size='md'
                    radius= 'lg'
                    className={classes.addButton}
                    onClick={() => router.push('/journalForm')}
                    rightSection={<FilePlus />}
                    >
                        Add Journal Entry
                    </Button>

                    <Popover width={300} position='bottom' withArrow shadow='lg'>
                        <Popover.Target>
                            <Button className={classes.filterButton} size='md' color='#854bcb' radius='lg' variant="filled" rightSection={<ListFilter />}>Filter By Name</Button>
                        </Popover.Target>

                        <Popover.Dropdown>
                            <Select
                                label="Choose a game to filter your journal by"
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

                </div>

                <div className={classes.entriesCountWrapper}>
                    <p className={classes.entriesCount}>{filteredEntries.length} Journal Entries found</p>
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
                                    color='red'
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </SimpleGrid>

                <div className={classes.paginationWrapper}>
                    <Pagination
                        size='lg'
                        total={totalPages}
                        value={page}
                        onChange={setPage}
                    />
                </div>

            </div>
        </div>
    );
}