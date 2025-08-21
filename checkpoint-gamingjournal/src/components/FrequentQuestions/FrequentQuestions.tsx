
import { Accordion } from '@mantine/core';
import classes from './FrequentQuestions.module.css'

// Data that has the frequently asked questions and answers to use in the FAQ UI
const frequentQuestions = [
    {
        question: 'What is CheckPoint?',
        answer: "CheckPoint is a web app built for gamers who want to stay organized, motivated, and reflective throughout their gaming journey. It combines journal-style logging with progress tracking, allowing users to capture what they accomplished during each session, set goals for future play, and visualize their backlog and completed games—all in one place."
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
    },
    {
        question: "Is my data safe with CheckPoint?",
        answer: "Yes! CheckPoint takes data security seriously. All your information is encrypted and stored securely in the cloud. There are also strict privacy policies in place to protect your data."
    }
]

export default function Questions() {

    const items = frequentQuestions.map((item) => (
        <Accordion.Item key={item.question} value={item.question}>
            <Accordion.Control>{item.question}</Accordion.Control>
            <Accordion.Panel>
                <div style={{ maxWidth: '500px', textAlign: 'left', padding: '0.5rem 0', fontWeight: 550 }}>
                    {item.answer}
                </div>
            </Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <Accordion className={classes.accordion} styles={{item: {background: '#55575aff', color: 'white'}, label: {color: 'white', paddingRight: '0.7rem'}, chevron: {color: 'white'}}} variant='filled' radius='lg'>
            {items}
        </Accordion>
    );
}