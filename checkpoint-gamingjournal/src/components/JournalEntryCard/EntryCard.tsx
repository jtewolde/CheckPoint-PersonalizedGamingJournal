'use client'

import { useRouter } from "next/navigation"
import { useMediaQuery } from "@mantine/hooks";
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
    ? `https:${entry.coverImage.replace('t_thumb', 't_1080p')}`
    : PlaceHolderImage.src;

    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <div className={`${classes.entryCard} ${variant === 'dashboard' ? classes.dashboard : variant === 'compact' ? classes.compact: classes.journal}`} onClick={() => router.push(`/journal/${entry._id}`)}>

            {/* COVER */}
            {variant === 'dashboard' && (
                <div className={classes.hoverCover}>
                    <Image
                        src={coverImage}
                        alt={entry.gameName}
                        className={classes.cover}
                    />
                </div>
            )}

            {variant === 'journal' && (
                <div className={classes.coverWrapper}>
                    <Image
                        src={coverImage}
                        alt={entry.gameName}
                        className={classes.coverImage}
                        fit='cover'
                    />
                </div>
            )}

            {/*CONTENT*/}
            <div className={classes.contentWrapper}>
                {/* Top Meta */}
                <div className={classes.metaRow}>
                    
                    <Text className={classes.gameName}>
                        {entry.gameName}
                    </Text>

                    <Group gap={6} wrap="wrap" className={classes.metaBadges}>
                        {entry.entryType && (
                            <Badge color="green" variant="light" size='md' radius='md'>
                                {entry.entryType}
                            </Badge>
                        )}

                        {entry.tags?.map((tag) => (
                            <Badge
                                key={tag}
                                variant="light"
                                color="blue"
                                size='md'
                                radius='md'
                            >
                                {tag}
                            </Badge>
                        ))}
                    </Group>
                </div>

                {/*TITLE*/}
                <Text className={classes.title}>
                    {entry.title}
                </Text>

                {/* PREVIEW TEXT */}
                <Text className={classes.content}>
                    {entry.content.length > 500 ? `${entry.content.slice(0, 800)}...` : entry.content}
                </Text>

                {/*FOOTER*/}
                <div className={classes.footer}>
                    <Text className={classes.date}>{entry.displayDate}</Text>
                </div>
            </div>
        </div>
    )
}