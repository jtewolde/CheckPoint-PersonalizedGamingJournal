'use client'

import { useRouter } from "next/navigation"
import { Badge, Text, Image, Tooltip, ActionIcon, Group, Stack } from '@mantine/core';

import PlaceHolderImage from '../../../public/no-cover-image.png';
import classes from './EntryCard.module.css';

// Create type variable to determine which variant of entryCard, dashboard for recent entries section
// Journal for displaying journal entries on the page and compact for smaller cards
type EntryCardVariant = 'dashboard' | 'journal' | 'compact';

// Define the entryCard component props that uses all of the attributes and variant of entryCard
interface JournalEntryCardProps {
    entry: {
        _id: string;
        uuid: string;
        gameId: string;
        gameName: string;
        coverImage?: string;
        title: string;
        content: string;
        entryType?: string;
        tags?: string[];
        displayDate?: string;
    };

    variant?: EntryCardVariant;
}

export default function JournalEntryCard({entry, variant =  "journal"}: JournalEntryCardProps){

    const router = useRouter();

    // Determine the cover image URL or use a placeholder if not available
    const coverImage = entry.coverImage
    ? `https:${entry.coverImage.replace('t_thumb', 't_cover_big')}`
    : PlaceHolderImage.src;

    return (
        <div className={`${classes.entryCard} ${variant === 'dashboard' ? classes.dashboard : variant === 'compact' ? classes.compact: classes.journal}`} onClick={() => router.push(`/journal/${entry._id}`)}>

            {/* COVER */}
            <div className={classes.hoverCover}>
                <Image
                    src={coverImage}
                    alt={entry.gameName}
                    className={classes.cover}
                />
            </div>

            {/*CONTENT*/}
            <div className={classes.contentWrapper}>

                <div className={classes.header}>
                    <Text className={classes.gameName}>
                        {entry.gameName}
                    </Text>

                    {entry.entryType && (
                        <Badge
                            variant="light"
                            color="lime"
                            radius='xl'
                            size="md"
                        >
                            {entry.entryType}
                        </Badge>
                    )}
                </div>

                {/*TITLE*/}
                <Text className={classes.title}>
                    {entry.title}
                </Text>

                {/* CONTENT */}
                <Text className={classes.content}>
                    {entry.content.length >
                    (variant === 'dashboard' ? 100 : 180)
                        ? `${entry.content.slice(
                            0,
                            variant === 'dashboard'
                            ? 100
                            : 150
                        )}...`
                        : entry.content}
                </Text>

                {/*FOOTER*/}
                <div className={classes.footer}>
                    <Group gap={6}>
                        {entry.tags?.slice(0, variant === 'dashboard' ? 2 : 4).map((tag, index) => (
                            <Badge
                                key={index}
                                size="md"
                                radius="sm"
                                variant="dot"
                                color="blue"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </Group>

                    <Text className={classes.date}>{entry.displayDate}</Text>
                </div>
            </div>
        </div>
    )
}