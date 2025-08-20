'use client'

import { Anchor, Button, Paper, PasswordInput, Text, TextInput, Title, Flex, Group, Divider, Modal} from '@mantine/core';
import { redirect, useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import React from 'react';
import { authClient } from '@/lib/auth-client';

import { GoogleButton } from '@/components/GoogleButton/GoogleButton';
import { DiscordButton } from '@/components/DiscordButton/DiscordButton';
import { useDisclosure } from '@mantine/hooks';

import { LogIn, Lock, Mail } from 'lucide-react';

import toast from 'react-hot-toast';

import classes from './signIn.module.css';

export default function signInPage(){

    // State variables for form inputs and tracking errors
    const [email, setEmail] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState("");
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
          localStorage.setItem("UnverifiedEmail", email);
          console.log(ctx.error)
          router.push('/auth/email-verification')
          return;
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

    // Function to search for a user by email and send a reset password link
    const handleForgotPassword = async () => {
      setLoading(true);

      if(!resetEmail) {
        setError("Please enter your email address");
        return;
      }

      const {data, error } = await authClient.forgetPassword({
        email: resetEmail,
        redirectTo: '/auth/reset-password',
        
        fetchOptions: {
          onRequest: () => {
            setLoading(true);
          },
          onResponse: () => {
            setLoading(false);
          },
          onSuccess: () => {
            toast.success("Reset link sent to your email! Please check your inbox!")
            close();
          },
          onError: (ctx) => {
            setModalError(ctx.error.message || "Failed to send reset link");
            toast.error(ctx.error.message);
          }
        }
        
      })
      
    }

    return(
      <div className={classes.wrapper}>
        <Paper className={classes.form} radius={0} p={30}>
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Welcome to CheckPoint! 
          </Title>

          <Text ta='center' c='white' mt='lg'>
            Sign in with 
          </Text>

            <Group grow mb="md" mt="md">
                <GoogleButton radius="xl" onClick={handleGoogleSignIn}>Google</GoogleButton>
                <DiscordButton radius='xl' onClick={handleDiscordSignIn}>Discord </DiscordButton>
            </Group>

            <Divider styles={{label: {color: 'white'}}} label="Or continue with email" labelPosition="center" color='white' my="lg"  />

          <TextInput className={classes.emailInput} label="Email Address" placeholder="Your Email" size="md" leftSection={<Mail size={20} />} required mt="md" mb='md' value={email} onChange={(e) => setEmail(e.currentTarget.value)} error={error} />

          <Group justify='space-between' mb={1}>

            <Text className={classes.passwordLabel} component='label' c='white' htmlFor='password' size='md' fw={600}>
              Password
            </Text>

            <Anchor size='sm' pt={2} onClick={open} fw={500}>
              Forgot your password?
            </Anchor>

            {/* Forgot Password Modal */}
            <Modal opened={opened} onClose={close} centered styles={{content: {backgroundColor: '#0c0d21'}, header: {backgroundColor: '#0c0d21'}, close: {color: 'white'}}}>

              <Group className={classes.modalText} mb={20} ta='center'>
                <Title className={classes.modalTitle} ta="center" c='white'>
                  Forgot your password?
                </Title>

                <Text c='whitesmoke' fz="md" ta="center" mb={10}>
                  Enter your email to get a reset link
                </Text>

              </Group>
              
              <TextInput 
                styles={{
                  input:{
                    backgroundColor: '#232526',
                    color: 'white'
                  },
                  label: {
                    color: 'white'
                  }
                }}
                label="Email address" 
                placeholder="Enter Your Email" 
                leftSection={<Mail size={20} />}
                size="md" 
                required mt="sm" 
                mb='sm' value={resetEmail} 
                onChange={(e) => setResetEmail(e.currentTarget.value)} 
                error={modalError} 
              />

              <Flex justify='center' >
                <Button className={classes.modalButton} variant='filled' color='blue' radius='md' size='md' loading={loading} disabled={!resetEmail}onClick={handleForgotPassword} >
                  Send Reset Link
                </Button>
              </Flex>

            </Modal>

          </Group>

          <PasswordInput className={classes.passwordInput} placeholder="Your Password" id='password' size="md" leftSection={<Lock size={20} />} required value={password} onChange={(e) => setPassword(e.currentTarget.value)} error={error} />

          <Button fullWidth mt="xl" size="md" loading={loading} rightSection={<LogIn size={25} />} onClick={handleEmailLogin}>
            Login
          </Button>

          <Text c='white' ta="center" mt="md">
            Don&apos;t have an account?{' '}
            <Anchor<'a'> href="/auth/signup" fw={700} onClick={() => router.push('/auth/signup')}>
              Register
            </Anchor>

          </Text>

        </Paper>
    </div>
    )
}
