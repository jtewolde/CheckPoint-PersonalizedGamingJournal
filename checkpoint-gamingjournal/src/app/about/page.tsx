'use client'

import { Title, Text, List } from "@mantine/core"
import classes from './about.module.css'

export default function AboutPage() {
    return (
        <main className={classes.main}>
            <Title className={classes.title} order={1} c='white'>About CheckPoint</Title>

            <div className={classes.content}>
                <Text fz='md' mb='md' className={classes.text}>
                    CheckPoint is a web application designed for gamers to track their progress in the games they are playing and plan to play in the future. 
                    It helps users log their gaming sessions, create journal entries for games they play, and visualize their progress over time. 
                    With CheckPoint, you'll never forget where you left off in a game!
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Our Mission</Title>

                <Text fz="md" className={classes.text}>
                    The purpose of creating CheckPoint is to solve a problem many gamers face: 
                    forgetting where they left off in a game, losing track of achievements, 
                    or feeling overwhelmed by a growing backlog. 
                    CheckPoint helps gamers stay organized, motivated, and reflective 
                    by providing a personal space to log progress, record achievements, 
                    and plan their gaming journey with clarity.
                </Text>

                <Title className={classes.subtitle} order={2} mt='lg' mb='sm'>Features</Title>

                <List className={classes.list} withPadding spacing='sm'>
                    <List.Item>Search and find games with ease using our search feature powered by IGDB</List.Item>
                    <List.Item>Log journal entries for each gaming session to track your progress</List.Item>
                    <List.Item>Organize your gaming library/backlog effectively with tags and filters</List.Item>
                    <List.Item>Utilize our CheckPoint AI Chatbot to quickly ask questions, get game recommendations, and more!</List.Item>
                </List>

                <Title className={classes.subtitle} order={2} mt='lg' mb='sm'>About the Developer</Title>

                <Text fz='md' className={classes.text} mt='sm'>
                    CheckPoint is a passion project built by Joseph Tewolde, combining a love 
                    for gaming with modern web development technologies like Next.js and Mantine UI.
                </Text>

            </div>
        </main>
    )
}