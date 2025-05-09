'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


import classes from './library.module.css';

import { LoadingOverlay } from '@mantine/core';
import { SimpleGrid, Badge, Image, Text,  } from '@mantine/core';
import PlaceHolderImage from '../../../public/no-cover-image.png';

export default function Library(){
    const [page, setPage] = useState(1) // Used to keep track of page for pagination, starting at 1
    const limit = 14; // Set the limit of games on page to 12

    const [games, setGames] = useState<any[]>([]); // State to store games data
    const [totalGames, setTotalGames] = useState(0); // Store number of games in library
    const [loading, setLoading] = useState(true); // State to handle loading
    const router = useRouter();

    useEffect(() => {
        const fetchUserGames = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('bearer_token'); // Retrieve Bearer Token fom
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
                setGames(data.games) // Store the games in state
                console.log("Total games ", data.games.length)
                setTotalGames(data.games.length)
                console.log(data.games)
            } catch(error) {
                console.log('Error fetching user library', error);
            } finally {
                setLoading(false); // Hide loading overlay after fetching data
            }
        };
        fetchUserGames();

    }, [])


    return(
        <div className={classes.wrapper} >
            
            {loading && <LoadingOverlay visible zIndex={1000}  overlayProps={{ radius: "sm", blur: 2 }} />}

                <p className={classes.subTitle}> You have {totalGames} games in your library. </p>
                
                {!loading && games.length > 0 && (
                    <div className={classes.library}>
                        <SimpleGrid cols={6} spacing="sm" verticalSpacing='md' className={classes.responsiveGrid}>
                            {games.map((game) => (
                                <div className={classes.imageContainer} key={game._id} style={{ textAlign: 'center' }} onClick={() => {console.log("Naviagating to game details ", game.id); router.push(`/games/${game._id}`) }} >
                                    <Image
                                        src={
                                            game.coverImage
                                                ? `https:${game.coverImage.replace('t_thumb', 't_cover_big')}` // Replace thumbnail size with a larger size
                                                : PlaceHolderImage.src // Use placeholder if cover is missing
                                        }
                                        alt={game.name}
                                        radius="md"
                                        className={classes.image}
                                    />
                                    <Badge className={classes.badge} color='blue' variant='filled' size='md' >{game.status || "No Status"}</Badge>
                                </div>
                            ))}
                        </SimpleGrid>
                    </div>
                )}


        </div>
    )
    
}