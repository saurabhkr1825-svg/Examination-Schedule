import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIT Patna Autumn 2026 Mid-Semester Examination",
  description: "Find your exam schedule, room, and compare with peers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 mt-auto">
          Directed by Saurabh &middot; Because checking the Excel was too easy 😭
        </footer>
      </body>
    </html>
  );
}
