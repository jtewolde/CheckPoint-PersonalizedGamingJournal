'use client'

import { Title, Text, List } from "@mantine/core"
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

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>User Responsibilities</Title>

                <List className={classes.list} withPadding spacing='sm'>
                    <List.Item>You are responsible for maintaining the confidentiality of your account and password.</List.Item>
                    <List.Item>You agree to use the service for lawful, personal purposes only.</List.Item>
                    <List.Item>You must not attempt to misuse, reverse engineer, or disrupt the service in any way. </List.Item>
                </List>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>AI Assistant</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    CheckPoint offers an Gemini AI-powered feature to provide gaming tips, recommendations, and answers to questions. 
                    While helpful, the AI may generate inaccurate or incomplete information. 
                    You agree to use this feature responsibly and acknowledge that CheckPoint is not liable for decisions made based on AI responses.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Data Privacy</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    CheckPoint is committed to protecting your privacy. We do not sell or share your personal information with third parties without your consent. 
                    Please review our Privacy Policy for more details on how we collect, use, and protect your data.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Termination of Accounts</Title>

                <List className={classes.list} withPadding spacing='sm'>
                    <List.Item>We reserve the right to delete any account that violates these Terms.</List.Item>
                    <List.Item>Inactive accounts can be removed after long periods of non-use</List.Item>
                    <List.Item>You can request the deletion of your account and the associated data at any time in your account settings. </List.Item>
                </List>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Technical Issues</Title>
                    
                <Text fz='md' mb='md' className={classes.text}>
                    CheckPoint is committed to protecting your privacy. We do not sell or share your personal information with third parties without your consent. 
                    Please review our Privacy Policy for more details on how we collect, use, and protect your data.
                </Text>

            </div>

        </main>
    )
}