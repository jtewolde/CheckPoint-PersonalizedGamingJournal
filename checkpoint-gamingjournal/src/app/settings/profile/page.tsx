
'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Text, Title, FileButton, Avatar } from '@mantine/core'

import { MailPlus } from 'lucide-react';

import { authClient } from '@/lib/auth-client'

import toast from 'react-hot-toast';

import classes from './profile.module.css';

export default function Profile(){

  // State variables for changing username and profile picture
  const router = useRouter();
  const [username, setUserName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

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

        <Text size='lg' c='white' fw={600}> Current Username:   
          
          <span className={classes.currentName}> {username} </span>

        </Text>
        
      </div>

    </div>

      

  )

}