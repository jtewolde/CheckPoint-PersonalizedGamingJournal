'use client'

import { Paper, NavLink, Stack, Box, Flex, Burger } from "@mantine/core";

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
        <Flex direction={{ base: 'column', sm: 'row' }} style={{ minHeight: 'calc(100vh - 148px)' }}>
        {/* Burger for mobile */}
        {isMobile && (
            <Box p="md">
            <Burger opened={opened} onClick={toggle} aria-label="Toggle settings menu" />
            </Box>
        )}

        {/* Sidebar */}
        {(!isMobile || opened) && (
            <Paper
            withBorder
            shadow="sm"
            w={{ base: '100%', sm: 270 }}
            p="md"
            style={{ backgroundColor: '#f0f0f0', borderRight: '1px solid black'}}
            >
                <Stack gap="lg">
                    <NavLink
                    label="Profile"
                    styles={{
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem'
                        }
                    }}
                    leftSection={<User size={30} />}
                    component={Link}
                    href="/settings/profile"
                    active={pathname === '/settings/profile'}
                    />

                    <NavLink
                    label="Email"
                    styles={{
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem'
                        }
                    }}
                    leftSection={<Mail size={30} />}
                    component={Link}
                    href="/settings/email"
                    active={pathname === '/settings/email'}
                    />

                    <NavLink
                    styles={{
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem'
                        }
                    }}
                    label="Password"
                    leftSection={<FileLock size={30} />}
                    component={Link}
                    href="/settings/password"
                    active={pathname === '/settings/password'}
                    />
                </Stack>

            </Paper>
        )}

        {/* Main Content */}
        <Box p="xl" style={{ flex: 1, backgroundColor: 'white' }}>
            {children}
        </Box>
    </Flex>

    );
}