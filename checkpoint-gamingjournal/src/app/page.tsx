"use client";

import { Button, Text, Title, Image, ThemeIcon } from "@mantine/core";

import { UserRoundPlus, Search, Megaphone, Flame } from "lucide-react";
import { FeaturesGrid } from "../components/Features/Features";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/Authcontext";
import { useMediaQuery } from "@mantine/hooks";
import { motion } from "motion/react";

import classes from "./page.module.css";

import Questions from "@/components/FrequentQuestions/FrequentQuestions";
import TrendingSection from "@/components/TrendingSection/TrendingSection";
import CheckpointLogo from "../../public/LandingPageLogoFinal.png";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const isMobile = useMediaQuery("(max-width: 646px)");

  // Redirect to dashboard if user is autheenticated
  useEffect(() => {
    setMounted(true);

    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Handle Create Account Button click to go to signup
  const handleClick = () => {
    router.push("/auth/signup");
  };

  return (
    <div className={classes.hero}>
      <div className={classes.backgroundOverlay}>
        <div className={classes.contentContainer}>
          <div className={classes.mainContent}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.landingPageHeader}>
                <div className={classes.heroSection}>
                  <div className={classes.logoContainer}>
                    <Image
                      src={CheckpointLogo.src}
                      alt="CheckPoint Logo"
                      className={classes.landingLogo}
                      style={{ cursor: "pointer" }}
                    />
                    <Text className={classes.subtitle}>
                      Never lose your progress.
                    </Text>
                  </div>

                  <Text className={classes.description}>
                    Keep your entire gaming collection organized, track every
                    play session, capture your favorite moments, and always know
                    exactly where you left off.
                  </Text>

                  <div className={classes.buttonContainer}>
                    <Button
                      className={classes.createAccountButton}
                      variant="filled"
                      size="lg"
                      radius="md"
                      fullWidth={isMobile}
                      rightSection={<UserRoundPlus size={20} />}
                      onClick={handleClick}
                    >
                      Get Started Free
                    </Button>

                    <Button
                      className={classes.discoverButton}
                      variant="outline"
                      size="lg"
                      radius="md"
                      fullWidth={isMobile}
                      rightSection={<Search size={20} />}
                      onClick={() => router.push("/discover")}
                    >
                      Discover Games
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.FeatureSection}>
                <FeaturesGrid />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.trendingSection}>
                <div className={classes.trendingHeader}>
                  <Flame size={50} color="#f15c12" />
                  <h1 className={classes.trendingText}>Trending</h1>
                </div>
                <TrendingSection />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.librarySection}>
                <div className={classes.imageContainer}>
                  <Image
                    src="/NewLibrary.png"
                    alt="Library Page"
                    className={classes.image}
                    width={650}
                    height={560}
                  />

                  <div className={classes.imageTextContainer}>
                    <Text
                      className={classes.libraryImageTitle}
                      size="xl"
                      mt="lg"
                    >
                      Your Game Library Awaits
                    </Text>

                    <Text
                      className={classes.libraryImageText}
                      size="lg"
                      mt="lg"
                    >
                      Browse and manage your entire game collection
                      effortlessly. Sort, filter, and explore your library with
                      an interface designed around gamers. Whether you're
                      checking your backlog or searching for something new to
                      play, your library is always organized and easy to
                      navigate.
                    </Text>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.gameDetailsSection}>
                <div className={classes.imageReverseContainer}>
                  <Image
                    src="/GameDetailsPage.png"
                    alt="Game Details Page"
                    className={classes.image}
                    width={650}
                    height={500}
                  />

                  <div className={classes.imageTextContainer}>
                    <Text
                      className={classes.gameDetailsTitle}
                      size="xl"
                      mt="lg"
                    >
                      Dive into Game Details
                    </Text>

                    <Text className={classes.gameDetailsText} size="lg" mt="lg">
                      View detailed information for every game, including
                      descriptions, platforms, screenshots, and similar titles.
                      Discover new games tailored to your interests, and add
                      them to your library with a single click.
                    </Text>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.journalSection}>
                <div className={classes.imageContainer}>
                  <Image
                    src="/NewJournal.png"
                    alt="Journal Page"
                    className={classes.image}
                    width={800}
                    height={600}
                  />

                  <div className={classes.imageTextContainer}>
                    <Text className={classes.chatRoomTitle} size="xl" mt="lg">
                      Your Personal Gaming Journal
                    </Text>

                    <Text className={classes.chatRoomText} size="lg" mt="lg">
                      Keep track of your gaming journey with our journal entries
                      feature. Write about your gaming experiences, document
                      your achievements, and reflect on your progress. Whether
                      it's a memorable quest, a tough boss fight, or a new
                      strategy you discovered, your journal is the perfect place
                      to capture it all.
                    </Text>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={classes.chatRoomSection}>
                <div className={classes.imageReverseContainer}>
                  <Image
                    src="/PlaySession.png"
                    alt="PlaySession Calendar"
                    className={classes.image}
                    width={800}
                    height={600}
                  />

                  <div className={classes.imageTextContainer}>
                    <Text className={classes.chatRoomTitle}>
                      Track Your Play Sessions
                    </Text>

                    <Text className={classes.chatRoomText}>
                      Log every gaming session and visualize your activity over
                      time with a built-in calendar. See when you played, how
                      long you spent, and what you accomplished—so you always
                      know exactly where you left off.
                    </Text>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className={classes.faqSection}>
              <Title className={classes.faqTitle} c="white" size="xl">
                Frequently Asked Questions
              </Title>

              <Text className={classes.faqSubtitle} c="white">
                Everything you need to know before starting your gaming journey
                with CheckPoint.
              </Text>

              <Questions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
