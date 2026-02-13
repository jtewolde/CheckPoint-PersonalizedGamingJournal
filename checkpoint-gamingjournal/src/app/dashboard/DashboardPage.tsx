'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SimpleGrid, Image, Paper, Text, ThemeIcon, Rating } from '@mantine/core';
import { DonutChart, BarChart, LineChart } from '@mantine/charts';

import { authClient } from '@/lib/auth-client';

import PlaceHolderImage from "../../../public/no-cover-image.png"

import { IconDeviceGamepad3Filled, IconPlayerPauseFilled, IconSword, IconClipboardListFilled } from '@tabler/icons-react';
import { Notebook, Gamepad, CircleUserRound, CircleArrowRight, Trophy, Icon, Star } from 'lucide-react';

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

  // State variables to store data for the profile stats section of the dashboard
  const [numOfGames, setNumOfGames] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [numEntries, setNumEntries] = useState(0);
  const [numPlatinumedGames, setNumPlatinumedGames] = useState(0);
  const [topRatedGame, setTopRatedGame] = useState("");

  const [completedPercentage, setCompletedPercentage] = useState(0)

  const [recentEntries, setRecentEntries] = useState<any[]>([]); // State to store recent journal entries
  const [journalActivityData, setJournalActivityData] = useState<{ month: string; entries: number }[]>([]); // State to store data from journal entries over time chart
  const [ratingDistributionData, setRatingDistributionData] = useState<{ rating: string; count: number }[]>([]); // State to store data for game ratings distribution chart

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

      setRatingDistributionData(calculateRatingDistribution(data.games)) // Calculate the distribution of game ratings
      setAvgRating(calculateAverageRating(data.games)) // Calculate the average rating of the user's games
      setTopRatedGame(calculateTopRatedGame(data.games));

      const playingGames = data.games.filter((game: any) => game.status === 'Playing').slice(0,6) // Filter games that are currently being played with the first 6 games
      const platinumedGames = data.games.filter((game: any) => game.platinum === true).length; // Filter games that have been platinumed and get the count
      setNumPlatinumedGames(platinumedGames); // Store the number of platinumed games in state

      console.log("Playing Games: ", playingGames);
      console.log("Avg Rating: ", avgRating);
      console.log("Number of Platinumed Games: ", platinumedGames);
      console.log("Top Rated Game: ", topRatedGame);
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
          setNumEntries(data.journalEntries.length) // Store total number of journal entries
          
          const sortedEntries = data.journalEntries.reverse().slice(0, 4); // Limit to the 5 most recent entries
          setRecentEntries(sortedEntries); // Store the recent entries in state
          console.log('Recent Journal Entries:', sortedEntries);

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

    // Initialize distribution object with keys for each rating (1-5) and values set to 0 to count number of entries for each rating
    const distribution: Record<string, number> = {
      '1' : 0,
      '2' : 0,
      '3' : 0,
      '4' : 0,
      '5' : 0
    }

    // Loop through each journal entry and increment the count for the corresponding rating in the distribution object
    games.forEach(game => {
      const rating = game.rating;

      if(rating >= 1 && rating <= 5){
        distribution[rating.toString()]++;
      }
    })

    // Convert distribution object into an array of objects with keys 'rating' and 'count' for use in the bar chart
    const distributionArray = Object.keys(distribution).map(rating => ({
      rating,
      count: distribution[rating]
    }));

    return distributionArray;
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
    return topRatedGame.title;
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

            <div className={classes.heroTextContainer}>

              <p className={classes.dashboardTitle}> Welcome back, <span className={classes.username} onClick={() => router.push('/settings/profile')}>{userName}! </span> </p>
              
              <p className={classes.welcomeText}> 
                Here's a quick overview of your gaming journey so far!
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
                        { name: 'Plan to Play', value: planToPlayLength, color: 'blue' },
                        { name: 'On Hold', value: onHoldLength, color: 'gray' },
                        { name: 'Playing', value: playGamesLength, color: 'yellow'},
                        { name: 'No Status Given', value: noStatusLength, color: 'red'},
                        { name: 'Completed', value: completedLength, color: 'green'}
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
                      yAxisLabel='Number of Entries'
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
                <div className={classes.quickStatsContainer}>
                  <p className={classes.statusTitle}>Quick Stats</p>

                  <div className={classes.quickStatsGrid}>

                      <div className={classes.quickStatItem}>

                        <div className={classes.titleLogo}>
                          <ThemeIcon size={30} radius='md' variant='filled' color='indigo'> <IconClipboardListFilled size={20} /> </ThemeIcon>
                          <Text className={classes.quickStatLabel}>Average Rating</Text>
                        </div>
                        
                        <div className={classes.ratingWrapper}>
                          <Text className={classes.ratingValue}>{avgRating.toFixed(2)}</Text>
                          <Rating value={avgRating} readOnly fractions={3} color='yellow' size='md' />
                        </div>

                      </div>

                      <div className={classes.quickStatItem}>

                        <div className={classes.titleLogo}>
                          <ThemeIcon size={30} radius='md' variant='filled' color='teal'> <Trophy size={20} /> </ThemeIcon>
                          <Text className={classes.quickStatLabel}>Games Platinumed</Text>
                        </div>

                        <div className={classes.platinumWrapper}>
                          <Text className={classes.platValue}>{numPlatinumedGames}</Text>
                        </div>
                      </div>

                      <div className={classes.quickStatItem}>

                        <div className={classes.titleLogo}>
                          <ThemeIcon size={30} radius='md' variant='filled' color='orange'> <Notebook size={20} /> </ThemeIcon>
                          <Text className={classes.quickStatLabel}>Total Entries</Text>
                        </div>

                        <div className={classes.ratingWrapper}>
                          <Text className={classes.ratingValue}>{numEntries}</Text>
                        </div>

                      </div>

                      <div className={classes.quickStatItem}>

                        <div className={classes.titleLogo}>
                          <ThemeIcon size={30} radius='md' variant='filled' color='gold'> <Star size={20} /> </ThemeIcon>
                          <Text className={classes.quickStatLabel}>Top Rated Game</Text>
                        </div>

                        <div className={classes.ratingWrapper}>
                          <Text className={classes.ratingValue}>{topRatedGame || 'N/A'}</Text>
                        </div>
                        
                      </div>

                  </div>
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