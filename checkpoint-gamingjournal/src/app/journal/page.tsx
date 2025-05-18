'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import classes from './journal.module.css';

import { Table, Button, LoadingOverlay, Overlay } from '@mantine/core';

import toast from 'react-hot-toast';
import { FilePlus, DeleteIcon, Eye } from 'lucide-react';

export default function Journal() {
    // State variables for the journal entries
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Function to fetch journal entries
    const fetchEntries = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token
            const res = await fetch('/api/journal/getEntries', {
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
            console.log('Journal Entries', data.journalEntries);
        } catch (error) {
            console.log('Error fetching user journal entries', error);
        } finally {
            setLoading(false); // Hide loading overlay after fetching data
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

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

    // Function to create the rows of the table with the data of journal entries
        const rows = entries.map((entry) => (
        <Table.Tr key={entry._id}>
            <Table.Td className={classes.tableCell}>{entry.gameName}</Table.Td>
            <Table.Td className={classes.tableCell}>{entry.title}</Table.Td>
            <Table.Td className={classes.tableCell}>{entry.content}</Table.Td>
            <Table.Td className={classes.tableCell}>{entry.date}</Table.Td>
            <Table.Td className={classes.deleteButtonCell}>

                <Button
                    className={classes.viewButton}
                    onClick={() => router.push(`/viewJournalEntry/${entry._id}`)}
                    color="blue"
                    radius="lg"
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
                    radius='lg'
                >
                    Delete
                </Button>

            </Table.Td>

        </Table.Tr>
    ));

    if (loading) {
        return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
    }

    return (
        <div className={classes.container}>
            <Overlay
                gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgb(94, 94, 94) 90%)"
                opacity={0.8}
                zIndex={0}
            />

            <div className={classes.journalWrapper}>
                <h2 className={classes.journalTitle}>My Journal</h2>

                <Button
                    radius= 'lg'
                    className={classes.addButton}
                    onClick={() => router.push('/journalForm')}
                    rightSection={<FilePlus />}
                >
                    Add Journal Entry
                </Button>

                <div className={classes.tableContainer}>
                    <Table striped={true} stripedColor='#ededed' borderColor='black' withColumnBorders={true} highlightOnHover={true}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th className={classes.tableHeader}>Game</Table.Th>
                                <Table.Th className={classes.tableHeader}>Title</Table.Th>
                                <Table.Th className={classes.tableHeader}>Content</Table.Th>
                                <Table.Th className={classes.tableHeader}>Date</Table.Th>
                                <Table.Th className={classes.tableHeader}>View/Delete Entry</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}