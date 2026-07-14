import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InboxPilot AI - Voice-based AI Email Assistant",
  description:
    "Summarize, categorize, and answer emails using voice commands. Experience the ultimate AI inbox intelligence assistant for Gmail and Outlook.",
  keywords: ["email assistant", "voice email", "AI email summarization", "gmail AI helper", "inbox pilot"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
