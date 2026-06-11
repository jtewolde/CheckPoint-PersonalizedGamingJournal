'use client'

import { useState, useRef } from "react"
import { TextInput, Button } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"

import classes from './GamePageSearch.module.css';

// Define the props for the GamePageSearch component 
// Props include optional placeholder text, size, radius, className, 
// autoNavigate flag, and initialQuery for pre-filling the search input.
type GamePageSearchProps = {
    placeHolder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;

    // lets parent control filtering (recommended)
    value?: string;
    onChange?: (value: string) => void;

    initialQuery?: string; 
};

export default function GamePageSearch({
    placeHolder = "Search for games on this page...",
    size = "lg",
    radius = 'md',
    className,
    value,
    onChange,
    initialQuery = '',
}: GamePageSearchProps) {

    const [internalSearchQuery, setInternalSearchQuery] = useState(initialQuery);

    const isControlled = value !== undefined;
    const searchQuery = isControlled ? value: internalSearchQuery;

    const handleChange = (val: string) => {
        if (!isControlled) {
            setInternalSearchQuery(val);
        }
        onChange?.(val);
    };

    return(
        <div className={classes.wrapper}>
            <TextInput
                value={searchQuery}
                onChange={(e) => handleChange(e.currentTarget.value)}
                placeholder={placeHolder}
                size={size}
                radius={radius}
                className={classes.input}
                leftSection={<IconSearch size={25} />}
            />
        </div>
    )
}