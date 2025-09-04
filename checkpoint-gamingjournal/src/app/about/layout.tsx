'use client'

import { Paper, NavLink, Stack, Box, Flex, Burger, rem } from "@mantine/core";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";

import { ReactNode } from "react";

import { ReceiptText, FileLock, AppWindow, MailPlus, ShieldQuestion, Map } from "lucide-react";

import classes from './about.module.css';

export default function AboutLayout({ children }: { children: ReactNode}) {

    const pathname = usePathname();
    const availableHeight = 'calc(100vh - 147px)'

    const [opened, { toggle }] = useDisclosure();
    const [isMobile, setIsMobile] = useState(false);

    return (
        <Flex direction={{ base: 'column', sm: 'row' }} style={{ minHeight: 'calc(100vh - 100px)' }}>

        {/* Sidebar */}
        {(!isMobile || opened) && (
            <Paper
            withBorder
            shadow="sm"
            radius='xs'
            h={{ base: '100%'}}
            w={{ base: '100%', sm: 300 }}
            p="md"
            className={isMobile ? classes.mobileSidebarBorder: undefined}
            style={{ background: 'linear-gradient(to bottom, #2e2e2e, #282727ff)', border: '1px solid black', borderRight: '2px solid white', borderBottom: '1px solid black'}}
            >
                <Stack gap="xl">

                    <NavLink
                    className={classes.navLinks}
                    styles={{
                        root: {
                            borderBottom: pathname === '/about' ? '4px solid white': undefined,
                            color: pathname === '/about' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 420,
                            fontSize: '1.5rem',
                            color: 'white'
                        },
                        description: {
                            fontFamily: 'Poppins',
                            fontSize: '0.75rem'
                        }
                    }}
                    label="About"
                    autoContrast
                    leftSection={<AppWindow size={30} color="white"/>}
                    component={Link}
                    href="/about"
                    active={pathname === '/about'}
                    color="white"
                    />

                    <NavLink
                    className={classes.navLinks}
                    label="Terms of Service"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/about/terms' ? '4px solid white': undefined,
                            color: pathname === '/about/terms' ? 'white' : undefined,
                        },

                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 420,
                            fontSize: '1.5rem',
                            color: 'white'
                        },
                        description: {
                            fontFamily: 'Poppins',
                            fontSize: '0.75rem'
                        }
                    }}
                    leftSection={<ReceiptText size={30} color="white"/>}
                    component={Link}
                    href="/about/terms"
                    active={pathname === '/about/terms'}
                    color='white'
                    />

                    <NavLink
                    className={classes.navLinks}
                    label="Privacy Policy"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/about/privacy' ? '4px solid white': undefined,
                            color: pathname === '/about/privacy' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 420,
                            fontSize: '1.5rem',
                            color: 'white'
                        },
                        description: {
                            fontFamily: 'Poppins',
                            fontSize: '0.75rem'
                        }
                    }}
                    leftSection={<FileLock size={30} color="white"/>}
                    component={Link}
                    href="/about/privacy"
                    active={pathname === '/about/privacy'}
                    color="white"
                    />

                    <NavLink
                    className={classes.navLinks}
                    label="Contact Us"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/about/contact' ? '4px solid white': undefined,
                            color: pathname === '/about/contact' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 420,
                            fontSize: '1.5rem',
                            color: 'white'
                        },
                        description: {
                            fontFamily: 'Poppins',
                            fontSize: '0.75rem'
                        }
                    }}
                    leftSection={<MailPlus size={30} color="white"/>}
                    component={Link}
                    href="/about/contact"
                    active={pathname === '/about/contact'}
                    color="white"
                    />

                    <NavLink
                    className={classes.navLinks}
                    label="Roadmap"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/about/roadmap' ? '4px solid white': undefined,
                            color: pathname === '/about/roadmap' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 420,
                            fontSize: '1.5rem',
                            color: 'white'
                        },
                        description: {
                            fontFamily: 'Poppins',
                            fontSize: '0.75rem'
                        }
                    }}
                    leftSection={<Map size={30} color="white"/>}
                    component={Link}
                    href="/about/roadmap"
                    active={pathname === '/about/roadmap'}
                    color="white"
                    />

                    <NavLink
                    className={classes.navLinks}
                    label="FAQ"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/about/FAQ' ? '4px solid white': undefined,
                            color: pathname === '/about/FAQ' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 420,
                            fontSize: '1.5rem',
                            color: 'white'
                        },
                        description: {
                            fontFamily: 'Poppins',
                            fontSize: '0.75rem'
                        }
                    }}
                    leftSection={<ShieldQuestion size={30} color="white"/>}
                    component={Link}
                    href="/about/FAQ"
                    active={pathname === '/about/FAQ'}
                    color="white"
                    />

                </Stack>

            </Paper>
        )}

        {/* Main Content */}
        <Box p="xl" style={{ flex: 1, background: '#212121' }}>
            {children}
        </Box>
    </Flex>

    );
}
