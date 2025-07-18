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

import LibraryPage from '../../public/Library.png';
import GameDetailsPage from '../../public//GameDetails.png'
import ChatroomPage from '../../public/ChatRoom.png';
import JournalPage from '../../public/JournalPage.png';

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
        gradient="linear-gradient(180deg, #1f1c2c 10%,rgb(47, 45, 58) 20%)"
        opacity={0.10}
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


        <Button variant="filled" color='#5474b4' size="xl" radius="xl" className={classes.control} rightSection={<UserRoundPlus />} onClick={handleClick}>
          Create an account now!
        </Button>

        <div className={classes.FeatureSection}>
          <FeaturesGrid />
        </div>

        <div className={classes.librarySection}>

          <div className={classes.imageContainer} >

            <Image
              src={LibraryPage}
              alt="Library Page"
              className={classes.image}
              width={650}
              height={500}
            />

            <div className={classes.imageTextContainer} >
              <Text className={classes.libraryImageTitle} size='xl' mt='lg' >
                Your Game Library Awaits
              </Text>

              <Text className={classes.libraryImageText} size='lg' mt='lg' >
                Explore your game library with ease. Our intuitive interface allows you to browse,
                filter, and manage your games effortlessly. Whether you're looking for a specific title
                or just want to see what you have, Checkpoint makes it simple.
              </Text>
            </div>

          </div>

        </div>

        <div className={classes.gameDetailsSection}>

          <div className={classes.imageReverseContainer} >

            <Image
              src={GameDetailsPage}
              alt="Game Details Page"
              className={classes.image}
              width={650}
              height={500}
              unoptimized
            />

            <div className={classes.imageTextContainer} >

              <Text className={classes.gameDetailsTitle} size='xl' mt='lg' >
                Dive into Game Details
              </Text>

              <Text className={classes.gameDetailsText} size='lg' mt='lg' >
                Get comprehensive details about each game in your library and searching for new ones.
                View game descriptions, cover images, platforms, and screenshots that the game is available on, and more.
                See games that are similar to the one you are viewing, so you can discover new titles that match your interests.
                Add games to your library with just a click, and start tracking your progress right away.
              </Text>
            </div>

          </div>

        </div>

        <div className={classes.journalSection}>

          <div className={classes.imageContainer}>

            <Image
              src={JournalPage}
              alt='Journal Page'
              className={classes.image}
              width={800}
              height={600}
              unoptimized
            />

            <div className={classes.imageTextContainer}>

              <Text className={classes.chatRoomTitle} size='xl' mt='lg' >
                Your Personal Gaming Journal
              </Text>

              <Text className={classes.chatRoomText} size='lg' mt='lg' >
                Keep track of your gaming journey with our journal entries feature.
                Write about your gaming experiences, document your achievements, and reflect on your
                progress. Whether it's a memorable quest, a tough boss fight, or a new strategy you
                discovered, your journal is the perfect place to capture it all.
              </Text>

            </div>

          </div>

        </div>

        <div className={classes.chatRoomSection}>

          <div className={classes.imageReverseContainer} >

            <Image
              src={ChatroomPage}
              alt="Chatroom Page"
              className={classes.image}
              width={800}
              height={600}
              unoptimized
            />

            <div className={classes.imageTextContainer} >
              <Text className={classes.chatRoomTitle} size='xl' mt='lg' >
                Chat with Gemini AI
              </Text>

              <Text className={classes.chatRoomText} size='lg' mt='lg' >
                Get instant answers to your gaming questions. Whether you need help with a specific game,
                want recommendations, or just want to chat about the latest in gaming, Gemini AI is here
                to assist you.
              </Text>
            </div>

          </div>

        </div>
        

      </Container>

    </div>

  );
}
