'use client'

import {Anchor, Button, Checkbox, Paper, PasswordInput, Text, TextInput, Title, Group} from '@mantine/core';
import Router from 'next/router';

import CheckPointLogo from '../../../../public/CheckPointLogo.png';
import classes from './signIn.module.css';
import { GoogleButton } from '@/app/components/GoogleButton/GoogleButton';
import { url } from 'inspector';

export default function signInPage(){
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
                <GoogleButton radius="xl">Google</GoogleButton>
            </Group>

          <TextInput label="Email address" placeholder="hello@gmail.com" size="md" />
          <PasswordInput label="Password" placeholder="Your password" mt="md" size="md" />
          <Checkbox label="Keep me logged in" mt="xl" size="md" />
          <Button fullWidth mt="xl" size="md">
            Login
          </Button>

          <Text ta="center" mt="md">
            Don&apos;t have an account?{' '}
            <Anchor<'a'> href="/auth/signup" fw={700} onClick={() => Router.push('/auth/signup')}>
              Register
            </Anchor>
          </Text>
        </Paper>
    </div>
    )
}
