'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';
import { useLibraryGame } from '@/hooks/useLibraryGame';
import { useAuth } from '@/context/Authcontext';

import { Badge, Text, Image, Tooltip, ActionIcon } from '@mantine/core';
import toast from 'react-hot-toast';

import { Plus, Minus, Ellipsis } from 'lucide-react';

import PlaceHolderImage from '../../../public/no-cover-image.png';
import classes from './GameCard.module.css';

// Define the GameCard component that takes a game prop
interface GameCardProps {
    game: {
        id: string;
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

    const {isAuthenticated, setIsAuthenticated} = useAuth(); // Access global auth state

    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 450px)');

    // Determine the cover image URL or use a placeholder if not available
    const coverImage = game.cover
    ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
    : PlaceHolderImage.src;

    // State variables for determing if current gameCard is in the user's library
    const {isInLibrary, loading} = useLibraryGame(game.id);
    const [addingToLibrary, setAddingtoLibrary] = useState(false)

    // Function to handle quick adding and removing games from the user's library.
    const handleQuickToggle = async (gameId: string) => {
        if (loading || addingToLibrary){
            console.log('[GameCard]', {
                gameId: game.id,
                isInLibrary,
                loading,
            });
            return;
        } 

        setAddingtoLibrary(true);
        
        const wasInLibrary = isInLibrary

        try{
            if(!isAuthenticated){
                toast.error("You must be logged in to manage your library!")
                setAddingtoLibrary(false)
                return
            }

            const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token from localStorage
            const res = await fetch(wasInLibrary ? '/api/library/delete' : '/api/library/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Include the Bearer token
                },
                body: JSON.stringify({
                gameID: String(gameId),
                gameDetails: {
                    title: game.name,
                    genre: game.genres?.map((genre: any) => genre.name).join(', '),
                    coverImage: game.cover?.url,
                    releaseDate: game.first_release_date
                    ? new Date(game.first_release_date * 1000).toISOString()
                    : null,
                    journalEntries: [],
                },
            }),
        });

        if(res.status === 409){
            toast.error('The game already exists in your library!')
        } 
        
        if (!res.ok){
            throw new Error('Failed to update library');
        }

        toast.success(
            wasInLibrary ? 'Game has been removed from your library!' : 'Game has been added to your library!'
        );

        } catch(error) {
            console.error('Error updating game library', error)
            toast.error('An error has occured!')
        } finally {
            setAddingtoLibrary(false);
        }

    }

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
                        handleQuickToggle(String(game.id))
                    }}
                    >

                        <Tooltip label={loading ? 'Checking library...' : isInLibrary ? 'Remove from Library': 'Add to Library'} withArrow disabled={isMobile || loading}>
                            <ActionIcon size='lg' radius='xl' variant='filled' color={loading ? 'gray' : isInLibrary ? 'red' : 'green'} disabled={loading || addingToLibrary}>
                                {loading || isInLibrary === null ? (
                                    <Ellipsis size={18} strokeWidth={2.5} />
                                ):
                                isInLibrary ? (
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