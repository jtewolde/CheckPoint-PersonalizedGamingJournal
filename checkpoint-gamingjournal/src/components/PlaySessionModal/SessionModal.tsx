'use client'

import { useEffect, useState } from "react"
import { Modal, Divider, Stack, Button, TextInput, Textarea, NumberInput, Select, MultiSelect } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { formatDate } from "@/utils/dateUtils";

import toast from "react-hot-toast";

import classes from './SessionModal.module.css';

import { Captions, CalendarDays, NotebookPen, Gamepad2, Clock, LibraryBig } from "lucide-react";

// Define the playSession object used on both calendar and modal with the props
type PlaySession = {
    _id: string
    gameName: string
    date: string
    duration: number
    notes: string
    tags: string[]
}

// Define the props for the PlaySessionModal component
type PlaySessionModalProps = {
    opened: boolean;
    onClose: () => void;
    gameId?: string;
    gameName?: string;
    session?: PlaySession | null;
    onSuccess?: (session: PlaySession) => void
    onSessionCreated?: () => void;
};

export default function PlaySessionModal({ opened, onClose, gameId, session, gameName, onSuccess, onSessionCreated }: PlaySessionModalProps) {

    // State variables to hold info on play time duration using hours and minutes inputs
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const duration = hours * 60 + minutes;

    // State variables to hold play session notes and date inputs
    const [playSessionNotes, setPlaySessionNotes] = useState("");
    const [playSessionDate, setPlaySessionDate] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // State variables to hold selected game and user's game library for the select dropdown in the modal
    const [selectedGameName, setSelectedGameName] = useState(gameName || "");
    const [selectedGameId, setSelectedGameId] = useState(gameId || "");
    const [userGames, setUserGames] = useState<any[]>([]);

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
        if (opened && gameId) {
            setSelectedGameId(gameId);
            setSelectedGameName(gameName || '');
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
                    tags: tags,
                    date: playSessionDate
                })
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to log play session');
            }

            // Show success toast and reset form fields after successful logging
            toast.success(isEditing ? "Session updated!" : "Session created!");
            setHours(0);
            setMinutes(0);
            setPlaySessionNotes("");
            setPlaySessionDate(null);
            setLoading(false);
            onSessionCreated?.();
            onClose();
        
        } catch(error){
            console.error('Error logging play session:', error);
            toast.error('Failed to log play session. Please try again.');
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} size='lg' title={(gameId ? 'Play Session for ' + gameName : 'Quick Log Session')} withCloseButton>
            <Stack gap='md'>
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
                    label="Select Game"
                    placeholder="Choose a game from your library"
                    value={selectedGameId}
                    onChange={(value, option) =>{
                        setSelectedGameId(value || '')
                        setSelectedGameName(option?.label || '')
                    }}
                    searchable
                    required
                    />
                )}

                <TextInput
                    className={classes.textInput}
                    styles={{
                        wrapper: { color: '#212121'}, 
                        input: { color: 'white', background: '#212121'}, 
                    }}
                    size="md"
                    label="Notes"
                    placeholder="Enter play session notes... "
                    leftSection={<Captions size={20} />}
                    value={playSessionNotes}
                    onChange={(e) => setPlaySessionNotes(e.target.value)}
                    required
                    style={{ marginTop: "1rem" }}
                />

                
                <MultiSelect
                    className={classes.select}
                    leftSection={<LibraryBig size={20} />}
                    label="Tags"
                    placeholder="Add tags (e.g. boss, story, multiplayer)"
                    data={[
                        "Story",
                        "Boss Fight",
                        "Exploration",
                        "Multiplayer",
                        "Grinding",
                        "Side Quest",
                        "Achievement",
                    ]}
                    value={tags}
                    onChange={setTags}
                    searchable
                    size="md"
                    styles={{
                    input: { color: "white", background: "#212121" },
                    dropdown: { background: "#212121", color: "whitesmoke" },
                    }}
                    style={{ marginTop: "1rem" }}
                />

                <DateInput
                    size='md'
                    label="Session Date"
                    placeholder='Select session date'
                    clearable
                    required
                    leftSection={<CalendarDays size={20} />}
                    value={playSessionDate}
                    maxDate={new Date()}
                    onChange={(date) => {
                        setPlaySessionDate(date);
                    }}
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

                <Divider styles={{label: {color: 'white'}}} labelPosition="center" color='dimmed' my="lg"  />

                <div className={classes.buttonGroup}>

                    <Button 
                    className={classes.cancelButton}
                    color="black"
                    size="md"
                    variant='white'
                    onClick={onClose}
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