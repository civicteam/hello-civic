import type { Metadata } from "next";

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import ClientProvider from "./components/ClientProvider";
import { CivicAuthProvider } from "@civic/auth/nextjs";

export const metadata: Metadata = {
  title: "Cool Convo - Voice Chat",
  description: "Simple voice chat application with Pipecat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-white`}
      >
        <ClientProvider>
          <CivicAuthProvider>
            {children}
          </CivicAuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
