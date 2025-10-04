'use client'

import { Title, Text, List } from "@mantine/core"
import classes from './roadmap.module.css'

export default function RoadmapPage() {

    const roadMapItems = [
        {
            title: "Sorting and Filtering Options",
            description: "Add more sorting and filtering options to the search page, popular games, and trending games pages to help users find games more easily."
        },
        {
            title: 'Photo Gallery',
            description: "Allow users to upload and view screenshots and photos related to their gaming experiences."
        },
        { 
            title: "Achievements/Trophies Tracking System",
            description: "Pull achievements and trophies data from APIs like Playstation, Xbox, Steam to have access to user progress automatically."
        },
        {
            title: "Rich Media Journal Entries",
            description: "Allow users to upload screenshots, short clips, or attach links from Twitch/Youtube to remember moments."
        },
        {
            title: "CheckPoint AI Saved Conversations",
            description: "Save and revisit past conversations with the AI for better context and continuity."
        },
        {
            title: "CheckPoint AI Game Recommendations",
            description: "Provide personalized game recommendations based on user's library."
        }
    ]

    return(
        <main className={classes.roadmap}>
            <Title order={1} c='white' className={classes.title}>Roadmap</Title>.

            <div className={classes.content}>

                <Text fz='md' mb='sm' className={classes.text}>
                    Here you can find our roadmap and upcoming features for CheckPoint. 
                    We are constantly working to improve the app and add new features based on user feedback.
                    If you have any suggestions or ideas, feel free to send us a message via the contact page!
                </Text>

                {roadMapItems.map(item => (
                    <div className={classes.card} key={item.title}>
                        <Title order={3} mb='sm' className={classes.cardTitle}>{item.title}</Title>
                        <Text className={classes.cardDescription}>{item.description}</Text>
                    </div>
                ))}

            </div>

        </main>
    )
}