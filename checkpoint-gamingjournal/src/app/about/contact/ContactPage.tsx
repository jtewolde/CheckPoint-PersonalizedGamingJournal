'use client'

import React from "react";
import { useState } from "react";

import { Textarea, TextInput, Button, Title, Text, Select } from "@mantine/core";
import { Mail, SendHorizonal, MessageCircle } from "lucide-react";

import toast from "react-hot-toast";

import classes from './contact.module.css';

export default function Contact() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const subjectOptions = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Support' },
        { value: 'feedback', label: 'Feedback' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);


        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    access_key: "41c9e728-b9c4-4273-ae27-ca26deb4825d",
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            // Handle successful form submission
            toast.success("Form submitted successfully!")
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("There was an error submitting the form. Please try again.")
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.wrapper} >

            <Title className={classes.title} order={1} c='white'>Contact Us</Title>

            <Text fz='md' mb='sm' className={classes.text}>
                If you have any questions, feedback, or inquiries, please feel free to reach out to us using the form below. We value your input and will get back to you as soon as possible.
            </Text>

            <div className={classes.container}>

                <div className={classes.contactInfo} >
                    
                    <form className={classes.form} onSubmit={handleSubmit}>
                        <TextInput radius='md' variant="filled" type="name" label="Enter your Name (Optional)" placeholder="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required={false} size='md' className={classes.name} />

                        <Select
                            value={subject}
                            onChange={(subject) => setSubject(subject || "")}
                            classNames={{
                                option: classes.selectOption
                            }}
                            radius='md'
                            name="subject"
                            size="md"
                            variant="filled" 
                            type='text'
                            label="Subject"
                            placeholder="Select a Subject"
                            required={true} 
                            className={classes.subject}
                            styles={{
                                dropdown: { backgroundColor: '#212121', border: '1px solid #e4e4e4', color: 'white' },
                            }}
                            data={
                                subjectOptions.map((option) => ({
                                    value: option.value,
                                    label: option.label
                                }))
                            } 
                        />
                        
                        <TextInput type="email" variant="filled" label="Enter your Email" placeholder="Email" required={true} withAsterisk leftSection={<Mail />} size="md" className={classes.email} value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
                        <Textarea name="message" variant="filled" withAsterisk autosize required={true} label="Enter your Message" placeholder="Message" size="md" leftSection={<MessageCircle size={20} />} className={classes.message} value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
                        <Button size="md" type="submit" className={classes.sendButton} radius="md" rightSection={<SendHorizonal />} color="green" loading={loading} disabled={!email || !message || !subject} >Send</Button>
                    </form>

                </div>

            </div>

        </div>
    );
}