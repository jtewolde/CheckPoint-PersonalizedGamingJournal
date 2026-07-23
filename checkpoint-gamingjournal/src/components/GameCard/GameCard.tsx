'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { useLibraryGame } from '@/hooks/useLibraryGame';
import { useAuth } from '@/context/Authcontext';

import PlaySessionModal from '../PlaySessionModal/SessionModal';
import EditGameInfoModal from '../EditGameInfoModal/EditGameInfoModal';
import AddToLibraryModal from '../AddToLibraryModal/AddToLibraryModal';

import { Badge, Image, Tooltip, ActionIcon, Rating, OverflowList, Text, ThemeIcon, Group} from '@mantine/core';
import toast from 'react-hot-toast';

import { Plus, Minus, Ellipsis, Trophy, ClipboardEdit, Star, Check, PowerOff, Backpack, Pause, Play, Timer, CalendarDays } from 'lucide-react';

import { FaXbox, FaWindows, FaApple, FaAndroid, FaSteam, FaLinux, FaTrophy, FaGoogle } from "react-icons/fa";
import { SiPlaystation, SiPlaystation2, SiPlaystation3, SiPlaystation4, SiPlaystation5, SiPlaystationportable, SiPlaystationvita } from "react-icons/si"
import { BsNintendoSwitch, BsPc } from "react-icons/bs";

import PlaceHolderImage from '../../../public/no-cover-image.png';
import classes from './GameCard.module.css';

// Create type variable to determine which variant of gameCard, default for search results and more info
// Compact for Popular and Trending games sections with less info
type GameCardVariant = 'default' | 'compact' | 'small' | 'library'| 'upcoming'

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
        hours?: number;
        platinum?: boolean;
        completionDate?: string;
    }

    libraryGame?: any;

    onQuickLog?: (game: {
        gameId: string;
        title: string;
        cover?: string;
    }) => void;
    onAddToLibrary?: (game: any) => void;
    onSuccess?: () => void;
    variant?: GameCardVariant;
}

export default function GameCard({ game, libraryGame, variant = 'default', libraryMeta, onQuickLog, onSuccess }: GameCardProps) {

    const {isAuthenticated, setIsAuthenticated} = useAuth(); // Access global auth state
    const [opened, {open, close} ] = useDisclosure(false);
    const [editOpened, {open: editOpen, close: editClose}] = useDisclosure(false)
    const [AddOpened, {open: openAddModal, close: closeAddModal}] = useDisclosure(false);
    const anyModalOpen = opened || editOpened || AddOpened;

    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 480px)');

    // State variables for determing if current gameCard is in the user's library
    const {isInLibrary} = useLibraryGame(game.id);
    const [loading, setLoading] = useState(false);
    const [addingToLibrary, setAddingtoLibrary] = useState(false)

    // Prepare platform data for display, showing up to 3 platforms and indicating if there are more.
    const platforms = game.platforms ?? [];
    const visiblePlatforms = platforms.slice(0, 3);
    const remainingPlatforms = platforms.length - visiblePlatforms.length;

    // Function to handle removing the game from the user's library
    const handleRemoveFromLibrary = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("bearer_token");

            const res = await fetch(`/api/library/${libraryGame.gameId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to remove game.");
            }

            toast.success("Game Removed from library!");

            onSuccess?.();
        } catch (err) {
            toast.error("Failed to remove game.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to style game status badge depending on the status of the game
    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'Playing':
                return {
                    color: '#67baea',
                    textColor: '#79b8f3',
                    icon: <Play size={14} />,
                };

            case 'Completed':
                return {
                    color: '#0de40a',
                    textColor: '#72eb74',
                    icon: <Check size={14} />,
                };

            case '100%':
                return {
                    color: '#f2e422',
                    textColor: '#f9ed83',
                    icon: <Trophy size={14} />
                }

            case 'On Hold':
                return {
                    color: '#c88cf3',
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
                    color: '#f7bf5e',
                    icon: <Backpack size={14} />,
                };

            default:
                return {
                    color: 'gray',
                    icon: null,
                };
        }
    };

    // Variable to determine if game info should be displayed
    const showGameInfo = variant === 'default' || variant === 'upcoming';

    // Get the correct associating status info for the current game's card
    const statusInfo = getStatusInfo(libraryMeta?.status);

    // Helper function that maps the specific platform name to the associated logo to put on card
    const getPlatformIcon = (platform: string) => {
        const name = platform.toLowerCase();

        // Windows / PC
        if (name.includes("windows") || name === "pc")
            return <FaWindows size={18} />;

        // Apple
        if (name.includes("mac"))
            return <FaApple size={18} />;

        // Google Stadia
        if (name.includes("google stadia"))
            return <FaGoogle size={18} />;

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
        if (name.includes("switch") || name.includes("nintendo"))
            return <BsNintendoSwitch size={18} />;

        // PlayStation
        if (name.includes("playstation 5") || name.includes("ps5"))
            return <SiPlaystation5 size={39} />;

        if (name.includes("playstation 4") || name.includes("ps4"))
            return <SiPlaystation4 size={39} />;

        if (name.includes("playstation 3") || name.includes("ps3"))
            return <SiPlaystation3 size={39} />;

        if (name.includes("playstation 2") || name.includes("ps2"))
            return <SiPlaystation2 size={30} />;

        if (name.includes("playstation"))
            return <SiPlaystation size={30} />;

        if (name.includes("playstation vita"))
            return <SiPlaystationvita size={18} />

        if (name.includes("playstation portable"))
            return <SiPlaystationportable size={18} />

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
        <div key={game.id} className={`${classes.gameCard} ${variant === 'compact' ? classes.compact  : variant === 'small' ? classes.small : variant === 'library' ? classes.library : classes.default}`} onClick={() => {if(anyModalOpen) return;  router.push(`/games/${game.id}`)}}>
            <div className={classes.imageWrapper}>
                <Image 
                    src={game.cover ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}` : PlaceHolderImage.src } 
                    alt={game.name} 
                    className={classes.cover}  
                />

                {showGameInfo && (
                    <>
                        {variant === 'default' && (
                            <Badge 
                                className={classes.ratingBadge}
                                classNames={{ root: classes.root}}
                                variant='dot' 
                                color={game.total_rating && game.total_rating >= 80 ? '#1ace3b' : game.total_rating && game.total_rating >= 70 ? 'yellow' : '#f01e1e'}
                                radius='md'
                                size='md'
                            >
                                <Group gap={5} align='center' >
                                    <Star size={12} color='gold' fill='gold'/> 
                                    {game.total_rating ? `${Math.round(game.total_rating)}` : 'N/A'}
                                </Group>
                            </Badge>
                        )}

                        {showGameInfo && game.game_type?.type !== 'Main Game' && (
                            <Badge
                                className={classes.gameTypeBadge}
                                size='sm'
                                variant="light"
                                radius="sm"
                                color={game.game_type?.type == 'Expansion' ? 'grape' : game.game_type?.type == 'Remake' ? 'blue': '#2e2e2e'}
                            >
                                {game.game_type?.type }
                            </Badge>
                        )}
                    </>
                )}

                {variant === 'library' && (
                    <>
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

                        {libraryMeta?.platinum === true && (
                            <ThemeIcon className={classes.platinumIcon} size='md' radius='sm' variant='outline' color='black'>
                                <FaTrophy
                                    size={20} 
                                    color='gold'
                                    cursor='pointer'
                                />
                            </ThemeIcon>
                        )}  
                    </>
                )}

                <div className={classes.overlay}>
                    <div className={classes.quickAdd}>
                        {(variant === 'default' || variant === 'upcoming') && (
                            <Tooltip label={loading ? 'Checking library...' : isInLibrary ? 'Remove from Library': 'Add to Library'} withArrow disabled={isMobile || loading}>
                                <ActionIcon 
                                    size='lg' 
                                    radius='xl' 
                                    variant='filled' 
                                    color={loading ? 'gray' : isInLibrary ? 'red' : 'green'} 
                                    disabled={loading || addingToLibrary} 
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        if (isInLibrary) {
                                            handleRemoveFromLibrary();
                                        } else {
                                            openAddModal();
                                        }
                                    }}
                                >
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

                    <div className={classes.quickButtons}>
                        <PlaySessionModal 
                            key={game.id} 
                            opened={opened} 
                            onClose={close} 
                            gameId={game.id} 
                            gameName={game.name}
                            platforms={game.platforms?.map((platform) => platform.name)}
                            onSuccess={() => close()}  
                        />

                        <AddToLibraryModal
                            opened={AddOpened}
                            onClose={closeAddModal}
                            game={game}
                        />

                        <div className={classes.quickLibraryAdd}>
                            {variant === 'library' && (
                                <Tooltip label={loading ? 'Checking library...' : isInLibrary ? 'Remove from Library': 'Add to Library'} withArrow disabled={isMobile || loading}>
                                    <ActionIcon 
                                        size='lg' 
                                        radius='xl' 
                                        variant='filled' 
                                        color={loading ? 'gray' : isInLibrary ? 'red' : 'green'} 
                                        disabled={loading || addingToLibrary} 
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (isInLibrary) {
                                                handleRemoveFromLibrary();
                                            } else {
                                                openAddModal();
                                            }
                                        }}
                                    >
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
                        
                        <div className={classes.quickLog}>
                            {variant === 'library' && (
                                <Tooltip label='Quick Log' events={{ hover: true, focus: true, touch: true }} withArrow>
                                    <ActionIcon size='lg' radius='xl' variant='filled' color='blue' onClick={(e) => {e.stopPropagation(); open();}}> <CalendarDays size={18} /> </ActionIcon>
                                </Tooltip>
                            )}
                        </div>

                        <EditGameInfoModal opened={editOpened} onClose={editClose} libraryGame={libraryGame} onSuccess={() => close()}/>

                        <div className={classes.editInfo}>
                            {variant === 'library' && (
                                <Tooltip label='Edit Info' events={{ hover: true, focus: true, touch: true }} withArrow>
                                    <ActionIcon size='lg' radius='xl' variant='filled' color='violet' onClick={(e) => {e.stopPropagation(); editOpen();}}> <ClipboardEdit size={18} /> </ActionIcon>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {variant === 'library' && (
                <div className={classes.gameInfo}>
                    <h3 className={classes.gameTitle}>{game.name}</h3>

                    <div className={classes.ratingSection}>
                        <Group gap={3} align='center'>
                            <Rating 
                                size='md'
                                color={libraryMeta?.rating && libraryMeta?.rating > 0 ? 'yellow' : '#555'}
                                readOnly
                                value={libraryMeta?.rating} 
                            />

                            <Text className={classes.ratingText}>
                                {libraryMeta?.rating}/10
                            </Text>
                        </Group>

                        <Group gap={4} align='center'>
                            <Timer size={20} color='white' />
                            <Text className={classes.hoursPlayedText}>
                                {libraryMeta?.hours || 0} Hours Played
                            </Text>
                        </Group>
                    </div>
                </div>
            )}

            {showGameInfo && (
                <div className={classes.gameInfo}>
                    <h3 className={classes.gameTitle}>{game.name}</h3>

                    <Badge
                        size='md'
                        variant="default"
                        color="#784ac3"
                        c='white'
                        radius="lg"
                        fw={500}
                    >
                        {game.genres?.[0]?.name || 'N/A'}
                    </Badge>

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