'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { TextInput, Textarea, Button, Select, Overlay } from "@mantine/core";

import toast from "react-hot-toast";
import { Send, Gamepad2, Captions, MessageSquareText } from "lucide-react";

import classes from './journalForm.module.css';


export default function JournalForm() {
  // State variables for the journal form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [gameID, setGameID] = useState(""); // Selected game ID
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date

  const router = useRouter();

  // State variables for the game dropdown
  const [games, setGames] = useState<any[]>([]); // Store games data
  const [loading, setLoading] = useState(true);
  const [addToJournal, setAddtoJournal] = useState(false);

  // Check If the user is authenticated, if not redirect to signin page
    useEffect(() => {
        const checkAuth = async () => {
            const session = await authClient.getSession();
            if (!session.data?.user) {
                router.push('/auth/signin');
            }
        }
        checkAuth();

    }, [router]);

  // Fetch the user's library of games
  useEffect(() => {
    const fetchUserGames = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token
        const res = await fetch("/api/user/getLibrary", {
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
        setGames(data.games); // Store the games in state
        console.log(data.games);
      } catch (error) {
        console.error("Error fetching user library:", error);
      } finally {
        setLoading(false); // Hide loading overlay after fetching data
      }
    };
    fetchUserGames();
  }, []);

  // Function to handle the submission of the journal form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameID) {
      toast.error("Please select a game.");
      return;
    }

    setAddtoJournal(true)

    // Find the selected game's title
    const selectedGame = games.find((game) => game.gameId === gameID);
    const gameName = selectedGame ? selectedGame.title : "";

    try {
      const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token
      const res = await fetch("/api/journal/createEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          gameID,
          gameName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create journal entry");
      }

      toast.success("Journal entry created successfully!");
      router.push("/journal"); // Redirect to the library or another page
    } catch (error) {
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry. Please try again.");
    } finally {
      setAddtoJournal(false)
    }
  };


  return (

    <div className={classes.journalContainer}>

      <Overlay
        gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgba(79, 78, 78, 1) 90%)"
        opacity={0.80}
        zIndex={0}
      />

        <div className={classes.journalWrapper} >

          <h1 className={classes.journalTitle}>Create Journal Entry</h1>

          <form onSubmit={handleSubmit} className={classes.form}>

            <Select
              leftSection={<Gamepad2 size={30} />}
              maxDropdownHeight={300}
              className={classes.select}
              styles={{
                wrapper: { color: '#212121'}, 
                input: { color: 'white', background: '#212121'}, 
                dropdown: { background: '#212121', color: 'whitesmoke'},
                option: { background: '#202020'}
              }}
              scrollAreaProps={{ type: 'auto', scrollbarSize: 16, scrollbars: 'y', color:'black',  classNames: { scrollbar: classes.scrollBar }}}
              size="lg"
              label="Select Game"
              placeholder="Choose a game from your library"
              data={games.map((game) => ({
                value: game.gameId, // Use the game's ID as the value
                label: game.title, // Display the game's name
              }))}
              value={gameID}
              onChange={(value) => setGameID(value || "")}
              required
              disabled={loading} // Disable the dropdown while loading
            />

            <TextInput
              className={classes.textInput}
              styles={{
                wrapper: { color: '#212121'}, 
                input: { color: 'white', background: '#212121'}, 
              }}
              size="lg"
              label="Title"
              placeholder="Enter Journal Entry Title"
              leftSection={<Captions size={30} />}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ marginTop: "1rem" }}
            />

            <Textarea
              className={classes.textArea}
              classNames={{input: classes.input}}
              styles={{
                wrapper: { color: '#212121'}, 
                input: { color: 'white', background: '#212121'}, 
              }}
              label="Content"
              placeholder="Write Your Journal Entry Here..."
              autosize
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minRows={2}
              style={{ marginTop: "1rem" }}
              size="lg"
            />

            <Button
              className={classes.submitButton}
              type="submit"
              variant="filled"
              radius="lg"
              size="lg"
              rightSection={<Send/>}
              color='green'
              style={{ marginTop: "1rem" }}
              loading={addToJournal}
              disabled={!gameID || !title || !content || addToJournal}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
  );
}