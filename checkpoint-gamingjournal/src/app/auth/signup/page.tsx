'use client'

import {Anchor, Button, Checkbox, Paper, PasswordInput, Text, TextInput, Title, Group} from '@mantine/core';
import Router from 'next/router';

import classes from './signUp.module.css';
import { GoogleButton } from '@/app/components/GoogleButton/GoogleButton';
import { TwitterButton } from '@/app/components/TwitterButton/TwitterButton';

export default function signInPage(){
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
                <GoogleButton radius="xl">Google</GoogleButton>
                <TwitterButton radius='xl'>Twitter</TwitterButton>
            </Group>

          <TextInput label="Username" placeholder='Your username' size='md' />
          <TextInput label="Email address" placeholder="hello@gmail.com" size="md" />
          <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" />
          <Button fullWidth mt="xl" size="md">
            Register Account
          </Button>

          <Text ta='center' mt='lg'>
            Already have an account?{' '}
            <Anchor<'a'> size="sm" onClick={() => Router.push('/auth/signin')}>
              Sign in
            </Anchor>
          </Text>
        </Paper>
    </div>
    )
}
