import { Button, ButtonProps } from '@mantine/core';
import { DiscordIcon } from '@mantinex/dev-icons';

export function DiscordButton(props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) {
  return (
    <Button size='md' style={{border: '0.5px solid #969492'}} color='#181818ff' leftSection={<DiscordIcon size={22} color="#00ACEE" />} variant="filled" {...props} />
  );
}