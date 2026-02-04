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
              withGlobalClasses
              theme={{
                primaryColor: 'blue',
                defaultRadius: 'md',
              }}
            >

              <Toaster
                position='top-center'
                toastOptions={{
                  duration: 5000,
                  success: {
                    style: {
                      background: "#222121ff",
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
                      background: '#2d2d2dff',
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
                
            </MantineProvider>
          </LibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}