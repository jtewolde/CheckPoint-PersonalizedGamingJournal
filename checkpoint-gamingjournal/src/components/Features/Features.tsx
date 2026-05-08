
import { Pin, Notebook, Library, BotMessageSquare, Gamepad2, Smartphone, } from 'lucide-react';
import { SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { Transition } from '@mantine/core';
import { useState, useEffect } from 'react';

import classes from './Features.module.css';

export const featuresData = [
    {
        icon: <Pin size={50} />,
        title: 'Track Your Game Progress',
        description: 'Monitor your overall progress across games, including milestones, achievements, and completion status.',
        iconColor: '#d813d2'
    },
    
    {
        icon: <Notebook size={50} />,
        title: 'Personalized Journal',
        description: 'Write session recaps, strategies, and personal notes to document your gaming journey.',
        iconColor: '#2b5ae7'
    },

    {
        icon: <Library size={50} />,
        title: 'Game Library Management',
        description: 'Organize your games into categories like Currently Playing, Backlog, and Completed for easy tracking.',
        iconColor: '#e31a1a'
    },

    {
        icon: <BotMessageSquare size={50} />,
        title: 'Track Play Sessions',
        description: 'Record each gaming session with playtime, activities, and notes to build a detailed history of your gameplay.',
        iconColor: '#8a1ddd'
    },

    {
        icon: <Gamepad2 size={50} />,
        title: 'Detailed Game Info',
        description: 'Access rich game details including release dates, genres, ratings, screenshots, and more to learn about your favorite titles from IGDB.',
        iconColor: '#23e139'
    },

    {
        icon: <Smartphone size={50}  />,
        title: 'Responsive Design',
        description: 'Enjoy a seamless experience on both desktop and mobile devices, perfect for logging sessions on the go.',
        iconColor: '#e9a41a'
    }
    
]

const Feature = ({ icon, title, description, iconColor }: { icon: React.ReactNode; title: string; description: string; iconColor: string }) => (
    <div className={classes.feature}>
      <ThemeIcon variant='light' color={iconColor} size={80} radius="lg" className={classes.icon}>
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

        <div className={classes.featureWidthSection}>

          <SimpleGrid cols={3} className={classes.featuresGrid}>
            {features}
          </SimpleGrid>

        </div>

      </div>
    );
  }    