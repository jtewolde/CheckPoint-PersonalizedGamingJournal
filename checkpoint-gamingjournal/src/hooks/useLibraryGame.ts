'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/Authcontext';

// Hook to centralize library games management without reusing the same logic across multiple pages
// Needed to make QOL features like quick-adding games to a user's library
export function useLibraryGame(gameId: string | number, enabled = true) {

    // State variables for identifying if game is in user's library, getting the game object, and loading state
    const [isInLibrary, setIsInLibrary] = useState(false);
    const [libraryGame, setLibraryGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!enabled || !isAuthenticated){
            setIsInLibrary(false);
            setLibraryGame(null);
            setLoading(false);
            return;
        }

        // Function to check if game is in the user's library 
        // by first checking if user is authenicated by checking if token exists.
        const checkLibrary = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem('bearer_token');
                if (!token) {
                    setIsInLibrary(false);
                    return;
                }

                // Use the getLibrary API Call to get the user's library of games
                const res = await fetch('/api/user/getLibrary', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                console.log("Data for Library Hook", data)
                
                // Check if the current game is in the user's library based on ID.
                const found = data.games.find((g: any) => String(g.gameId) === String(gameId));
                console.log("Found Game: ", found)

                setIsInLibrary(Boolean(found));
                setLibraryGame(found || null);
            } catch(error) {
                console.error('Library Check failed', error)
                setIsInLibrary(false);
                setLibraryGame(null);
            } finally {
                setLoading(false);
            }
        };

        checkLibrary();
    }, [gameId, enabled, isAuthenticated]);

    return { isInLibrary, libraryGame, setIsInLibrary, loading };
}
