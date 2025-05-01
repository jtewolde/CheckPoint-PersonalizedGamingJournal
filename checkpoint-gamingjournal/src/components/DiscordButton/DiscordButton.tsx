import { Button, ButtonProps } from '@mantine/core';
import { DiscordIcon } from '@mantinex/dev-icons';

export function DiscordButton(props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) {
  return (
    <Button leftSection={<DiscordIcon size={16} color="#00ACEE" />} variant="default" {...props} />
  );
}