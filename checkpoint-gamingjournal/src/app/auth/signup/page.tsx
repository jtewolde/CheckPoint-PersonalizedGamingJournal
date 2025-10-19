'use client'

import { Anchor, Button, Paper, PasswordInput, Text, TextInput, Title, Group, Divider, Overlay} from '@mantine/core';
import toast from 'react-hot-toast';

import { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import React from 'react';
import { authClient } from '@/lib/auth-client';

import classes from './signUp.module.css';
import { UserRoundPlus } from 'lucide-react';
import { GoogleButton } from '@/components/GoogleButton/GoogleButton';
import { DiscordButton } from '@/components/DiscordButton/DiscordButton';

import { Lock, Mail, CircleUser } from 'lucide-react';

export default function signInPage(){

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("");

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

  // Function to handle email sign-up authentication
  const handleEmailSignUp = async () => {
    setLoading(true);
    
    // Validate password and confirm password 
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

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
      onError: (ctx) => {
        setError(ctx.error?.message)
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

        <Paper className={classes.form} radius={0}  >
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Welcome to CheckPoint! 
          </Title>

          <Text ta='center' c='white' mt='lg' size='lg'>
            Register by using
          </Text>

          <Group grow mb="md" mt="md">
              <GoogleButton radius="xl" onClick={handleGoogleSignIn}>Google</GoogleButton>
              <DiscordButton radius="xl" onClick={handleDiscordSignIn}>Discord</DiscordButton>
          </Group>

          <Divider styles={{label: {color: 'white'}}} label="Or continue with email" labelPosition="center" color='white' my="lg"  />
          
          <TextInput className={classes.usernameInput} label="Username" placeholder='Jin_Sakai' required size='md' leftSection={<CircleUser size={20} />} mt='md' value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <TextInput className={classes.emailInput} label="Email Address" placeholder="JSakai@gmail.com" required size="md" leftSection={<Mail size={20} />} mt="md" value={email} onChange={(e) => setEmail(e.currentTarget.value)} error={error}/>
          <PasswordInput className={classes.passwordInput} label="Password" placeholder="Your Password" required leftSection={<Lock size={20} />} mt="md" size="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} error={passwordError}/>
          <PasswordInput className={classes.passwordInput} label="Confirm Password" placeholder="Confim Password" required leftSection={<Lock size={20} />} mt="md" size="md" value={confirmPassword} onChange={(e) => setConfirmPassword(e.currentTarget.value)} error={passwordError}/>
          <Button fullWidth mt="xl" size="md" loading={loading} rightSection={<UserRoundPlus size={25} />} onClick={handleEmailSignUp}>
            Register Account
          </Button>

          <Text ta='center' mt='lg' c='white'>
            Already have an account?{' '}
            <Anchor<'a'> size="sm" onClick={() => router.push('/auth/signin')} href="/auth/signin" fw={700}>
              Sign in
            </Anchor>
          </Text>
        </Paper>
    </div>
    )
}
