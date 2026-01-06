'use client'

import { useRouter } from 'next/navigation';
import { Badge, Text, Image } from '@mantine/core';

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

    console.log("Game Object", game)

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

                <div className={classes.badgeContainer}>

                    {game.genres?.slice(0, 1).map((genre: { name: string }) => (
                        <Badge key={genre.name} size="md" variant="filled" color="white" radius='lg' c='black'>
                            {genre.name}
                        </Badge>
                    ))}

                    <Badge 
                    className={classes.badge}
                    variant='filled' 
                    color='green'
                    radius='md'
                    size='md'
                    >
                        {game.total_rating ? `${Math.round(game.total_rating)}` : 'N/A'}
                    </Badge>

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