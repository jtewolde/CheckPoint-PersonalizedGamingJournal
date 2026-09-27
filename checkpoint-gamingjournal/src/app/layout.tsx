import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Barlow,
  Noto_Sans,
} from "next/font/google";

import "./globals.css";
import "@mantine/core/styles.css";

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/Authcontext";
import { LibraryProvider } from "@/context/LibraryContext";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";

import { Suspense } from "react";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

// Font configurations using next/font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CheckPoint",
  description:
    "CheckPoint is your personal gaming journal, where you can track you gaming progress, add/delete games from your library, and write journal entries about your gaming experiences.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} page-container`}
      >
        <AuthProvider>
          <LibraryProvider>
            <MantineProvider
              defaultColorScheme="dark"
              withGlobalClasses
              theme={{
                primaryColor: "brand",

                colors: {
                  /*
                   * Dark neutral palette
                   *
                   * 0 - Primary text
                   * 1 - Secondary text
                   * 2 - Muted text
                   * 3 - Disabled/subtle text
                   * 4 - Borders
                   * 5 - Strong borders / muted surfaces
                   * 6 - Cards
                   * 7 - Sections
                   * 8 - Application background
                   * 9 - Deepest background
                   */
                  dark: [
                    "#f5f5f7", // 0 - primary text
                    "#d4d4d8", // 1 - secondary text
                    "#a1a1aa", // 2 - muted text
                    "#71717a", // 3 - disabled/subtle text
                    "#3f424b", // 4 - borders
                    "#252831", // 5 - strong borders / muted surfaces
                    "#15171c", // 6 - cards
                    "#111318", // 7 - sections
                    "#0d0e11", // 8 - app background
                    "#08090b", // 9 - deepest background
                  ],

                  /*
                   * CheckPoint purple accent
                   */
                  brand: [
                    "#f5f3ff", // 0
                    "#ede9fe", // 1
                    "#ddd6fe", // 2
                    "#c4b5fd", // 3
                    "#a78bfa", // 4
                    "#8b5cf6", // 5 - primary
                    "#7c3aed", // 6
                    "#6d28d9", // 7
                    "#5b21b6", // 8
                    "#4c1d95", // 9
                  ],
                },

                primaryShade: 5,

                defaultRadius: "sm",

                components: {
                  Paper: {
                    defaultProps: {
                      bg: "dark.6",
                    },
                  },

                  Card: {
                    defaultProps: {
                      bg: "dark.6",
                    },
                  },

                  AppShell: {
                    styles: {
                      main: {
                        background: "#0d0e11",
                      },
                    },
                  },

                  Button: {
                    defaultProps: {
                      color: "brand",
                    },
                  },

                  Modal: {
                    styles: {
                      content: {
                        background: "#15171c",
                        border: "1px solid #252831",
                      },

                      header: {
                        background: "#15171c",
                        borderBottom: "1px solid #252831",
                      },

                      overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.78)",
                      },
                    },
                  },

                  Drawer: {
                    styles: {
                      content: {
                        background: "#15171c",
                        borderLeft: "1px solid #252831",
                      },

                      overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.78)",
                      },
                    },
                  },
                },
              }}
            >
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
              <ModalsProvider>
                <Header />
                <main className="main-content">
                  <Suspense fallback={<GlobalLoader visible />}>
                    {children}
                  </Suspense>
                </main>
                <Footer />
              </ModalsProvider>
            </MantineProvider>
          </LibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
