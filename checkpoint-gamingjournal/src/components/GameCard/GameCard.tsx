'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';
import { useLibraryGame } from '@/hooks/useLibraryGame';

import { Badge, Text, Image, Tooltip, ActionIcon } from '@mantine/core';

import { Plus, Minus } from 'lucide-react';

import PlaceHolderImage from '../../../public/no-cover-image.png';
import classes from './GameCard.module.css';

// Define the GameCard component that takes a game prop
interface GameCardProps {
    game: {
        id: number;
        name: string;
        cover?: {url: string;};
        game_type?: {type: string;};
        genres?: {name: string;}[];
        platforms?: {name: string;}[];
        release_dates?: {human: string;}[];
        first_release_date?: number;
        total_rating?: number;
    };
}

export default function GameCard({ game }: GameCardProps) {

    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 450px)');

    // Determine the cover image URL or use a placeholder if not available
    const coverImage = game.cover
    ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
    : PlaceHolderImage.src;

    // State variables for determing if current gameCard is in the user's library
    const {isInLibrary, setIsInLibrary, loading} = useLibraryGame(game.id);
    const [addingToLibrary, setAddingtoLibrary] = useState(false)

    // const handleQuickToggle = async (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     if (loading || addingToLibrary) return;

    //     setAdd
    // }

    return (
        <div key={game.id} className={classes.gameCard} onClick={() => router.push(`/games/${game.id}`)}>

            <div className={classes.imageWrapper}>

                <Image 
                src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}` : PlaceHolderImage.src } 
                alt={game.name} 
                className={classes.cover}  
                />

                <div className={classes.overlay}>

                    <Text className={classes.gameName}>{game.name}</Text>

                    <div 
                    className={classes.quickAdd} 
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Quick Add', game.id)
                    }}
                    >

                        <Tooltip label={isInLibrary ? 'Remove from Library': 'Add to Library'} withArrow disabled={isMobile}>
                            <ActionIcon size='lg' radius='xl' variant='filled' color={isInLibrary ? 'red' : 'green'}>
                                {isInLibrary ? (
                                    <Minus size={18} strokeWidth={2.5} />
                                    ) : (
                                    <Plus size={18} strokeWidth={2.5} />
                                )}
                            </ActionIcon>
                        </Tooltip>

                    </div>

                </div>

            </div>
            
            <div className={classes.gameInfo}>

                <h3 className={classes.gameTitle}>{game.name}</h3>

                <div className={classes.ratingTypeSection}>

                    <Badge size='md' variant='filled' color='gray'>{game.game_type?.type}</Badge>

                    <Badge 
                    className={classes.badge}
                    variant='filled' 
                    color={game.total_rating && game.total_rating >= 80 ? 'green' : game.total_rating && game.total_rating >= 70 ? 'yellow' : 'red'}
                    radius='md'
                    size='md'
                    >
                        {game.total_rating ? `${Math.round(game.total_rating)}` : 'N/A'}
                    </Badge>

                </div>

                <div className={classes.badgeContainer}>

                    {game.genres?.slice(0, 2).map((genre: { name: string }) => (
                        <Badge key={genre.name} size="md" variant="filled" color="white" radius='lg' c='black'>
                            {genre.name}
                        </Badge>
                    ))}

                </div>

                <p className={classes.gameDate}>{game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
                : 'N/A'}
                </p>
            </div>

        </div>
    )
}