'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Burger, Group, Drawer, Image, Modal, Menu, Divider, ActionIcon } from '@mantine/core';
import { useDisclosure, useMediaQuery} from '@mantine/hooks';
import GameSearchBar from '../GameSearchBar/GameSearchBar';

import CheckPointLogo from '../../../public/DesktopLogoNew.png';
import CheckPointMobileLogo from '../../../public/MobileCheckPointLogo.png';

import { useAuth } from '@/context/Authcontext';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

import { IconSearch } from '@tabler/icons-react';
import { LogIn, UserRoundPlus, LayoutDashboard, Library, Notebook, House, Timer, Star, Flame, Settings, LogOut, Megaphone } from 'lucide-react';
import AvatarMenu from "../AvatarMenu/AvatarMenu";

import toast from 'react-hot-toast';
import classes from './Header.module.css';

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false); // State for mobile side bar
  const [searchOpened, { toggle: searchToggle, close: searchClose}] = useDisclosure(false); // State for search drawer

  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state
  const isMobile = useMediaQuery('(max-width: 650px)');

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
        { label: 'Upcoming', icon: <Timer size={20} />, href: '/search/upcoming' },
        { label: 'Most Anticipated', icon: <Megaphone size={20} />, href: '/search/most-anticipated' }
      ]},
  ]

  // Define the guest navigation links with their labels, icons, and hrefs
  const guestNavLinks = [
      { label: 'Home', icon: <House size={20} />, href: '/' },
      { label: 'Discover', icon: <IconSearch size={20} />, href: '/search', links: [
        { label: 'Popular', icon: <Star size={20} />, href: '/search/popular' },
        { label: 'Trending', icon: <Flame size={20} />, href: '/search/trending' },
        { label: 'Upcoming', icon: <Timer size={20} />, href: '/search/upcoming' },
        { label: 'Most Anticipated', icon: <Megaphone size={20} />, href: '/search/most-anticipated' }
      ]},
      { label: 'Sign In', icon: <LogIn size={20} />, href: '/auth/signin' },
      { label: 'Register', icon: <UserRoundPlus size={20} />, href: '/auth/signup'},
  ]
  
  // Define the discover links with their labels, icons, and hrefs
  const mobileGuestLinks = {
    main: [
      { label: 'Home', icon: <House size={25} />, href: '/' },
    ],
    discover: [
      { label: 'Discover', icon: <IconSearch size={25} />, href: '/discover' },
      { label: 'Popular', icon: <Star size={25} />, href: '/search/popular' },
      { label: 'Trending', icon: <Flame size={25} />, href: '/search/trending' },
      { label: 'Upcoming', icon: <Timer size={25} />, href: '/search/upcoming' },
      { label: 'Most Anticipated', icon: <Megaphone size={20} />, href: '/search/most-anticipated' }
    ],
    authentication: [
      { label: 'Sign In', icon: <LogIn size={25} />, href: '/auth/signin' },
      { label: 'Register', icon: <UserRoundPlus size={25} />, href: '/auth/signup'},
    ]
  }

  // Define links for when user is on mobile and signed in
  const mobileAuthLinks = {
    main: [
      { label: 'Dashboard', icon: <LayoutDashboard size={25} />, href: '/dashboard' },
      { label: 'Library', icon: <Library size={25} />, href: '/library' },
      { label: 'Journal', icon: <Notebook size={25} />, href: '/journal' },
      { label: 'Sessions', icon: <Timer size={25} />, href: '/sessions' },
    ],

    discover: [
      { label: 'Discover', icon: <IconSearch size={25} />, href: '/discover' },
      { label: 'Popular', icon: <Star size={25} color='#e4c61d' fill='#e4c61d'/>, href: '/search/popular' },
      { label: 'Trending', icon: <Flame size={25} color='#ff8c00' fill='#ff8c00'/>, href: '/search/trending' },
      { label: 'Upcoming', icon: <Timer size={20} color='#00c3ff' fill='#00c3ff'/>, href: '/search/upcoming' },
      { label: 'Most Anticipated', icon: <Megaphone size={20} color='#45e629' fill='#24e848'/>, href: '/search/most-anticipated' }
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
          <Group gap='lg' visibleFrom='sm' justify='flex-start' className={classes.linkGroup}>
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
                            pathname === '/discover' ||
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
                          href="/discover"
                          leftSection={<IconSearch size={20} color='white'/>}
                        >
                          Discover Games
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

                        <Menu.Item
                          component={Link}
                          href="/search/upcoming"
                          leftSection={<Timer size={20} color='#00c3ff' fill='#00c3ff'/>}
                        >
                          Upcoming Games
                        </Menu.Item>
                        
                        <Menu.Item
                          component={Link}
                          href="/search/most-anticipated"
                          leftSection={<Megaphone size={20} color='#45e629' fill='#24e848'/>}
                        >
                          Most Anticipated Games
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
                                pathname === '/discover' ||
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
                              href="/discover"
                              leftSection={<IconSearch size={20} color='white'/>}
                            >
                              Discover Games
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

                            <Menu.Item
                              component={Link}
                              href="/search/upcoming"
                              leftSection={<Timer size={20} color='#00c3ff' fill='#00c3ff'/>}
                            >
                              Upcoming Games
                            </Menu.Item>
                            
                            <Menu.Item
                              component={Link}
                              href="/search/most-anticipated"
                              leftSection={<Megaphone size={20} color='#45e629' fill='#24e848'/>}
                            >
                              Most Anticipated Games
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

        <Group gap="md">
          <Modal
              opened={searchOpened}
              onClose={searchClose}
              centered
              withCloseButton
              title="Search Games"
              className={classes.drawer}
              styles={{
                close: {
                  color: 'white'
                }
              }}
            >
              <GameSearchBar className={classes.searchBar} placeHolder='Search Games...' size='lg' autoNavigate showActionIcon iconColor='#812fcf' />
          </Modal>

          {!isMobile ? (
            <div className={classes.searchBarContainer}>
              <GameSearchBar className={classes.searchBar} placeHolder='Search Games...' size='lg' autoNavigate showButton={false} />
            </div>
          ): (
            <div className={classes.searchButtonContainer}>
              <ActionIcon size='lg' variant='light' color='white' onClick={searchToggle}>
                <IconSearch size={30} />
              </ActionIcon>
            </div>
          )}
    
          {isAuthenticated && !isMobile ? <AvatarMenu /> : null}

          {/* Mobile Links */}
          <Burger className={classes.burger} opened={opened} onClick={toggle} hiddenFrom="sm" size="md" color='white' />

        </Group>

        <Drawer
          opened={opened}
          onClose={close}
          position='left'
          withCloseButton={false}
          size={isMobile ? (isAuthenticated ? '290px' : '290px') : '300px'} // Adjust size based on conditions
          className={classes.drawer}
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
              <>
                <div className={classes.guestMobileLinksContainer} >
                  <Divider label='Main' labelPosition='left' size='lg' styles={{label: { fontSize: '18px'}}} />
                  {mobileGuestLinks.main.map((link) => (
                    <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                      <div className={classes.mobileLink}>
                        {link.icon}
                        {link.label}
                      </div>
                    </Link>
                  ))}

                  <Divider label='Discover' labelPosition='left' size='lg' styles={{label: { fontSize: '18px'}}} />
                  {mobileGuestLinks.discover.map((link) => (
                    <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                      <div className={classes.mobileLink}>
                        {link.icon}
                        {link.label}
                      </div>
                    </Link>
                  ))}

                  <Divider label='Account' labelPosition='left' size='lg' styles={{label: { fontSize: '18px'}}} />
                  {mobileGuestLinks.authentication.map((link) => (
                    <Link key={link.href} href={link.href} className={`${classes.link} ${pathname === link.href ? classes.active : ''}`}>
                      <div className={classes.mobileLink}>
                        {link.icon}
                        {link.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </Drawer>
      </div>
    </header>
  );
}