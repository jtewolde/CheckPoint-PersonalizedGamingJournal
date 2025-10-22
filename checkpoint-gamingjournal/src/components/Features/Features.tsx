
import { Pin, Notebook, Library, BotMessageSquare, Gamepad2, Smartphone} from 'lucide-react';
import { Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import { Transition } from '@mantine/core';
import { useState, useEffect } from 'react';

import classes from './Features.module.css';

export const featuresData = [
    {
        icon: <Pin size={50} color='white' />,
        title: 'Track Your Game Progress',
        description: 'Log milestones, achievements, and story progress, see an overview of your gaming journey.',
        iconColor: 'pink'
    },
    
    {
        icon: <Notebook size={50} color='white'/>,
        title: 'Personalized Journal',
        description: 'Write session recaps, strategies, and personal notes to document your gaming journey.',
        iconColor: 'blue'
    },

    {
        icon: <Library size={50} color='white'/>,
        title: 'Game Library Management',
        description: 'Organize your games into categories like Currently Playing, Backlog, and Completed for easy tracking.',
        iconColor: 'red'
    },

    {
        icon: <BotMessageSquare size={50} color='white'/>,
        title: 'Gemini AI Powered Chat',
        description: 'Be able to chat with the Gemini AI about your gaming progress, ask questions, and get game recommendations."',
        iconColor: 'purple'
    },

    {
        icon: <Gamepad2 size={50} color='white' />,
        title: 'Detailed Game Info',
        description: 'Access rich game details including release dates, genres, ratings, screenshots, and more to learn about your favorite titles from IGDB.',
        iconColor: 'green'
    },

    {
        icon: <Smartphone size={50} color='white' />,
        title: 'Responsive Design',
        description: 'Enjoy a seamless experience on both desktop and mobile devices, perfect for logging sessions on the go.',
        iconColor: 'yellow'
    }
    
]

const Feature = ({ icon, title, description, iconColor }: { icon: React.ReactNode; title: string; description: string; iconColor: string }) => (
    <div className={classes.feature}>
      <ThemeIcon variant='filled' color={iconColor} size={80} radius="lg" className={classes.icon}>
        {icon}
      </ThemeIcon>
      <Text className={classes.featureTitle}>{title}</Text>
      <Text size="sm" className={classes.featureDescription}>
        {description}
      </Text>
    </div>
)

export function FeaturesGrid() {

    const features = featuresData.map((feature, index) => <Feature {...feature} key={index} />);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setMounted(true), 300); // Optional delay
      return () => clearTimeout(timer);
    }, []);


    return (
      <div className={classes.wrapper}>

        <Transition mounted={mounted} transition="fade" duration={500} timingFunction="ease">
          {(styles) => (
            <Title className={classes.title} style={styles}>
              Track your gaming progress with ease!
            </Title>
          )}
        </Transition>
    
        <Transition mounted={mounted} transition="fade" duration={600} timingFunction="ease">
          {(styles) => (
            <Container fluid p={0} style={styles}>
              <Text size="sm" className={classes.description}>
                Stay on top of your game progress, achievements, and goals across multiple titles. 
                With CheckPoint, logging your sessions has never been easier.
              </Text>
            </Container>
          )}
        </Transition>

        <div className={classes.featureWidthSection}>

          <SimpleGrid cols={3} className={classes.featuresGrid}>
            {features}
          </SimpleGrid>

        </div>

      </div>
    );
  }    