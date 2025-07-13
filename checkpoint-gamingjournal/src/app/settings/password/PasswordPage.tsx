'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/context/Authcontext';

import { TextInput, Button, Text, Title, Group } from '@mantine/core';

import { authClient } from '@/lib/auth-client';

import toast from 'react-hot-toast';
import classes from './password.module.css'

export default function PasswordPage(){

    const router = useRouter();

    const [provider, setProvider] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    // Check if the user is authenticated
    useEffect(() => {
    const checkAuth = async () => {
        const { data } = await authClient.getSession();
        if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
        }
    }
    
    checkAuth();
    }, [router]);

    return(
        <div className={classes.passwordContainer} >
            
        </div>
    )

}