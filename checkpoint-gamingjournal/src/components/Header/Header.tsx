'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Burger, Group, Drawer, Image, Button, Menu, Divider } from '@mantine/core';
import { useDisclosure, useMediaQuery} from '@mantine/hooks';

import CheckPointLogo from '../../../public/DesktopLogoNew.png';
import CheckPointMobileLogo from '../../../public/MobileCheckPointLogo.png';

import classes from './Header.module.css';
import Link from 'next/link';

import { useAuth } from '@/context/Authcontext';
import { authClient } from '@/lib/auth-client';

import { IconSearch } from '@tabler/icons-react';
import { LogIn, UserRoundPlus, LayoutDashboard, Library, Notebook, House, Timer, Star, Flame, Settings, LogOut } from 'lucide-react';
import AvatarMenu from "../AvatarMenu/AvatarMenu";
import toast from 'react-hot-toast';

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false); // State for Drawer
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state
  const isMobile = useMediaQuery('(max-width: 520px)');

  // Function to handle clicking the logo and redirecting user to dashboard or homepage based on authenication
  const handleLogoClick = async () => {
    if(isAuthenticated){
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

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

  // Define the navigation links with their labels, icons, and hrefs
  const navLinks = [
      { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
      { label: 'Library', icon: <Library size={20} />, href: '/library' },
      { label: 'Journal', icon: <Notebook size={20} />, href: '/journal' },
      { label: 'Discover', icon: <IconSearch size={20} />, href: '/search', links: [
        { label: 'Popular', icon: <Star size={20} />, href: '/search/popular' },
        { label: 'Trending', icon: <Flame size={20} />, href: '/search/trending' },
      ]},
  ]

  // Define the guest navigation links with their labels, icons, and hrefs
  const guestNavLinks = [
      { label: 'Home', icon: <House size={20} />, href: '/' },
      { label: 'Discover', icon: <IconSearch size={20} />, href: '/search'},
      { label: 'Sign In', icon: <LogIn size={20} />, href: '/auth/signin' },
      { label: 'Register', icon: <UserRoundPlus size={20} />, href: '/auth/signup'},
  ]
  
  // Define the discover links with their labels, icons, and hrefs
  const mobileGuestLinks = [
      { label: 'Home', icon: <House size={20} />, href: '/' },
      { label: 'Sign In', icon: <LogIn size={20} />, href: '/auth/signin' },
      { label: 'Register', icon: <UserRoundPlus size={20} />, href: '/auth/signup'},
      { label: 'Search Games', icon: <IconSearch size={20} />, href: '/search' },
      { label: 'Popular Games', icon: <Star size={20} />, href: '/search/popular' },
      { label: 'Trending Games', icon: <Flame size={20} />, href: '/search/trending' },
  ]

  // Define links for when user is on mobile and signed in
  const mobileAuthLinks = {
    main: [
      { label: 'Dashboard', icon: <LayoutDashboard size={25} />, href: '/dashboard' },
      { label: 'Library', icon: <Library size={25} />, href: '/library' },
      { label: 'Journal', icon: <Notebook size={25} />, href: '/journal' },
      { label: 'Sessions', icon: <Timer size={25} />, href: '/sessions' },
    ],

    discover: [
      { label: 'Search', icon: <IconSearch size={25} />, href: '/search' },
      { label: 'Popular', icon: <Star size={25} />, href: '/search/popular' },
      { label: 'Trending', icon: <Flame size={25} />, href: '/search/trending' },
    ],

    account: [
      { label: 'Profile', icon: <UserRoundPlus size={25} />, href: '/settings/profile' },
      { label: 'Settings', icon: <Settings size={25} />, href: '/settings', color: '#999b99'},
      { label: 'Log Out', icon: <LogOut size={25} color='red' />, href: '/', onClick: handleSignOut, color: '#f05345'}
    ],
};

  return (
    <header className={classes.header}>
      <div className={classes.inner}>

        <div className={classes.logoContainer} onClick={handleLogoClick}>
          {isMobile ? (
            <Image src={CheckPointMobileLogo.src} alt="CheckPoint Logo" className={classes.mobileLogo} style={{cursor: 'pointer'}} />
          ): (
            <Image src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} style={{cursor: 'pointer'}} />
          )}
        </div>

        {/* Desktop Links */}
        <div className={classes.links} >
          <Group gap='lg' visibleFrom='sm' justify='flex-end' className={classes.linkGroup}>
            {isAuthenticated ? (
              <>
              {navLinks.map((link) => {
                if (link.label === 'Discover') {
                  return (
                    <Menu
                      key={link.href}
                      trigger="hover"
                      openDelay={100}
                      closeDelay={200}
                      shadow="md"
                      width={220}
                    >
                      <Menu.Target>
                        <div
                          className={`${classes.link} ${
                            pathname === '/search' ||
                            pathname === '/search/popular' ||
                            pathname === '/search/trending'
                              ? classes.active
                              : ''
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            {link.icon}
                            {link.label}
                          </div>
                        </div>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          component={Link}
                          href="/search"
                          leftSection={<IconSearch size={20} color='white' />}
                        >
                          Search Games
                        </Menu.Item>

                        <Menu.Item
                          component={Link}
                          href="/search/popular"
                          leftSection={<Star size={20} color='#e4c61d'/>}
                        >
                          Popular Games
                        </Menu.Item>

                        <Menu.Item
                          component={Link}
                          href="/search/trending"
                          leftSection={<Flame size={20} color='#ff8c00'/>}
                        >
                          Trending Games
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${classes.link} ${
                      pathname === link.href ? classes.active : ''
                    }`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </div>
                  </Link>
                );
              })}
              </>
            ) : (
              <>
                <div className={classes.guestLinks}>
                  {guestNavLinks.map((link) => {
                    if (link.label === 'Discover') {
                      return (
                        <Menu
                          key={link.href}
                          trigger="hover"
                          openDelay={100}
                          closeDelay={200}
                          shadow="md"
                          width={220}
                        >
                          <Menu.Target>
                            <div
                              className={`${classes.link} ${
                                pathname === '/search' ||
                                pathname === '/search/popular' ||
                                pathname === '/search/trending'
                                  ? classes.active
                                  : ''
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                }}
                              >
                                {link.icon}
                                {link.label}
                              </div>
                            </div>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              component={Link}
                              href="/search"
                              leftSection={<IconSearch size={20} color='white'/>}
                            >
                              Search Games
                            </Menu.Item>

                            <Menu.Item
                              component={Link}
                              href="/search/popular"
                              leftSection={<Star size={20} color='#e4c61d' fill='#e4c61d'/>}
                            >
                              Popular Games
                            </Menu.Item>

                            <Menu.Item
                              component={Link}
                              href="/search/trending"
                              leftSection={<Flame size={20} color='#ff8c00' fill='#ff8c00'/>}
                            >
                              Trending Games
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      );
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`${classes.link} ${
                          pathname === link.href ? classes.active : ''
                        }`}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          {link.icon}
                          {link.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </Group>
        </div>

        <Group gap="xs">
    
          {isAuthenticated && !isMobile ? <AvatarMenu /> : null}

          {/* Mobile Links */}
          <Burger className={classes.burger} opened={opened} onClick={toggle} hiddenFrom="sm" size="md" color='white' />

        </Group>

        <Drawer
          opened={opened}
          onClose={close}
          position='left'
          withCloseButton={false}
          size={isMobile ? (isAuthenticated ? '270px' : '280px') : '300px'} // Adjust size based on conditions
          className={classes.drawer}
          styles={{
            content: {
              backgroundColor: '#202020ff',
              borderBottom: '2px solid grey'
            },
            header: {
              backgroundColor: '#202020ff'
            },
            close: {
              color: 'white'
            }
          }}
        >

          <div className={classes.logoContainer}>
              <Image src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} style={{cursor: 'pointer'}} />
          </div>

          <Divider my='sm' color='grey' />

          <div className={classes.linkSpacing}>
            {isAuthenticated ? (
              <>
                <div className={classes.mobileLinksContainer}>

                  <Divider label='Main' labelPosition='left' size='lg' styles={{label: { fontSize: '18px'}}} />

                  {mobileAuthLinks.main.map((link) => (
                    <>
                      <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                        <div className={classes.mobileLink}>
                          {link.icon}
                          {link.label}
                        </div>
                      </Link>
                    </>
                  ))}

                  <Divider label='Discover Games' labelPosition='left' size='lg' styles={{ label: { fontSize: '18px', fontFamily: 'Poppins' } }} />

                  {mobileAuthLinks.discover.map((link) => (
                      <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                        <div className={classes.mobileLink}>
                          {link.icon}
                          {link.label}
                        </div>
                      </Link>
                  ))}

                  <Divider label='Account' labelPosition='left' size='lg' styles={{ label: { fontSize: '18px', fontFamily: 'Poppins' }}} />

                  {mobileAuthLinks.account.map((link) => (
                    <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                      <div className={classes.mobileLink} style={link.label === 'Log Out' ? {color: '#f05345'} : link.label === 'Settings' ? {color: '#aeaeae'} : {}} >
                        {link.icon}
                        {link.label}
                      </div>
                    </Link>
                  ))}

                </div>
              </>
            ) : (
                <div className={classes.guestMobileLinksContainer} >
                  {mobileGuestLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px' }}>
                        {link.icon}
                        {link.label}
                      </div>
                    </Link>
                  ))}
                </div>
            )}
          </div>
        </Drawer>
      </div>
    </header>
  );
}