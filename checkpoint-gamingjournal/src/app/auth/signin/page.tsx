'use client'

import { Anchor, Button, Checkbox, Paper, PasswordInput, Text, TextInput, Title, Group, Divider} from '@mantine/core';
import { redirect, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useState, useEffect } from 'react';
import React from 'react';
import { authClient } from '@/lib/auth-client';

import CheckPointLogo from '../../../../public/CheckPointLogo.png';
import classes from './signIn.module.css';
import { GoogleButton } from '@/components/GoogleButton/GoogleButton';
import { DiscordButton } from '@/components/DiscordButton/DiscordButton';

export default function signInPage(){

    // State variables for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter(); // Initialize router fo navigation

    // Check if the user is authenticated
    useEffect(() => {
      const checkAuth = async () => {
        const { data } = await authClient.getSession();
        if (data?.user) {
          // If the user is authenticated, redirect to the dashboard
          return redirect("/dashboard")
        }
      };
  
      checkAuth();
    }, [router]);

    // Function to handle form submission
    const handleClick = async ()=> {
      setLoading(true); // Set loading state to true 

      const {data, error} = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/dashboard'
      },{
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success("Login In Successful!" );
  
        },
        onError: () => {
          setLoading(false);
          toast.error("Login Failed, Invalid Email or Password ")
        }
      })

      }

      // Function to handle Google sign-in authentication
      const handleGoogleSignIn = async () => {
        const {data, error} = await authClient.signIn.social({
          provider: "google",
          callbackURL: "/dashboard"
        })
        if (error) {
          toast.error("Google Sign-in Failed")
        } else {
          toast.success("Google Sign-in Successful")
        }
      }

      // Function to handle Discord sign-in authentication
      const handleDiscordSignIn = async () => {
        const {data, error} = await authClient.signIn.social({
          provider: "discord",
          callbackURL:"/dashboard"
        })
        if (error) {
          toast.error("Discord Sign-in Failed")
        } else {
          toast.success("Discord Sign-in Successful")
        }
      }

    return(
      <div className={classes.wrapper}>
        <Paper className={classes.form} radius={0} p={30}>
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Welcome to CheckPoint! 
          </Title>

          <Text ta='center' mt='lg'>
            Sign in with 
          </Text>

            <Group grow mb="md" mt="md">
                <GoogleButton radius="xl" onClick={handleGoogleSignIn}>Google</GoogleButton>
                <DiscordButton radius='xl' onClick={handleDiscordSignIn}>Discord </DiscordButton>
            </Group>

            <Divider label="Or continue with email" labelPosition="center" my="lg" />

          <TextInput label="Email address" placeholder="Your email" size="md" required mt="md" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
          <PasswordInput label="Password" placeholder="Your password" size="md" required mt="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
          <Checkbox label="Keep me logged in" mt="xl" size="md" />
          <Button fullWidth mt="xl" size="md" loading={loading} onClick={handleClick}>
            Login
          </Button>

          <Text ta="center" mt="md">
            Don&apos;t have an account?{' '}
            <Anchor<'a'> href="/auth/signup" fw={700} onClick={() => router.push('/auth/signup')}>
              Register
            </Anchor>
          </Text>
        </Paper>
    </div>
    )
}
