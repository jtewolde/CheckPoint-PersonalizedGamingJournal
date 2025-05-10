'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Textarea, Button, Select } from "@mantine/core";
import toast from "react-hot-toast";

import classes from './journalForm.module.css';

export default function JournalForm() {
  // State variables for the journal form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [gameID, setGameID] = useState(""); // Selected game ID
  const [date, setDate] = useState("");

  const router = useRouter();

  // State variables for the game dropdown
  const [games, setGames] = useState<any[]>([]); // Store games data
  const [loading, setLoading] = useState(true);

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

    const token = localStorage.getItem("bearer_token"); // Retrieve Bearer Token
    try {
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
          date: date ? new Date(date).toISOString() : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create journal entry");
      }

      toast.success("Journal entry created successfully!");
      router.push("/library"); // Redirect to the library or another page
    } catch (error) {
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry. Please try again.");
    }
  };

  return (
    <div className={classes.wrapper} style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1 className={classes.journalTitle}>Create Journal Entry</h1>
      <form onSubmit={handleSubmit}>
        <Select
          label="Select Game"
          placeholder="Choose a game"
          data={games.map((game) => ({
            value: game._id, // Use the game's ID as the value
            label: game.name, // Display the game's name
          }))}
          value={gameID}
          onChange={(value) => setGameID(value || "")}
          required
          disabled={loading} // Disable the dropdown while loading
        />
        <TextInput
          label="Title"
          placeholder="Enter the title of your journal entry"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginTop: "1rem" }}
        />
        <Textarea
          label="Content"
          placeholder="Write your journal entry here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minRows={5}
          style={{ marginTop: "1rem" }}
        />
        <TextInput
          label="Date"
          placeholder="Enter the date (YYYY-MM-DD)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ marginTop: "1rem" }}
        />
        <Button
          type="submit"
          variant="filled"
          color="blue"
          style={{ marginTop: "1rem" }}
          loading={loading}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}