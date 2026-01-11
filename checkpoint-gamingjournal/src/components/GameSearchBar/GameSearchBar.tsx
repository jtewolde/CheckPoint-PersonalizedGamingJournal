'use client'

import { useState } from "react"
import { Autocomplete, useCombobox, Button } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import classes from './GameSearchBar.module.css';

// Define the props for the GameSearchBar component 
// Props include optional placeholder text, size, radius, className, 
// autoNavigate flag, and initialQuery for pre-filling the search input.
type GameSearchBarProps = {
    placeHolder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    autoNavigate?: boolean;
    initialQuery?: string; 
};

export default function GameSearchBar({
    placeHolder = "Search for games...",
    size = "lg",
    radius = 'md',
    className,
    autoNavigate = true,
    initialQuery = '',
}: GameSearchBarProps) {

    // State to manage the current query and search results
    const [query, setQuery] = useState(initialQuery)
    const [searchResults, setSearchResults] = useState<{name: string}[]>([])
    const router = useRouter()

    // Combobox used to close dropdown when entering name in search bar.
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    })

    // Function to handle search queries and fetch results from the API
    const handleSearch = async (query: string) => {
        setQuery(query);
    
        if (query.trim().length < 3) {
            setSearchResults([]); // Clear results if the query is empty
            return;
        }

        try {
            const res = await fetch(`/api/igdb/games?query=${encodeURIComponent(query)}`);
            if (!res.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await res.json();
            if (!Array.isArray(data)) {
                console.log("Unexpected response format:", data);
                return;
            }
    
            // Remove duplicate game names
            const uniqueResults = data.filter(
                (game: any, index: number, self: any[]) =>
                index === self.findIndex((g) => g.name === game.name)
            );
    
        setSearchResults(uniqueResults); // Update search results with unique values
        } catch (error) {
        console.error('Error fetching search results:', error);
        }
    };

    // Function to navigate to the search results page
    const navigateToSearch = (query: string) => {
        if (!query.trim()) return;
        router.push(`/search?query=${encodeURIComponent(query)}`);
    };

    return (

        <div className={classes.wrapper} >

            <Autocomplete
                classNames={{ option: classes.option }}
                className={className}
                radius={radius}
                size={size}
                variant="filled"
                placeholder={placeHolder}
                value={query}
                styles={
                    {
                        dropdown: {
                            backgroundColor: '#232526',
                            color: 'white',
                            borderRadius: '4px'
                        },
                    }
                }
                scrollAreaProps={{ scrollbarSize: 16, type: 'auto', scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                comboboxProps={{ transitionProps: { transition: 'fade-down', duration: 200 } }}
                data={searchResults.map((game: {name: string}) => ({
                    value: game.name,
                    label: game.name,
                }))}
                onChange={handleSearch}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && autoNavigate) {
                        navigateToSearch(query);
                        close()
                    }
                }}
                leftSection={
                    <IconSearch size={30} />
                }
            />

            <Button 
            className={classes.button} 
            color= 'white'
            c='black'
            size={size}
            radius={radius}
            onClick={() => autoNavigate && navigateToSearch(query)}>
                Search
            </Button>

        </div>
        
    );
}
