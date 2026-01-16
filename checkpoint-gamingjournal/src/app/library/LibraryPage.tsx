'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client'
import GlobalLoader from '@/components/GlobalLoader/GlobalLoader';

import { SimpleGrid, Badge, Image, Select, Popover, Button } from '@mantine/core';
import { ListFilter } from 'lucide-react';
import PlaceHolderImage from '../../../public/no-cover-image.png';

import classes from './library.module.css';

export default function Library(){
    const [page, setPage] = useState(1);
    const limit = 14;

    const [games, setGames] = useState<any[]>([]);
    const [totalGames, setTotalGames] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');

    const router = useRouter();

    // Check If the user is authenticated, if not redirect to signin page
    useEffect(() => {
        const checkAuth = async () => {
            const session = await authClient.getSession();
            if (!session.data?.user) {
                router.push('/auth/signin');
            }
        }
        checkAuth();

    }, [router]);

    // Fetch User's Game Library
    useEffect(() => {
        const fetchUserGames = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('bearer_token');
                const res = await fetch('/api/user/getLibrary', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if(!res.ok) {
                    throw new Error('Failed to fetch user library');
                }

                const data = await res.json();
                setGames(data.games);
                setTotalGames(data.games.length);
                console.log("User Library Games: ", data.games);
            } catch(error) {
                console.log('Error fetching user library', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserGames();
    }, []);

    // Filter the games based on selected status
    const filteredGames = games.filter((game) =>
        selectedStatus === 'all' || game.status?.toLowerCase() === selectedStatus
    );

    return(

    <div className={classes.background}>

        <div className={classes.overlay}>

            <div className={classes.wrapper}>

                {loading && <GlobalLoader visible={loading} />}

                <div className={classes.libraryHeader}>

                    <div className={classes.titleLogo}>

                        <h2 className={classes.title}>Your Library</h2>

                    </div>

                </div>

                <p className={classes.subTitle}> Track and manage your gaming adventures all in one place. </p>

                <p className={classes.subTitle}> You have <span className={classes.totalGames}>{totalGames} games</span> in your library. </p>

                {/* Status Filter Dropdown */}
                <Popover width={300} position='bottom-end' withArrow shadow='lg'>
                    <Popover.Target>
                        <Button className={classes.filterButton} size='md' radius='lg' variant='gradient' gradient={{from: '#43bae9', to: '#3b99d3', deg: 90}} rightSection={<ListFilter />}>Filter By Status</Button>
                    </Popover.Target>

                    <Popover.Dropdown styles={{dropdown: {backgroundColor: '#212121', color: 'white', border: '2px solid #424040ff'}}}>
                        <Select
                            label="Choose a status to filter your library by"
                            placeholder="Filter by status"
                            styles={{
                                wrapper: { color: '#212121'}, 
                                input: { color: 'white', background: '#212121'}, 
                                dropdown: { background: '#212121', color: 'whitesmoke', border: '1px solid #424242', fontWeight:600 },
                                option: { background: '#202020'}
                            }}
                            checkIconPosition='left'
                            data={[
                                { value: 'all', label: 'All' },
                                { value: 'plan to play', label: "Plan to Play"},
                                { value: 'playing', label: 'Playing'},
                                { value: 'completed', label: 'Completed'},
                                { value: 'on hold', label: 'On Hold'},
                                { value: 'dropped', label: "Dropped"}
                            ]}
                            value={selectedStatus}
                            onChange={(value) => setSelectedStatus(value || 'all')}
                            className={classes.filterDropdown}
                            mb="md"
                        />
                    </Popover.Dropdown>

                </Popover>

                {!loading && filteredGames.length > 0 && (
                    <div className={classes.library}>
                        <SimpleGrid cols={6} spacing="sm" verticalSpacing='md' className={classes.responsiveGrid}>
                            {filteredGames.map((game) => (
                                <div key={game._id} className={classes.libraryCard} onClick={() => router.push(`/games/${game.gameId}`)}>
                                    <div className={classes.imageContainer} style={{ textAlign: 'center' }}>
                                        <Image
                                            src={
                                                game.coverImage
                                                    ? `https:${game.coverImage.replace('t_thumb', 't_cover_big')}`
                                                    : PlaceHolderImage.src
                                            }
                                            alt={game.name}
                                            radius="md"
                                            className={classes.image}
                                        />
                                    </div>

                                    <div className={classes.gameInfo}>

                                        <h3 className={classes.gameTitle}>{game.title}</h3>

                                        {/* <p className={classes.gameGenres}>{game.genre}</p> */}

                                        <Badge 
                                        className={classes.badge} 
                                        color={game.status === 'Completed' ? 'green' : game.status === 'Playing' ? 'blue' : game.status === 'On Hold' ? 'yellow' : game.status === 'Dropped' ? 'red' : game.status === 'Plan to Play' ? 'yellow': game.status === 'No Status Given' ? 'white' : 'dark'} 
                                        variant='outline'
                                        size='md'
                                        radius='sm'
                                        >
                                            {game.status || "No Status"}
                                        </Badge>

                                    </div>

                                </div>
                                
                            ))}
                        </SimpleGrid>
                    </div>
                )}

                {!loading && filteredGames.length === 0 && (
                    <p className={classes.noGamesText}>No games found for the selected status.</p>
                )}
            </div>

        </div>

    </div>

    )
}
