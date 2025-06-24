'use client'

import { Paper, NavLink, Stack, Box, Flex, Burger, rem } from "@mantine/core";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";

import { ReactNode } from "react";

import { User, Mail, FileLock } from "lucide-react";

import classes from './settings.module.css';


export default function SettingsLayout({ children }: { children: ReactNode}) {

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
            h={{ base: '100%'}}
            w={{ base: '100%', sm: 270 }}
            p="md"
            style={{ background: 'linear-gradient(to bottom, #2e2e2e, #3e3e3e)', borderRight: '1px solid white'}}
            >
                <Stack gap="xl">

                    <NavLink
                    className={classes.navLinks}
                    label="Email"
                    description="Update your Email Address"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/settings/email' ? '4px solid white': undefined,
                            color: pathname === '/settings/email' ? 'white' : undefined,
                        },

                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                            color: 'white'
                        }
                    }}
                    leftSection={<Mail size={30} color="white"/>}
                    component={Link}
                    href="/settings/email"
                    active={pathname === '/settings/email'}
                    color='white'
                    />

                    <NavLink
                    className={classes.navLinks}
                    label="Profile"
                    description="Update your Avatar/Username"
                    autoContrast
                    styles={{
                        root: {
                            borderBottom: pathname === '/settings/profile' ? '4px solid white': undefined,
                            color: pathname === '/settings/profile' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                            color: 'white'
                        }
                    }}
                    leftSection={<User size={30} color="white"/>}
                    component={Link}
                    href="/settings/profile"
                    active={pathname === '/settings/profile'}
                    color="white"
                    />

                    <NavLink
                    className={classes.navLinks}
                    description="Change your Password"
                    styles={{
                        root: {
                            borderBottom: pathname === '/settings/password' ? '4px solid white': undefined,
                            color: pathname === '/settings/password' ? 'white' : undefined,
                        },
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                            color: 'white'
                        }
                    }}
                    label="Password"
                    autoContrast
                    leftSection={<FileLock size={30} color="white"/>}
                    component={Link}
                    href="/settings/password"
                    active={pathname === '/settings/password'}
                    color="white"
                    />
                </Stack>

            </Paper>
        )}

        {/* Main Content */}
        <Box p="xl" style={{ flex: 1, background: 'linear-gradient(to top, #444444, #333333)' }}>
            {children}
        </Box>
    </Flex>

    );
}