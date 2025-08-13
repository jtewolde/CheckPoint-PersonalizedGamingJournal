'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react'
import { Textarea, Button, Loader, Avatar } from '@mantine/core';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { SendIcon, MessageCircleQuestion, MessageSquare, Earth, Gamepad2, Hourglass, Users} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

import classes from './chat.module.css';

export default function Chat() {
    
    const [input, setInput] = useState('');
    const router = useRouter();

    const { messages, append, isLoading } = useChat({
        api: '/api/geminichat'
    });

    const [user, setUser] = useState<{ name?: string; image?: string } | null>(null);

    // Check If the user is authenticated, if not redirect to signin page
    useEffect(() => {
        const checkAuth = async () => {
            const session = await authClient.getSession();
            if (!session.data?.user) {
                router.push('/auth/signin');
            } else {
                setUser({
                    name: session.data.user.name,
                    image: session.data.user.image || undefined,
                });
            }
        }
        checkAuth();

    }, [router]);

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

    // Function to scroll the page down automatically


    // Check if the user has sent any messages, used for making introductory text disappear
    const hasUserMessage = messages.some(msg => msg.role === 'user');

    // Array of common game-related questions to use as quick prompts for user in suggestion cards
    const gameSuggestions = [
        {icon: <Earth size={30} color='lime'/> , text: "Best open-world games this year?"},
        {icon: <Gamepad2 size={30} color='cyan'/> , text: "Can you recommend some indie games?"},
        {icon: <Hourglass size={30} color='yellow'/> , text: "Most anticipated games coming out?"},
        {icon: <Users size={30} color='pink'/> , text: "Looking for co-op games to play with friends."}
    ]

    return (
        <div className={classes.container} >

            {!hasUserMessage && (
                <>
                    <h2 className={classes.headerTitle}>Welcome to <span className={classes.highlight}>CheckPoint AI!</span></h2>
                    <h3 className={classes.description}>Ask CheckPoint AI anything about video games and <br/> get instant and accurate answers!</h3>
                </>
            )}

            <div className={classes.chatRoom} style={{ marginBottom: 8, borderRadius: 8}}>
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            className={`messageBubble ${isUser ? 'user' : 'assistant'}`}
                            key={idx}
                            style={{
                                display: 'flex',
                                flexDirection: isUser ? 'row-reverse' : 'row',
                                alignItems: 'flex-start',
                                margin: '12px 0',
                            }}
                        >
                            <Avatar
                                radius="xl"
                                size={40}
                                src={isUser ? user?.image : undefined}
                                alt={isUser ? (user?.name || "User") : "Gemini"}
                                style={{ margin: isUser ? '0 0 0 12px' : '0 12px 12px 0', background: isUser ? undefined : '#383838ff' }}
                            >
                                {!isUser && "🤖"}
                            </Avatar>
                            <div
                                className={classes.messageBubble}
                                style={{ 
                                    background: isUser ? '#424344ff' : '#5c5b5bff',
                                    color: '#fff',
                                    padding: '12px 12px',
                                    fontFamily: 'Inter',
                                    fontSize: 12,
                                    fontWeight: 520,
                                    borderRadius: isUser ? '16px' : '16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    wordBreak: 'break-word',
                                    textAlign: 'left',
                                }}
                            >
                            
                            <div className={classes.markdownContent}>
                                <Markdown
                                    remarkPlugins={[remarkGfm]} 
                                    rehypePlugins={[rehypeRaw]}
                                >
                                {msg.content}
                                </Markdown>
                            </div>

                            </div>
                        </div>
                    );
                })}
                {isLoading && <Loader color="white" type="dots" />}
            </div>

            {!hasUserMessage && (
                <div className={classes.suggestions}>
                
                {gameSuggestions.map((suggestion, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        color="gray"
                        size="lg"
                        leftSection={suggestion.icon}
                        radius="md"
                        className={classes.suggestionButton}
                        onClick={() => {
                            setInput(suggestion.text);
                        }}
                    >
                        {suggestion.text}
                    </Button>
                ))}
            </div>
            )}

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
                    leftSection={<MessageCircleQuestion size={25} color='#ccc' />}
                    rightSection={<SendIcon size={25} color='#ccc' onClick={handleSend} aria-disabled={isLoading || !input.trim()} style={{ cursor: 'pointer'}}/>}
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
            </form>
        </div>
    );
}