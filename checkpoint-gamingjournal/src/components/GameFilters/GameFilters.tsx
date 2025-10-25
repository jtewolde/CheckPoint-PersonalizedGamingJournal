'use client';

import { MultiSelect, Select, Drawer, Stack, Button } from "@mantine/core";4
import { useDisclosure } from "@mantine/hooks";
import { ListFilter } from "lucide-react";
import classes from './GameFilters.module.css';
import { validate } from "uuid";

// Define the props for the GameFilter component
interface GameFilterProps {
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

    const [opened, { toggle, close }] = useDisclosure(false);

    return (

        <>
        
            <Button className={classes.filterButton} size='lg' radius='md' color='#64A0ff' leftSection={<ListFilter size={30} />} onClick={toggle}>Filters</Button>

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

                <Stack className={classes.drawerFilters} gap='md' justify='center' mt={20}>

                    {/* Sort By Dropdown */}
                    <Select
                        size='md'
                        label="Sort By:"
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
                            { value: 'all', label: 'All'},
                            { value: 'main game', label: 'Main Game' },
                            { value: 'dlc', label: "DLC"},
                            { value: 'expansion', label: "Expansion"},
                            { value: 'standalone expansion', label:'Standalone Expansions'},
                            { value: 'remake', label: 'Remake'},
                            { value: 'remaster', label: 'Remaster'},
                            { value: 'episode', label: 'Episode'},
                            { value: 'update', label: 'Update'}
                        ]}
                        value={selectedType}
                        onChange={onTypeChange}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Game Genres with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Genres"
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
                            { value: 'all', label: 'All'},
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
                        value={selectedGenres}
                        onChange={onGenresChange}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Game Themes with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Themes"
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
                            { value: 'all', label: 'All'},
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
                        value={selectedThemes}
                        onChange={onThemesChange}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Game Modes with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Game Modes"
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
                            { value: 'all', label: 'All'},
                            { value: 'single-player', label: 'Single Player' },
                            { value: 'multiplayer', label: 'Multiplayer' },
                            { value: 'co-operative', label: 'Co-operative' },
                            { value: 'battle-royale', label: 'Battle Royale' },
                            { value: 'split-screen', label: 'Split Screen' },
                            { value: 'massively-multiplayer-online-mmo', label: 'MMO'}
                        ]}
                        value={selectedModes}
                        onChange={onModesChange}
                        className={classes.filterSelect}
                        mb="md"
                    />

                    {/* Filter by Platforms with MultiSelect */}
                    <MultiSelect
                        size='md'
                        label="Platforms"
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
                            { value: 'all', label: 'All'},
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
                        value={selectedPlatforms}
                        onChange={onPlatformsChange}
                        className={classes.filterSelect}
                        mb="md"
                    />

                </Stack>

            </Drawer>

        </>
    )

}