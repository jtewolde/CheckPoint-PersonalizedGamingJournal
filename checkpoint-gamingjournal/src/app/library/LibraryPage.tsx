'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Metadata } from 'next';

import classes from './library.module.css';

import { ListFilter } from 'lucide-react';

import { LoadingOverlay, SimpleGrid, Badge, Image, Select, Popover, Button } from '@mantine/core';
import PlaceHolderImage from '../../../public/no-cover-image.png';

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
                console.log("Total games ", data.games.length)
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
        <div className={classes.wrapper}>
            {loading && <LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}

            <p className={classes.subTitle}> You have {totalGames} games in your library. </p>

            {/* Status Filter Dropdown */}
            <Popover width={300} position='bottom-end' withArrow shadow='lg'>
                <Popover.Target>
                    <Button className={classes.filterButton} size='md' radius='lg' variant="filled" rightSection={<ListFilter />}>Filter By Status</Button>
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
                            { value: 'playing', label: 'Playing' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'on hold', label: 'On Hold' },
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
                            <div
                                className={classes.imageContainer}
                                key={game._id}
                                style={{ textAlign: 'center' }}
                                onClick={() => router.push(`/games/${game.gameId}`)}
                            >
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
                                <Badge className={classes.badge} color='blue' variant='filled' size='md'>
                                    {game.status || "No Status"}
                                </Badge>
                            </div>
                        ))}
                    </SimpleGrid>
                </div>
            )}

            {!loading && filteredGames.length === 0 && (
                <p className={classes.noGamesText}>No games found for the selected status.</p>
            )}
        </div>
    )
}
