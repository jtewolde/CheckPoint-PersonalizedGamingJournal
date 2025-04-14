'use client'

import { Button, Container, Overlay, Text, Title } from '@mantine/core';
import { UserRoundPlus } from 'lucide-react';
import { FeaturesGrid } from '../components/Features/Features';
import { useRouter } from 'next/navigation';
import classes from './page.module.css';


export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/auth/signup');
  }


  return (
    <div className= {classes.hero}>
      <Overlay
        gradient="linear-gradient(180deg, #1f1c2c 30%, #928dab 90%)"
        opacity={0.80}
        zIndex={0}
      />

      <Container size={'md'} className={classes.container}>

         <Title className={classes.title}> Your Personal Gaming Journal </Title>

         <Text className={classes.description} size="xl" mt="xl">
          Keep a clear record of your progress across multiple games. Log your achievements,  
          quests, and key moments so you never lose track of where you left off. Whether you're  
          juggling RPGs, tackling competitive matches, or diving into open worlds, Checkpoint  
          ensures you always pick up right where you left off.
        </Text>

        <Button variant="filled" color='#2463C4' size="xl" radius="xl" className={classes.control} rightSection={<UserRoundPlus />} onClick={handleClick}>

          Create an account to get started!

        </Button>

        <div className={classes.FeatureSection}>
          <FeaturesGrid />
        </div>

      </Container>
      
    </div>

  );
}
