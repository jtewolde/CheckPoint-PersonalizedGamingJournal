'use client'

import { Skeleton } from "@mantine/core"
import classes from './GameCard.module.css'

// Create type variable to determine which variant of gameCard, default for search results and more info
// Compact for Popular and Trending games sections with less info
type GameCardVariant = 'default' | 'compact' | 'small';

interface GameCardSkeletonProps {
    variant?: GameCardVariant;
}

export default function GameSkeletonCard({ variant = 'default' }: GameCardSkeletonProps){

    return (
        <div className={`${classes.gameCard} ${variant === 'compact' ? classes.compact  : variant === 'small' ? classes.small : classes.default}`}>
            <div className={classes.imageWrapper}>
                <Skeleton width='auto' height={310} radius='md' animate />
            </div>
        </div>
    )

}