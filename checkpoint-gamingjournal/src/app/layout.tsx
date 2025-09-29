import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import '@mantine/core/styles.css';

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/context/Authcontext";

import { ColorSchemeScript, LoadingOverlay, MantineProvider, mantineHtmlProps } from '@mantine/core';

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
              components: {
                LoadingOverlay:{
                  defaultProps:{
                    overlayProps: { radius: "sm", blur: 2, backgroundColor:'black', backgroundOpacity: 1 },
                    loaderProps: { color: "pink", type: "oval" },
                  }
                }
              }
            }}
          >

            <Toaster
              position='top-center'
              toastOptions={{
                duration: 5000,
                success: {
                  style: {
                    background: "#333",
                    color: 'white',
                    fontFamily: 'Poppins',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    textAlign: 'center',
                    width: '100%'
                  },
                  iconTheme: {
                    primary: 'green',
                    secondary: 'white'
                  }
                },
                error: {
                  style: {
                    background: '#333',
                    color: 'white',
                    fontFamily: 'Poppins',
                    fontWeight: '500',
                    borderRadius: '8px',
                    textAlign: 'left',
                    width: '80%'
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