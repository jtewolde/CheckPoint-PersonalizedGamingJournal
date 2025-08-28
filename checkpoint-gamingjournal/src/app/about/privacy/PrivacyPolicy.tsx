'use client'

import { Title, Text, List } from "@mantine/core"
import classes from './PrivacyPolicy.module.css'

export default function PrivacyPolicyPage() {
    return (
        <main className={classes.main}>
            <Title className={classes.title} order={1} c='white'>CheckPoint Privacy Policy</Title>

            <div className={classes.content}>

                <Text fz='md' mb='lg' className={classes.text}>
                    At CheckPoint, we prioritize your privacy and are committed to protecting your personal information.
                    This Privacy Policy outlines how we collect, use, and safeguard your data. 
                    Also, we inform you about your rights regarding your personal information.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Consent</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    By using our website and services, you consent to the collection, use, storage, and processing of your information as described in this Privacy Policy.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Changes To Policy</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                    By continuing to use our services after any changes, you acknowledge and accept the updated Privacy Policy.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Information We Collect</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    We collect various types of information to provide and improve our services. This includes:
                </Text>

                <List className={classes.list} withPadding spacing='sm'>
                    <List.Item><strong>Account Information - </strong> Such as your email address, password, and profile details when you sign up.</List.Item>
                    <List.Item><strong>Usage Data - </strong>Entries you make in your journal, games that you add to your library, and your interactions with our services.</List.Item>
                    <List.Item><strong>Technical Data - </strong> Information about your device, browser, and IP address.</List.Item>
                </List>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>How We Use Your Information </Title>

                <Text fz='md' mb='md' className={classes.text}>
                    We use the information we collect for various purposes, including:
                </Text>

                <List className={classes.list} withPadding spacing='sm'>
                    <List.Item>To provide and improve the App's functionality.</List.Item>
                    <List.Item>To allow you to track your gaming library and journal entries.</List.Item>
                    <List.Item>To maintain account security and prevent unauthorized access.</List.Item>
                </List>

                <Text fz='md' mb='md' mt='lg' className={classes.text}>
                    We do not sell or share your personal data to third parties or any advertisers.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Data Storage and Security</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    We implement a variety of security measures to maintain the safety of your personal information.
                    Your data is stored on secure servers, and we use encryption and access controls to protect it.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Your Rights</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    You have the right to access, correct, or delete your personal information at any time.
                    If you wish to exercise these rights, please contact us using the information provided below.
                </Text>

                <Title className={classes.subtitle} order={2} mt="lg" mb='sm'>Children's Privacy</Title>

                <Text fz='md' mb='md' className={classes.text}>
                    We are committed to protecting the privacy of children. Our services are not directed to individuals under the age of 13, and we do not knowingly collect personal information from children.
                </Text>

            </div>

        </main>
    )
}
