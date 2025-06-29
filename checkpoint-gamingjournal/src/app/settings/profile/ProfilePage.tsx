'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Text, Title, FileButton, Avatar } from '@mantine/core'

import { FileLock, Upload, CircleCheck } from 'lucide-react';

import { authClient } from '@/lib/auth-client'

import toast from 'react-hot-toast';

import classes from './profile.module.css';

export default function Profile(){

  // State variables for changing username and profile picture
  const router = useRouter();
  const [username, setUserName] = useState('')
  const [oldUserName, setOldUserName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
      } else {
        setOldUserName(data.user.name);
        setProfileImage(data.user.image ?? '')
      }
    };

    checkAuth();
  }, [router]);

  // Function to handle updating the user's username and/or profile
  const handleUpdateName = async () => {
    setLoading(true)

    if(username === ''){
      toast.error("Please enter a username! ")
      setLoading(false)
      return
    }

    const res = await authClient.updateUser({
      name: username
    },{
      onRequest: () => {
        setLoading(true)
      },
      onSuccess: () => {
        setLoading(false)
        toast.success("Username successfully updated!")
      },
      onError: (ctx) => {
        setError(ctx.error.message)
        setLoading(false)
        toast.error(ctx.error.message)
      }
    });
  }

  // Function to handle changing user's avatar
  const handleUpdateAvatar = async () => {
    setLoading(true)

    const res = await authClient.updateUser({
      image: profileImage
    },{
      onRequest: () => {
        setLoading(true)
      },
      onSuccess: () => {
        setLoading(false)
        toast.success("Avatar successfully updated!")
      },
      onError: (ctx) => {
        setError(ctx.error.message)
        setLoading(false)
        toast.error(ctx.error.message)
      }
    });
  }

  return(

    <div className={classes.profileWrapper}>

        <div className={classes.usernameSection} >

          <Title className={classes.title} c='white' fw={450} order={1} >Update Username</Title>

          <Text size='lg' c='white' fw={400}> Current Username:   
            <span className={classes.currentName}> {oldUserName} </span>
          </Text>

          <TextInput 
            className={classes.enterUsername}
            styles={{
              input:{
                backgroundColor: '#232526',
                color: 'white'
              }
            }}
            size='lg' 
            inputSize='md' 
            label='New Username' 
            value={username}
            onChange={(e) => setUserName(e.currentTarget.value)} 
            placeholder='Enter your new username' 
            leftSection={<FileLock size={20} />}
            error={error} 
          />

          <Button 
            color='#2bdd66' 
            rightSection={<CircleCheck size={30} />} 
            size='md' 
            radius='md' 
            variant='filled' 
            loading={loading}
            onClick={handleUpdateName}>
            Confirm Change
          </Button>

        </div>

        <div className={classes.avatarSection} >

          <Title className={classes.avatarTitle} c='white' fw={450} order={1} >Update Avatar</Title>

          <Avatar className={classes.avatar} radius="xl" size={200} src={profileImage} alt={username || "User"} style={{ cursor: "pointer"}} />

          <FileButton onChange={setProfilePicture} accept='image/png,image/jpeg'>
            {(props) => <Button color='#f21616' size='md' radius='md' variant='filled' rightSection={<Upload size={30} />}{...props}>Upload Image</Button>}
          </FileButton>

        </div>

    </div>

  )

}