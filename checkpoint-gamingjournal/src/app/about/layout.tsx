'use client'

import { Paper, NavLink, Stack, Box, Flex, Burger, rem } from "@mantine/core";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";

import { ReactNode } from "react";

import { ReceiptText, FileLock } from "lucide-react";

import classes from './about.module.css';

export default function AboutLayout({ children }: { children: ReactNode}) {

    const pathname = usePathname();
    const availableHeight = 'calc(100vh - 147px)'

    const [opened, { toggle }] = useDisclosure();
    const [isMobile, setIsMobile] = useState(false);

    return (
        <Flex direction={{ base: 'column', sm: 'row' }} style={{ minHeight: 'calc(100vh - 140px)' }}>

        {/* Sidebar */}
        {(!isMobile || opened) && (
            <Paper
            withBorder
            shadow="sm"
            radius='xs'
            h={{ base: '100%'}}
            w={{ base: '100%', sm: 270 }}
            p="md"
            style={{ background: 'linear-gradient(to bottom, #2e2e2e, #282727ff)', border: '1px solid black', borderRight: '2px solid white'}}
            >
                <Stack gap="xl">

                    <NavLink
                    className={classes.navLinks}
                    description="Learn more about CheckPoint"
                    styles={{
                        root: {
                            borderBottom: pathname === '/about' ? '4px solid white': undefined,
                            color: pathname === '/about' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
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
                    leftSection={<FileLock size={30} color="white"/>}
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
                            fontWeight: 600,
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
                            fontWeight: 600,
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
