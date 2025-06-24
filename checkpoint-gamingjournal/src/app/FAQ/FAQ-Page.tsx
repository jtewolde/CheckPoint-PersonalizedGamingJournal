'use client'

import { Accordion, Container, Title, Overlay } from '@mantine/core';
import classes from './FAQ.module.css'

// Data that has the frequently asked questions and answers to use in the FAQ UI
const frequentQuestions = [
    {
        question: 'What is CheckPoint?',
        answer: "CheckPoint is a web app built for gamers who want to stay organized, motivated, and reflective throughout their gaming journey. It combines journal-style logging with progress tracking, allowing users to capture what they accomplished during each session, set goals for future play, and visualize their backlog and completed games—all in one place.."
    },
    {
        question: "How is CheckPoint different from other game tracking/backlog apps?",
        answer: "Most game tracking apps simply let you mark games as “played” or “completed.” CheckPoint goes deeper. It's designed for personal growth, memory, and storytelling. You can write journal entries after every session, set custom milestones, revisit past logs, and get a meaningful timeline of your gaming experiences. It’s like a fitness tracker, but for your passion for gaming."
    },
    {
        question: "Can I track any game?",
        answer: "Yes! CheckPoint works with any game across all platforms—PC, console, or mobile. If you can play it, you can track it."
    },
    {
        question: "Do I need an account to use CheckPoint?",
        answer: "Yes. Creating an account gives you access to your personal dashboard, saves all your progress to the cloud, and ensures you never lose your journal entries or settings—even if you switch devices."
    },
    {
        question: "Is CheckPoint free to use?",
        answer: "Yes, CheckPoint is completely free to use with all core features available upon signing up."
    },
    {
        question: "Can I use CheckPoint on mobile devices?",
        answer: "Yes! Checkpoint was built to be fully scalable for desktop and mobile devices!"
    }
]

export default function FAQ() {

    const items = frequentQuestions.map((item) => (
        <Accordion.Item key={item.question} value={item.question}>
            <Accordion.Control>{item.question}</Accordion.Control>
            <Accordion.Panel>{item.answer}</Accordion.Panel>
        </Accordion.Item>
    ));

    return(

        <div className={classes.background}>

            <Overlay
                gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgb(112, 112, 112) 90%)"
                opacity={0.50}
                zIndex={0}
            />

            <Container className={classes.wrapper} size='sm'>

                <Title ta='center' className={classes.title}>
                    Frequently Asked Questions:
                </Title>

                <Accordion variant='separated' radius='xl' className={classes.accordion}>
                    <div className={classes.accordionItems} >
                        {items}
                    </div>
                </Accordion>

            </Container>

        </div>
    );
}