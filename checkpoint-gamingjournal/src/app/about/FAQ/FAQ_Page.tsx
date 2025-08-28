'use client'

import { Title, Text } from '@mantine/core';

import Questions from '@/components/FrequentQuestions/FrequentQuestions';
import classes from './FAQ.module.css'

export default function FAQ() {

    return(

        <div className={classes.main}>

            <div className={classes.content} >

                <Title c='white' mb='md' className={classes.title}>
                    Frequently Asked Questions:
                </Title>

                <Questions />

            </div>

        </div>
    );
}