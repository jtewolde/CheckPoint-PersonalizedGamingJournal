import { Button, ButtonProps } from "@mantine/core";
import { DiscordIcon } from "@mantinex/dev-icons";

export function DiscordButton(
  props: ButtonProps & React.ComponentPropsWithoutRef<"button">,
) {
  return (
    <Button
      size="md"
      style={{
        border: "1px solid #342b3a",
        fontWeight: 500,
        textAlign: "left",
        fontSize: "14px",
      }}
      color="rgb(24, 24, 24)"
      leftSection={<DiscordIcon size={25} color="#00ACEE" />}
      variant="filled"
      {...props}
    />
  );
}
