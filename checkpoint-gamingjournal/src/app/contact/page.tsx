'use client'

import React from "react";

import { Textarea, TextInput, Button, Overlay } from "@mantine/core";
import { Mail, SendHorizonal } from "lucide-react";

import classes from './contact.module.css';

export default function Contact() {
    return (
        <div className={classes.wrapper} >

            <Overlay
                gradient="linear-gradient(180deg,rgb(67, 67, 67) 30%,rgb(112, 112, 112) 90%)"
                opacity={0.50}
                zIndex={0}
            />

            <div className={classes.container}>

                <h1 className={classes.contactTitle}>Contact Me!</h1>

                <p className={classes.contactText}>Use this contact form for any questions, feedback, and requests: </p>

                <div className={classes.contactInfo} >
                    
                    <form className={classes.form} action="https://getform.io/f/ajjjwrqa" method="POST">
                        <TextInput radius='md' variant="filled" type="name" label="Enter your Name (Optional)" placeholder="Name" required={false} className={classes.name} />
                        <TextInput type="email" variant="filled" label="Enter your Email" placeholder="Email" required={true} withAsterisk leftSection={<Mail />} className={classes.email} />
                        <Textarea name="message" variant="filled"withAsterisk required={true} label="Enter your Message" placeholder="Message" className={classes.message}/>
                        <Button size="md" className={classes.sendButton} radius="md" rightSection={<SendHorizonal />} color="green">Send</Button>
                    </form>

                </div>

            </div>

        </div>
    );
}