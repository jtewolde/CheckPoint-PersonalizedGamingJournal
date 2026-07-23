import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins, Barlow, Noto_Sans } from "next/font/google";

import "./globals.css";
import '@mantine/core/styles.css';

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/context/Authcontext";
import { LibraryProvider } from "@/context/LibraryContext";

import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";

import { Suspense } from "react";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

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
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: "CheckPoint",
  description: "CheckPoint is your personal gaming journal, where you can track you gaming progress, add/delete games from your library, and write journal entries about your gaming experiences.",
  icons: {
    icon: '/favicon.ico'
  }
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

      <body className={`${geistSans.variable} ${geistMono.variable} page-container`}>
        <AuthProvider>
          <LibraryProvider>
            <MantineProvider
              defaultColorScheme="dark"
              withGlobalClasses
              theme={{
                primaryColor: 'violet',
                colors: {
                  dark: [
                    '#d9d6e6', // text
                    '#c4bfd7',
                    '#ada7c3',
                    '#8b85a3',
                    '#5b5672',
                    '#343043',
                    '#262235', // cards
                    '#1f1b2c', // sections
                    '#17151f', // app background
                    '#121019', // deepest
                  ],

                  brand:[
                    '#f3ecff',
                    '#e4d3ff',
                    '#d2b6ff',
                    '#bc95ff',
                    '#a774ff',
                    '#8b5cf6',
                    '#7c3aed',
                    '#6d28d9',
                    '#5b21b6',
                    '#4c1d95',
                  ]
                },
                primaryShade: 5,
                defaultRadius: 'md',
                components: {
                  Paper: {
                    defaultProps: {
                      bg: "dark.6"
                    }
                  },

                  Card: {
                    defaultProps: {
                      bg: "dark.6"
                    }
                  },

                  AppShell: {
                    styles: {
                      main: {
                        background: "#17151f"
                      }
                    }
                  },

                  Button: {
                    defaultProps: {
                      color: "brand"
                    }
                  },

                  Modal: {
                    styles: {
                      content: {
                        background: "#1f1b2c",
                      },

                      header: {
                        background: "#1f1b2c",
                      },
                    },
                  },

                  Drawer: {
                    styles: {
                      content: {
                        background: "#1f1b2c",
                      },
                    },
                  },
                },
              }}
            >

              <Toaster
                position='top-right'
                toastOptions={{
                  duration: 5000,
                  success: {
                    style: {
                      background: "rgb(40, 26, 55)",
                      color: 'white',
                      fontFamily: 'Poppins',
                      fontWeight: '400',
                      borderRadius: '8px',
                      border: '1px solid #2f2f2f',
                      textAlign: 'left',
                      width: '100%'
                    },
                    iconTheme: {
                      primary: 'green',
                      secondary: 'white'
                    }
                  },
                  error: {
                    style: {
                      background: 'rgb(23, 23, 23)',
                      color: 'white',
                      fontFamily: 'Poppins',
                      fontWeight: '400',
                      fontSize: '16px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      width: '100%'
                    }
                  }  
                }}
              />
              <ModalsProvider>
                
              <Header />
                <main className="main-content">
                  <Suspense
                    fallback={
                      <GlobalLoader
                        visible
                      />
                    }
                  >
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