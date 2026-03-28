'use client';

import { useEffect, useState } from 'react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { DateInput } from '@mantine/dates';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import toast from 'react-hot-toast';

import { Button, Modal, Select, Badge, RingProgress, Text, Accordion, SimpleGrid, Group, Stack, Rating, Tooltip, ThemeIcon, ActionIcon } from '@mantine/core';
import Image from 'next/image';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType} from 'swiper/types';

import { FreeMode, Navigation, Pagination, Thumbs, Keyboard } from 'swiper/modules';

import classes from './game.module.css';

import { NotebookPen, Delete, X, CalendarDays, Trophy, Check, Pause, Clock, Camera, Star, Gamepad, Activity, Pencil, Info } from 'lucide-react';

import { IconBrandXbox, IconFileDescription, IconBook, IconSwords, IconBrush, IconUsersGroup, IconDeviceGamepad2, 
  IconRating18Plus, IconIcons, IconDevicesPc, IconBrandGoogle, IconDeviceNintendo, IconBrandAndroid, IconBrandApple } from '@tabler/icons-react';

import PlaceHolderImage from '../../../../public/no-cover-image.png';
import { useAuth } from '@/context/Authcontext';
import GameCard from '@/components/GameCard/GameCard';

export default function GameDetails() {
  const { id } = useParams(); // Get the game ID from the URL

  const [game, setGame] = useState<any>(null); // State to store game details
  const [libraryGame, setLibraryGame] = useState<any>(null);

  const [loading, setLoading] = useState(true); // State to handle loading

  const [addingToLibrary, setAddingToLibrary] = useState(false); // State to handle button loading
  const [isGameInLibrary, setIsInLibrary] = useState(false);

  const [status, setStatus] = useState(''); // State to handle game status
  const [isPlatinum, setIsPlatinum] = useState(false) // State to handle platinum of game
  const [rating, setRating] = useState(0); // State to handling rating of game given by user from 0-5 stars
  const [completionDate, setCompletionDate] = useState<string | null>(null); // State to handle completion date of game
  const completionDateString = completionDate ? new Date(completionDate).toLocaleDateString('en-US') : 'N/A';
  const [numOfEntries, setNumOfEntries] = useState(0);

  const [opened, {open, close} ] = useDisclosure(false);

  const [screenshots, setScreensShots] = useState<any[]>([]); // State to store screenshots
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null); // State to handle selected screenshot for modal
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0); // State to track index of selected screenshot
  const [backgroundImage, setBackgroundImage] = useState<string>(PlaceHolderImage.src)

  const [modalOpen, setModalOpen] = useState(false); // State to handle modal open/close

  const {isAuthenticated} = useAuth(); // Access global auth state
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 650px)');

  const [thumbsSwiper, setThumbSwiper] = useState<SwiperType | null>(null);
  const showCardUI = isAuthenticated && isGameInLibrary;

  // Helper function to combining all screenshots and artworks of game in single array for different backgrounds
  const getAllImages = (gameData: any) => {
    const screenshots = gameData?.screenshots || [];
    const artworks = gameData?.artworks || []

    return [...screenshots, ...artworks]
  }

  // Function to help pick a random image from screenshots and artworks of game to be background for dynamic background instead of fixed image
  const getRandomImage = (gameData: any) =>{
    const images = getAllImages(gameData);

    if(images.length === 0) return PlaceHolderImage.src

    const randomIndex = Math.floor(Math.random() * images.length);
    const selected = images[randomIndex]

    return `https:${selected.url.replace('t_thumb', 't_1080p')}`;
  }

  // Fetch game details from IGDB API when component mounts or ID changes
  useEffect(() => {
    const fetchIGDBGameDetails = async () => {
      try {
        const res = await fetch(`/api/igdb/game?id=${id}`); // Fetch game details from your API
        console.log("API Response", res)
        if (!res.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data = await res.json();
        setGame(data); // Store the game details in state
        setBackgroundImage(getRandomImage(data))
        setStatus(data.status);
        setScreensShots(data.screenshots || []);
      } catch (error) {
        console.error('Error fetching game details:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    // Function to check if the game is in the user's library
    const checkIfInLibrary = async () => {
      try {
        const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token
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

        const isGameInLibrary = data.games.some((libraryGame: any) => libraryGame.gameId === id);
        const currentGame = data.games.find((libraryGame: any) => libraryGame.gameId === id);
        console.log("Current Game", currentGame)

        setIsInLibrary(isGameInLibrary); // Update the state
        setLibraryGame(currentGame || null); // Store the current game details in state 
        setStatus(currentGame?.status);
        setIsPlatinum(currentGame?.platinum ?? false)
        setRating(currentGame?.rating ?? 0)
        setCompletionDate(currentGame?.completionDate ?? null)
        setNumOfEntries(currentGame?.journalEntries.length ?? 0)
      } catch (error) {
        console.error('Error checking if game is in library:', error);
      }
    };

    if (id) {
      fetchIGDBGameDetails();
      if(isAuthenticated) { // Only check library if user is authenticated}
      checkIfInLibrary();
      } else {
        setIsInLibrary(false)
        setLibraryGame(null)
      }
    }
  }, [id, isAuthenticated]);

  // Function to handle adding the game to the user's library
  const handleAddToLibrary = async () => {
    if (!game) return;

    setAddingToLibrary(true);

    try {
      const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token from localStorage
      const res = await fetch('/api/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
        body: JSON.stringify({
          gameID: id,
          gameDetails: {
            title: game.name,
            genre: game.genres,
            coverImage: game.cover.url,
            releaseDate: game.first_release_date
              ? new Date(game.first_release_date * 1000).toISOString()
              : null,
            status: game.status,
            platinum: game.platinum,
            journalEntries: [],
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add game to library');
      }

      toast.success('Game added to your library!')
      setIsInLibrary(true); // Update the state to show that the game is in the user's library
    } catch (error) {
      console.error('Error adding game to library:', error);
      toast.error('Failed to add game to your library. Please try again.');
    } finally {
      setAddingToLibrary(false);
    }
  };

  // Function to handle removing the game from the user's library
  const handleRemoveFromLibrary = async () => {
    if (!game) return;

    setAddingToLibrary(true);

    try {
      const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token from localStorage
      const res = await fetch('/api/library/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
        body: JSON.stringify({
          gameID: id,
          gameDetails: {
            title: game.name,
            genre: game.genres,
            coverImage: game.cover.url,
            releaseDate: game.first_release_date
              ? new Date(game.first_release_date * 1000).toISOString()
              : null,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to remove game from library');
      }

      toast.error('Game removed from your library!')
      setIsInLibrary(false); // Update the state to show that the game is not in the user's library
    } catch (error) {
      console.error('Error removing game from library:', error);
      toast.error('Failed to remove game from your library. Please try again.');
    } finally {
      setAddingToLibrary(false);
    }
  }

  // Function to handle updating the game status, trophy(platinum), and rating.
  const handleUpdateInfo = async (status?: string, platinum?: boolean, rating?: number, completionDate?: string | null) => {
    try {
      const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token
      const res = await fetch('/api/library/updateInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
        body: JSON.stringify({
          gameID: id, // Pass the game ID
          gameDetails: {
            status,
            platinum,
            rating,
            completionDate
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update game status');
      }
        
      const data = await res.json();
      toast.success('Game info updated to:', data);
      
      router.push(`/games/${game.id}`)
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error('Failed to update game info. Please try again.');
    }
  };

  // Update local state when the modal opens to reflect the current status, platinum, and rating of the game.
  useEffect(() => {
    if (opened && libraryGame) {
      setStatus(libraryGame.status ?? null);
      setCompletionDate(libraryGame.completionDate ?? null);
      setIsPlatinum(libraryGame.platinum ?? false);
      setRating(libraryGame.rating ?? null);
    }
  }, [opened, libraryGame]);

  // Show global loader while fetching game details
  if (loading) {
    return <GlobalLoader visible={loading} />;
  }

  // If there is no valid game that the user selected, return the notFound page
  if (!game) {
    return notFound()
  }

  // Function to retrieve logos for different platforms that games can be on
  const getPlatformIcon = (platformName: string) => {

    if (platformName.toLowerCase().includes("xbox")) return <IconBrandXbox size={25} />;

    if (platformName.toLowerCase().includes("playstation")) return <IconIcons size={25} />;

    if (platformName.toLowerCase().includes("pc") || platformName.toLowerCase().includes("windows"))
      return <IconDevicesPc size={25} />;

    if (platformName.toLowerCase().includes("nintendo")) return <IconDeviceNintendo size={25} />;

    if (platformName.toLowerCase().includes("android")) return <IconBrandAndroid size={25} />;

    if (platformName.toLowerCase().includes("google")) return <IconBrandGoogle size={25} />

    if (platformName.toLowerCase().includes("ios") || platformName.toLowerCase().includes("mac")) 
      return <IconBrandApple size={25} />;

    return null; // fallback if no match
  };

  // Define possible game statuses for the Select component in the Modal with descriptions for each status that the user can read
  const gameStatuses = [
    {
      value: 'Playing',
      label: 'Playing',
      description: "Currently playing and making progress in the game.",
      icon: <IconDeviceGamepad2 size={25} color='lime' />,
      color: 'green'
    },
    {
      value: 'Completed',
      label: 'Completed',
      description: "Finished the game, having completed the main storyline or achieved the end goals.",
      icon: <Check size={25} color='gold'/>,
      color: 'gold'
    },
    {
      value: 'On Hold',
      label: 'On Hold',
      description: "Temporarily paused playing the game, with the intention to return to it later.",
      icon: <Pause size={25} color='violet'/>,
      color: 'violet'
    },
    {
      value: 'Dropped',
      label: 'Dropped',
      description: "Stopped playing the game without the intention to return",
      icon: <X size={25} color='red'/>,
      color: 'red'
    },
    {
      value: 'Plan to Play',
      label: 'Plan to Play',
      description: "Have intentions to play the game in the future but haven't started yet.",
      icon: <Clock size={25} color='pink'/>,
      color: 'blue'
    }
  ]

  // Function to render the options in the Select component with their respective icons and descriptions for each game status 
  const renderSelectOption = ({option}: any) => { 
    const statusItem = gameStatuses.find(s => s.value === option.value); 
    return statusItem ? ( 
      <Group gap='sm'> 
          {statusItem.icon} 
          <Text size='lg' fw={600}>{statusItem.label}</Text> 
          <Text size='xs' c='dimmed'>{statusItem.description}</Text> 
        </Group> 
        ) : null; 
    };

  // Prepare game information for display on Accordions
  const gameInfo = [
    {
      label: "Description",
      content: game.summary || 'No description available.',
      icon: <IconFileDescription size={30}  color='white'/>
    },
    {
      label: "Storyline",
      content: game.storyline || 'No storyline available.',
      icon: <IconBook size={30} color='white' />
    },
    {
      label: "Release Dates",
      content: game.release_dates ? (
        <Stack gap='xs'>
          {game.release_dates.map((release: any) => 
            <div key={release.id} className={classes.releaseDate}>
              <strong>{release.platform?.name} - </strong>
              {release.human || 'N/A'}
            </div>
          )}
        </Stack>
      ) : (
        "N/A"
      ),
      icon: <CalendarDays size={30} color='white' />
    },
    {
      label: "Genres",
      content: game.genres ? (
        <Group gap="xs">
          {game.genres.map((genre: any) => (
            <Badge key={genre.id} color="blue" radius="lg" size='lg'>
              {genre.name}
            </Badge>
          ))}
        </Group>
      ) : (
        "N/A"
      ),
      icon: <IconSwords size={30} color='white' />
    },
    {
      label: "Themes",
      content: game.themes ? (
        <Group gap='sm'>
          {game.themes.map((theme: any) => 
            <Badge size='lg' className={classes.badge} key={theme.id} color='grape' radius='lg'>
              {theme.name}
            </Badge>
          )}
        </Group>
      ) : (
        "N/A"
      ),
      icon: <IconBrush size={30} color='white' />
    },
    {
      label: "Game Modes",
      content: game.game_modes ? (
        <Group gap="xs">
          {game.game_modes.map((mode: any) => (
            <Badge className={classes.badge} key={mode.id} color="teal" radius="lg" size='lg'>
              {mode.name}
            </Badge>
          ))}
        </Group>
      ) : (
        "N/A"
      ),
      icon: <IconUsersGroup size={30} color='white' />
    },
    {
      label: "Platforms",
      content: game.platforms ? (
        <Group gap='sm'>
          {game.platforms.map((platform: any) => 
            <Badge size='lg' 
              className={classes.badge} 
              key={platform.id} 
              color='cyan' 
              radius='lg'
              leftSection={getPlatformIcon(platform.name)}
            >
              {platform.name}
            </Badge>
          )}
        </Group>
      ) : (
        "N/A"
      ),
      icon: <IconBrandXbox size={30} color='white' />
    },
    {
      label: "Companies Involved",
      content: game.involved_companies?.map((involved_companies: any) => involved_companies.company.name).join(', ') || 'N/A',
      icon: <IconDeviceGamepad2 size={30} color='white' />
    },
    {
      label: "Age Ratings",
      content: game.age_ratings ? (
        <Group gap='sm'>
          {game.age_ratings.filter((rating: any) => rating.rating_category.organization.name === "ESRB" || rating.rating_category.organization.name === "PEGI")
          .map((rating: any) =>  // ESRB and PEGI ratings only
            <div key={rating.id} className={classes.releaseDate}>
              <strong>{rating.rating_category.organization.name || 'N/A'} - </strong>
              {rating.rating_category.rating}
            </div>
          )}
        </Group>
      ) : (
        "N/A"
      ),
      icon: <IconRating18Plus size={30} color='white' />
    }
  ]

  // Sort the collection games by total rating in descending order
  const sortedCollections = game.collections?.[0]?.games.sort((a: any, b: any) => b.total_rating - a.total_rating);

  return (
    <div className={classes.background} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={classes.backgroundOverlay}>
        <div className={classes.wrapper}>
          <div className={classes.titleType}>
            <h1 className={classes.title}>{game.name}</h1>
            <Badge className={classes.gameTypeBadge} color='#656565' size='xl' radius='lg' variant='filled' c='white'>{game.game_type.type}</Badge>
          </div>

          <div className={classes.details}>
            <div className={classes.leftSection}>
              <div className={classes.media}>
                <img
                  src={
                    game.cover
                      ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
                      : PlaceHolderImage.src
                  }
                  alt={game.name}
                  className={classes.cover}
                />
                <div className={`${classes.coverInfoContainer} ${showCardUI ? classes.cardActive : classes.cardMinimal}`}>
                    {isAuthenticated ? (
                      isGameInLibrary ? (
                        <div className={classes.buttonContainer}>
                          <div style={{display:'flex', flexDirection:'row', justifyContent:'center', gap: '1rem'}}>

                            <Badge color="green" size="xl" radius="xl">
                              {libraryGame?.status || 'No Status'}
                            </Badge>

                            {/* Platinum */}
                            <Tooltip label={isPlatinum ? 'Platinum Achieved' : 'Not Completed'} position='top' events={{ hover: true, focus: true, touch: true }}>
                              <ThemeIcon size="lg" variant="subtle" color={isPlatinum ? 'yellow' : 'gray'}>
                                <Trophy 
                                  size={30} 
                                  color={isPlatinum ? 'gold' : 'gray'}
                                  fill={isPlatinum ? 'gold' : 'none'}
                                  style={{ transition: 'all 0.2s ease' }}
                                />
                              </ThemeIcon>
                            </Tooltip>

                            {/*Completion Date */}
                            <Tooltip label={completionDateString} position='top' events={{ hover: true, focus: true, touch: true }}>
                              <ThemeIcon variant='subtle' size='lg' radius='md'>
                                <CalendarDays size={30} color={completionDate ? 'white' : 'gray'}/>
                              </ThemeIcon>
                            </Tooltip>
                          </div>

                          <div style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
                            <Rating readOnly size='lg' fractions={2} value={rating}/>
                          </div>

                          <Modal opened={opened} onClose={close} title="Change Game Info" styles={{content: {backgroundColor: '#2c2c2dff', border: '1px solid #424242', color: 'white', fontFamily: 'Noto Sans'}, header: {backgroundColor: '#2c2c2fff'}, close: {color: 'white'}}}>
                            <Stack gap='md'>

                              <Select
                                className={classes.statusSelect}
                                label="Status:"
                                placeholder="Select game status"
                                size='md'
                                styles={{
                                    wrapper: { color: '#212121'}, 
                                    input: { color: 'white', background: '#212121'}, 
                                    dropdown: { background: '#212121', color: 'whitesmoke', border: '1px solid #424242', fontWeight:600 },
                                }}
                                scrollAreaProps={{ scrollbarSize: 16, type: 'auto', scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                                value={status}
                                onChange={(value) => {
                                  if(!value) return;
                                  setStatus(value);
                                }}
                                data={gameStatuses.map((status) => ({
                                  value: status.value,
                                  label: status.label,
                                }))}
                                renderOption={renderSelectOption}
                              />

                              <DateInput
                                size='md'
                                label="Completion Date:"
                                placeholder='Select completion date'
                                clearable
                                leftSection={<CalendarDays size={20} />}
                                value={completionDate}
                                disabled={status !== 'Completed'}
                                maxDate={new Date()}
                                description={
                                  status !== 'Completed' ? 'Available when status is set to Completed' : undefined
                                }
                                onChange={(date) => {
                                  const dateObj = date ? new Date(date).toISOString() : null;
                                  setCompletionDate(dateObj);
                                }}
                              />

                              <div className={classes.ratingContainer}>

                                <Text size='md' className={classes.ratingText}>Your Rating:</Text>

                                <Rating
                                size='lg' 
                                fractions={2} 
                                value={rating} 
                                onChange={
                                  (value) => {
                                    setRating(value);
                                  }}
                                />

                              </div>

                              <div className={classes.ratingContainer}>

                                <Text size='md' className={classes.ratingText}>Platinum Trophy/100% Completed:</Text>

                                <Trophy 
                                size={30} 
                                color={isPlatinum ? 'gold' : 'gray'}
                                fill={isPlatinum ? 'gold' : 'none'}
                                style={{ transition: 'all 0.2s ease' }}
                                cursor={'pointer'}
                                onClick={() => {
                                  const newValue = !isPlatinum;
                                  setIsPlatinum(newValue);
                                }}
                                />

                              </div>

                              <Button
                                variant='filled'
                                color='blue'
                                size='md'
                                onClick={() => {
                                  handleUpdateInfo(status, isPlatinum, rating, completionDate);
                                  close();
                                }}
                              >
                                Save Changes
                              </Button>

                            </Stack>
                            
                          </Modal>

                          <div className={classes.buttonActions}>
                            <Tooltip label='Remove game from library' position='top'>
                              <Button
                              variant="filled"
                              color="#d8070b"
                              size="md"
                              radius="md"
                              className={classes.button}
                              rightSection={<Delete />}
                              onClick={handleRemoveFromLibrary}
                              loading={addingToLibrary}
                              >
                                Remove
                              </Button>                          
                            </Tooltip>

                              <Tooltip label='Edit Game Info' position="top">
                                  <Button className={classes.button} variant="filled" color="yellow" size='md' radius='md' rightSection={<Pencil size={20} />} onClick={open}>Edit </Button>
                              </Tooltip>
                          </div>


                        </div>
                      ) : (
                        <div className={classes.buttonContainer}>
                          <Button
                            variant="filled"
                            color="#2bdd66"
                            size="lg"
                            radius="xl"
                            className={classes.button}
                            rightSection={<NotebookPen />}
                            onClick={handleAddToLibrary}
                            loading={addingToLibrary}
                          >
                            Add to Library
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button
                        variant="filled"
                        color="#2bdd66"
                        size="lg"
                        radius="xl"
                        className={classes.button}
                        rightSection={<NotebookPen />}
                        onClick={() => router.push('/auth/signup')}
                      >
                        Create an account
                      </Button>
                    )}

                  </div>

              </div>

            </div>

            <div className={classes.rightSection}>
              <Accordion className={classes.accordion} 
                styles={{item: {background: '#181717', color: 'white', border: '0.5px solid #5a5a59'}, 
                  label: {color: 'white', paddingRight: '0.7rem', fontSize: '18px', fontWeight: 550}, 
                  chevron: {color: 'white'},
                  panel: {color: 'white', fontSize: '18px'}
                }} 
                radius='md' 
                variant='contained'
                multiple 
                defaultValue={['Description']}
              >
                {gameInfo.map((item) => (
                  <Accordion.Item key={item.label} value={item.label}>
                    <Accordion.Control icon={item.icon}>{item.label}</Accordion.Control>
                    <Accordion.Panel>{item.content}</Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>

            </div>

          </div>

          <div className={classes.ratingSection}>

            <div className={classes.sectionHeader}>
              <ThemeIcon size={50} variant='gradient' gradient={{ from: '#f7971e', to: '#ffd200', deg: 20}} radius='md'>
                  <Star size={40} />
              </ThemeIcon>
              <h2 className={classes.sectionTitle}>Ratings: </h2>
            </div>

            <div className={classes.ratings}>

              <div className={classes.igdbRating}>

                <Text className={classes.ratingLabel}>User Score</Text>

                <RingProgress
                  size={300}
                  thickness={18}
                  sections={[
                    { value: game.rating || 0, color: 'blue' },
                    { value: 100 - (game.rating || 0), color: 'gray' },
                  ]}
                  label={
                    <Text size="xl" fw={600} c='white' className={classes.ratingScore}>
                      {game.rating ? `${Math.round(game.rating)}%` : 'N/A'}
                    </Text>
                  }
                  />
              </div>

              <div className={classes.aggregatedRating}>

                <Text className={classes.ratingLabel}>
                  Critic Score
                </Text>

                <RingProgress
                  size={300}
                  thickness={18}
                  sections={[
                    { value: game.aggregated_rating || 0, color: 'red' },
                    { value: 100 - (game.aggregated_rating || 0), color: 'gray' },
                  ]}
                  label={
                    <Text size="xl" fw={600} c='white' className={classes.ratingScore}>
                      {game.aggregated_rating ? `${Math.round(game.aggregated_rating)}%` : 'N/A'}
                    </Text>
                  }
                />
              </div>

            </div>

          </div>

          {/* <div className={classes.activitySection}>
            <div className={classes.sectionHeader}>
                <ThemeIcon size={50} variant='gradient' gradient={{ from: '#e70e0e', to: '#ca1118', deg: 20}} radius='md'>
                    <Activity size={40} />
                </ThemeIcon>
                <h2 className={classes.sectionTitle}>Your Activity: </h2>
            </div>

            <SimpleGrid cols={{base: 3}} spacing='lg' verticalSpacing='lg' className={classes.activityGrid}>

              <div className={classes.activityItem}>
                <div className={classes.titleLogo}>
                  <Text className={classes.activityLabel}>Last Played</Text>
                </div>
                <Text className={classes.activityStat}>March</Text>
              </div>

              <div className={classes.activityItem}>
                <div className={classes.titleLogo}>
                  <Text className={classes.activityLabel}>Total Entries</Text>
                </div>
                <Text className={classes.activityStat}>{numOfEntries}</Text>
              </div>

              <div className={classes.activityItem}>
                <div className={classes.titleLogo}>
                  <Text className={classes.activityLabel}>Total Playtime</Text>
                </div>
                <Text className={classes.activityStat}>4 Hours 59 Minutes</Text>
              </div>

            </SimpleGrid>
          </div> */}

          <div className={classes.sectionHeader}>
            <ThemeIcon size={50} variant='gradient' gradient={{ from: '#3ecb1b', to: '#10912a', deg: 20}} radius='md'>
                <Camera size={40} />
            </ThemeIcon>
            <h2 className={classes.sectionTitle}>Screenshots ({game.screenshots.length}):</h2>
          </div>

          <div className={classes.screenshotsContainer}>

            <Swiper
              centeredSlides={true}
              loop={true}
              navigation={true}
              pagination={{type: 'progressbar'}}
              scrollbar={isMobile ? true: false}
              thumbs={{ swiper: thumbsSwiper}}
              modules={[Pagination, Navigation, Thumbs]}
              slidesPerView={isMobile ? 1 : 1.5}
              spaceBetween={20}
              className={classes.swiperContainer}
            >
              {screenshots.map((screenshot: any, index: number) => (
                <SwiperSlide key={screenshot.id} className={classes.carouselSlide}>
                  <Image
                    src={`https:${screenshot.url.replace('t_thumb', 't_1080p')}`}
                    alt={`Screenshot of ${game.name}`}
                    className={classes.screenshot}
                    width={900}
                    height={400}
                    loading='lazy'
                    onClick={() => {
                      setSelectedScreenshot(`https:${screenshot.url.replace('t_thumb', 't_1080p')}`);
                      setSelectedScreenshotIndex(index);
                      console.log("Selected Screenshot Index:", index);
                      setModalOpen(true);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {modalOpen && (
            <div className={classes.fullScreenOverlay}>

              <div className={classes.carouselButtons}>
                <Button className={classes.closeButton} variant='light' color='white' size='sm' onClick={() =>setModalOpen(false)}><X size={40} /></Button>
              </div>

              <Swiper
              initialSlide={selectedScreenshotIndex}
              navigation
              loop
              pagination={{ clickable: true, type: 'bullets' }}
              keyboard={{ enabled: true }}
              modules={[Navigation, Pagination, Keyboard]}
              className={classes.fullscreenSwiper}
              >
                {screenshots.map((screenshot: any, index: number) => (
                  <SwiperSlide key={screenshot.id}>
                    <Image
                      src={`https:${screenshot.url.replace('t_thumb', 't_1080p')}`}
                      alt={`Screenshot ${index}`}
                      className={classes.fullScreenImage}
                      width={1200}
                      height={700}
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100vh'
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
          <div className={classes.gameSeries}>
            {game.collections?.[0]?.games.length > 4 && (
              <>
                <div className={classes.sectionHeader}>
                  <h2 className={classes.sectionTitle}>Games in the Same Series:</h2>
                </div>

                <SimpleGrid cols={{ base: 2, sm: 3, md: 5}} spacing='lg' verticalSpacing='lg' className={classes.seriesGrid}>
                  {sortedCollections.slice(0, 10).map((collection: any) => (
                      <GameCard variant='compact' key={collection.id} game={collection} />
                  ))}
                </SimpleGrid>
              </>
            )}

          </div>

          <div className={classes.sectionHeader}>
            <ThemeIcon size={50} variant='gradient' gradient={{ from: '#0e6ce7', to: '#1d4ee2', deg: 20}} radius='md'>
                <Gamepad size={40} />
            </ThemeIcon>
            <h2 className={classes.sectionTitle}>Similar Games: </h2>
          </div>

          <div className={classes.similarGames}>
            
            <Swiper
              centeredSlides={isMobile ? true: false}
              navigation={true}
              pagination={{clickable: true}}
              modules={[Navigation, Pagination]}
              slidesPerView={isMobile ? 1.4 : 3}
              spaceBetween={20}
              className={classes.swiperContainer}
            >
              {game.similar_games?.map((similarGame: any) => {
                return (
                  <SwiperSlide
                    key={similarGame.id}
                    className={classes.similarGameSlide}
                    onClick={() => router.push(`/games/${similarGame.id}`)} // Navigate to the similar game's details page
                  >
                    <GameCard variant='default' key={similarGame.id} game={similarGame} />
                  </SwiperSlide>
                );
              })}
            </Swiper>

          </div>

        </div>

      </div>

    </div>

  );
}