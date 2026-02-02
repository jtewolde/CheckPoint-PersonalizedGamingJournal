'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/Authcontext';
import { useLibrary } from '@/context/LibraryContext';

// Hook to centralize library games management without reusing the same logic across multiple pages
// Needed to make QOL features like quick-adding games to a user's library
export function useLibraryGame(gameId: string | number, enabled = true) {

    // State variables for identifying if game is in user's library, getting the game object, and loading state
    const { library, loading } = useLibrary();
    const { isAuthenticated } = useAuth();

    const found = library.find(
        (g: { gameId: string | number }) => String(g.gameId) === String(gameId)
    );

    return { 
        isInLibrary: Boolean(found),
        libraryGame: found || null,
        loading
    }
}
