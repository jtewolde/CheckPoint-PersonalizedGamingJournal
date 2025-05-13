'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay, SimpleGrid, Image } from '@mantine/core';
import { authClient } from '@/lib/auth-client';

import PlaceHolderImage from "../../../public/no-cover-image.png"
import classes from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("")
  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [playingGames, setPlayingGames] = useState<any[]>([]); // State to store games that the user is currently playing
  const [recentEntries, setRecentEntries] = useState<any[]>([]); // State to store recent journal entries
  const [loading, setLoading] = useState(true); // State to handle loading
  const [hasMounted, setHasMounted] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
      } else {
        setUserName(data.user.name)
      }
    };

    checkAuth();
  }, [router]);

  // Fetch games data from the API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/igdb/games');
        if (!res.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await res.json();
        setGames(data); // Store the games data in state
        console.log(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchGames();
    setHasMounted(true);
  }, []);

 // Function to get the games that the user is currently playing from their library
 const fetchPlayingGames = async () => {
  try {
    const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token from local storage
    const res = await fetch('/api/user/getLibrary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch user library');
    }

    const data = await res.json();
    const playingGames = data.games.filter((game: any) => game.status === 'Playing').slice(0,5) // Filter games that are currently being played with the first 5 games
    setPlayingGames(playingGames); // Store the playing games in state
    console.log("Playing Games", playingGames);
  } catch (error) {
    console.error('Error fetching playing games: ', error);
  }
};


  const fetchRecentJournalEntries = async () => {
      try {
          const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token from local storage
          const res = await fetch('/api/journal/getEntries', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
          });

          if (!res.ok) {
              throw new Error('Failed to fetch journal entries');
          }

          const data = await res.json();
          const sortedEntries = data.journalEntries
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date (most recent first)
              .slice(0, 5); // Limit to the 5 most recent entries
          setRecentEntries(sortedEntries); // Store the recent entries in state
          console.log('Recent Journal Entries:', sortedEntries);
      } catch (error) {
          console.error('Error fetching recent journal entries:', error);
      }
  };

  useEffect(() => {
    fetchPlayingGames();
    fetchRecentJournalEntries();
  }, []);
 
    

  return (
    <div className={classes.wrapper}>

      <h1 className={classes.welcomeText}> Welcome {userName}! </h1>
      
      <h1 className={classes.trendingText}>Top Trending Games from Last 30 Days:</h1>

      <div className={classes.trendingGames}>

        {loading && <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
        <SimpleGrid cols={6} spacing="lg" className={classes.gamesGrid}>
          {games.map((game) => (
            <div key={game.id} className={classes.gameCard}>
              <Image src={
                game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : PlaceHolderImage.src } 
                alt={game.name} 
                className={classes.cover} 
                onClick={() => router.push(`/games/${game.id}`)} 
                />
            </div>
          ))}
        </SimpleGrid>
      </div>

      <h1 className={classes.playingText}>Games that you are currently playing:</h1>

      <div className={classes.playingGames} >

        {loading && <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
        <SimpleGrid cols={6} spacing="lg" className={classes.gamesGrid}>
          {playingGames.map((game) => (
            <div key={game._id} className={classes.gameCard}>
              <Image src={
                game.coverImage ? `https:${game.coverImage.replace('t_thumb', 't_cover_big')}` : PlaceHolderImage.src } 
                alt={game.name} 
                className={classes.cover} 
                onClick={() => router.push(`/games/${game._id}`)} 
                />
            </div>
          ))}
        </SimpleGrid>
      </div>

      <h1 className={classes.recentEntriesText}>Recent Journal Entries: </h1>

      <div className={classes.recentEntries}>
          {recentEntries.length === 0 ? (
              <p>No recent journal entries found.</p>
          ) : (
              <SimpleGrid cols={4} spacing="lg" className={classes.gamesGrid}>
                  {recentEntries.map((entry) => (
                      <div key={entry._id} className={classes.entryCard} onClick={() => router.push('/journal')}>
                          <h3 className={classes.entryGame}>{entry.gameName}</h3>
                          <h3 className={classes.entryTitle}>{entry.title}</h3>
                          <p className={classes.entryContent}>
                              {entry.content.length > 100
                                  ? `${entry.content.slice(0, 100)}...` // Truncate long content
                                  : entry.content}
                          </p>
                          <p className={classes.entryDate}>{entry.date}</p>
                      </div>
                  ))}
              </SimpleGrid>
          )}
      </div>

    </div>
  );
}