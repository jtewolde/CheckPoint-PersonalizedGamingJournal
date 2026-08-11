"use client";

import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Group,
  Checkbox,
  Stack,
  Divider,
  Image,
} from "@mantine/core";
import { toast } from "react-toastify";

import { useState, useEffect } from "react";
import { useRouter, redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import classes from "./signUp.module.css";
import { UserRoundPlus } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton/GoogleButton";
import { DiscordButton } from "@/components/DiscordButton/DiscordButton";

import { Lock, Mail, CircleUser } from "lucide-react";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import CheckpointLogo from "../../../../public/MobileCheckPointLanding.png";

export default function signInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const router = useRouter();

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await authClient.getSession();
      if (data?.user) {
        // If the user is authenticated, redirect to the dashboard
        return redirect("/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  // Function to handle email sign-up authentication
  const handleEmailSignUp = async () => {
    setLoading(true);

    // Validate password and confirm password
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms of Service and Privacy Policy");
      setLoading(false);
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "/auth/signin",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success(
            "Account Created Successfully, A Vertification link has been sent to your email",
          );
          router.push("/auth/signin");
        },
        onError: (ctx) => {
          setError(ctx.error?.message);
          setLoading(false);
          toast.error("Account Creation Failed, Invalid Password or Email!");
        },
      },
    );
  };

  // Function to handle Google sign-in authentication
  const handleGoogleSignIn = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      toast.error("Google Sign-in Failed");
    } else {
      toast.success("Google Sign-in Successful");
    }
  };

  // Function to handle Discord sign-in authentication
  const handleDiscordSignIn = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "discord",
      callbackURL: "/dashboard",
    });
    if (error) {
      toast.error("Discord Sign-in Failed");
    } else {
      toast.success("Discord Sign-in Successful");
    }
  };

  // When loading into page, display global loader on page
  if (loading) {
    return <GlobalLoader visible={loading}></GlobalLoader>;
  }

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius="lg">
        <div className={classes.logoContainer}>
          <Image
            src={CheckpointLogo.src}
            alt="CheckPoint Logo"
            className={classes.landingLogo}
          />
        </div>
        <Title className={classes.title} order={2} ta="center" c="white">
          Create an Account
        </Title>

        <Text c="dimmed" ta="center" mt={8} fz="sm">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </Text>

        <Stack gap="xs" mt="md">
          <GoogleButton radius="md" onClick={handleGoogleSignIn}>
            Continue With Google
          </GoogleButton>
          <DiscordButton radius="md" onClick={handleDiscordSignIn}>
            Continue with Discord
          </DiscordButton>
        </Stack>

        <Divider
          styles={{ label: { color: "white" } }}
          label="Or continue with email"
          labelPosition="center"
          color="white"
          my="md"
        />

        <div className={classes.inputWrapper}>
          <TextInput
            className={classes.usernameInput}
            label="Username"
            placeholder="An_Example01"
            required
            size="md"
            leftSection={<CircleUser size={20} />}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <TextInput
            className={classes.emailInput}
            label="Email Address"
            placeholder="AExample@gmail.com"
            required
            size="md"
            leftSection={<Mail size={20} />}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={error}
          />
          <PasswordInput
            className={classes.passwordInput}
            label="Password"
            placeholder="Your Password"
            required
            leftSection={<Lock size={20} />}
            size="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={passwordError}
          />
          <PasswordInput
            className={classes.passwordInput}
            label="Confirm Password"
            placeholder="Confim Password"
            required
            leftSection={<Lock size={20} />}
            size="md"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            error={passwordError}
          />

          <Checkbox
            label={
              <>
                I agree to the{" "}
                <Anchor<"a"> href="/about/terms" target="_blank">
                  Terms of Service
                </Anchor>{" "}
                and{" "}
                <Anchor<"a"> href="/about/privacy" target="_blank">
                  Privacy Policy
                </Anchor>
              </>
            }
            required
            size="md"
            mt="md"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.currentTarget.checked)}
          />

          <Button
            fullWidth
            size="md"
            mt="md"
            loading={loading}
            rightSection={<UserRoundPlus size={25} />}
            onClick={handleEmailSignUp}
          >
            Register Account
          </Button>
        </div>

        <Text ta="center" mt="lg" c="white">
          Already have an account?{" "}
          <Anchor<"a">
            size="sm"
            onClick={() => router.push("/auth/signin")}
            href="/auth/signin"
            fw={700}
          >
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
