'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';

import { SimpleGrid, Image, Paper, Text, ThemeIcon, Tooltip, Rating, Group, Avatar, Button, ActionIcon } from '@mantine/core';
import { DonutChart, BarChart, LineChart } from '@mantine/charts';

import SessionHeatmap from '@/components/SessionHeatmap/SessionHeatmap';
import JournalEntryCard from '@/components/JournalEntryCard/EntryCard';
import PlaySessionModal from '@/components/PlaySessionModal/SessionModal';
import EditGameInfoModal from '@/components/EditGameInfoModal/EditGameInfoModal';
import JournalEntryModal from '@/components/JournalEntryModal/EntryModal';

import PlaceHolderImage from "../../../public/no-cover-image.png"

import { Trophy, Star, ClipboardCheck, Edit, Notebook, Gamepad, BookText, NotebookPen } from 'lucide-react';

import classes from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<{ name?: string; image?: string } | null>(null); // State to store user information such as name and profile image

  const [playingGames, setPlayingGames] = useState<any[]>([]); // State to store games that the user is currently playing
  const [libraryGames, setLibraryGames] = useState<any[]>([]); // State to store all of the games that the user has in their library

  // State variables to hold the count of each game's status in the user's library for graph
  const [playGamesLength, setPlayGamesLength] = useState(0) 
  const [noStatusLength, setNoStatusLength] = useState(0) 
  const [completedLength, setCompletedLength] = useState(0) 
  const [fullyDoneLength, setfullyDoneLength] = useState(0)
  const [wishlistLength, setWishlistLength] = useState(0)
  const [backlogLength, setBacklogLength] = useState(0) 
  const [onHoldLength, setOnHoldLength] = useState(0)

  // State variables to store data for the profile stats section of the dashboard
  const [numOfGames, setNumOfGames] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [numEntries, setNumEntries] = useState(0);
  const [numPlatinumedGames, setNumPlatinumedGames] = useState(0);
  const [topRatedGame, setTopRatedGame] = useState<any | null>(null);

  const [completedPercentage, setCompletedPercentage] = useState(0)

  const [recentEntries, setRecentEntries] = useState<any[]>([]); // State to store recent journal entries
  const [journalActivityData, setJournalActivityData] = useState<{ month: string; entries: number }[]>([]); // State to store data from journal entries over time chart
  const [ratingDistributionData, setRatingDistributionData] = useState<{ rating: number; count: number }[]>([]); // State to store data for game ratings distribution chart

  // State variables for doing quick actions by opening modals for editing, log play session, and create journal entry
  const [opened, {open, close} ] = useDisclosure(false);
  const [editOpened, {open: editOpen, close: editClose}] = useDisclosure(false)
  const [logOpened, {open: logOpen, close: logClose}] = useDisclosure(false)
  const [journalOpened, {open: journalOpen, close: journalClose}] = useDisclosure(false)

  const [selectedGame, setSelectedGame] = useState<{
    gameId: string;
    title: string;
    cover: string;
    platforms: string[];
  } | null>(null);


  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
      } else {
        setUser({
          name: data.user.name,
          image: data.user.image || undefined,
        });
      }
    };

    checkAuth();
  }, [router]);


 // Function to get the games that the user is currently playing from their library
  const fetchPlayingGames = async () => {
    try {
      const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token from local storage
      const res = await fetch('/api/library', {
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

      setRatingDistributionData(calculateRatingDistribution(data.games)) // Calculate the distribution of game ratings
      setAvgRating(calculateAverageRating(data.games)) // Calculate the average rating of the user's games
      setTopRatedGame(calculateTopRatedGame(data.games));


      const playingGames = data.games.filter((game: any) => game.status === 'Playing').slice(0,6) // Filter games that are currently being played with the first 6 games
      const platinumedGames = data.games.filter((game: any) => game.platinum === true).length; // Filter games that have been platinumed and get the count
      setNumPlatinumedGames(platinumedGames); // Store the number of platinumed games in state
      setPlayingGames(playingGames); // Store the playing games in state
      setLibraryGames(data.games);

      const totalGames = data.games.length // Store total number of games
      
      const backlog = data.games.filter((game: any) => game.status === 'Backlog').length;
      const wishlist = data.games.filter((game: any) => game.status === 'Wishlist').length;
      const playing = data.games.filter((game: any) => game.status === 'Playing').length;
      const completed = data.games.filter((game: any) => game.status === 'Completed').length;
      const fullCompleted = data.games.filter((game: any) => game.status === '100%').length;
      const noStatus = data.games.filter((game: any) => game.status === 'No Status Given').length;
      const onHold = data.games.filter((game: any) => game.status === 'On Hold').length;

      // Get the completation Rate of the user's completed games compared to total games in their library
      const completationRate = Math.round((completed / totalGames) * 100) 

      setBacklogLength(backlog)
      setPlayGamesLength(playing);
      setCompletedLength(completed);
      setfullyDoneLength(fullCompleted);
      setWishlistLength(wishlist);
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
          const res = await fetch('/api/journal?limit=100', {
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
          setNumEntries(data.pagination.totalEntries) // Store total number of journal entries
          
          const sortedEntries = data.journalEntries.slice(0, 4); // Limit to the 5 most recent entries
          setRecentEntries(sortedEntries); // Store the recent entries in state

          setJournalActivityData(buildJournalEntriesOverTimeData(data.journalEntries)) // Build the data for the journal entries over time chart using the user's journal entries
      } catch (error) {
          console.error('Error fetching recent journal entries:', error);
      }
  };

  // Function to build out the data for the journal entries activity over time chart.
  // This will show the user how mmany journal entries they have made each month for the past 6 months. This will be based on the date of the journal entry and will be displayed in a line chart.
  const buildJournalEntriesOverTimeData = (entries: any[]) => {
    const currentDate = new Date();

    // Create an array of the past 6 months with labels and keys for counting entries
    const pastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      
      return {
        label: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
        key: `${date.getFullYear()}-${date.getMonth()}`
      };
    }).reverse();

    const counts: Record<string, number> = {};

    pastSixMonths.forEach(m => {
      counts[m.key] = 0;
    });

    entries.forEach(entry => {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (counts[key] !== undefined) {
        counts[key]++;
      }
    });

    return pastSixMonths.map(m => ({
      month: m.label,
      entries: counts[m.key]
    }));
  };

  // Function to calculate the distribution of game ratings for the user's library games. This will be used to display a bar chart of the user's game ratings.
  const calculateRatingDistribution = (games: any[]) => {

    // Initialize ratingBuckets array that have the spread of potential ratings that games can be given
    const ratingBuckets = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    const distribution: Record<number, number> = {};

    // Iterate through array and initialize all count for each rating as zero
    ratingBuckets.forEach(r => {
      distribution[r] = 0;
    });

    // Loop through each journal entry and increment the count for the corresponding rating in the distribution object
    games.forEach(game => {
      const rating = game.rating;

      if(rating >= 0.5 && rating <= 5){
        const normalized = Math.round(rating * 2) / 2;
        distribution[normalized]++;
      }
    })

    return ratingBuckets.map(rating => ({
      rating,
      count: distribution[rating]
    }));
  }

  // Function to calculate the average rating of the user's games. This will be used to display as a quick stat card on the dashboard.
  const calculateAverageRating = (games: any[]) => {

    // Filter out unrated games in the user's library to get an accurate average rating.
    const ratedGames = games.filter(game => game.rating >= 1 && game.rating <= 5);

    if(ratedGames.length === 0) {
      return 0;
    }

    let totalRating = 0;
    ratedGames.forEach(game => {
      totalRating += game.rating;
    });

    return totalRating / ratedGames.length;
  }

  // Function to calculate the top rated game in the user's library. This will be used to display as a quick stat card
  const calculateTopRatedGame = (games: any[]) => {
    const ratedGames = games.filter(game => game.rating >= 1 && game.rating <= 5);

    if(ratedGames.length === 0) {
      return 0;
    }

    let topRatedGame = ratedGames[0];
    ratedGames.forEach(game => {
      if(game.rating >= topRatedGame.rating){
        topRatedGame = game;
      }
    })
    return topRatedGame;
  }

  // useEffect to call both fetchPlayingGames and fetchRecentJournalEntries when the component mounts.
  useEffect(() => {
    fetchPlayingGames();
    fetchRecentJournalEntries();
  }, []);

  return (

    <div className={classes.background}>

      <div className={classes.backgroundOverlay}>

        <div className={classes.wrapper}>

          <div className={classes.dashboardHeader}>

            <div className={classes.heroContainer}>
              <Group gap={10} align='center'>
                <Avatar radius='xl' size={45} src={user?.image || undefined} alt={user?.name || "User"} onClick={() => router.push('/settings/profile')} />
                <p className={classes.dashboardTitle}> Welcome back, <span className={classes.username}>{user?.name}! </span> </p>
              </Group>
              
              <p className={classes.welcomeText}> 
                Your latest stats, sessions, and milestones — all in one place.
              </p>
              
            </div>

            <div className={classes.quickActionGroup}>
              <EditGameInfoModal opened={editOpened} onClose={editClose} libraryGames={libraryGames} />
              <Button style={{fontFamily:'Poppins', fontWeight: '400'}} size='md' radius='md' leftSection={<Edit size={20} />} onClick={editOpen}>Edit Game Info</Button>

              <PlaySessionModal opened={logOpened} onClose={logClose} gameId={selectedGame?.gameId} gameName={selectedGame?.title} platforms={selectedGame?.platforms}/>
              <Tooltip label='Log Play Session' position='top'>
                <ActionIcon color='teal' size='xl' radius='md' onClick={logOpen}><BookText size={25} /></ActionIcon>
              </Tooltip>

              <JournalEntryModal opened={journalOpened} onClose={journalClose} gameId={selectedGame?.gameId} gameName={selectedGame?.title} />
              <Tooltip label='Create Journal Entry' position='top'>
                <ActionIcon color='pink' size='xl' radius='md' onClick={journalOpen}><NotebookPen size={25} /></ActionIcon>
              </Tooltip>

            </div>
          
          </div>

          <div className={classes.statCards}>

            <SimpleGrid cols={{base: 1, sm: 1, md: 2, lg: 4, xl: 4}} spacing="lg" className={classes.quickStatsGrid}>

              <div className={classes.quickStatItem}>

                <div className={classes.quickStatHeader}>
                  <ThemeIcon size={42} radius='xl' variant='filled' color='indigo'> <ClipboardCheck size={30} /> </ThemeIcon>
                  <Text className={classes.quickStatLabel}>Average Rating</Text>
                </div>
                
                <div className={classes.quickStatBody}>
                  <Text className={classes.quickStatValue}>
                    {avgRating.toFixed(1)}
                    <span className={classes.quickStatUnit}>/5</span>
                  </Text>
                  <Text className={classes.quickStatSubtext}>Across rated games</Text>
                </div>

              </div>

              <div className={classes.quickStatItem}>

                <div className={classes.quickStatHeader}>
                  <ThemeIcon size={42} radius='xl' variant='filled' color='teal'> <Trophy size={20} /> </ThemeIcon>
                  <Text className={classes.quickStatLabel}>Games Platinumed</Text>
                </div>

                <div className={classes.quickStatBody}>
                  <Text className={classes.quickStatValue}>{numPlatinumedGames}</Text>
                  <Text className={classes.quickStatSubtext}>Games you've earned a platinum trophy on</Text>
                </div>
                
              </div>

              <div className={classes.quickStatItem}>

                <div className={classes.quickStatHeader}>
                  <ThemeIcon size={42} radius='xl' variant='filled' color='red'> <Notebook size={20} /> </ThemeIcon>
                  <Text className={classes.quickStatLabel}>Total Entries</Text>
                </div>

                <div className={classes.quickStatBody}>
                  <Text className={classes.quickStatValue}>{numEntries}</Text>
                  <Text className={classes.quickStatSubtext}>Journal entries made</Text>
                </div>
        
              </div>

              <div className={classes.quickStatItem}>

                <div className={classes.quickStatHeader}>
                  <ThemeIcon size={42} radius='xl' variant='filled' color='#f2c617'> <Star size={20} /> </ThemeIcon>
                  <Text className={classes.quickStatLabel}>Top Rated Game</Text>
                </div>

                <div className={classes.ratingWrapper}>
                  <Image src={topRatedGame?.coverImage ? `https:${topRatedGame.coverImage.replace('t_thumb', 't_1080p')}` : PlaceHolderImage.src} alt={topRatedGame?.title || "No Image"} className={classes.topRatedCover} />
                  <Group gap='md' align='center' justify='center'> 
                    <Link className={classes.ratingValue} href={`/games/${topRatedGame?.gameId}`}>{topRatedGame?.title || 'N/A'}</Link>
                    <Rating size='md' value={topRatedGame?.rating || 0} readOnly fractions={2} color='yellow' />
                  </Group>
                </div>
                
              </div>

            </SimpleGrid>

            <SimpleGrid cols={{base: 1, sm: 2, md: 2, lg: 2, xl: 2}} spacing="sm" className={classes.statusGrid}>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>

                  <p className={classes.statusTitle}>Game Status Breakdown</p>

                  <div className={classes.chartWrapper}>

                    <DonutChart
                      size={260}
                      strokeColor='black'
                      strokeWidth={2}
                      thickness={24}
                      paddingAngle={3}
                      chartLabel={`${numOfGames} Games Tracked`}
                      styles={{
                        label:{
                          color: 'white',
                          fontFamily: 'Poppins',
                          fill: 'white',
                          fontSize: '18px'
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
                        { name: 'Backlog', value: backlogLength, color: 'orange' },
                        { name: 'Wishlist', value: wishlistLength, color: 'pink'},
                        { name: 'On Hold', value: onHoldLength, color: 'red' },
                        { name: 'Playing', value: playGamesLength, color: 'blue'},
                        { name: 'No Status Given', value: noStatusLength, color: 'lightgrey'},
                        { name: 'Completed', value: completedLength, color: 'green'},
                        { name: '100%', value: fullyDoneLength, color: 'gold'}
                      ]}
                    />

                  </div>

              </Paper>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>

                  <p className={classes.statusTitle}>Journal Entries Activity</p>

                  <div className={classes.chartWrapper}>

                    <LineChart
                      h={260}
                      w='95%'
                      dataKey='month'
                      yAxisLabel='# of Entries'
                      xAxisLabel='Months'
                      strokeWidth={2}
                      data={journalActivityData}
                      series={[{ name: 'entries', color: 'blue' }]}
                      styles={{
                        axisLabel: {
                          fill: 'white',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                        },
                        axis: {
                          fill: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        },
                        tooltip:{
                          backgroundColor: '#2b2b2b',
                          color: 'white',
                          border: '1px solid #424242'
                        },
                        tooltipBody:{
                          backgroundColor: '#2b2b2b',
                          color: 'white'
                        },
                        tooltipLabel:{
                          color: 'white'
                        },
                        tooltipItemName:{
                          color: 'white',
                          fontFamily: 'Poppins',
                          fontSize: '16px'
                        },
                        tooltipItemData: {
                          color: 'white',
                          fontFamily: 'Poppins',
                          fontSize: '16px'
                        }
                      }}
                    />

                  </div>

              </Paper>

              <Paper shadow="md" radius="lg" className={classes.statusCard}>

                  <p className={classes.statusTitle}>Game Ratings</p>

                  <div className={classes.chartWrapper}>

                    <BarChart
                      h={260}
                      w='95%'
                      dataKey='rating'
                      yAxisLabel='Games'
                      xAxisLabel='Rating (1-5)'
                      data={ratingDistributionData}
                      series={[{ name: 'count', color: 'red' }]}
                      yAxisProps={{
                        allowDecimals: false
                      }}
                      xAxisProps={{
                        allowDecimals: true
                      }}
                      styles={{
                        axisLabel: {
                          fill: 'white',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                        },
                        axis: {
                          fill: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        },
                        tooltip:{
                          backgroundColor: '#2b2b2b',
                          color: 'white',
                          border: '1px solid #424242'
                        },
                        tooltipBody:{
                          backgroundColor: '#2b2b2b',
                          color: 'white'
                        },
                        tooltipLabel:{
                          color: 'white'
                        },
                        tooltipItemName:{
                          color: 'white',
                          fontFamily: 'Poppins',
                          fontSize: '16px'
                        },
                        tooltipItemData: {
                          color: 'white',
                          fontFamily: 'Poppins',
                          fontSize: '16px'
                        }
                      }}
                    />

                  </div>

              </Paper>

              <Paper shadow='md' radius='lg' className={classes.statusCard}>
                  <p className={classes.statusTitle}>Session Heatmap</p>
                  <div className={classes.heatmapWrapper}>
                    <SessionHeatmap />
                  </div>
              </Paper>

            </SimpleGrid>

          </div>

          {/*QUICK LOG SESSION MODAL*/}
          <PlaySessionModal
            opened={opened}
            onClose={() => {
              close();
              setSelectedGame(null);
            }}
            gameId={selectedGame?.gameId || ""}
            gameName={selectedGame?.title || ""}
            platforms={selectedGame?.platforms}
            onSuccess={() => {
              close();
            }}
          />

          <div className={classes.playingGames} >

            <div className={classes.playingSection}>

              <div className={classes.titleLogo}>
                <ThemeIcon size={50} radius='md' variant='gradient' gradient={{from: '#e96443', to: '#904e95', deg: 90}}> <Gamepad size={40} /> </ThemeIcon>
                <a className={classes.gamesPlayingText} href='/library'>Playing Games</a>
              </div>
              
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
                <a className={classes.gamesPlayingText} href='/journal'>Recent Entries</a>
              </div>

            </div>

              {recentEntries.length === 0 ? (
                  <p className={classes.noEntriesText}>No recent journal entries found.</p>
              ) : (
                  <SimpleGrid cols={4} spacing="lg" className={classes.entriesGrid}>
                      {recentEntries.map((entry) => (
                        <JournalEntryCard key={entry._id} entry={entry} variant='dashboard'/>
                      ))}
                  </SimpleGrid>
              )}
          </div>

        </div>

      </div>

    </div>

  );
}