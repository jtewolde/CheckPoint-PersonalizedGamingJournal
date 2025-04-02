
import { Pin, Notebook, Library, ChartColumnIncreasing, Target, Trophy } from 'lucide-react';
import { Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import classes from './Features.module.css';

export const featuresData = [
    {
        icon: <Pin size={50} color='#ffb700' />,
        title: 'Track Your Game Progress',
        description: 'Log milestones, achievements, and story progress, see an overview of your gaming journey.',
    },
    {
        icon: <Notebook size={50} color='#ffb700'/>,
        title: 'Personalized Journal',
        description: 'Write session recaps, strategies, and personal notes to document your gaming journey.',
    },
    {
        icon: <Library size={50} color='#ffb700'/>,
        title: 'Game Library Management',
        description: 'Organize your games into categories like Currently Playing, Backlog, and Completed for easy tracking.',
    },
    {
        icon: <ChartColumnIncreasing size={50} color='#ffb700'/>,
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

    return (
        <Container className={classes.wrapper}>
          
          <Title className={classes.title}>Track your gaming progress with ease!</Title>
    
          <Container size={560} p={0}>
            <Text size="sm" className={classes.description}>
              Stay on top of your game progress, achievements, and goals across multiple titles. 
              With CheckPoint, logging your sessions has never been easier.
            </Text>
          </Container>
    
          <SimpleGrid
            mt={60}
            cols={{ base: 1, sm: 2, md: 2 }}
            spacing={{ base: 'xl', md: 50 }}
            verticalSpacing={{ base: 'xl', md: 50 }}
          >
            {features}
          </SimpleGrid>
        </Container>
      );
  }