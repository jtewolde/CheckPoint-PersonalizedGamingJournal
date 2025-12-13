'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Burger, Group, Drawer, Autocomplete, Image, Button } from '@mantine/core';
import { useDisclosure, useMediaQuery} from '@mantine/hooks';

import CheckPointLogo from '../../../public/DesktopLogoNew.png';
import CheckPointMobileLogo from '../../../public/MobileCheckPointLogo.png';

import classes from './Header.module.css';
import Link from 'next/link';

import { useAuth } from '@/context/Authcontext';

import { IconSearch } from '@tabler/icons-react';
import { LogIn, UserRoundPlus, LayoutDashboard, Library, BotMessageSquare, Notebook, House } from 'lucide-react';
import AvatarMenu from "../AvatarMenu/AvatarMenu";
import { useState } from 'react';

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false); // State for Drawer
  const [searchQuery, setSearchQuery] = useState('') // State for Search Input
  const [searchResults, setSearchResults] = useState<any[]>([]); // State for search results
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state
  const isMobile = useMediaQuery('(max-width: 510px)');

  // Drawer height for different conditions
  const drawerSize = (() => {
    if (isMobile && isAuthenticated) return '400px'; // smaller when logged in on mobile
    if (isMobile && !isAuthenticated) return '270px'; // larger when guest on mobile
    return '300px'; // default for desktop
  })();

  // Function to handle clicking the logo and redirecting user to dashboard or homepage based on authenication
  const handleLogoClick = async () => {
    if(isAuthenticated){
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  // Function to handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  
    if (query.trim().length < 3) {
      setSearchResults([]); // Clear results if the query is empty
      return;
    }
    try {
      const res = await fetch(`/api/igdb/games?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.log("Unexpected response format:", data);
        return;
      }
  
      // Remove duplicate game names
      const uniqueResults = data.filter(
        (game: any, index: number, self: any[]) =>
          index === self.findIndex((g) => g.name === game.name)
      );
  
      setSearchResults(uniqueResults); // Update search results with unique values
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
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

        <Autocomplete
          classNames={{
            option: classes.autocompleteOption
          }}
          styles={
            {
              dropdown: {
                backgroundColor: '#232526',
                color: 'white',
                borderRadius: '4px'
              },
            }
          }
          scrollAreaProps={{ scrollbarSize: 16, type: 'auto', scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
          comboboxProps={{ transitionProps: { transition: 'fade-down', duration: 200 } }}
          className={classes.searchBar}
          radius='md'
          size='lg'
          maxDropdownHeight={200}
          variant='filled'
          placeholder="Search For Games"
          rightSection={<IconSearch size={28} color='lightgrey' style={{cursor: 'pointer'}} onClick={() => router.push(`/search?query=${encodeURIComponent(searchQuery)}`)}/>}
          value={searchQuery}
          onChange={handleSearch} // Update the search query state
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim() !== '') {
              router.push(`/search?query=${encodeURIComponent(searchQuery)}`); // Navigate to the search results page
            }
          }}
          data={searchResults.map((game) => ({
            value: game.name,
            label: game.name,
          }))} // Map search results to Autocomplete options
          onSubmit={(event) => {
            event.preventDefault();
            const inputValue = (event.target as HTMLInputElement).value;
            router.push(`/search?query=${encodeURIComponent(inputValue)}`); // Navigate to the search results page
            setSearchQuery(''); // Clear search input after submission
          }}
        />

        {/* Desktop Links */}
        <div className={classes.links} >
          <Group gap='lg' visibleFrom='lg' justify='flex-end' className={classes.linkGroup}>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={`${classes.link} ${pathname === '/dashboard' ? classes.active : ''}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <LayoutDashboard size={20} style={{ marginBottom: 2 }} />
                    Dashboard
                  </div>
                </Link>

                <Link href="/library" className={`${classes.link} ${pathname === '/library' ? classes.active : ''}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Library size={20} style={{ marginBottom: 2 }} />
                    Library
                  </div>
                </Link>

                <Link href="/journal" className={`${classes.link} ${pathname === '/journal' ? classes.active : ''}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Notebook size={20} style={{ marginBottom: 2 }} />
                    Journal
                  </div>
                </Link>

                <Link href="/chat" className={`${classes.link} ${pathname === '/chat' ? classes.active : ''}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <BotMessageSquare size={20} style={{ marginBottom: 2 }} />
                    Chat
                  </div>
                </Link>

                <AvatarMenu />
              </>
            ) : (
              <>
                <div className={classes.guestLinks}>
                  <Link href="/" className={`${classes.link} ${pathname === '/' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <House size={20} style={{ marginBottom: 2 }} />
                      Home
                    </div>
                  </Link>

                  <Link href="/auth/signin" className={`${classes.link} ${pathname === '/auth/signin' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <LogIn size={20} style={{ marginBottom: 2 }} />
                      Sign In
                    </div>
                  </Link>

                  <Link href="/auth/signup" className={`${classes.link} ${pathname === '/auth/signup' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <UserRoundPlus size={20} style={{ marginBottom: 2 }} />
                      Register
                    </div>
                  </Link>
                </div>
              </>
            )}
          </Group>
        </div>

        {/* Mobile Links */}
        <Burger className={classes.burger} opened={opened} onClick={toggle} hiddenFrom="lg" size="lg" color='white' />

        <Drawer
          opened={opened}
          onClose={close}
          position='top'
          size={drawerSize}
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
          <div className={classes.linkSpacing}>

            {isAuthenticated ? (
              <>
                <div className={classes.mobileLinksContainer} >

                  <Link href="/dashboard" className={`${classes.link} ${pathname === '/dashboard' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                      <LayoutDashboard size={20} style={{ marginBottom: 2 }} />
                      Dashboard
                    </div>
                  </Link>

                  <Link href="/library" className={`${classes.link} ${pathname === '/library' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                      <Library size={20} style={{ marginBottom: 2 }} />
                      Library
                    </div>
                  </Link>

                  <Link href="/journal" className={`${classes.link} ${pathname === '/journal' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                      <Notebook size={20} style={{ marginBottom: 2 }} />
                      Journal
                    </div>
                  </Link>

                  <Link href="/chat" className={`${classes.link} ${pathname === '/chat' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                      <BotMessageSquare size={20} style={{ marginBottom: 2 }} />
                      Chat
                    </div>
                  </Link>

                </div>

                  <AvatarMenu />

              </>
            ) : (
              <>
                <div className={classes.guestMobileLinksContainer} >
                  <Link href="/" className={`${classes.link} ${pathname === '/' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                      <House size={20} style={{ marginBottom: 2 }} />
                      Home
                    </div>
                  </Link>

                  <Link href="/auth/signin" className={`${classes.link} ${pathname === '/auth/signin' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                      <LogIn size={20} style={{ marginBottom: 2 }} />
                      Sign In
                    </div>
                  </Link>

                  <Link href="/auth/signup" className={`${classes.link} ${pathname === '/auth/signup' ? classes.active : ''}`}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                      <UserRoundPlus size={20} style={{ marginBottom: 2 }} />
                      Register
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Drawer>
      </div>
    </header>
  );
}