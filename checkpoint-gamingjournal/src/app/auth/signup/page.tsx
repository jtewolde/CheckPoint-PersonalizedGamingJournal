'use client'

import {Anchor, Button, Overlay, Paper, PasswordInput, Text, TextInput, Title, Group, Divider} from '@mantine/core';
import toast from 'react-hot-toast';

import { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import React from 'react';
import { authClient } from '@/lib/auth-client';

import classes from './signUp.module.css';
import { GoogleButton } from '@/components/GoogleButton/GoogleButton';
import { DiscordButton } from '@/components/DiscordButton/DiscordButton';

export default function signInPage(){

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

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

  const handleClick = async () => {
    setLoading(true);
    const {data, error} = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/auth/signin"
    }, {
      onRequest: () => {
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
        toast.success("Account Created Successfully, A Vertification link has been sent to your email" );
        router.push("/auth/signin")

      },
      onError: () => {
        setLoading(false);
        toast.error("Account Creation Failed, Invalid Password or Email!")
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

        <Paper className={classes.form} radius={0}  withBorder>
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Welcome to CheckPoint! 
          </Title>

          <Text ta='center' mt='lg'>
            Sign up by using
          </Text>

            <Group grow mb="md" mt="md">
                <GoogleButton radius="xl" onClick={handleGoogleSignIn}>Google</GoogleButton>
                <DiscordButton radius="xl" onClick={handleDiscordSignIn}>Discord</DiscordButton>
            </Group>

            <Divider label="Or continue with email" labelPosition="center" my="lg" />

          <TextInput label="Username" placeholder='Your username' size='md' mt='md' value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <TextInput label="Email address" placeholder="hello@gmail.com" size="md" mt="md" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
          <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
          {/* <PasswordInput label="Confirm Password" placeholder="Your password" mt="md" size="md" /> */}
          <Button fullWidth mt="xl" size="md" loading={loading} onClick={handleClick}>
            Register Account
          </Button>

          <Text ta='center' mt='lg'>
            Already have an account?{' '}
            <Anchor<'a'> size="sm" onClick={() => router.push('/auth/signin')} href="/auth/signin" fw={700}>
              Sign in
            </Anchor>
          </Text>
        </Paper>
    </div>
    )
}
