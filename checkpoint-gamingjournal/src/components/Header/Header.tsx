'use client'

import { usePathname, useRouter } from 'next/navigation';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import CheckPointLogo from '../../../public/CheckPointLogo.png';
import classes from './Header.module.css';
import Link from 'next/link';

import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/context/Authcontext';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AvatarMenu from "../AvatarMenu/AvatarMenu";

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const router = useRouter();
  const pathname = usePathname();
  const {isAuthenticated, setIsAuthenticated} = useAuth(); // Access global auth state

  // Function to handle sign out for authenticated users
  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setIsAuthenticated(false);
      router.push('/'); // Redirect to home page after sign out
      toast.success('Signed out successfully!'); // Show success toast
      
    }
  };

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <img src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} />

        {/* Desktop Links */}
        <Container size="md" className={classes.links}>
          <Group gap={5} visibleFrom="sm">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={`${classes.link} ${pathname === '/dashboard' ? classes.active : ''}`}>Dashboard</Link>
                <Link href="/my-games" className={`${classes.link} ${pathname === '/my-games' ? classes.active : ''}`}>My Games</Link>
                <Link href="/journal" className={`${classes.link} ${pathname === '/journal' ? classes.active : ''}`}>Journal</Link>
                <Link href="/stats" className={`${classes.link} ${pathname === '/stats' ? classes.active : ''}`}>Stats</Link>
                <AvatarMenu />
              </>
            ) : (
              <>
                <div className={classes.guestLinks}>
                  <Link href="/" className={`${classes.link} ${pathname === '/' ? classes.active : ''}`}>Home</Link>
                  <Link href="/auth/signin" className={`${classes.signInButton} ${pathname === '/auth/signin' ? classes.active : ''}`}>Sign In</Link>
                  <Link href="/auth/signup" className={`${classes.signUpButton} ${pathname === '/auth/signup' ? classes.active : ''}`}>Get Started</Link>
                </div>
              </>
            )}
          </Group>
        </Container>

        {/* Mobile Links */}


        <Burger opened={opened} onClick={toggle} hiddenFrom="s" size="md" />
      </Container>
    </header>
  );
}