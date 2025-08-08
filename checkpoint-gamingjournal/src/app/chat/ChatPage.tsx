'use client'

import React, { useState, useEffect} from 'react'
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react'
import { Textarea, Button, Loader, Avatar } from '@mantine/core';

import Markdown from 'react-markdown';

import { Send, SendIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

import classes from './chat.module.css';

export default function Chat() {
    
    const [input, setInput] = useState('');
    const router = useRouter();

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

    // Check If the user is authenticated, if not redirect to signin page
    useEffect(() => {
        const checkAuth = async () => {
            const session = await authClient.getSession();
            if (!session.data?.user) {
                router.push('/auth/signin');
            }
        }
        checkAuth();

    }, [router]);

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

    // Function to handle sending message to the Gemini AI and if rate limit is exceeded, send out message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
            await append({ role: 'user', content: input });
        } catch (error: any) {
            // If the error is a rate limit error, show it as a Gemini message
            if (error?.response?.status === 429) {
                // Add a Gemini error message to the chat
                await append({
                    role: 'assistant',
                    content: "⚠️ Rate limit exceeded. Please try again in a minute.",
                });
            } else {
                // Add a generic Gemini error message
                await append({
                    role: 'assistant',
                    content: "⚠️ Sorry, something went wrong. Please try again later.",
                });
            }
        }
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
                                className={classes.messageBubble}
                                style={{
                                    background: isUser ? '#c8cad3' : '#f3f4fd',
                                    color: '#000',
                                    padding: '16px 24px',
                                    fontSize: 17,
                                    fontWeight: 520,
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
                <Textarea
                    autosize
                    minRows={1}
                    className={classes.askQuestionText}
                    variant='filled'
                    inputSize='md'
                    size='lg'
                    radius='lg'
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask Gemini anything!"
                    disabled={isLoading}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                        }
                    }}
                />

                <Button variant='outline' color='white' size='md' radius='lg' type='submit'>{<SendIcon size={30}/>}</Button>
            </form>
        </div>
    );
}