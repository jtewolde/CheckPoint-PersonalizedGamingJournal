'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay, SimpleGrid, Image, Paper, SemiCircleProgress, Text } from '@mantine/core';
import { authClient } from '@/lib/auth-client';

import PlaceHolderImage from "../../../public/no-cover-image.png"

import { IconDeviceGamepad3Filled, IconPlayerPauseFilled, IconBookmarkFilled, IconCheck, IconQuestionMark, IconClipboardListFilled } from '@tabler/icons-react';
import { TrendingUp, Notebook, Gamepad } from 'lucide-react';
import classes from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("")

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [playingGames, setPlayingGames] = useState<any[]>([]); // State to store games that the user is currently playing
  const [popularGames, setPopularGames] = useState<any[]>([]);

  const [playGamesLength, setPlayGamesLength] = useState(0) // State to store length of playing games user has
  const [noStatusLength, setNoStatusLength] = useState(0) // State to store length of games user has that has no status
  const [completedLength, setCompletedLength] = useState(0) // State to store length of completed games user has
  const [planToPlayLength, setPlanToPlayLength] = useState(0) // State to store length of game that the user plans to play
  const [onHoldLength, setOnHoldLength] = useState(0)

  const [numOfGames, setNumOfGames] = useState(0);
  const [completedPercentage, setCompletedPercentage] = useState(0)

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
    const fetchPopularGames = async () => {
      try {
        const res = await fetch('/api/igdb/populargames');
        
        if (!res.ok) {
          throw new Error('Failed to fetch popular games');
        }
        const data = await res.json();
        setGames(data); // Store the games data in state
        console.log("Popular Games: ",data);
      } catch (error) {
        console.error('Error fetching popular games:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchPopularGames();
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

    const totalGames = data.games.length // Store total number of games
    
    const planToPlay = data.games.filter((game: any) => game.status === 'Plan to Play').length;
    const playing = data.games.filter((game: any) => game.status === 'Playing').length;
    const completed = data.games.filter((game: any) => game.status === 'Completed').length;
    const noStatus = data.games.filter((game: any) => game.status === 'No Status Given').length;
    const onHold = data.games.filter((game: any) => game.status === 'On Hold').length;

    // Get the completation Rate of the user's completed games compared to total games in their library
    const completationRate = Math.round((completed / totalGames) * 100) 

    setPlanToPlayLength(planToPlay);
    setPlayGamesLength(playing);
    setCompletedLength(completed);
    setNoStatusLength(noStatus);
    setOnHoldLength(onHold);
    setNumOfGames(totalGames);
    setCompletedPercentage(completationRate);

    console.log("Completation Percentage", completedPercentage);
    console.log("Length of Plan to Play Games:", planToPlay);
    console.log("Length of Playing Games:", playing);
    console.log("Length of Completed Games:", completed);
    console.log("Length of No Status Games:", noStatus);

    console.log("Playing Games", playingGames);

  } catch (error) {
    console.error('Error fetching playing games: ', error);
  }
};

  // Use API call to fetch most recent journal entries
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
          console.log("Data", data)
          
          const sortedEntries = data.journalEntries.reverse().slice(0, 4); // Limit to the 5 most recent entries
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

      <h1 className={classes.welcomeText}> Welcome back, {userName}! </h1>

      <div className={classes.statCards}>

        <div className={classes.profileStats}>
          <p className={classes.titleLogo}>Profile Stats: </p>
        </div>

        <SimpleGrid cols={6} spacing="lg" className={classes.statusGrid}>

          <Paper shadow="md" radius="lg" className={classes.statusCard}>

            <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}>

              <div className={classes.statusLogoCenter} >
                <IconClipboardListFilled size={60} color='#f018e8' className={classes.statusLogo}/>
              </div>
              
              <h3 className={classes.statusTitle}>Progress Summary</h3>
              <p className={classes.statusTotalCount}>Total Games: {numOfGames}</p>

              <SemiCircleProgress className={classes.statusProgress} value={completedPercentage} filledSegmentColor='#f018e8' size={170} thickness={15} 
                label={<Text c='#f018e8' component='span' size='lg' fw={600}>{completedPercentage || '0'}% Completed</Text>}>
              </SemiCircleProgress>

            </Suspense>

          </Paper>

          <Paper shadow="md" radius="lg" className={classes.statusCard}>

            <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}>

              <div className={classes.statusLogoCenter} >
                <IconDeviceGamepad3Filled size={60} color="blue" />
              </div>

              <h3 className={classes.statusTitle}>Playing</h3>
              <p className={classes.statusCount}>{playGamesLength}</p>

            </Suspense>

          </Paper>

          <Paper shadow="md" radius="lg" className={classes.statusCard}>

            <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}>

              <div className={classes.statusLogoCenter} >
                <IconBookmarkFilled size={60} color="green" className={classes.statusLogo}/>
              </div>

              <h3 className={classes.statusTitle}>Plan to Play</h3>
              <p className={classes.statusCount}>{planToPlayLength}</p>

            </Suspense>

          </Paper>

          <Paper shadow="md" radius="lg" className={classes.statusCard}>

            <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}>

              <div className={classes.statusLogoCenter} >
                <IconCheck size={60} color="purple" className={classes.statusLogo}/>
              </div>

              <h3 className={classes.statusTitle}>Completed</h3>
              <p className={classes.statusCount}>{completedLength}</p>
            </Suspense>

          </Paper>

          <Paper shadow="md" radius="lg" className={classes.statusCard}>

             <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}>
              <div className={classes.statusLogoCenter} >
                <IconQuestionMark size={60} color='#fc8a08' className={classes.statusLogo}/>
              </div>
              <h3 className={classes.statusTitle}>No Status</h3>
              <p className={classes.statusCount}>{noStatusLength}</p>
            </Suspense>

          </Paper>

          <Paper shadow="md" radius="lg" className={classes.statusCard}>

            <Suspense fallback={<LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}>

              <div className={classes.statusLogoCenter} >
                <IconPlayerPauseFilled size={60} color="red" className={classes.statusLogo}/>
              </div>

              <h3 className={classes.statusTitle}>On Hold</h3>
              <p className={classes.statusCount}>{onHoldLength}</p>
              
            </Suspense>

          </Paper>

        </SimpleGrid>

      </div>

      <div className={classes.trendingGames}>

        <div className={classes.trendingText}>
          
          <div className={classes.titleLogo}>
            <TrendingUp size={40} />
            <h1 className={classes.gamesPlayingText}>Most Visited Games on IGDB Website:</h1>
          </div>

          <a className={classes.viewMoreText} href='' >View more</a>
        </div>
        
        {loading && <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
        <SimpleGrid cols={7} spacing="lg" verticalSpacing='xl' className={classes.trendingGamesGrid}>
          {games.map((game) => (
            <div key={game.id} className={classes.gameCard}>
              <Image src={
                game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : PlaceHolderImage.src } 
                alt={game.name} 
                className={classes.cover} 
                onClick={() => router.push(`/games/${game.id}`)} 
                />
                <Text className={classes.gameName}>{game.name}</Text>
            </div>
          ))}
        </SimpleGrid>
      </div>

      <div className={classes.playingGames} >

        <div className={classes.playingText}>

          <div className={classes.titleLogo}>
            <Gamepad size={40} /> 
            <h1 className={classes.gamesPlayingText}>Games that you are currently playing:</h1>
          </div>
          
        </div>

        {playingGames.length === 0 ? (
              <p className={classes.noEntriesText}>You have no games that have the 'Playing' status.</p>
          ) : (
            <>
              {loading && <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}
              <SimpleGrid cols={6} spacing="lg" className={classes.gamesGrid}>
                {playingGames.map((game) => (
                  <div key={game._id} className={classes.gameCard}>
                    <Image src={
                      game.coverImage ? `https:${game.coverImage.replace('t_thumb', 't_cover_big')}` : PlaceHolderImage.src } 
                      alt={game.name} 
                      className={classes.cover} 
                      onClick={() => router.push(`/games/${game.gameId}`)} 
                      />
                  </div>
                ))}
              </SimpleGrid>
            </>
          )}
      </div>

      <div className={classes.recentEntries}>

        <div className={classes.recentEntriesText}>
          
          <div className={classes.titleLogo}>
            <Notebook size={40} />
            <h1 className={classes.gamesPlayingText}>Recent Journal Entries:</h1>
          </div>

        </div>

          {recentEntries.length === 0 ? (
              <p className={classes.noEntriesText}>No recent journal entries found.</p>
          ) : (
              <SimpleGrid cols={4} spacing="lg" className={classes.entriesGrid}>
                  {recentEntries.map((entry) => (
                      <div key={entry._id} className={classes.entryCard} onClick={() => router.push('/journal')}>
                          <h3 className={classes.entryGame}>{entry.gameName}</h3>
                          <h3 className={classes.entryTitle}>{entry.title}</h3>
                          <p className={classes.entryContent}>
                              {entry.content.length > 150
                                  ? `${entry.content.slice(0, 150)}...` // Truncate long content
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