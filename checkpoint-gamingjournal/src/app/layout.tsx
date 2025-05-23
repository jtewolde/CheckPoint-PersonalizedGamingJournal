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
  description: "Generated by create next app",
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
          <MantineProvider>
            <Toaster 
              toastOptions={{
                success: {
                  style: {
                    background: "#d9f8de",
                    fontFamily: 'Poppins',
                    fontWeight: 'bold',
                    border: '1px solid black'
                  },
                },
                error: {
                  style: {
                    background: '#ffcece',
                    fontFamily: 'Poppins',
                    fontWeight: 'bold',
                    border: '1px solid black'
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