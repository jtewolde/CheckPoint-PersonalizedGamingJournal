'use client'

import { Overlay, Title, Container } from '@mantine/core';

import Questions from '@/components/FrequentQuestions/FrequentQuestions';
import classes from './FAQ.module.css'

export default function FAQ() {

    return(

        <div className={classes.background}>

            <Overlay
                gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgba(42, 41, 41, 1) 90%)"
                opacity={0.75}
                zIndex={0}
            />

            <Container className={classes.wrapper} size='sm'>

                <Title ta='center' className={classes.title}>
                    FAQ:
                </Title>

                <Questions />

            </Container>

        </div>
    );
}