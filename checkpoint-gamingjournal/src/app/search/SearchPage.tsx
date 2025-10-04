'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';

import { LoadingOverlay } from '@mantine/core';
import { SimpleGrid, Button, Stack, Select, Drawer} from '@mantine/core';

import { ListFilter } from 'lucide-react';
import PlaceHolderImage from '../../../public/no-cover-image.png';

import classes from './search.module.css';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || ''; // Get the search query from the URL

  const [opened, { toggle, close }] = useDisclosure();

  const [page, setPage] = useState(1) // start with page 1 for pagination
  const limit = 100; // Set the limit of games on page to 12

  const [games, setGames] = useState<any[]>([]); // State to store games data
  const [length, setLength] = useState("")
  const [loading, setLoading] = useState(true); // State to handle loading

  const [sortOption, setSortOption] = useState<'first_release_date' | 'total_rating' | 'alphabetical' | ''>('total_rating'); // State to sort search results from release date/total_rating
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const offset = (page - 1) * limit; // calculate offset based on page
        const res = await fetch(`/api/igdb/games?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);

        if (!res.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await res.json();
        setGames(data);
        setLength(data.length);
        console.log("Game Results", data)
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchGames();
    }
  }, [query, page]);

// Function to sort out the search results of games using useMemo to sort 
  const sortedGames = useMemo(() => {
  if (!sortOption) return games;

  const sorted = [...games].sort((a, b) => {
    if (sortOption === 'first_release_date') {
      return (b.first_release_date || 0) - (a.first_release_date || 0);
    }
    if (sortOption === 'total_rating') {
      return (b.total_rating || 0) - (a.total_rating || 0);
    }
    if (sortOption === 'alphabetical'){
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  console.log("Sorted by:", sortOption, sorted.map(g => ({
    name: g.name,
    release: g.first_release_date,
    rating: g.total_rating
  })));

  return sorted;
}, [games, sortOption]);

  // Filter the sorted games based on game types like Main Games, DLCs, and Expansions
  // Genres like Action, Adventure, RPG, etc.
  const processedGames = sortedGames.filter((game) =>
    (selectedType === 'all' || game.game_type.type?.toLowerCase() === selectedType) &&
    (selectedGenre === 'all' || game.genres?.some((genre: any) => genre.slug === selectedGenre))
  );

  // If the page is still loading, put a loading overlay
  if (loading) {
    return <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />
  }

  // If there are no search results for search input, redirect to not found page
  if (!games.length) {
    redirect('/search/not-found')
  }

  return (
    <div className={classes.wrapper} >
      <h1 className={classes.searchText}>Search Results for "{query}"</h1>

        <div className={classes.mainContent}>

          <h2 className={classes.numberText}>{processedGames.length} Game Results:</h2>

          <Button className={classes.filterButton} size='lg' radius='md' color='blue' leftSection={<ListFilter size={30} />} onClick={toggle}>Filters</Button>

          <Drawer
            opened={opened}
            onClose={close}
            position='left'
            size="300px"
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

            <Stack className={classes.drawerFilters} gap='lg' justify='center' mt={20}>

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
                onChange={(value) => setSortOption(value as any)}
                className={classes.filterDropdown}
                mb="md"
              />
              
              <Select
                size='md'
                label="Game Type"
                placeholder="All Games"
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
                onChange={(value) => setSelectedType(value as any)}
                className={classes.filterDropdown}
                mb="md"
              />

              <Select
                size='md'
                label="Game Genre"
                placeholder="All Genres"
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
                value={selectedGenre}
                onChange={(value) => setSelectedGenre(value as any)}
                className={classes.filterDropdown}
                mb="md"
              />

            </Stack>

          </Drawer>

          <SimpleGrid cols={6} spacing='sm' verticalSpacing='md' className={classes.gameGrid}>
            {processedGames.map((game) => (
              <div className={classes.gameContainer} key={game.id} style={{ textAlign: 'center' }} onClick={() => {console.log("Naviagating to game details ", game.id); router.push(`/games/${game.id}`) }} >
                <img
                  src={
                    game.cover
                      ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
                      : PlaceHolderImage.src
                  }
                  alt={game.name}
                  className={classes.gameImage}
                />
                <p className={classes.gameName}>{game.name} </p>
                
              </div>
            ))}
          </SimpleGrid>

        </div>
        
    </div>
  );
}