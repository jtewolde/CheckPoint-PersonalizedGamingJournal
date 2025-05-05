'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { LoadingOverlay, Image, Button } from '@mantine/core';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import classes from './game.module.css';

import { NotebookPen } from 'lucide-react';
import PlaceHolderImage from '../../../../public/no-cover-image.png';

export default function GameDetails() {
  const { id } = useParams(); // Get the game ID from the URL
  const [game, setGame] = useState<any>(null); // State to store game details
  const [loading, setLoading] = useState(true); // State to handle loading
  const [addingToLibrary, setAddingToLibrary] = useState(false); // State to handle button loading
  const router = useRouter();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await fetch(`/api/igdb/game?id=${id}`); // Fetch game details from your API
        if (!res.ok) {
          throw new Error('Failed to fetch game details');
        }
        const data = await res.json();
        setGame(data); // Store the game details in state
      } catch (error) {
        console.error('Error fetching game details:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (id) {
      fetchGameDetails();
    }
  }, [id]);

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
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add game to library');
      }

      toast.success('Game added to your library!')
    } catch (error) {
      console.error('Error adding game to library:', error);
      toast.error('Failed to add game to your library. Please try again.');
    } finally {
      setAddingToLibrary(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
  }

  if (!game) {
    return <div>Game not found</div>; // Show a message if the game is not found
  }

  // Define responsive settings for carousel
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1, // Show one slide at a time
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

  // Define responsive settings for similar games carousel
  const similarGameResponsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3, // Show one slide at a time
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

          <Button
            variant="filled"
            color="#2bdd66"
            size="xl"
            radius="xl"
            className={classes.button}
            rightSection={<NotebookPen />}
            onClick={handleAddToLibrary}
            loading={addingToLibrary}
          >
            Add to your Library!
          </Button>

        </div>

        
        <div className={classes.info}>
          <p><strong>Description:</strong> {game.summary || 'No description available.'}</p>
          <p><strong>Storyline:</strong> {game.storyline || 'No storyline provided'} </p>
          <p><strong>Release Date:</strong> {game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString() : 'Unknown'}</p>
          <p><strong>Genres:</strong> {game.genres?.map((genre: any) => genre.name).join(', ') || 'N/A'}</p>
          <p><strong>Platforms:</strong> {game.platforms?.map((platform: any) => platform.name).join(', ') || 'N/A'}</p>
          <p><strong>Companies Involved:</strong> {game.involved_companies?.map((involved_companies: any) => involved_companies.company.name).join(', ') || 'N/A'}</p>
        </div>
      </div>

      <h2 className={classes.screenshotsTitle}>Screenshots: </h2>

      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={false}
        keyBoardControl={true}
        showDots={true}
        containerClass={classes.carouselContainer}
        itemClass={classes.carouselItem}
      >
        {game.screenshots?.map((screenshot: any) => (
          <div key={screenshot.id} className={classes.carouselSlide}>
            <Image
              src={`https:${screenshot.url.replace('t_thumb', 't_screenshot_big')}`}
              alt={`Screenshot of ${game.name}`}
              className={classes.screenshot}
            />
          </div>
        ))}
      </Carousel>

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