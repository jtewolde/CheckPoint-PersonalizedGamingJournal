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
        <Flex direction={{ base: 'column', sm: 'row' }} style={{ minHeight: 'calc(100vh - 140px)' }}>

        {/* Sidebar */}
        {(!isMobile || opened) && (
            <Paper
            withBorder
            shadow="sm"
            h={{ base: '100%'}}
            w={{ base: '100%', sm: 270 }}
            p="md"
            style={{ background: 'rgb(167, 167, 167)', borderRight: '1px solid white'}}
            >
                <Stack gap="lg">

                    <NavLink
                    label="Email"
                    autoContrast
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
                    color='white'
                    />

                    <NavLink
                    label="Profile"
                    autoContrast
                    styles={{
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                        }
                    }}
                    leftSection={<User size={30} />}
                    component={Link}
                    href="/settings/profile"
                    active={pathname === '/settings/profile'}
                    color="white"
                    />

                    <NavLink
                    styles={{
                        label:{
                            fontFamily: 'Poppins',
                            fontWeight: 600,
                            fontSize: '1.5rem',
                        }
                    }}
                    label="Password"
                    autoContrast
                    leftSection={<FileLock size={30} />}
                    component={Link}
                    href="/settings/password"
                    active={pathname === '/settings/password'}
                    color="white"
                    />
                </Stack>

            </Paper>
        )}

        {/* Main Content */}
        <Box p="xl" style={{ flex: 1, background: 'linear-gradient(to top,rgb(72, 71, 71),rgb(73, 73, 73)' }}>
            {children}
        </Box>
    </Flex>

    );
}