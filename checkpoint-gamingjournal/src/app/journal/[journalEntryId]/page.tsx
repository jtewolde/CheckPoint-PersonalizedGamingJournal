'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Text, Badge, Group, Button, Paper, ActionIcon, Tooltip } from '@mantine/core';
import toast from 'react-hot-toast';

import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import classes from './viewJournal.module.css';

export default function ViewJournalEntry() {
  const { journalEntryId } = useParams();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the data for the specific journal entry
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = localStorage.getItem('bearer_token');
        const res = await fetch(`/api/journal/${journalEntryId}`, {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET'
        });

        if (!res.ok) throw new Error('Failed to fetch entry');
        const data = await res.json();
        console.log("Journal Entry: ", data)
        setEntry(data.entry);

      } catch (err) {
          setEntry(null);
      } finally {
        setLoading(false);
      }
    };
    if (journalEntryId) fetchEntry();
  }, [journalEntryId]);

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
          router.push('/journal')

      } catch (error) {
          setLoading(false);
          console.error('Error deleting journal entry:', error);
          toast.error('Error deleting journal entry');
      }
  };

  // Render Global Loader while fetching journal entry data
  if (loading) {
    return <GlobalLoader visible={loading} />;
  }

  return (
    <div className={classes.wrapper}>
        <Paper className={classes.entryContainer} radius='xl'>

          {/* Top Navigation */}
          <Group justify='space-between' align='center' mb='lg'>

            <Button 
              className={classes.backbtn}
              variant='subtle' 
              color='gray' 
              radius='md' 
              size='sm' 
              leftSection={<ArrowLeft />} 
              onClick={() => router.back()}
            >
              Back to Journal  
            </Button>

            <Group gap='sm'>

              <Tooltip label='Edit' position='top'>
                <ActionIcon
                  variant="light"
                  color="blue"
                  radius="md"
                  size="lg"
                >
                  <Pencil size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label='Delete' position='top'>
                <ActionIcon
                  variant="light"
                  color="red"
                  radius="md"
                  size="lg"
                >
                  <Trash2 size={18} />
                </ActionIcon>
              </Tooltip>

            </Group>

          </Group>

          {/* Game Name */}
          <Group gap="xs" align='center'>
            <Text className={classes.gameName}>
              {entry.gameName}
            </Text>
          </Group>

          <Text className={classes.title}>{entry.title}</Text>

          {entry.entryType && (
            <Badge
              variant="light"
              color="blue"
              radius="sm"
              size="lg"
            >
                {entry.entryType}
            </Badge>
          )}

          {entry.tags && entry.tags.length > 0 && (
              <Group className={classes.tagsContainter} gap="lg" mt="sm" mb='lg'>
                  {entry.tags.map((tag: string, index: number) => (
                  <Badge
                      key={index}
                      variant="filled"
                      color="violet"
                      radius="md"
                      size='lg'
                  >
                      {tag}
                  </Badge>
                  ))}
              </Group>
          )}
            <Text className={classes.content}>{entry.content}</Text>
            <Text className={classes.date}><b>Date Created:</b> {entry.displayDate}</Text>
        </Paper>
    </div>
  );
}