'use client'

import { useRouter } from 'next/navigation';
import { Button, Overlay } from '@mantine/core';
import { LayoutDashboard } from 'lucide-react';

import classes from './notFound.module.css'

export default function NotFound(){

    const router = useRouter();

    return (
        <div className={classes.container}>

            <Overlay
            gradient="linear-gradient(180deg, #1f1c2c 10%,rgb(47, 45, 58) 20%)"
            opacity={0.55}
            zIndex={0}
            />

            <div className={classes.notFoundSection}>

                <h1 className={classes.notFoundTitle}>
                    NO GAME RESULTS FOUND
                </h1>
        
                <p className={classes.notFoundText}>
                    The game that you are trying to search for, was not found.
                    Try again with a different name in the search bar or return back to your Dashboard.
                </p>

                <Button className={classes.notFoundBtn}
                    size='lg' 
                    radius='md' 
                    leftSection={<LayoutDashboard size={30} />} 
                    onClick={() => router.push('/dashboard')}
                >
                Return to Dashboard
                </Button>

            </div>

        </div>
    )
}