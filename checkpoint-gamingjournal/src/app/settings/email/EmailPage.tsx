'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Text, Title } from '@mantine/core'

import { MailPlus } from 'lucide-react';

import { authClient } from '@/lib/auth-client'

import toast from 'react-hot-toast';
import classes from './email.module.css';

export default function Email(){

  // State variables for email page
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        // If the user isn't authenticated, redirect to the sign-in page
        router.push('/auth/signin')
      } else {
        setEmail(data.user.email);
      }
    };

    checkAuth();
  }, [router]);

  // Function to handle form submission for updating user's email
  const handleUpdateEmail = async () => {
    setLoading(true)

    const res = await authClient.changeEmail({
      newEmail: updatedEmail,
      callbackURL: '/dashboard'
    },{
      onRequest: () => {
        setLoading(true)
      },
      onSuccess: () => {
        setLoading(true)
        toast.success("Updated Email Successful!")
      },
      onError: (ctx) => {

          setError(ctx.error?.message || "Invalid Credentials")

          setLoading(false);
          toast.error(ctx.error?.message)
      }
    })
    
  }

  return (

    <div className={classes.emailWrapper}>

      <Title className={classes.title} c='white' order={1} >Email</Title>
      
      <Text size='lg' c='white' fw={400}> Your current email is:  
        
        <span className={classes.currentEmail}> {email} </span>

      </Text>

      <TextInput 
        className={classes.enterEmail}
        styles={{
          input:{
            backgroundColor: '#232526',
            color: 'white'
          }
        }}
        size='lg' 
        inputSize='md' 
        label='New Email' 
        placeholder='Enter your New Email' 
        leftSection={<MailPlus size={20} />}  
        value={updatedEmail}
        onChange={(e) => setUpdatedEmail(e.currentTarget.value)} 
        error={error} 
      />

      <Button className={classes.submitButton} size='md' mt={15} radius='md' variant='filled' color='green' onClick={handleUpdateEmail}>Update Email</Button>

    </div>
  )

}
  
