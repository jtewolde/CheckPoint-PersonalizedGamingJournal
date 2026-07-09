'use client'

import { useState, useRef } from "react"
import { TextInput, Button } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"

import classes from './JournalPageSearch.module.css';

// Define the props for the JournalPageSearch component 
// Props include optional placeholder text, size, radius, className, 
// autoNavigate flag, and initialQuery for pre-filling the search input.
type JournalPageSearchProps = {
    placeHolder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;

    // lets parent control filtering (recommended)
    value?: string;
    onChange?: (value: string) => void;

    initialQuery?: string; 
};

export default function JournalPageSearch({
    placeHolder = "Search for entries on this page...",
    size = "lg",
    radius = 'md',
    className,
    value,
    onChange,
    initialQuery = '',
}: JournalPageSearchProps) {

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
                variant="filled"
                leftSection={<IconSearch size={25} color="white"/>}
                styles={{
                    input:{
                        backgroundColor: '#1b1b1b',
                        color: 'white',
                        border: '1px solid #2a2828'
                    }
                }}
            />
        </div>
    )
}