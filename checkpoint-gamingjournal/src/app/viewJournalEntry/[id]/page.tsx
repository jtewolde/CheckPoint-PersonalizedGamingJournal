'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter} from 'next/navigation';
import { Text, LoadingOverlay, Button } from '@mantine/core';

import { ArrowLeft } from 'lucide-react';
import classes from './viewJournal.module.css';

export default function ViewJournalEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

    if (loading) {
    return <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />
  }

  if (!entry) return
   <Text color="red">Entry not found.</Text>;

  return (

    <div className={classes.wrapper}>

        <div className={classes.entryContainer}>
            <Text className={classes.gameName}>{entry.gameName}</Text>
            <Text className={classes.title}>{entry.title}</Text>
            <Text className={classes.content}>{entry.content}</Text>
            <Text className={classes.date}><b>Date Created:</b> {entry.displayDate}</Text>
            <Button className={classes.backbtn} variant='filled' color='violet' radius='lg' size='md' rightSection={<ArrowLeft />} onClick={() => router.back()}>Go Back</Button>
        </div>

    </div>

  );
}