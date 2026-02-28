'use client'

import { Title, Text, List } from "@mantine/core"
import classes from './roadmap.module.css'

export default function RoadmapPage() {

    const roadMapItems = [
        {
            title: "Add CompletationDate Field to completed games in library",
            description: "Allow users to add a completion date to their completed games in the library, so they can track when they finished a game."
        },
        {
            title: "Calendar Integration for Journal Entries",
            description: "Create a calendar view to better visualize journal entries and gaming sessions."
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