'use client'

import React, { useState, useEffect} from 'react'
import { useChat } from '@ai-sdk/react'
import { TextInput, Button, Loader, Avatar } from '@mantine/core'; 
import Markdown from 'react-markdown';

import { Send, SendIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

import classes from './chat.module.css';

export default function Chat() {
    const [input, setInput] = useState('');
    const { messages, append, isLoading } = useChat({
        initialMessages:[
            {
                role: "assistant", content: "Great to meet you. I'm Gemini, your chatbot. Ask me anything about games!",
                id: ''
            }
        ],
        api: '/api/geminichat'
    });

    const [user, setUser] = useState<{ name?: string; image?: string } | null>(null);
    
    
        // Fetch session info on mount to get the user's name and image for chatroom
        useEffect(() => {
        const fetchSession = async () => {
            const session = await authClient.getSession(); // Get current session
            if (session?.data?.user) {
                setUser({
                    name: session.data.user.name,
                    image: session.data.user.image || undefined,
                });
            }
        };

        fetchSession();
    }, []);

    // Function to handle sending message to the Gemini AI
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        await append({ role: 'user', content: input });
        setInput('');
    };

    return (
        <div className={classes.container} >

            <h2 className={classes.headerTitle}>Welcome to the Gemini AI Chatroom!</h2>
            <p className={classes.description}>Here you can have quick access to Gemini AI to ask 
                a quick question on game recommendations, help for completing tasks, and more!
            </p>

            <div className={classes.chatRoom} style={{ border: '1px solid #ccc', padding: 16, minHeight: 300, marginBottom: 16, borderRadius: 8}}>
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                flexDirection: isUser ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                margin: '12px 0',
                            }}
                        >
                            <Avatar
                                radius="xl"
                                size={40}
                                src={isUser ? user?.image : undefined}
                                alt={isUser ? (user?.name || "User") : "Gemini"}
                                style={{ margin: isUser ? '0 0 0 12px' : '0 12px 0 0', background: isUser ? undefined : '#eee' }}
                            >
                                {!isUser && "🤖"}
                            </Avatar>
                            <div
                                style={{
                                    background: isUser ? '#c8cad3' : '#c8cad3',
                                    color: '#000',
                                    padding: '10px 16px',
                                    borderRadius: 16,
                                    maxWidth: '70%',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    wordBreak: 'break-word',
                                    textAlign: 'left',
                                }}
                            >
                                <Markdown>{msg.content}</Markdown>
                            </div>
                        </div>
                    );
                })}
                {isLoading && <Loader color="gray" type="dots" />}
            </div>

            <form onSubmit={handleSend} className={classes.form}>
                <TextInput
                    className={classes.askQuestionText}
                    variant='filled'
                    size='lg'
                    radius='lg'
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask Gemini anything!"
                    disabled={isLoading}
                />

                <Button variant='outline' color='white' size='md' radius='lg' type='submit'>{<SendIcon size={30}/>}</Button>
            </form>
        </div>
    );
}