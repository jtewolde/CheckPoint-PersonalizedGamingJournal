'use client'

import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/context/Authcontext';

import { TextInput, Button, Text, Title, Modal, Group, Checkbox } from '@mantine/core'

import { MailPlus, UserX, FolderPen, CircleAlert } from 'lucide-react';

import { authClient } from '@/lib/auth-client'

import toast from 'react-hot-toast';
import classes from './email.module.css';

export default function Email(){

  // State variables for email page
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  const [opened, {open, close }] = useDisclosure(false);

  const {isAuthenticated, setIsAuthenticated } = useAuth();

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
        setLoading(false)
        toast.success("Updated Email Successful!")
      },
      onError: (ctx) => {
          setError(ctx.error?.message || "Invalid Credentials")
          setLoading(false);
          toast.error(ctx.error?.message)
      }
    })
    
  }
  
  // Function to handle deleting a user's account permanently
  const handleDeleteUser = async () => {
    if(!checked){
      setError("Your must confirm before deleting your account")
      toast.error("You must confirm before deleting your account!")
      return
    }

    setLoading(true);
    setError('');

    // Call api route to delete user, no need for body
    try{
      const res = await fetch('/api/user/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json(); // Retrieve data and make it a json object

      // If an error occurs, set the error variable to it and display toast noti of error to user
      if(!res.ok){
        setError(data.error || 'Failed to delete user');
        toast.error(data.error || 'Failed to delete user!');
        setLoading(false);
        return;
      }

      // Otherwise, noti the user of the deletion of the account and their data
      toast.success('Account deleted successfully!')
      setLoading(true);

      await authClient.signOut(); // Sign out of account
      setIsAuthenticated(false) // Reset context state for header to load guest header
      router.push('/')

    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      toast.error(err.message || 'Failed to delete account');
      setLoading(false);
    }
  }

  return (

    <div className={classes.container} >

      <div className={classes.emailWrapper}>

        <Title className={classes.title} c='white' fw={450} order={1} >Email</Title>
        
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

        <Button className={classes.submitButton} color='green' size='md' rightSection={<FolderPen size={20} />} mt={15} radius='lg' variant='filled'  onClick={handleUpdateEmail}>Update Email</Button>

      </div>

      <div className={classes.deleteUserWrapper}>

        <Title className={classes.title} c='#f21616' fw={490} order={1} >Delete Account</Title>

        <Text className={classes.deleteText} size='lg' c='white' fw={400}>Permanently delete your account and associated data</Text>

        <Modal size='lg' opened={opened} onClose={close} centered styles={{content: {backgroundColor: '#232526'}, header: {backgroundColor: '#232526'}}}>

          <Group className={classes.modalText} mb={20} ta='center'>

            <Title className={classes.title} ta="center" order={3}>
              <CircleAlert color='red' size={30} /> Warning! 
            </Title>

            <Text c="white" fz="md" ta="center" mb={10}>
              Your account and all data associated with your account will be deleted from the database.
              This action cannot be reversed.
            </Text>

            <Checkbox radius='md' color='blue' size='md' label='I understand that I am permanently deleting my account.' checked={checked} error={error} onChange={(event) => setChecked(event.currentTarget.checked)} />
            
            <Button className={classes.deleteButton} color='#d8070b' size='md' mt={15} radius='lg' variant='filled' rightSection={<UserX size={30}/>} disabled={!checked} loading={loading} onClick={handleDeleteUser}>Delete Account</Button>

          </Group>
                        
        </Modal>

        <Button className={classes.deleteButton} size='md' mt={15} radius='lg' variant='filled' color='#d8070b' rightSection={<UserX size={30}/>}  onClick={open} >Delete Account</Button>

      </div>

    </div>
  )

}
  
