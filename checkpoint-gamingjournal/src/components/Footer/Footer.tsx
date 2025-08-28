
import { Mail } from "lucide-react";
import { IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";
import { ActionIcon, Group, Text } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import classes from './Footer.module.css';

export function Footer() {

  return (
    <div className={classes.footer}>
      
      <div className={classes.inner}>

        {/* Left side: IGDB + copyright */}
        <div className={classes.left}>

          <Group gap="xs" className={classes.footerText}>
            <Text size="sm" color="dimmed" className={classes.igdbText}>
              Data provided by <Link href="https://www.igdb.com" target="_blank" className={classes.igdbLink}>IGDB</Link>.
              <br /> © {new Date().getFullYear()} Checkpoint. All rights reserved.
            </Text>
          </Group>
        </div>

        {/* Center: FAQ */}
        <div className={classes.center}>
          <Link href='/about' className={classes.FAQLink}>About</Link>
          <Link href='/about/terms' className={classes.FAQLink}>Terms of Service</Link>
          <Link href='/about/contact' className={classes.FAQLink}>Contact</Link>
          <Link href="/FAQ" className={classes.FAQLink}>FAQ</Link>
        </div>

        {/* Right side: Socials */}
        <div className={classes.right}>
          <Group gap="xs" className={classes.links} wrap="nowrap">
            <ActionIcon
              component="a"
              href="mailto:jotewolde20@gmail.com"
              target="_blank"
              size="xl"
              color="gray"
              variant="subtle"
              aria-label="Email"
            >
              <Mail size={40} color="red" />
            </ActionIcon>

            <ActionIcon
              component="a"
              href="https://www.linkedin.com/in/joseph-tewolde-88295a244/"
              target="_blank"
              size="xl"
              color="white"
              variant="subtle"
              aria-label="LinkedIn"
            >
              <IconBrandLinkedin size={40} stroke={1.7} color="#0072B1" />
            </ActionIcon>

            <ActionIcon
              component="a"
              href="https://github.com/jtewolde/CheckPoint-PersonalizedGamingJournal"
              target="_blank"
              size="xl"
              color="white"
              variant="subtle"
              aria-label="LinkedIn"
            >
              <IconBrandGithub size={40} stroke={1.7} color="white" />
            </ActionIcon>
          </Group>
        </div>
      </div>
    </div>
  );
}
