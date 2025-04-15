
import { Pin, Notebook, Library, ChartColumnIncreasing, Target, Trophy } from 'lucide-react';
import { Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import { Transition } from '@mantine/core';
import { useState, useEffect } from 'react';

import classes from './Features.module.css';

export const featuresData = [
    {
        icon: <Pin size={50} color='#66c7f4' />,
        title: 'Track Your Game Progress',
        description: 'Log milestones, achievements, and story progress, see an overview of your gaming journey.',
    },
    {
        icon: <Notebook size={50} color='#66c7f4'/>,
        title: 'Personalized Journal',
        description: 'Write session recaps, strategies, and personal notes to document your gaming journey.',
    },
    {
        icon: <Library size={50} color='#66c7f4'/>,
        title: 'Game Library Management',
        description: 'Organize your games into categories like Currently Playing, Backlog, and Completed for easy tracking.',
    },
    {
        icon: <ChartColumnIncreasing size={50} color='#66c7f4'/>,
        title: 'Stats and Insights',
        description: 'Analyze playtime, favorite genres, and gaming trends to better understand your habits.',
    },
]

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className={classes.feature}>
      <ThemeIcon variant="light" size={40} radius="md" className={classes.icon}>
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
      <Container className={classes.wrapper}>
        <Transition mounted={mounted} transition="fade" duration={500} timingFunction="ease">
          {(styles) => (
            <Title className={classes.title} style={styles}>
              Track your gaming progress with ease!
            </Title>
          )}
        </Transition>
    
        <Transition mounted={mounted} transition="fade" duration={600} timingFunction="ease">
          {(styles) => (
            <Container size={560} p={0} style={styles}>
              <Text size="sm" className={classes.description}>
                Stay on top of your game progress, achievements, and goals across multiple titles. 
                With CheckPoint, logging your sessions has never been easier.
              </Text>
            </Container>
          )}
        </Transition>
    
        <Transition mounted={mounted} transition="fade" duration={700} timingFunction="ease">
          {(styles) => (
            <SimpleGrid
              style={styles}
              mt={60}
              cols={{ base: 1, sm: 2, md: 2 }}
              spacing={{ base: 'xl', md: 50 }}
              verticalSpacing={{ base: 'xl', md: 50 }}
            >
              {features}
            </SimpleGrid>
          )}
        </Transition>
      </Container>
    );
  }    