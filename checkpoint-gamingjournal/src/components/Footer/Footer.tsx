import { Mail } from "lucide-react";
import { IconBrandLinkedin } from "@tabler/icons-react";
import { ActionIcon, Group, Container, Text } from "@mantine/core";
import classes from './Footer.module.css';

export function Footer() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Text size="sm" color="dimmed" className={classes.text}>
          © {new Date().getFullYear()} Checkpoint. All rights reserved.
        </Text>
        
        <Group gap="xs" className={classes.links} justify="flex-end" wrap="nowrap">
          <ActionIcon
            component="a"
            href="mailto:jotewolde20@gmail.com"
            target="_blank"
            size="lg"
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
            size="lg"
            color="gray"
            variant="subtle"
            aria-label="LinkedIn"
          >
            <IconBrandLinkedin size={40} color="black"/>
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}
