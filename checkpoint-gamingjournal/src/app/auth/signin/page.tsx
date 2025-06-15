'use client'

import { Anchor, Button, Paper, PasswordInput, Text, TextInput, Title, Flex, Group, Divider, Modal} from '@mantine/core';
import { redirect, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useState, useEffect } from 'react';
import React from 'react';
import { authClient } from '@/lib/auth-client';

import CheckPointLogo from '../../../../public/CheckPointLogo.png';
import classes from './signIn.module.css';
import { GoogleButton } from '@/components/GoogleButton/GoogleButton';
import { DiscordButton } from '@/components/DiscordButton/DiscordButton';
import { useDisclosure } from '@mantine/hooks';

export default function signInPage(){

    // State variables for form inputs and tracking errors
    const [email, setEmail] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [opened, { open, close}] = useDisclosure(false);

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

    // Function to handle form submission for email authentication
    const handleEmailLogin = async ()=> {
      setLoading(true); // Set loading state to true 

      const res = await authClient.signIn.email({
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
        onError: (ctx) => {

          setError(ctx.error?.message || "Invalid Credentials")

          // If the user's email isn't vertified, an 403 error will occur
          if(ctx.error.status === 403){
            console.log(ctx.error)
            toast.error("Please verify your email address! ")
          }

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

          <TextInput label="Email address" placeholder="Your email" size="md" required mt="md" mb='md' value={email} onChange={(e) => setEmail(e.currentTarget.value)} error={error} />

          <Group justify='space-between' mb={1}>

            <Text component='label' htmlFor='password' size='md' fw={500}>
              Password
            </Text>

            <Anchor size='sm' pt={2} onClick={open} >
              Forgot your password?
            </Anchor>

            {/* Forgot Password Modal */}
            <Modal opened={opened} onClose={close} centered>

              <Group className={classes.modalText} mb={20} ta='center'>
                <Title className={classes.modalTitle} ta="center">
                  Forgot your password?
                </Title>

                <Text c="dimmed" fz="sm" ta="center" mb={10}>
                  Enter your email to get a reset link
                </Text>
              </Group>
              
              <TextInput label="Email address" placeholder="Enter Your email" size="md" required mt="sm" mb='sm' value={email} onChange={(e) => setEmail(e.currentTarget.value)} error={error} />

              <Flex justify='center' >
                <Button className={classes.modalButton} variant='filled' color='blue' radius='md' size='md' >
                  Reset Password
                </Button>
              </Flex>

            </Modal>

          </Group>

          <PasswordInput placeholder="Your Password" id='password' size="md" required value={password} onChange={(e) => setPassword(e.currentTarget.value)} error={error} />

          <Button fullWidth mt="xl" size="md" loading={loading} onClick={handleEmailLogin}>
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
