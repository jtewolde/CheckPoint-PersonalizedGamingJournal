'use client'

import { useEffect, useState } from "react"
import { Modal, Divider, Stack, Button, TextInput, LoadingOverlay, Select, MultiSelect, Textarea } from "@mantine/core";

import toast from "react-hot-toast";

import { NotebookPen, Gamepad2, Captions, LibraryBig } from "lucide-react";

import classes from './EntryModal.module.css';

// Define the Journal Entry object used on both Journal Page and modal with the props
type JournalEntry = {
    _id: string
    gameId: string
    gameName: string
    coverImage?: string
    title: string
    content: string
    entryType: string
    tags: string[]
}

// Define the props for the JournalEntryModal component
type JournalEntryModalProps = {
    opened: boolean;
    onClose: () => void;
    gameId?: string;
    gameName?: string;
    entry?: JournalEntry | null;
    onSuccess?: (Entry: JournalEntry) => void
    onEntryCreated?: () => void;
};

export default function JournalEntryModal({ opened, onClose, gameId, gameName, entry, onSuccess, onEntryCreated }: JournalEntryModalProps) {
    // State variables for the journal form like name, content, associated tags, and entry type
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [entryType, setEntryType] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    
    // State variables to hold selected game and user's game library for the select dropdown in the modal
    const [selectedGameName, setSelectedGameName] = useState(gameName || "");
    const [gameCover, setGameCover] = useState("")
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
    // Populate form when editing an existing entry
    useEffect(() => {
        if (opened && entry) {
            setTitle(entry.title || '');
            setContent(entry.content || '');
            setEntryType(entry.entryType || '');
            setTags(entry.tags || []);

            setSelectedGameId(entry.gameId || '');
            setSelectedGameName(entry.gameName || '');
            setGameCover(entry.coverImage || '');
        }

        // Reset form when creating a new entry
        if (opened && !entry) {
            setTitle('');
            setContent('');
            setEntryType('');
            setTags([]);

            setSelectedGameId(gameId || '');
            setSelectedGameName(gameName || '');
            setGameCover('');
        }
    }, [opened, entry, gameId, gameName]);

    // Function to handle creating or updating a journal entry 
    // This will involve opening a modal with a form to input play session details such as duration and notes, 
    // and then making an API call to save the play session to the database and associate it with the game and user's library.
    const handleSubmit = async () => {
        try{
            setLoading(true);
            // Validate required fields and show error toast if any are missing
            if (!selectedGameId || !title || !content || !entryType) {
                toast.error("Please fill out all required fields.");
                return;
            }

            // Receive session token for authenication and determine if play session is being edited or not
            const token = localStorage.getItem('bearer_token');
            const isEditing = !!entry;

            // Create custom URL for updating or creating play session
            const url = isEditing
                ? `/api/journal/${entry._id}`
                : `/api/journal`;

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
                    coverImage: gameCover,
                    title,
                    content,
                    entryType,
                    tags
                })
            });

            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create journal entry');
            }

            // Show success toast and reset form fields after successful logging
            toast.success(isEditing ? "Journal Entry updated!" : "Journal Entry created!");
            setTitle("");
            setContent("");
            setLoading(false);
            onEntryCreated?.();
            onClose();
        
        } catch(error){
            setLoading(false);
            console.error('Error creating journal entry:', error);
            toast.error('Failed to create journal entry. Please try again.');
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} size='xl' title={entry ? "Edit Journal Entry" : "Create Journal Entry"} centered withCloseButton>

            {/* ✅ LOADING OVERLAY */}
            <LoadingOverlay
                visible={loading}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ size: 'lg', color: "white", type: "oval" }}
            />

            <Stack gap='lg'>
                {entry ? (
                    <TextInput
                        label="Game"
                        required
                        value={selectedGameName}
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

                            const selectedGame = userGames.find(
                                (game) => game.gameId === value
                            );

                            setGameCover(selectedGame?.coverImage || '');
                        }}
                        searchable
                        required
                    />
                )}

                <TextInput
                    size="md"
                    label="Title"
                    description="Give this entry a short memorable title"
                    placeholder="(e.g. Defeated Malenia After 20 Attempts)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    leftSection={<Captions size={18} />}
                    required
                />

                <Select
                    className={classes.select}
                    leftSection={<LibraryBig size={20} />}
                    size="md"
                    required
                    label="Entry Type"
                    description="Choose the kind of experience you're documenting"
                    placeholder="Select an entry type"
                    data={[
                        "First Impressions",
                        "Progress Update",
                        "Boss Fight",
                        "Achievement",
                        "Story Reaction",
                        "Review",
                        "Ending Thoughts",
                        "General",
                    ]}
                    value={entryType}
                    onChange={(value) => setEntryType(value || '')}
                    searchable
                    styles={{
                        input: { color: "white", background: "#212121" },
                        dropdown: { background: "#212121", color: "whitesmoke" },
                    }}
                    style={{ marginTop: "1rem" }}
                />

                <Textarea
                    className={classes.textInput}
                    styles={{
                        wrapper: { color: '#212121'}, 
                        input: { color: 'white', background: '#212121'}, 
                    }}
                    size="md"
                    minRows={3}
                    autosize
                    required
                    label="Journal Entry"
                    description="Write about what happened, how you felt, or what stood out during your session"
                    placeholder="Today I finally defeated the final boss after upgrading my build and learning the attack patterns..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ marginTop: "1rem" }}
                />

                <MultiSelect
                    className={classes.select}
                    leftSection={<LibraryBig size={20} />}
                    label="Tags"
                    description="Add keywords to organize your entries"
                    placeholder="(e.g. boss fight, story, multiplayer)"
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

                <Divider styles={{label: {color: 'white'}}} labelPosition="center" color='dimmed' my="md"  />

                <div className={classes.buttonGroup}>

                    <Button 
                    className={classes.cancelButton}
                    color="red"
                    size="md"
                    variant='filled'
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
                    disabled={!selectedGameId || !content || !title}
                    onClick={() => {
                        handleSubmit();
                    }}
                    >
                        {entry ? 'Update' : 'Create'}
                    </Button>

                </div>

            </Stack>
        </Modal>
    )
}
