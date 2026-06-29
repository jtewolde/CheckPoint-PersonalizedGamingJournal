'use client'

import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Modal, Group, Stack, Button, Textarea, LoadingOverlay, Select, Rating, Checkbox, Text, TextInput, NumberInput, Slider } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import toast from "react-hot-toast";

import { Gamepad2, CalendarDays, Check, Pause, Clock, SaveAll, Star, Trophy, Play, PowerOff } from 'lucide-react';

import classes from './EditGameInfoModal.module.css';

// Define the props for the Edit Game Info Modal that takes teh 
interface EditGameInfoModalProps {
    opened: boolean;
    onClose: () => void;
    game?: any;
    libraryGames?: any[];
    libraryGame?: any;
    onSuccess?: () => void;
}

export default function EditGameInfoModal({ opened, onClose, libraryGames, libraryGame, game, onSuccess}: EditGameInfoModalProps){

    // States for storing the selected game's Id when changing game info
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<any>(null);
    const activeGame = libraryGame || selectedGame;

    // State variables for the info of a game in the user's library 
    // like game status, starting and completion date, rating, hours played, etc
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [isPlatinum, setIsPlatinum] = useState(false);
    const [hours, setHours] = useState(0);
    const [rating, setRating] = useState(0);

    const [startingDate, setStartingDate] = useState<string | null>(null);
    const [completionDate, setCompletionDate] = useState<string | null>(null); 

    const [loading, setLoading] = useState(false)
    const isMobile = useMediaQuery('(max-width: 510px)');

    // Populate the modal with info of the selected game in library
    useEffect(() => {
        if (!activeGame) return;

        setStatus(activeGame.status ?? '');
        setNotes(activeGame.notes ?? '');
        setIsPlatinum(activeGame.platinum ?? false);
        setRating(activeGame.rating ?? 0);
        setHours(activeGame.hours ?? '')
        setStartingDate(activeGame.startingDate ?? null);
        setCompletionDate(activeGame.completionDate ?? null);
    }, [activeGame]);

    // Function to handle updating and saving the game status, platinum, rating, notes,
    const handleSave = async () => {
        try{
            setLoading(true);
            const token = localStorage.getItem('bearer_token');

            const res = await fetch(`/api/library/${activeGame?.gameId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    gameDetails: {
                        status,
                        notes,
                        platinum: isPlatinum,
                        rating,
                        startingDate,
                        completionDate,
                        hours
                    },
                }),
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to edit game info');
            }
            
            const data = await res.json();
            console.log("PATCH INFO: ", data)
            toast.success('Changes have been saved!');
            
            setLoading(false);
            onSuccess?.();
            onClose();

        } catch (error){
            console.error('Error updating game status:', error);
            toast.error('Failed to update game info. Please try again.');
        }
    };

    // Define possible game statuses for the Select component in the Modal with descriptions for each status that the user can read
    const gameStatuses = [
        {
            value: 'Playing',
            label: 'Playing',
            description: "Currently playing and actively progressing in the game.",
            icon: <Play size={25} color='#1969b9'fill="#1969b9" />,
            color: '#1969b9'
        },
        {
            value: 'Completed',
            label: 'Completed',
            description: "Finished the main story or reached the game's primary ending",
            icon: <Check size={25} color='#27a01c'/>,
            color: '#27a01c'
            },
        {
            value: '100%',
            label: '100% Complete',
            description: 'Completed all major content, achievements, collectibles, and optional objectives',
            icon: <Trophy size={25} fill="yellow" color="yellow"/>,
            color: 'yellow'
        },
        {
            value: 'On Hold',
            label: 'On Hold',
            description: 'Taking a break from the game with plans to return later.',
            icon: <Pause size={25} color="violet" fill="violet"/>,
            color: 'violet'
        },
        {
            value: 'Dropped',
            label: 'Dropped',
            description: 'Stopped playing and do not currently plan to continue.',
            icon: <PowerOff size={25} color="red"/>,
            color: 'red'
        },
        {
            value: 'Wishlist',
            label: 'Wishlist',
            description: "Interested in playing this game in the future.",
            icon: <Star size={25} color='rgb(231, 210, 20)' fill="rgb(231, 210, 20)"/>,
            color: 'gold'
        },
        {
            value: 'Backlog',
            label: 'Backlog',
            description: "Own or intend to play this game, but not have started it yet.",
            icon: <Clock size={25} color="#21eebe"/>,
            color: 'orange'
        }
    ]

    // Function to render the options in the Select component with their respective icons and descriptions for each game status 
    const renderSelectOption = ({option}: any) => { 
        const statusItem = gameStatuses.find(s => s.value === option.value); 
            return statusItem ? ( 
                <Group gap='sm'> 
                    {statusItem.icon} 
                    <Text size='md' fw={600}>{statusItem.label}</Text> 
                    <Text size='xs' c='dimmed'>{statusItem.description}</Text> 
                </Group> 
            ) : null; 
    };

    return(
        <Modal
            opened={opened}
            onClose={onClose}
            size='xl'
            title={'Edit Game Info'}
        >

            {/* ✅ LOADING OVERLAY */}
            <LoadingOverlay
                visible={loading}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ size: 'lg', color: "white", type: "oval" }}
            />

            <Stack gap='lg'>
                {!libraryGame ? (
                    <Select
                        leftSection={<Gamepad2 size={20} />}
                        maxDropdownHeight={300}
                        className={classes.select}
                        data={(libraryGames || []).map((game: any) => ({
                            value: game.gameId,
                            label: game.title
                        }))}
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 16, scrollbars: 'y', color:'black',  classNames: { scrollbar: classes.scrollBar }}}
                        size="md"
                        label="Game"
                        description="Choose a game from your library"
                        placeholder="(e.g. God of War)"
                        value={selectedGameId}
                        onChange={(value) =>{
                            setSelectedGameId(value || '')

                            const selectedGame = (libraryGames || []).find(
                                (game) => game.gameId === value
                            );

                            setSelectedGame(selectedGame)
                        }}
                        searchable
                        required
                    />

                ):(
                    <TextInput
                        label="Game"
                        required
                        value={activeGame?.title}
                        readOnly
                        leftSection={<Gamepad2 size={20} />}
                    />
                )}

                {!isMobile ? (
                    <>
                        <Group grow align="flex-end">
                            <Select
                                className={classes.statusSelect}
                                label="Status"
                                placeholder="Select game status"
                                description="Track your current progress and relationship with this game."
                                size='md'
                                scrollAreaProps={{ scrollbarSize: 16, type: 'auto', scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                                value={status}
                                onChange={(value) => {
                                    if(!value) return;
                                    setStatus(value);
                                }}
                                data={gameStatuses.map((status) => ({
                                    value: status.value,
                                    label: status.label,
                                }))}
                                renderOption={renderSelectOption}
                            />

                            <NumberInput
                                label='Hours Played'
                                size="md"
                                leftSection={<Clock size={20} />}
                                description="Record your total playtime and watch your gaming journey grow over time."
                                placeholder="Enter hours"
                                min={0}
                                value={hours}
                                onChange={(value) => setHours(Number(value) || 0)}
                            />
                        
                        </Group>

                        <Group gap='lg' grow>

                            <DatePickerInput
                                size='md'
                                placeholder="(e.g. 5/27/2026)"
                                label="Start Date"
                                description='Select the date that you started playing'
                                clearable
                                leftSection={<CalendarDays size={20} />}
                                maxDate={new Date()}
                                // Convert stored string → Date ONLY for display
                                value={startingDate}
                                onChange={setStartingDate}
                                disabled={!activeGame}
                            />

                            <DatePickerInput
                                size='md'
                                placeholder="(e.g. 6/15/2026)"
                                label="Completion Date"
                                description='Select the date when you completed the game'
                                clearable
                                leftSection={<CalendarDays size={20} />}
                                maxDate={new Date()}
                                // Convert stored string → Date ONLY for display
                                value={completionDate}
                                onChange={setCompletionDate}
                                disabled={!activeGame}
                            />

                        </Group>
                    </>

                ): (
                    <>
                        <Stack gap='lg' align="flex-start">
                            <Select
                                className={classes.statusSelect}
                                label="Status"
                                placeholder="Select game status"
                                size='md'
                                scrollAreaProps={{ scrollbarSize: 16, type: 'auto', scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                                value={status}
                                onChange={(value) => {
                                    if(!value) return;
                                    setStatus(value);
                                }}
                                data={gameStatuses.map((status) => ({
                                    value: status.value,
                                    label: status.label,
                                }))}
                                renderOption={renderSelectOption}
                            />

                            <NumberInput
                                label='Hours Played'
                                size="md"
                                leftSection={<Clock size={20} />}
                                description="Record your total playtime and watch your gaming journey grow over time."
                                placeholder="Enter hours"
                                min={0}
                                value={hours}
                                onChange={(value) => setHours(Number(value) || 0)}
                            />
                        </Stack>

                        <Stack gap='lg'>
                            <DatePickerInput
                                size='md'
                                placeholder="(e.g. 5/27/2026)"
                                label="Start Date"
                                description='Select the date that you started playing'
                                clearable
                                leftSection={<CalendarDays size={20} />}
                                maxDate={new Date()}
                                // Convert stored string → Date ONLY for display
                                value={startingDate}
                                onChange={setStartingDate}
                                disabled={!activeGame}
                            />

                            <DatePickerInput
                                size='md'
                                placeholder="(e.g. 6/15/2026)"
                                label="Completion Date"
                                description='Select the date when you completed the game'
                                clearable
                                leftSection={<CalendarDays size={20} />}
                                maxDate={new Date()}
                                // Convert stored string → Date ONLY for display
                                value={completionDate}
                                onChange={setCompletionDate}
                                disabled={!activeGame}
                            />
                        </Stack>
                    </>
                )}

                <Textarea
                    size="sm"
                    label="Notes"
                    placeholder="Add notes about this game..."
                    description="Record thoughts, goals, memorable moments, achievements, or anything you'd like to remember."
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                    minRows={2}
                    autosize
                    disabled={!activeGame}
                />

                <Stack gap='lg' mb='md'>
                    <Group gap='lg' align="center">
                        <div className={classes.ratingContainer}>
                            <Text size='md' className={classes.ratingText}>Your Rating:</Text>
                            <div className={classes.ratingWrapper}>
                                <Rating
                                    size='xl' 
                                    fractions={2} 
                                    value={rating} 
                                    count={10}
                                    readOnly
                                    onChange={
                                    (value) => {
                                        setRating(value);
                                    }}
                                />
                                
                                <p className={classes.starsCount}>{rating}/10</p>
                            </div>
                        </div>

                    </Group>

                    <Slider
                        size='lg'
                        radius='xl'
                        min={0}
                        max={10}
                        step={0.5}
                        value={rating}
                        onChange={
                            (value) => {
                                setRating(value);
                            }
                        }
                    />

                    <Checkbox
                        size="lg"
                        label={'Platinum Achieved'}
                        checked={isPlatinum}
                        onChange={(event) =>
                            setIsPlatinum(event.currentTarget.checked)
                        }
                        disabled={!activeGame}
                    />

                </Stack>

                <Button size='md' radius='md' leftSection={<SaveAll size={20} />} onClick={handleSave}>
                    Confirm Changes
                </Button>

            </Stack>
        </Modal>
    )
}