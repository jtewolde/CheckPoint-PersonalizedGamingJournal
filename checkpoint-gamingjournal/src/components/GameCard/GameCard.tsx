'use client'

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Text, Card, Image } from '@mantine/core';

import PlaceHolderImage from '../../../public/no-cover-image.png';
import classes from './GameCard.module.css';
import { UserRound } from 'lucide-react';

// Define the GameCard component that takes a game prop
interface GameCardProps {
    game: {
        id: number;
        name: string;
        cover?: {url: string;};
        game_type?: {type: string;};
        genres?: {name: string;}[];
        release_dates?: {human: string;}[];
    };
}

export default function GameCard({ game }: GameCardProps) {
    const router = useRouter();

    // Determine the cover image URL or use a placeholder if not available
    const coverImage = game.cover
    ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
    : PlaceHolderImage.src;

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

                </div>

            </div>
            
            <div className={classes.gameInfo}>
                <h3 className={classes.gameTitle}>{game.name}</h3>
                {game.game_type && <Badge color='gray' size='sm' radius='lg' c='white'>{game.game_type.type}</Badge>}
                <p className={classes.gameDate}>{game.release_dates?.[0]?.human}</p>
            </div>

        </div>
    )
}