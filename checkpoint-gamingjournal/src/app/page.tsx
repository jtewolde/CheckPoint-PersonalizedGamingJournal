'use client'

import { Button, Container, Text, Title, Transition } from '@mantine/core';
import Image from 'next/image';

import { UserRoundPlus } from 'lucide-react';
import { FeaturesGrid } from '../components/Features/Features';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/Authcontext';

import classes from './page.module.css';

import Questions from '@/components/FrequentQuestions/FrequentQuestions';
import TrendingGamesCarousel from '@/components/TrendingGamesCarousel/TrendingGamesCarousel';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  // Redirect to dashboard if user is autheenticated
  useEffect(() => {
    setMounted(true);

    if (isAuthenticated){
      router.push('/dashboard');
    }

  }, [isAuthenticated, router]);

  // Handle Create Account Button click to go to signup
  const handleClick = () => {
    router.push('/auth/signup');
  }

  return (
    <div className= {classes.hero}>
      
      <div className={classes.backgroundOverlay}>

        <Container size='xl' className={classes.container}>

          <div className={classes.landingPageHeader}>

            <div className={classes.leftSideHeader}>

              <Transition mounted={mounted} transition="fade" duration={800} timingFunction="ease">
                {(styles) => (

                <div className={classes.titleContainer} style={styles}>

                  <Title className={classes.title} style={styles}>
                    CheckPoint
                  </Title>

                  <Text className={classes.subtitle} size="xl" mt="md" style={styles}>
                    Your Personalized Gaming Journal
                  </Text>

                </div>
                  
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

              <div className={classes.buttonContainer}>
                <Button  className={classes.createAccountButton} variant="filled" color='#d4b349ff' size="xl" radius="lg" rightSection={<UserRoundPlus />} onClick={handleClick}>
                  Create an account!
                </Button>
              </div>
              
            </div>

            <div className={classes.rightSideHeader}>
              <TrendingGamesCarousel />
            </div>

          </div>

          <div className={classes.FeatureSection}>
            <FeaturesGrid />
          </div>

          <div className={classes.librarySection}>

            <div className={classes.imageContainer} >

              <Image
                src="/LibraryPage.png"
                alt="Library Page"
                className={classes.image}
                width={650}
                height={560}
              />

              <div className={classes.imageTextContainer} >
                <Text className={classes.libraryImageTitle} size='xl' mt='lg' >
                  Your Game Library Awaits
                </Text>

                <Text className={classes.libraryImageText} size='lg' mt='lg' >
                  Browse and manage your entire game collection effortlessly. Sort, filter, and explore your library with an interface designed around gamers. 
                  Whether you're checking your backlog or searching for something new to play, your library is always organized and easy to navigate.
                </Text>
              </div>

            </div>

          </div>

          <div className={classes.gameDetailsSection}>

            <div className={classes.imageReverseContainer} >

              <Image
                src="/GameDetailsPage.png"
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
                  View detailed information for every game, including descriptions, platforms, screenshots, and similar titles. 
                  Discover new games tailored to your interests, and add them to your library with a single click.
                </Text>
              </div>

            </div>

          </div>

          <div className={classes.journalSection}>

            <div className={classes.imageContainer}>

              <Image
                src="/JournalPage.png"
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
                src="/ChatRoom.png"
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
                  Ask questions, get recommendations, learn strategies, or explore new games with the help of Gemini AI. 
                  Your personal gaming assistant is always ready to help—no matter what you're playing.
                </Text>
              </div>

            </div>

          </div>
          
          <div className={classes.faqSection}>

            <Title className={classes.faqTitle} c='white' size='xl' mt='lg' >
              FAQ:
            </Title>

            <Questions />

          </div>

        </Container>

      </div>

    </div>

  );
}
