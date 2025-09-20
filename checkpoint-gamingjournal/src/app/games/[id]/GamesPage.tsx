'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useParams, useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { LoadingOverlay, Button, Modal, Select, Badge, RingProgress, Text, Accordion, SimpleGrid, Group } from '@mantine/core';
import Image from 'next/image';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import useEmblaCarousel from 'embla-carousel-react'

import classes from './game.module.css';

import { NotebookPen, Delete, X, CalendarDays, icons } from 'lucide-react';

import { IconBrandXbox, IconFileDescription, IconBook, IconSwords, IconBrush, IconUsersGroup, IconDeviceGamepad2, 
  IconRating18Plus, IconIcons, IconDevicesPc, IconBrandGoogle, IconDeviceNintendo, IconBrandAndroid, IconBrandApple } from '@tabler/icons-react';

import PlaceHolderImage from '../../../../public/no-cover-image.png';
import { useAuth } from '@/context/Authcontext';

export default function GameDetails() {
  const { id } = useParams(); // Get the game ID from the URL

  const [game, setGame] = useState<any>(null); // State to store game details
  const [libraryGame, setLibraryGame] = useState<any>(null);

  const [loading, setLoading] = useState(true); // State to handle loading

  const [addingToLibrary, setAddingToLibrary] = useState(false); // State to handle button loading
  const [isGameInLibrary, setIsInLibrary] = useState(false);

  const [status, setStatus] = useState(''); // State to handle game status
  const [opened, {open, close} ] = useDisclosure(false);

  const [screenshots, setScreensShots] = useState<any[]>([]); // State to store screenshots
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null); // State to handle selected screenshot for modal
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0); // State to track index of selected screenshot

  const [modalOpen, setModalOpen] = useState(false); // State to handle modal open/close

  const {isAuthenticated, setIsAuthenticated} = useAuth(); // Access global auth state

  const router = useRouter();

  // Initialize Embla Carousel for screenshots when in full screen modal
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  // Functions to scroll the carousel with Buttons
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // When emblaApi or selectedScreenshotIndex changes, scroll to the selected screenshot
  useEffect(() => {
    if (emblaApi && selectedScreenshotIndex !== null) {
      emblaApi.scrollTo(selectedScreenshotIndex, true)
    }
  }, [emblaApi, selectedScreenshotIndex])

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
        console.log("Game Data", data)
        setStatus(data.status);
        setScreensShots(data.screenshots || []);
        console.log("Screenshots", data.screenshots)

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
            genre: game.genres?.map((genre: any) => genre.name).join(', '),
            coverImage: game.cover.url,
            releaseDate: game.first_release_date
              ? new Date(game.first_release_date * 1000).toISOString()
              : null,
            status: game.status,
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
            genre: game.genres?.map((genre: any) => genre.name).join(', '),
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

  // Function to handle updating the game status
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('bearer_token'); // Retrieve the Bearer token
      const res = await fetch('/api/library/updateStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the Bearer token
        },
        body: JSON.stringify({
          gameID: id, // Pass the game ID
          gameDetails: {
            status: newStatus, // Pass the new status
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update game status');
      }
        
      const data = await res.json();
      console.log('Game status updated:', data);
      toast.success('Game status updated successfully!');
      
      router.push(`/games/${game.id}`)
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error('Failed to update game status. Please try again.');
    }
  };

  if (loading) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
  }

  if (!game) {
    return <div>Game not found</div>; // Show a message if the game is not found
  }

  // Define responsive settings for similar games carousel
  const similarGameResponsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3, // Show three slides at a time for desktop
      slidesToSlide: 3, // Number of slides to scroll at once
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2, // Show one slide at a time
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1, // Show one slide at a time
    },
  };

  // Function to retrieve logos for different platforms that games can be on
  const getPlatformIcon = (platformName: string) => {

    if (platformName.toLowerCase().includes("xbox")) return <IconBrandXbox size={25} />;

    if (platformName.toLowerCase().includes("playstation")) return <IconIcons size={25} />;

    if (platformName.toLowerCase().includes("pc") || platformName.toLowerCase().includes("windows"))
      return <IconDevicesPc size={25} />;

    if (platformName.toLowerCase().includes("nintendo")) return <IconDeviceNintendo size={25} />;

    if (platformName.toLowerCase().includes("android")) return <IconBrandAndroid size={25} />;

    if (platformName.toLowerCase().includes("ios") || platformName.toLowerCase().includes("mac")) 
      return <IconBrandApple size={25} />;

    return null; // fallback if no match
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
      label: "Release Date",
      content: game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString() : 'Unknown',
      icon: <CalendarDays size={30} color='white' />
    },
    {
      label: "Genres",
      content: game.genres ? (
        <Group gap="xs">
          {game.genres.map((genre: any) => (
            <Badge key={genre.id} color="blue" radius="lg" size='xl'>
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
            <Badge size='xl' className={classes.badge} key={theme.id} color='grape' radius='lg'>
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
            <Badge className={classes.badge} key={mode.id} color="teal" radius="lg" size='xl'>
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
            <Badge size='xl' 
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
    // {
    //   label: "Age Ratings",
    //   content: game.age_ratings.rating_category?.map((age_rating: any) => ),
    //   icon: <IconRating18Plus size={30} color='white' />
    // }
  ]

  return (
    <div className={classes.wrapper}>
      <h1 className={classes.title}>{game.name}</h1>
      <div className={classes.details}>
        <div className={classes.media}>
          <img
            src={
              game.cover
                ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
                : PlaceHolderImage.src
            }
            alt={game.name}
            className={classes.cover}
          />

        {isAuthenticated ? (
          isGameInLibrary ? (
            <>
              <Badge className={classes.badge} color="green" size='xl' variant='filled' onClick={open}>
                {libraryGame?.status || 'No Status Given'}
              </Badge>
              <Modal opened={opened} onClose={close} title="Change Game Status">
                <Select
                  className={classes.statusSelect}
                  value={status}
                  onChange={(value) => {
                    setStatus(value || '');
                    handleUpdateStatus(value || '');
                    close();
                  }}
                  data={[
                    { value: 'Playing', label: 'Playing' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'On Hold', label: 'On Hold' },
                    { value: 'Dropped', label: 'Dropped' },
                    { value: 'Plan to Play', label: 'Plan to Play' },
                  ]}
                  placeholder="Select game status"
                />
              </Modal>
              <Button
                variant="filled"
                color="#d8070b"
                size="md"
                radius="xl"
                className={classes.button}
                rightSection={<Delete />}
                onClick={handleRemoveFromLibrary}
                loading={addingToLibrary}
              >
                Remove from your Library!
              </Button>
            </>
          ) : (
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
              Add to your Library!
            </Button>
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
            Create an account use CheckPoint!
          </Button>
        )}

        </div>

        <div className={classes.gameInfo}>

          {/* <h2 className={classes.accordionTitle}>Game Information</h2> */}

          <Accordion className={classes.accordion} 
            styles={{item: {background: '#5a5b5dff', color: 'white', borderRadius: '24px'}, 
              label: {color: 'white', paddingRight: '0.7rem', fontSize: '18px', fontWeight: 550}, 
              chevron: {color: 'white'},
              panel: {color: 'white', fontSize: '18px', }}} 
            chevronSize={30}
            radius='lg' 
            variant='seperated' 
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

      <h2 className={classes.screenshotsTitle}>Ratings: </h2>

      <div className={classes.ratings}>

        <div className={classes.igdbRating}>

            <RingProgress
              size={300}
              thickness={18}
              sections={[
                { value: game.rating || 0, color: 'blue' },
                { value: 100 - (game.rating || 0), color: 'gray' },
              ]}
              label={
                <Text size="xl" fw={600} c='white' className={classes.ratingLabel}>
                  {game.rating ? `${Math.round(game.rating)}%` : 'N/A'}
                </Text>
              }
            />
            <Text className={classes.ratingText} size="md" c='white'>
              {game.rating_count ? `${game.rating_count} average user ratings from IGDB` : 'No ratings available'}
            </Text>

          </div>

          <div className={classes.aggregatedRating}>

            <RingProgress
              size={300}
              thickness={18}
              sections={[
                { value: game.aggregated_rating || 0, color: 'red' },
                { value: 100 - (game.aggregated_rating || 0), color: 'gray' },
              ]}
              label={
                <Text size="xl" fw={600} c='white' className={classes.ratingLabel}>
                  {game.aggregated_rating ? `${Math.round(game.aggregated_rating)}%` : 'N/A'}
                </Text>
              }
            />
            <Text className={classes.ratingText} size="md" c='white'>
              {game.aggregated_rating_count ? `${game.aggregated_rating_count} ratings from external critics` : 'No ratings available'}
            </Text>

          </div>

      </div>

      <h2 className={classes.screenshotsTitle}>Screenshots: </h2>

      <div className={classes.screenshotGrid}>

        {screenshots.map((screenshot: any, index: number) => (
          <div key={screenshot.id} className={classes.carouselSlide}>
            <Image
              src={`https:${screenshot.url.replace('t_thumb', 't_1080p')}`}
              alt={`Screenshot of ${game.name}`}
              className={classes.screenshot}
              width={750}
              height={400}
              loading='lazy'
              layout='responsive'
              onClick={() => {
                setSelectedScreenshot(`https:${screenshot.url.replace('t_thumb', 't_1080p')}`);
                setSelectedScreenshotIndex(index);
                console.log("Selected Screenshot Index:", index);
                setModalOpen(true);
              }}
            />
          </div>
        ))}
      </div>

      {selectedScreenshot && modalOpen && (
        <div className={classes.fullScreenOverlay}>

          <div className={classes.carouselButtons}>
            <Button className={classes.closeButton} variant='light' color='white' size='sm' onClick={() =>setModalOpen(false)}><X size={40} /></Button>
          </div>

          <Image
            src={selectedScreenshot}
            alt={`Screenshot of ${game.name}`}
            className={classes.fullScreenImage}
            width={800}
            height={450}
            style={{ objectFit: 'contain', maxHeight: '90vh', width: 'auto'}}
            loading='lazy'
            layout='responsive'
          />
        </div>
      )}

      
      <div className={classes.gameSeries}>

        {game.collections?.[0]?.games.length > 0 && (
          <>

            <div className={classes.nameButtonContainer}>
              <h2 className={classes.gameSeriesName}> Other Games in the Series:</h2>
              {/* <a className={classes.viewMoreText} href='/search/popular' >View more</a> */}
            </div>
            
            <SimpleGrid spacing='lg' verticalSpacing='lg' className={classes.seriesGrid}>
              {game.collections?.[0]?.games?.slice(0, 6).map((collection: any) => (
                  <div
                    className={classes.seriesGameCard}
                    key={collection.id}
                    onClick={() => router.push(`/games/${collection.id}`)}
                  >
                    <img
                      src={
                        collection.cover
                          ? `https:${collection.cover.url.replace('t_thumb', 't_cover_big')}`
                          : PlaceHolderImage.src
                      }
                      alt={collection.name}
                      className={classes.gameCover}
                      onClick={() => router.push(`/games/${game.id}`)}
                    />
                  </div>
              ))}
            </SimpleGrid>
          </>
        )}

      </div>

      <h2 className={classes.similarGamesName}>Similar Games: </h2>

      <div className={classes.similarGames}>
        <Carousel
          responsive={similarGameResponsive}
          infinite={true}
          autoPlay={false}
          keyBoardControl={true}
          containerClass={classes.carouselContainer}
          itemClass={classes.carouselItem}
        >
          {game.similar_games?.map((similarGame: any) => {
            return (
              <div
                key={similarGame.id}
                className={classes.similarGameSlide}
                onClick={() => router.push(`/games/${similarGame.id}`)} // Navigate to the similar game's details page
              >
                <img
                  src={
                    similarGame.cover
                      ? `https:${similarGame.cover.url.replace('t_thumb', 't_cover_big')}`
                      : PlaceHolderImage.src
                  }
                  alt={similarGame.name}
                  className={classes.similarGameCover}
                />
                <p className={classes.similarGameName}>{similarGame.name}</p>
              </div>
            );
          })}
        </Carousel>
      </div>

    </div>

  );
}