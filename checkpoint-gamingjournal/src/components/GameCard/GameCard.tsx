'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { useLibraryGame } from '@/hooks/useLibraryGame';
import { useAuth } from '@/context/Authcontext';
import PlaySessionModal from '../PlaySessionModal/SessionModal';

import { Badge, Image, Tooltip, ActionIcon, Rating, Group, OverflowList } from '@mantine/core';
import toast from 'react-hot-toast';

import { Plus, Minus, Ellipsis, Trophy, ClipboardEdit, Star, Check, PowerOff, Backpack, Pause, Play } from 'lucide-react';

import { FaPlaystation, FaXbox, FaWindows, FaApple, FaAndroid, FaGoogle, FaSteam, FaLinux } from "react-icons/fa";
import { SiPlaystation, SiPlaystation2, SiPlaystation3, SiPlaystation4, SiPlaystation5, SiPlaystationportable, SiPlaystationvita } from "react-icons/si"
import { BsNintendoSwitch, BsPc } from "react-icons/bs";

import PlaceHolderImage from '../../../public/no-cover-image.png';
import classes from './GameCard.module.css';

// Create type variable to determine which variant of gameCard, default for search results and more info
// Compact for Popular and Trending games sections with less info
type GameCardVariant = 'default' | 'compact' | 'small' | 'library';

// Define the GameCard component that takes a game prop and attributes
interface GameCardProps {
    game: {
        id: string;
        name: string;
        cover?: {url: string;};
        game_type?: {type: string;};
        genres?: {name: string;}[];
        platforms?: {name: string; abbreviation?: string;}[];
        release_dates?: {human: string;}[];
        first_release_date?: number;
        total_rating?: number;
        status?: string
    };

    // Optional props for if the game is in the user's library
    libraryMeta?: {
        status?: string;
        rating?: number;
        duration?: number;
        platinum?: boolean;
        completionDate?: string;
    }

    onQuickLog?: (game: {
        gameId: string;
        title: string;
        cover?: string;
    }) => void;

    variant?: GameCardVariant;
}

export default function GameCard({ game, variant = 'default', libraryMeta, onQuickLog }: GameCardProps) {

    const {isAuthenticated, setIsAuthenticated} = useAuth(); // Access global auth state
    const [opened, {open, close} ] = useDisclosure(false);

    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 480px)');

    // Determine the cover image URL or use a placeholder if not available
    const coverImage = game.cover
    ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
    : PlaceHolderImage.src;

    // State variables for determing if current gameCard is in the user's library
    const {isInLibrary, loading} = useLibraryGame(game.id);
    const [addingToLibrary, setAddingtoLibrary] = useState(false)

    // Prepare platform data for display, showing up to 3 platforms and indicating if there are more.
    const platforms = game.platforms ?? [];
    const visiblePlatforms = platforms.slice(0, 3);
    const remainingPlatforms = platforms.length - visiblePlatforms.length;

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
            const res = await fetch(wasInLibrary ? `/api/library/${gameId}` : '/api/library', {
                method: wasInLibrary ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Include the Bearer token
                },
                body: JSON.stringify({
                gameID: String(gameId),
                gameDetails: {
                    title: game.name,
                    genre: game.genres,
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

    // Helper function to style game status badge depending on the status of the game
    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'Playing':
                return {
                    color: 'blue',
                    icon: <Play size={14} />,
                };

            case 'Completed':
                return {
                    color: 'green',
                    icon: <Check size={14} />,
                };

            case '100%':
                return {
                    color: 'gold',
                    icon: <Trophy size={14} />
                }

            case 'On Hold':
                return {
                    color: 'violet',
                    icon: <Pause size={14} />,
                };

            case 'Dropped':
                return {
                    color: 'red',
                    icon: <PowerOff size={14} />,
                };

            case 'Wishlist':
                return {
                    color: 'yellow',
                    icon: <Star size={14} />,
                };

            case 'Backlog':
                return {
                    color: 'orange',
                    icon: <Backpack size={14} />,
                };

            default:
                return {
                    color: 'gray',
                    icon: null,
                };
        }
    };

    // Get the correct associating status info for the current game's card
    const statusInfo = getStatusInfo(libraryMeta?.status)

    // Helper function that maps the specific platform name to the associated logo to put on card
    const getPlatformIcon = (platform: string) => {
        const name = platform.toLowerCase();

        // Windows / PC
        if (name.includes("windows") || name === "pc")
            return <FaWindows size={18} />;

        // Apple
        if (name.includes("mac"))
            return <FaApple size={18} />;

        // Linux
        if (name.includes("linux"))
            return <FaLinux size={18} />;

        // Steam
        if (name.includes("steam"))
            return <FaSteam size={18} />;

        // Android
        if (name.includes("android"))
            return <FaAndroid size={18} />;

        // iOS
        if (name.includes("ios"))
            return <FaApple size={18} />;

        // Nintendo
        if (name.includes("switch"))
            return <BsNintendoSwitch size={18} />;

        // PlayStation
        if (name.includes("playstation 5") || name.includes("ps5"))
            return <SiPlaystation5 size={30} />;

        if (name.includes("playstation 4") || name.includes("ps4"))
            return <SiPlaystation4 size={30} />;

        if (name.includes("playstation 3") || name.includes("ps3"))
            return <SiPlaystation3 size={39} />;

        if (name.includes("playstation 2") || name.includes("ps2"))
            return <SiPlaystation2 size={30} />;

        if (name.includes("playstation"))
            return <SiPlaystation size={30} />;

        // Xbox
        if (
            name.includes("xbox") ||
            name.includes("series x") ||
            name.includes("series s")
        )
            return <FaXbox size={18} />;

        return null;
    };

    return (
        <div key={game.id} className={`${classes.gameCard} ${variant === 'compact' ? classes.compact  : variant === 'small' ? classes.small : variant === 'library' ? classes.library : classes.default}`} onClick={() => {if(opened) return;  router.push(`/games/${game.id}`)}}>

            <div className={classes.imageWrapper}>

                <Image 
                src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}` : PlaceHolderImage.src } 
                alt={game.name} 
                className={classes.cover}  
                />

                {variant === 'default' && (
                    <Badge 
                        className={classes.ratingBadge}
                        variant='dot' 
                        color={game.total_rating && game.total_rating >= 80 ? '#2b8d08' : game.total_rating && game.total_rating >= 70 ? 'yellow' : '#e30000'}
                        radius='md'
                        size='sm'
                    >
                        <Group gap={5} align='center' >
                            <Star size={12} color='gold' fill='gold'/> 
                            {game.total_rating ? `${Math.round(game.total_rating)}` : 'N/A'}
                        </Group>
                        
                    </Badge>
                )}

                <div className={classes.overlay}>

                    <div className={classes.quickButtons}>

                        <div className={classes.quickAdd} onClick={(e) => {e.stopPropagation(); handleQuickToggle(String(game.id))}}>
                            {variant !== 'small' && (
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
                            )}

                        </div>
                        
                        <PlaySessionModal 
                            key={game.id} 
                            opened={opened} 
                            onClose={close} 
                            gameId={game.id} 
                            gameName={game.name}
                            platforms={game.platforms?.map((platform) => platform.name)}
                            onSuccess={() => close()}  
                        />
                        
                        <div className={classes.quickLog}>
                            {variant === 'library' && (
                                <Tooltip label='Quick Log' withArrow>
                                    <ActionIcon size='lg' radius='xl' variant='filled' color='blue' onClick={(e) => {e.stopPropagation(); open();}}> <ClipboardEdit size={18} /> </ActionIcon>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {variant === 'library' && (
                <div className={classes.gameInfo}>

                    <h3 className={classes.gameTitle}>{game.name}</h3>

                    <Badge 
                        className={classes.libraryBadge} 
                        color={statusInfo.color}
                        leftSection={statusInfo.icon}
                        variant='outline'
                        size='md'
                        radius='sm'
                    >
                        {libraryMeta?.status || "No Status"}
                    </Badge>

                    <div className={classes.ratingSection}>
                    
                        <Rating 
                            size='md'
                            color={libraryMeta?.rating && libraryMeta?.rating > 0 ? 'yellow' : '#555'}
                            fractions={2}
                            readOnly
                            value={libraryMeta?.rating} 
                        /> 

                        <Tooltip label='Platinumed/100%' position='right'>
                            <Trophy 
                                size={25} 
                                color={libraryMeta?.platinum ? 'gold' : '#555'}
                                fill={libraryMeta?.platinum ? 'gold' : 'none'}
                                cursor={'pointer'}
                            />
                        </Tooltip>
                    </div>
                </div>
            )}

            {variant === 'default' && (
                <div className={classes.gameInfo}>

                    <h3 className={classes.gameTitle}>{game.name}</h3>

                    <OverflowList
                        data={game.genres ?? []}
                        maxVisibleItems={3}
                        renderItem={(genre) => (
                            <Badge
                                key={genre.name}
                                size='xs'
                                variant="filled"
                                color="#2e2e2e"
                                radius="lg"
                                >
                                {genre.name}
                            </Badge>
                        )}
                        renderOverflow={(overflowItems) => (
                            <Badge
                                size={isMobile ? 'xs' : 'md'}
                                color='#808080'
                                variant="light"
                                radius="lg"
                                >
                                +{overflowItems.length} More
                            </Badge>
                        )}
                    />

                    <Group gap={8}>
                        {visiblePlatforms.map((platform) => (
                            <Tooltip
                                key={platform.name}
                                label={platform.name}
                                withArrow
                                >
                                <ActionIcon
                                    variant="subtle"
                                    size="md"
                                >
                                    {getPlatformIcon(platform.name)}
                                </ActionIcon>
                            </Tooltip>
                        ))}

                        {remainingPlatforms > 0 && (
                            <Tooltip
                                withArrow
                                multiline
                                label={platforms
                                    .slice(3)
                                    .map((p) => p.name)
                                    .join(", ")}
                                >
                                <Badge variant="light" color='gray'>
                                    +{remainingPlatforms}
                                </Badge>
                            </Tooltip>
                        )}
                        </Group>

                    <p className={classes.gameDate}>{game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                    : 'N/A'}
                    </p>
                </div>
            )}
        </div>
    )
}