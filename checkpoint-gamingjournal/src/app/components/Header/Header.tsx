'use client'

import { useState } from 'react';
import { Burger, Container, Group, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import CheckPointLogo from '../../../../public//CheckPointLogo.png';
import classes from './Header.module.css';

// TO DO FOR LATER:
// HAVE DIFFERENT HEADER FOR AUTHENICATED OR NOT

const links = [
  { link: '/', label: 'Home' },
  { link: '/my-games', label: 'My Games' },
  { link: '/journal', label: 'Journal' },
  { link: '/stats', label: 'Stats' },
  { link: '/signup', label: 'Sign Up' },
  { link: '/login', label: 'Login' },
];

export function Header(){
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <img src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} />
        <Container size="md" className={classes.links}>
          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>
        </Container>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}