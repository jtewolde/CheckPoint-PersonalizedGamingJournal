'use client'

import { usePathname, useRouter } from 'next/navigation';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import CheckPointLogo from '../../../../public/CheckPointLogo.png';
import classes from './Header.module.css';
import Link from 'next/link';

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const pathname = usePathname();

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <img src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} />
        <Container size="md" className={classes.links}>
          <Group gap={5} visibleFrom="xs">
          <Link href="/" className={`${classes.link} ${pathname === '/' ? classes.active : ''}`}>Home</Link>
              <Link href="/my-games" className={`${classes.link} ${pathname === '/my-games' ? classes.active : ''}`}>My Games</Link>
              <Link href="/journal" className={`${classes.link} ${pathname === '/journal' ? classes.active : ''}`}>Journal</Link>
              <Link href="/stats" className={`${classes.link} ${pathname === '/stats' ? classes.active : ''}`}>Stats</Link>
              <Link href="/auth/signin" className={`${classes.link} ${pathname === '/auth/signin' ? classes.active : ''}`}>Sign In</Link>
              <Link href="/auth/signup" className={`${classes.link} ${pathname === '/auth/signup' ? classes.active : ''}`}>Sign Up</Link>
          </Group>
        </Container>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
