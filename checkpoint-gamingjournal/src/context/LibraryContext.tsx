'use client';

import { createContext, useEffect, useContext, useState } from 'react';
import { useAuth } from './Authcontext';

// Purpose of creating LibraryContext is to make the user's library of games global and shared throughout the entire app
// Main use is for gameCards  to 
const LibraryContext = createContext<any>(null);

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [library, setLibrary] = useState<any[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!isAuthenticated){
            setLibrary([]);
            setLoading(false);
            return;
        }

        // Function to load the user's library
        const loadLibrary = async () =>{
            setLoading(true);
            const token = localStorage.getItem('bearer_token');

            // Use the getLibrary API Call to get the user's library of games
            const res = await fetch('/api/user/getLibrary', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Get data from API call to insert all of the user's library in the library state variable
            const data = await res.json();
            setLibrary(data.games || [])
            setLoading(false);
        };

        loadLibrary();
    }, [isAuthenticated])

    return(
        <LibraryContext.Provider value={{ library, setLibrary, loading}}>
            {children}
        </LibraryContext.Provider>
    )
}

export const useLibrary = () => useContext(LibraryContext);

