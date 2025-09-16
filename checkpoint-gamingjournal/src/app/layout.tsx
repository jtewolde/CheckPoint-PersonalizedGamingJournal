import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import '@mantine/core/styles.css';

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/context/Authcontext";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
          <MantineProvider
            withGlobalClasses
            theme={{
              primaryColor: 'blue',
              defaultRadius: 'md',
            }}
          >

            <Toaster
              position='bottom-left'
              toastOptions={{
                duration: 5000,
                success: {
                  style: {
                    background: "#d9f8de",
                    fontFamily: 'Poppins',
                    fontWeight: '610',
                    border: '0.2px solid black',
                    width: '400px'
                  },
                },
                error: {
                  style: {
                    background: '#ffd1d1',
                    fontFamily: 'Poppins',
                    fontWeight: '610',
                    border: '0.2px solid black',
                    textAlign: 'left',
                    width: '60%'
                  }
                }  
              }}
            />

            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </MantineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}