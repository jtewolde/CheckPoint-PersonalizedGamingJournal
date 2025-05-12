'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Textarea, Button, Select, Overlay } from "@mantine/core";

import toast from "react-hot-toast";
import { Send } from "lucide-react";

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

    const currentDate = date || new Date().toLocaleString(); // Use the current date if `date` is empty

    // Find the selected game's title
    const selectedGame = games.find((game) => game._id === gameID);
    console.log("Selectedgame",selectedGame);
    console.log(currentDate);
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
          date: currentDate
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
        gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgb(112, 112, 112) 90%)"
        opacity={0.80}
        zIndex={0}
      />

        <div className={classes.journalWrapper} >
          <h1 className={classes.journalTitle}>Create Journal Entry</h1>
          <form onSubmit={handleSubmit} className={classes.form}>
            <Select
            className={classes.select}
              label="Select Game"
              placeholder="Choose a game"
              data={games.map((game) => ({
                value: game._id, // Use the game's ID as the value
                label: game.title, // Display the game's name
              }))}
              value={gameID}
              onChange={(value) => setGameID(value || "")}
              required
              disabled={loading} // Disable the dropdown while loading
            />
            <TextInput
              className={classes.textInput}
              label="Title"
              placeholder="Enter the title of your journal entry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ marginTop: "1rem" }}
            />
            <Textarea
              className={classes.textArea}
              classNames={{ input: classes.input}}
              label="Content"
              placeholder="Write your journal entry here..."
              autosize
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minRows={2}
              style={{ marginTop: "1rem" }}
              size="md"
            />
            <Button
              className={classes.submitButton}
              type="submit"
              variant="filled"
              radius="lg"
              size="lg"
              rightSection={<Send/>}
              color="blue"
              style={{ marginTop: "1rem" }}
              loading={addToJournal}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
  );
}