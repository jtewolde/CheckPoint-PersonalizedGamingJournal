'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Burger, Group, Drawer, Image, Button, Divider } from '@mantine/core';
import { useDisclosure, useMediaQuery} from '@mantine/hooks';

import CheckPointLogo from '../../../public/DesktopLogoNew.png';
import CheckPointMobileLogo from '../../../public/MobileCheckPointLogo.png';

import { useAuth } from '@/context/Authcontext';

import { IconSearch } from '@tabler/icons-react';
import { LogIn, UserRoundPlus, LayoutDashboard, Library, Notebook, House, Timer, Star, Flame } from 'lucide-react';

import classes from './Header.module.css';

// Define the navigation links with their labels, icons, and hrefs
const navLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Library', icon: <Library size={20} />, href: '/library' },
    { label: 'Journal', icon: <Notebook size={20} />, href: '/journal' },
    { label: 'Sessions', icon: <Timer size={20} />, href: '/sessions'},
]

// Define the discover links with their labels, icons, and hrefs
const discoverLinks = [
    {
        label: "Discover",
        icon: <IconSearch size={20} />,
        href: "/search",
    },
    {
        label: "Popular",
        icon: <Star size={20} />,
        href: "/popular-games",
    },
    {
        label: "Trending",
        icon: <Flame size={20} />,
        href: "/trending-games",
    },
];

export default function Sidebar() {
    const [opened, { toggle, close }] = useDisclosure(false); // State for Drawer
    const router = useRouter();
    const pathname = usePathname();

    const { isAuthenticated, setIsAuthenticated } = useAuth(); // Access global auth state
    const isMobile = useMediaQuery('(max-width: 455px)');

    const [activeLink, setActiveLink] = useState(pathname); // State to track the active link
    

    return (
        <nav className={classes.sidebar}>
            <div className={classes.logoContainer}>
                {isMobile ? (
                    <Image src={CheckPointMobileLogo.src} alt="CheckPoint Logo" className={classes.mobileLogo} />
                ): (
                    <Image src={CheckPointLogo.src} alt="CheckPoint Logo" className={classes.logo} />
                )}
            </div>

            <div className={classes.navlinks}>
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${classes.navlink} ${activeLink === link.href ? classes.active : ''}`}
                        onClick={() => setActiveLink(link.href)}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            {link.icon}
                            <span style={{ marginLeft: 8}}>{link.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <Divider className={classes.divider} />

            <div className={classes.discoverLinks}>
                {discoverLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${classes.navlink} ${activeLink === link.href ? classes.active : ''}`}
                        onClick={() => setActiveLink(link.href)}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            {link.icon}
                            <span style={{ marginLeft: 8}}>{link.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

        </nav>
    )
}

