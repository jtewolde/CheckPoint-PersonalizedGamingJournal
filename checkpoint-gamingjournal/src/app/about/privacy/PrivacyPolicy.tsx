'use client'

import { Title, Text, List } from "@mantine/core"
import classes from './PrivacyPolicy.module.css'

export default function PrivacyPolicyPage() {
    return (
        <main className={classes.main}>
            <Title className={classes.title} order={1} c='white'>Privacy Policy</Title>
        </main>
    )
}
