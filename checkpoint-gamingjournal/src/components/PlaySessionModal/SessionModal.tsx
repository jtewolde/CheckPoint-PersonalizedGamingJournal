'use client'

import { useEffect, useState } from "react"
import { Modal, Divider, Stack, Button, TextInput, LoadingOverlay, NumberInput, Select, MultiSelect, Textarea } from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";

import toast from "react-hot-toast";

import classes from './SessionModal.module.css';

import { Smile, CalendarDays, NotebookPen, Gamepad2, Clock, LibraryBig } from "lucide-react";
import { IconBrandXbox } from "@tabler/icons-react";

// Define the playSession object used on both calendar and modal with the props
type PlaySession = {
    _id: string
    gameName: string
    gameId: string
    date: string
    duration: number
    notes: string
    sessionType: string[]
    mood?: string
    platform?: string
}

// Define the props for the PlaySessionModal component
type PlaySessionModalProps = {
    opened: boolean;
    onClose: () => void;
    gameId?: string;
    gameName?: string;
    platforms?: string[];
    session?: PlaySession | null;
    onSuccess?: (session: PlaySession) => void
    onSessionCreated?: () => void;
};

export default function PlaySessionModal({ opened, onClose, gameId, session, gameName, platforms, onSuccess, onSessionCreated }: PlaySessionModalProps) {

    // State variables to hold info on play time duration using hours and minutes inputs
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const duration = hours * 60 + minutes;

    // State variables to hold play session details such as notes, date, session type, mood, and platform for the form inputs in the modal
    const [playSessionNotes, setPlaySessionNotes] = useState("");
    const [playSessionDate, setPlaySessionDate] = useState<string | null>(null);
    const [sessionType, setSessionType] = useState<string[]>([]);
    const [mood, setMood] = useState<string>("");
    const [platform, setPlatform] = useState<string>("");

    const [loading, setLoading] = useState(false);

    // State variables to hold selected game and user's game library for the select dropdown in the modal
    const [selectedGameName, setSelectedGameName] = useState(gameName || "");
    const [selectedGameId, setSelectedGameId] = useState(gameId || "");
    const [userGames, setUserGames] = useState<any[]>([]);

    // Helper function to quickly reset the all of the info on the form
    const resetForm = () => {
        setHours(0);
        setMinutes(0);
        setPlaySessionNotes("");
        setPlaySessionDate(null);
        setSessionType([]);
        setMood('');
        setPlatform('');
    };

    // Helper function to parse the date from the date input in the modal to display correct date
    const parseLocalDate = (dateString: string) => {
        const date = new Date(dateString);

        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        );
    };

    // Fetch the user's library of games to populate the select dropdown
    useEffect(() => {
        if(!gameId && opened){
            const fetchUserGames = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token
                    const res = await fetch("/api/library", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        throw new Error("Failed to fetch user library");
                    }

                    const data = await res.json();
                    setUserGames(data.games); // Store the games in state
                    console.log(data.games);

                } catch (error) {
                    console.error("Error fetching user library:", error);
                } finally {
                    setLoading(false); // Hide loading overlay after fetching data
                }
            };
        fetchUserGames();
        };
    }, [opened, gameId]);

    // Update selected game name and ID when the modal is opened with a specific game, or when the library game data changes
    useEffect(() => {
        if(!opened) return;

        if (session) {
            setSelectedGameId(session.gameId || '');
            setSelectedGameName(session.gameName || '');
            setSessionType(session.sessionType || []);
            setPlaySessionNotes(session.notes || '');
            setPlaySessionDate(session.date ?? null);
            setPlatform(session.platform || '');
            setMood(session.mood || '');

            setHours(Math.floor(session.duration / 60));
            setMinutes(session.duration % 60);
        } else if(!playSessionNotes) {
            setSelectedGameId(gameId || '')
            setSelectedGameName(gameName || '')
        }
        
    }, [opened, gameId, gameName]);

    // Function to handle creating or updating a play session for a game 
    // This will involve opening a modal with a form to input play session details such as duration and notes, 
    // and then making an API call to save the play session to the database and associate it with the game and user's library.
    const handleSubmit = async () => {
        try{
            setLoading(true);
            // Validate required fields and show error toast if any are missing
            if (!selectedGameId || !playSessionDate || duration <= 0) {
                toast.error("Please fill out all required fields.");
                return;
            }

            // Receive session token for authenication and determine if play session is being edited or not
            const token = localStorage.getItem('bearer_token');
            const isEditing = !!session

            // Create custom URL for updating or creating play session
            const url = isEditing
                ? `/api/playSession/${session._id}`
                : `/api/playSession`;

            const method = isEditing ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Include the Bearer token
                },
                body: JSON.stringify({
                    gameID: String(selectedGameId),
                    gameName: selectedGameName,
                    duration,
                    notes: playSessionNotes,
                    sessionType: sessionType,
                    mood,
                    platform,
                    date: playSessionDate,
                })
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to log play session');
            }

            // Show success toast and reset form fields after successful logging
            toast.success(isEditing ? "Session updated!" : "Session created!");
            resetForm();
            setLoading(false);
            onSessionCreated?.();
            onClose();
        
        } catch(error){
            setLoading(false);
            console.error('Error logging play session:', error);
            toast.error('Failed to log play session. Please try again.');
        }
    }

    // Custom close handler that will display window to user if modal close button is clicked on
    // This is to prevent changes/additions to notes, tags, session type to be lost
    const handleClose = () =>{
        const hasUnsavedChanges =
            playSessionNotes ||
            playSessionDate ||
            sessionType.length > 0 ||
            mood || platform ||
            hours > 0 || minutes > 0;
            
        if(hasUnsavedChanges){
            const confirmed = window.confirm(
                "You have unsaved changes. Are you sure you want to close?"
            );

            if(!confirmed){
                return
            }
        }

        onClose();
    }

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            size='lg' 
            title={(gameId ? 'Play Session for ' + gameName : 'Quick Log Session')} 
            withCloseButton 
            closeOnClickOutside={false} 
            closeOnEscape={false}
        >

            {/* ✅ LOADING OVERLAY */}
            <LoadingOverlay
                visible={loading}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ size: 'lg', color: "white", type: "oval" }}
            />

            <Stack gap='lg'>
                {gameId ? (
                    <TextInput
                        label="Game"
                        required
                        value={gameName}
                        readOnly
                        leftSection={<Gamepad2 size={20} />}
                    />
                ): (
                    <Select
                        leftSection={<Gamepad2 size={20} />}
                        maxDropdownHeight={300}
                        className={classes.select}
                        data={userGames.map((game: any) => ({
                            value: game.gameId,
                            label: game.title
                        }))}
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 16, scrollbars: 'y', color:'black',  classNames: { scrollbar: classes.scrollBar }}}
                        size="md"
                        label="Game"
                        description="Choose a game from your library"
                        placeholder="(e.g. God of War)"
                        value={selectedGameId}
                        onChange={(value, option) =>{
                            setSelectedGameId(value || '')
                            setSelectedGameName(option?.label || '')
                        }}
                        searchable
                        required
                    />
                )}

                <Textarea
                    className={classes.textInput}
                    styles={{
                        wrapper: { color: '#212121'}, 
                        input: { color: 'white', background: '#212121'}, 
                    }}
                    size="md"
                    minRows={3}
                    maxRows={10}
                    maxLength={2500}
                    autosize
                    label="Session Summary"
                    placeholder="Enter play session notes... "
                    description={`${playSessionNotes.length}/2500 characters`}
                    value={playSessionNotes}
                    onChange={(e) => setPlaySessionNotes(e.target.value)}
                    style={{ marginTop: "1rem" }}
                />

                <MultiSelect
                    className={classes.select}
                    leftSection={<LibraryBig size={20} />}
                    label="Session Type"
                    placeholder="Add session type (e.g. story, multiplayer)"
                    description="What type of play session did you have?"
                    data={[
                        "Story Progress",
                        "Multiplayer",
                        "Casual Play",
                        "Ranked",
                        "Boss Fight",
                        "Exploration",
                        "Grinding",
                        "Side Quest",
                        "Achievement Hunting",
                    ]}
                    value={sessionType}
                    onChange={setSessionType}
                    searchable
                    size="md"
                    styles={{
                        input: { color: "white", background: "#212121" },
                        dropdown: { background: "#212121", color: "whitesmoke" },
                    }}
                    style={{ marginTop: "1rem" }}
                />

                <div className={classes.platformMoodContainer}>
                    <Select
                        leftSection={<IconBrandXbox size={20} />}
                        maxDropdownHeight={300}
                        className={classes.select}
                        value={platform}
                        data={(platforms ?? []).map((platform) => ({
                            value: platform,
                            label: platform
                        }))}
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 16, scrollbars: 'y', color:'black',  classNames: { scrollbar: classes.scrollBar }}}
                        size="md"
                        label="Platform"
                        description="Where did you play?"
                        placeholder="(e.g. PC, PS5, Xbox)"
                        onChange={(value) =>{
                            setPlatform(value || '')
                        }}
                    />

                    <Select
                        leftSection={<Smile size={20} />}
                        maxDropdownHeight={300}
                        className={classes.select}
                        data={[
                            "Relaxed",
                            "Focused",
                            "Competitive",
                            "Frustrated",
                            "Excited",
                            "Fun",
                            "Chill"
                        ]}
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 16, scrollbars: 'y', color:'black',  classNames: { scrollbar: classes.scrollBar }}}
                        size="md"
                        label="Mood"
                        description="How did you feel during this session?"
                        placeholder="(e.g. Fun, Frustrating, Relaxing, Nostalgic)"
                        value={mood}
                        onChange={(value) => {
                            setMood(value || '')
                        }}
                    />
                </div>

                <DatePickerInput
                    size='md'
                    label="Session Date"
                    placeholder='Select session date'
                    clearable
                    required
                    leftSection={<CalendarDays size={20} />}
                    maxDate={new Date()}
                    // Convert stored string → Date ONLY for display
                    value={playSessionDate}
                    onChange={setPlaySessionDate}
                />

                <div className={classes.durationContainer}>
                    <NumberInput
                        label='Time Played (Hours)'
                        leftSection={<Clock size={20} />}
                        placeholder="Enter hours"
                        min={0}
                        value={hours}
                        onChange={(value) => setHours(Number(value) || 0)}
                    />

                    <NumberInput
                        label='Minutes'
                        placeholder="Enter minutes"
                        min={0}
                        max={59}
                        value={minutes}
                        onChange={(value) => setMinutes(Number(value) || 0)}
                    />
                </div>

                <Divider styles={{label: {color: 'white'}}} labelPosition="center" color='dimmed' my="md"  />

                <div className={classes.buttonGroup}>

                    <Button 
                    className={classes.cancelButton}
                    color="red"
                    size="md"
                    variant='filled'
                    onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                    className={classes.logButton}
                    variant='filled'
                    color='green'
                    leftSection={<NotebookPen size={20}/>}
                    size='md'
                    disabled={!selectedGameId || !playSessionDate || duration <= 0}
                    onClick={() => {
                        handleSubmit();
                    }}
                    >
                        {session ? 'Update' : 'Create'}
                    </Button>

                </div>

            </Stack>
        </Modal>
    )
}