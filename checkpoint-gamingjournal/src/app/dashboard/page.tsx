'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { LoadingOverlay } from '@mantine/core';
import { authClient } from '@/lib/auth-client';

import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [loading, setLoading] = useState(true); // State to handle loading

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        return redirect('/auth/signin');
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
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}/>// Show a loading indicator while fetching data
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {games.map((game) => (
          <div key={game.id} style={{ textAlign: 'center' }}>
            <img
              src={`https:${game.cover?.url.replace('t_thumb', 't_cover_big')}`} // Replace thumbnail size with a larger size
              alt={game.name}
              style={{ width: '150px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}