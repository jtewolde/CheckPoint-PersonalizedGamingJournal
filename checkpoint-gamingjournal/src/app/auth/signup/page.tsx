'use client'

import {Anchor, Button, Checkbox, Paper, PasswordInput, Text, TextInput, Title, Group} from '@mantine/core';
import toast, { Toast } from 'react-hot-toast';

import { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import React from 'react';
import { authClient } from '@/lib/auth-client';

import classes from './signUp.module.css';
import { GoogleButton } from '@/components/GoogleButton/GoogleButton';
import { TwitterButton } from '@/components/TwitterButton/TwitterButton';

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
      callbackURL: "/dashboard"
    }, {
      onRequest: () => {
        setLoading(true);
      },
      onSuccess: () => {
        setLoading(false);
        toast.success("Account Created Successfully" );
        router.push("/auth/signin")

      },
      onError: () => {
        setLoading(false);
        toast.error("Account Creation Failed")
      }
    })
  }

  // Function to handle Google sign-in authentication
  const handleGoogleSignIn = async () => {
    const {data, error} = await authClient.signIn.social({
      provider: "google",
    })
  }

    return(
      <div className={classes.wrapper}>
        <Paper className={classes.form} radius={0} p={30}>
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Welcome to CheckPoint! 
          </Title>

          <Text ta='center' mt='lg'>
            Sign up by using
          </Text>

            <Group grow mb="md" mt="md">
                <GoogleButton radius="xl" onClick={handleGoogleSignIn}>Google</GoogleButton>
                <TwitterButton radius='xl'>Twitter</TwitterButton>
            </Group>

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
