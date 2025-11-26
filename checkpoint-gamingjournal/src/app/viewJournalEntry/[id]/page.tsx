'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Text, LoadingOverlay, Button } from '@mantine/core';

import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import { ArrowLeft } from 'lucide-react';
import classes from './viewJournal.module.css';

export default function ViewJournalEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the data for the specific journal entry
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = localStorage.getItem('bearer_token');
        const res = await fetch(`/api/journal/getEntry?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
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
    if (id) fetchEntry();
  }, [id]);

  // Render Global Loader while fetching journal entry data
  if (loading) {
    return <GlobalLoader visible={loading} />;
  }

  return (

    <div className={classes.wrapper}>

        <div className={classes.entryContainer}>
            <Text className={classes.gameName}>{entry.gameName}</Text>
            <Text className={classes.title}>{entry.title}</Text>
            <Text className={classes.content}>{entry.content}</Text>
            <Text className={classes.date}><b>Date Created:</b> {entry.displayDate}</Text>
            <Button className={classes.backbtn} variant='filled' color='violet' radius='lg' size='lg' rightSection={<ArrowLeft />} onClick={() => router.back()}>Go Back</Button>
        </div>

    </div>

  );
}