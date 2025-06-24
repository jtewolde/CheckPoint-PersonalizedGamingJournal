
'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Text, Title, FileButton, Avatar } from '@mantine/core'

import { FileLock } from 'lucide-react';

import { authClient } from '@/lib/auth-client'

import toast from 'react-hot-toast';

import classes from './profile.module.css';

export default function Profile(){

  // State variables for changing username and profile picture
  const router = useRouter();
  const [username, setUserName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [error, setError] = useState('')

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
      } else {
        setUserName(data.user.name);
        setProfileImage(data.user.image ?? '')
      }
    };

    checkAuth();
  }, [router]);

  // Function to handle updating the user's username and/or profile

  return(

    <div className={classes.profileWrapper}>

      <Title className={classes.title} c='white' order={1} >Update Profile </Title>

      <div className={classes.container}>

        <div className={classes.avatarSection} >

          <Avatar className={classes.avatar} radius="xl" size={300} src={profileImage} alt={username || "User"} style={{ cursor: "pointer"}} />

          <FileButton onChange={setProfilePicture} accept='image/png,image/jpeg'>
            {(props) => <Button color='red' radius='md' variant='filled' {...props}>Upload Image</Button>}
          </FileButton>

        </div>

        <div className={classes.usernameSection} >

          <Text size='lg' c='white' fw={400}> Current Username:   
            <span className={classes.currentName}> {username} </span>
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
            placeholder='Enter your new username' 
            leftSection={<FileLock size={20} />}
            error={error} 
          />

          <Button color='#280582' size='md' radius='md' variant='filled' >Confirm Change</Button>

        </div>
        
      </div>

    </div>

  )

}