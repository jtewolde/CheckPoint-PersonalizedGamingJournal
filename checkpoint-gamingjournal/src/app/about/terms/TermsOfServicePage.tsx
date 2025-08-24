'use client'

import { Title, Text } from "@mantine/core"
import classes from './TOS.module.css'

export default function TermsOfServicePage() {
    return (
        <main className={classes.main}>
            <Title className={classes.title} order={1} c='white'>Terms of Service</Title>

            <div className={classes.content}>
                <Text fz='md' mb='lg' className={classes.text}>
                    By accessing and using CheckPoint (the "Website" or "Service"), you agree to comply with and be bound by the following Terms of Service ("Terms"). 
                    If you do not agree, you should discontinue use of the Website immediately.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Purpose of Service</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    CheckPoint is a personalized gaming journal platform designed to help users track their gaming progress, achievements, and goals. 
                    It also offers an AI assistant to provide quick answers and recommendations related to gaming. 
                    The Service is intended solely for personal gaming-related use.
                </Text>

            </div>

        </main>
    )
}