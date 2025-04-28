'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LoadingOverlay } from '@mantine/core';
import classes from './game.module.css';

import PlaceHolderImage from '../../../../public/no-cover-image.png';
export default function GameDetails() {
  const { id } = useParams(); // Get the game ID from the URL
  const [game, setGame] = useState<any>(null); // State to store game details
  const [loading, setLoading] = useState(true); // State to handle loading

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

  if (loading) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />;
  }

  if (!game) {
    return <div>Game not found</div>; // Show a message if the game is not found
  }

  return (
    <div className={classes.wrapper}>
      <h1 className={classes.title}>{game.name}</h1>
      <div className={classes.details}>
        <img
          src={
            game.cover
              ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
              : PlaceHolderImage.src
          }
          alt={game.name}
          className={classes.cover}
        />
        <div className={classes.info}>
          <p><strong>Description:</strong> {game.summary || 'No description available.'}</p>
          <p><strong>Release Date:</strong> {game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString() : 'Unknown'}</p>
          <p><strong>Genres:</strong> {game.genres?.map((genre: any) => genre.name).join(', ') || 'N/A'}</p>
          <p><strong>Platforms:</strong> {game.platforms?.map((platform: any) => platform.name).join(', ') || 'N/A'}</p>
          <p><strong>Companies Involved:</strong> {game.involved_companies?.map((involved_companies: any) => involved_companies.company.name).join(', ') || 'N/A'}</p>
        </div>
      </div>
      <h2 className={classes.screenshotsTitle}>Screenshots</h2>
      <div className={classes.screenshots}>
        {game.screenshots?.map((screenshot: any) => (
          <img
            key={screenshot.id}
            src={`https:${screenshot.url.replace('t_thumb', 't_screenshot_big')}`}
            alt={`Screenshot of ${game.name}`}
            className={classes.screenshot}
          />
        )) || <p>No screenshots available.</p>}
      </div>
    </div>
  );
}