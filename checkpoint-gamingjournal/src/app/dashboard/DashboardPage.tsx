'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { SimpleGrid, Image, Paper, Text, ThemeIcon, LoadingOverlay } from '@mantine/core';
import { DonutChart } from '@mantine/charts';

import { authClient } from '@/lib/auth-client';

import PlaceHolderImage from "../../../public/no-cover-image.png"

import { IconDeviceGamepad3Filled, IconPlayerPauseFilled, IconBookmarkFilled, IconCheck, IconQuestionMark, IconClipboardListFilled } from '@tabler/icons-react';
import { Notebook, Gamepad, CircleUserRound, CircleArrowRight, Gamepad2 } from 'lucide-react';

import classes from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("")

  const [playingGames, setPlayingGames] = useState<any[]>([]); // State to store games that the user is currently playing

  const [playGamesLength, setPlayGamesLength] = useState(0) // State to store length of playing games user has
  const [noStatusLength, setNoStatusLength] = useState(0) // State to store length of games user has that has no status
  const [completedLength, setCompletedLength] = useState(0) // State to store length of completed games user has
  const [planToPlayLength, setPlanToPlayLength] = useState(0) // State to store length of game that the user plans to play
  const [onHoldLength, setOnHoldLength] = useState(0)

  const [numOfGames, setNumOfGames] = useState(0);
  const [completedPercentage, setCompletedPercentage] = useState(0)

  const [recentEntries, setRecentEntries] = useState<any[]>([]); // State to store recent journal entries

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
      const playingGames = data.games.filter((game: any) => game.status === 'Playing').slice(0,6) // Filter games that are currently being played with the first 6 games

      console.log("Playing Games: ", playingGames);
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

    } catch (error) {
      console.error('Error fetching playing games: ', error);
    }
  };

  // Use API call to fetch most recent journal entries
  const fetchRecentJournalEntries = async () => {
      try {
          const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token from local storage
          const res = await fetch('/api/journal/getRecentEntries', {
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

    <div className={classes.background}>

      <div className={classes.backgroundOverlay}>

        <div className={classes.wrapper}>

          <div className={classes.dashboardHeader}>
            
            <div className={classes.dashboardTitleWrapper}>
              <h2 className={classes.dashboardTitle}>Dashboard</h2>
            </div>

            <div className={classes.heroTextContainer}>

              <p className={classes.welcomeText}> Welcome back, <span className={classes.username} onClick={() => router.push('/settings/profile')}>{userName}! </span> </p>
              
              <p className={classes.welcomeText}> 
                Your gaming story is always evolving. 
                Log your latest sessions, revisit past entries, and discover new games to add to your journey. 
                Explore what’s trending and let Checkpoint guide you toward your next great playthrough.
              </p>

            </div>
          
          </div>

          <div className={classes.statCards}>

            <div className={classes.profileStats}>

              <div className={classes.titleLogo}>
                <ThemeIcon size={50} radius='md' variant='gradient' gradient={{from: '#56CCF2', to: '#2F80ED', deg: 30}}> <CircleUserRound size={40} /> </ThemeIcon>
                <p className={classes.profileTitle}>Profile Stats</p>
              </div>
              
            </div>

            <SimpleGrid cols={2} spacing="lg" className={classes.statusGrid}>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>

                  <p className={classes.statusTitle}>Game Status Breakdown</p>

                  <div className={classes.chartWrapper}>

                    <DonutChart
                      size={220}
                      strokeColor='black'
                      strokeWidth={2}
                      thickness={24}
                      chartLabel={`${numOfGames} Games Tracked`}
                      styles={{
                        label:{
                          color: 'white',
                          fontFamily: 'Poppins',
                          fill: 'white',
                          fontSize: '16px'
                        },
                        tooltip:{
                          border: '1px solid black'
                        },
                        tooltipBody:{
                          backgroundColor: '#2b2b2b',
                          color: 'white'
                        },
                        tooltipItemName:{
                          color: 'white'
                        },
                        tooltipItemData: {
                          color: 'white'
                        }
                      }}
                      data={[
                        { name: 'Plan to Play', value: planToPlayLength, color: 'blue' },
                        { name: 'On Hold', value: onHoldLength, color: 'gray' },
                        { name: 'Playing', value: playGamesLength, color: 'yellow'},
                        { name: 'No Status Given', value: noStatusLength, color: 'red'},
                        { name: 'Completed', value: completedLength, color: 'green'}
                      ]}
                    />

                  </div>

              </Paper>

            </SimpleGrid>

          </div>

          <div className={classes.continueSection}>
            
          </div>

          <div className={classes.playingGames} >

            <div className={classes.playingSection}>

              <div className={classes.titleLogo}>
                <ThemeIcon size={50} radius='md' variant='gradient' gradient={{from: '#e96443', to: '#904e95', deg: 90}}> <Gamepad size={40} /> </ThemeIcon>
                <h1 className={classes.gamesPlayingText}> Games You're Playing </h1>
              </div>

              <a className={classes.viewMoreText} href='/library'> <CircleArrowRight size={35} /> </a>
              
            </div>

            {playingGames.length === 0 ? (
                  <p className={classes.noEntriesText}>You have no games that have the 'Playing' status.</p>
              ) : (
                <>
                  <SimpleGrid cols={5} spacing="lg" className={classes.gamesGrid}>
                    {playingGames.map((game) => (
                      <div key={game._id} className={classes.gameCard} onClick={() => router.push(`/games/${game.gameId}`)} >

                        <div className={classes.imageWrapper}>

                          <Image 
                            src={
                            game.coverImage ? `https:${game.coverImage.replace('t_thumb', 't_1080p')}` : PlaceHolderImage.src } 
                            alt={game.name} 
                            className={classes.cover} 
                          />

                          <div className={classes.overlay}>

                            <Text className={classes.gameName}>{game.title}</Text>

                          </div>

                        </div>

                      </div>
                    ))}
                  </SimpleGrid>
                </>
              )}
          </div>

          <div className={classes.recentEntries}>

            <div className={classes.recentEntriesSection}>
              
              <div className={classes.titleLogo}>

                <ThemeIcon size={50} radius='md' variant='gradient' gradient={{ from: '#DCE35B', to: '#45B649', deg: 60}}> <Notebook size={40} /> </ThemeIcon>
                
                <h1 className={classes.gamesPlayingText}>Recent Journal Entries:</h1>

              </div>

              <a className={classes.viewMoreIcon} href='/journal'> <CircleArrowRight size={35} /> </a>

            </div>

              {recentEntries.length === 0 ? (
                  <p className={classes.noEntriesText}>No recent journal entries found.</p>
              ) : (
                  <SimpleGrid cols={4} spacing="lg" className={classes.entriesGrid}>
                      {recentEntries.map((entry) => (
                          <div key={entry._id} className={classes.entryCard} onClick={() => router.push(`/viewJournalEntry/${entry._id}`)}>
                              <h3 className={classes.entryGame}>{entry.gameName}</h3>
                              <h3 className={classes.entryTitle}>{entry.title}</h3>
                              <p className={classes.entryContent}>
                                  {entry.content.length > 150
                                      ? `${entry.content.slice(0, 150)}...` // Truncate long content
                                      : entry.content}
                              </p>
                              <p className={classes.entryDate}>{entry.displayDate}</p>
                          </div>
                      ))}
                  </SimpleGrid>
              )}
          </div>

        </div>

      </div>

    </div>

  );
}