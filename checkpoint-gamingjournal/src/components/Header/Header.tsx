'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Burger, Container, Group, Paper, Drawer, Autocomplete, Image, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import CheckPointLogo from '../../../public/CheckPointLogo.png';
import classes from './Header.module.css';
import Link from 'next/link';

import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/context/Authcontext';

import toast from 'react-hot-toast';
import { IconSearch } from '@tabler/icons-react';
import { LogIn, UserRoundPlus, LogOut } from 'lucide-react';
import AvatarMenu from "../AvatarMenu/AvatarMenu";
import { useState } from 'react';

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false); // State for Drawer
  const [searchQuery, setSearchQuery] = useState('') // State for Search Input
  const [searchResults, setSearchResults] = useState<any[]>([]); // State for search results
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state

  // Function to handle sign out for authenticated users
  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setIsAuthenticated(false);
      router.push('/'); // Redirect to home page after sign out
      toast.success('Signed out successfully!'); // Show success toast
      close(); // Close the drawer after sign out
    }
  };

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
  
    if (query.trim() === '') {
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
      <Container size="md" className={classes.inner}>
        
        <Image src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} onClick={handleLogoClick} style={{cursor: 'pointer'}} />

        {isAuthenticated ? (
          <Autocomplete
          className={classes.searchBar}
          visibleFrom='sm'
          placeholder="Search for games"
          rightSection={<IconSearch size={24} color='black' style={{cursor: 'pointer'}} onClick={() => router.push(`/search?query=${encodeURIComponent(searchQuery)}`)}/>}
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
          }}
        />
        ) : null}

        {/* Desktop Links */}
        <Container size="md" className={classes.links} >
          <Group gap='lg' visibleFrom='sm' justify='flex-end' className={classes.linkGroup}>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={`${classes.link} ${pathname === '/dashboard' ? classes.active : ''}`}>Dashboard</Link>
                <Link href="/library" className={`${classes.link} ${pathname === '/library' ? classes.active : ''}`}>Library</Link>
                <Link href="/journal" className={`${classes.link} ${pathname === '/journal' ? classes.active : ''}`}>Journal</Link>
                <AvatarMenu />
              </>
            ) : (
              <>
                <div className={classes.guestLinks}>
                  <Link href="/" className={`${classes.link} ${pathname === '/' ? classes.active : ''}`}>Home</Link>
                  <Link href="/auth/signin" className={`${classes.signInButton} ${pathname === '/auth/signin' ? classes.active : ''}`}>Sign In <LogIn size={15}/> </Link>
                  <Link href="/auth/signup" className={`${classes.signUpButton} ${pathname === '/auth/signup' ? classes.active : ''}`}>Register <UserRoundPlus size={15} /> </Link>
                </div>
              </>
            )}
          </Group>
        </Container>

        {/* Mobile Links */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="md" />

        <Drawer
          opened={opened}
          onClose={close}
          position="top"
          size="50%"
          className={classes.drawer}
        >
          <div className={classes.linkSpacing}>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={close} className={`${classes.mobileLink} ${pathname === '/dashboard' ? classes.active : ''}`}>Dashboard</Link>
                <Link href="/library" onClick={close} className={`${classes.mobileLink} ${pathname === '/library' ? classes.active : ''}`}>Library</Link>
                <Link href="/journal" onClick={close} className={`${classes.mobileLink} ${pathname === '/journal' ? classes.active : ''}`}>Journal</Link>
                <AvatarMenu />

                <Autocomplete
                  className={classes.searchBar}
                  label='Search For Games'
                  color='black'
                  placeholder="Search for games"
                  rightSection={<IconSearch size={24} color='black' style={{cursor: 'pointer'}} onClick={() => router.push(`/search?query=${encodeURIComponent(searchQuery)}`)}/>}
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
                  }}
                />

              </>
            ) : (
              <>
                <Link href="/" onClick={close} className={`${classes.mobileLink} ${pathname === '/' ? classes.active : ''}`}>Home</Link>
                <Link href="/auth/signin" onClick={close} className={`${classes.mobileSignInButton} ${pathname === '/auth/signin' ? classes.active : ''}`}>Sign In <LogIn size={15}/></Link>
                <Link href="/auth/signup" onClick={close} className={`${classes.mobileSignUpButton} ${pathname === '/auth/signup' ? classes.active : ''}`}>Register <UserRoundPlus size={15}/> </Link>
              </>
            )}
          </div>
        </Drawer>
      </Container>
    </header>
  );
}