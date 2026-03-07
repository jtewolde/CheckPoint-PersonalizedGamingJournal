'use client';

import { useState, useEffect } from "react";
import { MultiSelect, Select, Drawer, Stack, Button, Text, ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ListFilter, RefreshCcw } from "lucide-react";
import classes from './GameFilters.module.css';

type GameFiltersVariant = 'default' | 'small'

// Define the props for the GameFilter component
interface GameFilterProps {
    color: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant: GameFiltersVariant;
    totalGames: number;
    sortOption: string;
    selectedType: string[];
    selectedGenres: string[];
    selectedModes: string[];
    selectedThemes: string[];
    selectedPlatforms: string[];
    onSortChange: (value: string | null) => void;
    onTypeChange: (values: string[]) => void;
    onGenresChange: (values: string[]) => void;
    onModesChange: (values: string[]) => void;
    onThemesChange: (values: string[]) => void;
    onPlatformsChange: (values: string[]) => void;
}

// Create the GameFilter component with the defined props to handle game filtering/sorting
export default function GameFilters({
    color,
    size = "lg",
    radius = 'md',
    variant,
    totalGames,
    sortOption,
    selectedType,
    selectedGenres,
    selectedModes,
    selectedThemes,
    selectedPlatforms,
    onSortChange,
    onTypeChange,
    onGenresChange,
    onModesChange,
    onThemesChange,
    onPlatformsChange
} : GameFilterProps) {

    // States for managing the drawer visibility
    const [opened, { toggle, close }] = useDisclosure(false);

    // Determine if any filters are active and count them
    const activeFilters = selectedType.length > 0 || selectedGenres.length > 0 || selectedModes.length > 0 || selectedThemes.length > 0 || selectedPlatforms.length > 0;
    const numberOfActiveFilters = selectedGenres.length + selectedType.length + selectedModes.length + selectedThemes.length + selectedPlatforms.length;

    // Local draft state variables for keeping track of sorting and filters
    const [draftSort, setDraftSort] = useState(sortOption);
    const [draftType, setDraftType] = useState<string[]>(selectedType);
    const [draftGenres, setDraftGenres] = useState<string[]>(selectedGenres);
    const [draftModes, setDraftModes] = useState<string[]>(selectedModes);
    const [draftThemes, setDraftThemes] = useState<string[]>(selectedThemes);
    const [draftPlatforms, setDraftPlatforms] = useState<string[]>(selectedPlatforms);

    // Function to handle filters/sorting with the update filters button
    const handleApplyFilters = () => {
        onSortChange(draftSort);
        onTypeChange(draftType);
        onGenresChange(draftGenres);
        onModesChange(draftModes);
        onThemesChange(draftThemes);
        onPlatformsChange(draftPlatforms);
        close();
    }

    // Function to clear all of the filters/sorting to be used in clear filters button
    const handleClearFilters = () => {
        setDraftSort('');
        setDraftType([]);
        setDraftGenres([]);
        setDraftModes([]);
        setDraftThemes([]);
        setDraftPlatforms([]);
    };

    // Update local state when the modal opens to reflect the current filters and sorting option
    useEffect(() => {
        if (opened) {
            setDraftSort(sortOption);
            setDraftType(selectedType);
            setDraftGenres(selectedGenres);
            setDraftModes(selectedModes);
            setDraftThemes(selectedThemes);
            setDraftPlatforms(selectedPlatforms);
        }
    }, [opened]);

    return (

        <div className={classes.filterContainer}>

            {variant === 'default' && (
                <Button 
                className={classes.filterButton} 
                size={size} 
                radius={radius} 
                color={color} 
                leftSection={<ListFilter size={30} />} 
                onClick={toggle}>
                    Filters
                </Button>

            )}

            {variant === 'small' && (
                <ActionIcon
                size={size}
                radius={radius}
                color={color}
                onClick={toggle}
                >
                    <ListFilter size={30} />
                </ActionIcon>
            )}

            <Text className={classes.activeFiltersText} color='white'>
                {totalGames} Games
            </Text>

            {/* Drawer component to hold the filter options, slides in from left */}
            <Drawer
                opened={opened}
                onClose={close}
                position='left'
                size="330px"
                title='Sort and Filter'
                className={classes.drawer}
                styles={{
                    content: {
                        backgroundColor: '#252525ff'
                    },
                    header: {
                        backgroundColor: '#252525ff',
                        borderBottom: '1px solid gray'
                    },
                    title: {
                        fontSize: '24px',
                        color: 'white',
                        fontFamily: 'Noto Sans',
                        fontWeight: 300
                    },
                    close: {
                        color: 'white'
                    }
                }}
            >

                <Stack className={classes.drawerFilters} gap='xs' justify='center' mt={20}>

                    {/* Sort By Dropdown */}
                    <Select
                        size='md'
                        label="Sort By:"
                        placeholder="Select an option"
                        checkIconPosition='left'
                        styles={{
                        dropdown: {
                            background: '#212121',
                            color: 'whitesmoke'
                        },
                        input: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            color: 'white'
                        },
                        option: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            fontSize: '16px',
                            fontWeight: 330
                        },
                        label: {
                            fontFamily: 'Noto Sans',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 300
                        }
                        }}
                        data={[
                            { value: 'alphabetical', label: 'Alphabetical (A-Z)'},
                            { value: 'first_release_date', label: 'Release Date' },
                            { value: 'total_rating', label: "Total Rating"},
                        ]}
                        value={sortOption}
                        onChange={onSortChange}
                        className={classes.filterDropdown}
                        mb="md"
                    />
                    
                    {/* Filter by Game Type with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Game Types"
                        maxDropdownHeight={200}
                        placeholder={selectedType.length === 0 ? "Choose a Type" : ''}
                        checkIconPosition='left'
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                        styles={{
                        dropdown: {
                            background: '#212121',
                            color: 'whitesmoke',
                        },
                        input: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            color: 'white'
                        },
                        option: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            fontSize: '16px'
                        },
                        label: {
                            color: 'white',
                            fontFamily: 'Noto Sans',
                            fontSize: '20px',
                            fontWeight: 300
                        },
                        pill: {
                            backgroundColor: '#b6becaff',
                            fontWeight: 500,
                            fontFamily: 'Noto Sans',
                            color: 'black'
                        }
                        }}
                        data={[
                            { value: 'Main Game', label: 'Main Game' },
                            { value: 'DLC', label: "DLC"},
                            { value: 'Expansion', label: "Expansion"},
                            { value: 'Standalone Expansion', label:'Standalone Expansions'},
                            { value: 'Remake', label: 'Remake'},
                            { value: 'Remaster', label: 'Remaster'},
                            { value: 'Episode', label: 'Episode'},
                            { value: 'Update', label: 'Update'}
                        ]}
                        value={draftType}
                        onChange={setDraftType}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Game Genres with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Genres"
                        maxDropdownHeight={200}
                        placeholder={selectedGenres.length === 0 ? "Choose a Genre" : ""}
                        checkIconPosition='left'
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                        styles={{
                        dropdown: {
                            background: '#212121',
                            color: 'whitesmoke',
                        },
                        input: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            color: 'white'
                        },
                        option: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            fontSize: '16px'
                        },
                        label: {
                            color: 'white',
                            fontFamily: 'Noto Sans',
                            fontSize: '20px',
                            fontWeight: 300
                        },
                        pill: {
                            backgroundColor: '#b6becaff',
                            fontWeight: 500,
                            fontFamily: 'Noto Sans',
                            color: 'black'
                        }
                        }}
                        data={[
                            { value: 'adventure', label: 'Adventure' },
                            { value: 'arcade', label: "Arcade"},
                            { value: 'card-and-board game', label:'Card & Board Game'},
                            { value: 'fighting', label: 'Fighting'},
                            { value: 'hack-and-slash-beat-em-up', label: 'Hack and Slash/Beat em Up'},
                            { value: 'indie', label: 'Indie'},
                            { value: 'moba', label: 'MOBA'},
                            { value: 'music', label: 'Music'},
                            { value: 'platform', label: 'Platform'},
                            { value: 'point-and-click', label: 'Point and Click'},
                            { value: 'puzzle', label: 'Puzzle'},
                            { value: 'quiz-trivia', label: 'Quiz/Trivia'},
                            { value: 'racing', label: 'Racing'},
                            { value: 'real-time-strategy-rts', label: 'Real Time Strategy (RTS)'},
                            { value: 'role-playing-rpg', label: 'Role-Playing (RPG)'},
                            { value: 'shooter', label: 'Shooter'},
                            { value: 'simulator', label: 'Simulator'},
                            { value: 'sport', label: 'Sports'},
                            { value: 'strategy', label: 'Strategy'},
                            { value: 'tactical', label: 'Tactical'},
                            { value: 'turn-based-strategy-tbs', label: 'Turn-Based Strategy (TBS)'},       
                        ]}
                        value={draftGenres}
                        onChange={setDraftGenres}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Game Themes with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Themes"
                        maxDropdownHeight={200}
                        placeholder={selectedThemes.length === 0 ? 'Choose a Theme' : ''}
                        checkIconPosition='left'
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                        styles={{
                        dropdown: {
                            background: '#212121',
                            color: 'whitesmoke',
                        },
                        input: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            color: 'white'
                        },
                        option: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            fontSize: '16px'
                        },
                        label: {
                            color: 'white',
                            fontFamily: 'Noto Sans',
                            fontSize: '20px',
                            fontWeight: 300
                        },
                        pill: {
                            backgroundColor: '#b6becaff',
                            fontWeight: 500,
                            fontFamily: 'Noto Sans',
                            color: 'black'
                        }
                        }}
                        data={[    
                            { value: 'action', label: 'Action' },
                            { value: 'adventure', label: 'Adventure' },
                            { value: 'business', label: 'Business' },
                            { value: 'comedy', label: 'Comedy' },
                            { value: 'educational', label: 'Educational' },
                            { value: 'erotic', label: 'Erotic' },
                            { value: 'fantasy', label: 'Fantasy' },
                            { value: 'historical', label: 'Historical' },
                            { value: 'horror', label: 'Horror' },
                            { value: 'kids', label: 'Kids' },
                            { value: 'mystery', label: 'Mystery' },
                            { value: 'non-fiction', label: 'Non-Fiction' },
                            { value: 'open-world', label: 'Open-World' },
                            { value: 'party', label: 'Party' },
                            { value: 'romance', label: 'Romance' },
                            { value: 'sandbox', label: 'Sandbox' },
                            { value: 'science-fiction', label: 'Science-Fiction' },
                            { value: 'stealth', label: 'Stealth' },
                            { value: 'survival', label: 'Survival' },
                            { value: 'thriller', label: 'Thriller' },
                            { value: 'warfare', label: 'Warfare' }
                        ]}
                        value={draftThemes}
                        onChange={setDraftThemes}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Game Modes with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Game Modes"
                        placeholder={selectedModes.length === 0 ? 'Choose a Mode' : ''}
                        maxDropdownHeight={200}
                        checkIconPosition='left'
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                        styles={{
                        dropdown: {
                            background: '#212121',
                            color: 'whitesmoke',
                        },
                        input: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            color: 'white'
                        },
                        option: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            fontSize: '16px'
                        },
                        label: {
                            color: 'white',
                            fontFamily: 'Noto Sans',
                            fontSize: '20px',
                            fontWeight: 300
                        },
                        pill: {
                            backgroundColor: '#b6becaff',
                            fontWeight: 500,
                            fontFamily: 'Noto Sans',
                            color: 'black'
                        }
                        }}
                        data={[     
                            { value: 'single-player', label: 'Single Player' },
                            { value: 'multiplayer', label: 'Multiplayer' },
                            { value: 'co-operative', label: 'Co-operative' },
                            { value: 'battle-royale', label: 'Battle Royale' },
                            { value: 'split-screen', label: 'Split Screen' },
                            { value: 'massively-multiplayer-online-mmo', label: 'MMO'}
                        ]}
                        value={draftModes}
                        onChange={setDraftModes}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Platforms with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Platforms"
                        placeholder={selectedPlatforms.length === 0 ? 'Choose a Platform' : ''}
                        maxDropdownHeight={200}
                        checkIconPosition='left'
                        scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                        styles={{
                        dropdown: {
                            background: '#212121',
                            color: 'whitesmoke',
                        },
                        input: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            color: 'white'
                        },
                        option: {
                            background: '#212121',
                            fontFamily: 'Noto Sans',
                            fontSize: '16px'
                        },
                        label: {
                            color: 'white',
                            fontFamily: 'Noto Sans',
                            fontSize: '20px',
                            fontWeight: 300
                        },
                        pill: {
                            backgroundColor: '#b6becaff',
                            fontWeight: 500,
                            fontFamily: 'Noto Sans',
                            color: 'black'
                        }
                        }}
                        data={[  
                            { value: 'ps5', label: 'PlayStation 5' },
                            { value: 'series-x-s', label: 'Xbox Series X/S'},
                            { value: 'win', label: 'PC (Windows)' },
                            { value: 'switch-2', label: 'Nintendo Switch 2' },
                            { value: 'mac', label: 'Mac' },
                            { value: 'linux', label: 'Linux' },
                            { value: 'ps4', label: 'PlayStation 4' },
                            { value: 'xboxone', label: 'Xbox One' },
                            { value: 'switch', label: 'Nintendo Switch' },
                            { value: 'android', label: 'Android' },
                            { value: 'ios', label: 'IOS'},
                            { value: 'psvita', label: 'PlayStation Vita' },
                            { value: 'psp', label: 'PlayStation Portable'},
                            { value: '3ds', label: 'Nintendo 3DS'},
                            { value: 'ps3', label: 'PlayStation 3' },
                            { value: 'xbox360', label: 'Xbox 360' },
                            { value: 'wii', label: 'Wii'},
                            { value: 'wiiu', label: 'Wii U'},
                            { value: 'ds', label: 'Nintendo DS'},
                            { value: 'nes', label: 'NES'},
                            { value: 'ngc', label: 'GameCube'},
                            { value: 'n64', label: 'Nintendo 64'},
                            { value: 'snes', label: 'SNES'}
                        ]}
                        value={draftPlatforms}
                        onChange={setDraftPlatforms}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    <div className={classes.buttonActions}>
                        <Tooltip label='Clear Filters' position="top">
                            <ActionIcon variant="filled" color="red" size='lg' onClick={handleClearFilters}><RefreshCcw size={20} /></ActionIcon>
                        </Tooltip>

                        <Button className={classes.saveButton} size="md" onClick={handleApplyFilters}>Update Filters</Button>
                    </div>
                    
                </Stack>

            </Drawer>

        </div>
    )

}