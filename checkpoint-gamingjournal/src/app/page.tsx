'use client'

import { Button, Container, Overlay, Text, Title, SimpleGrid } from '@mantine/core';
import { Transition } from '@mantine/core';

import { UserRoundPlus } from 'lucide-react';
import { FeaturesGrid } from '../components/Features/Features';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import classes from './page.module.css';
import { useAuth } from '@/context/Authcontext';


export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);

    if (isAuthenticated){
      router.push('/dashboard');
    }

  }, [isAuthenticated, router]);


  const handleClick = () => {
    router.push('/auth/signup');
  }


  return (
    <div className= {classes.hero}>
      <Overlay
        gradient="linear-gradient(180deg, #1f1c2c 30%,rgb(47, 45, 58) 90%)"
        opacity={0.80}
        zIndex={0}
      />

      <Container size={'md'} className={classes.container}>

        <Transition mounted={mounted} transition="fade" duration={800} timingFunction="ease">
          {(styles) => (
            <Title className={classes.title} style={styles}>
              Your Personal Gaming Journal
            </Title>
          )}
        </Transition>

        <Transition mounted={mounted} transition="fade" duration={1000} timingFunction="ease">
          {(styles) => (
            <Text className={classes.description} size="xl" mt="xl" style={styles}>
              Keep a clear record of your progress across multiple games. Log your achievements,  
              quests, and key moments so you never lose track of where you left off. Whether you're  
              juggling RPGs, tackling competitive matches, or diving into open worlds, Checkpoint  
              ensures you always pick up right where you left off.
            </Text>
          )}
        </Transition>


        <Button variant="filled" color='#2463C4' size="lg" radius="xl" className={classes.control} rightSection={<UserRoundPlus />} onClick={handleClick}>
          Create an account to join CheckPoint!
        </Button>

        <div className={classes.FeatureSection}>
          <FeaturesGrid />
        </div>
            

      </Container>
      
    </div>

  );
}
