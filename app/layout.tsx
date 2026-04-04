'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sound");
    if (stored === "off") setEnabled(false);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("sound", next ? "on" : "off");
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 bg-black/40 text-white px-3 py-2 rounded-lg backdrop-blur"
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const authenticated = !!user;
      setIsAuthenticated(authenticated);

      // Public routes that don't require authentication
      const publicRoutes = ['/login', '/upgrade'];
      const isPublicRoute = publicRoutes.includes(pathname);

      // Redirect to login if not authenticated and not on public route
      if (!authenticated && !isPublicRoute) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SoundToggle />
        {children}
        <footer className="text-sm text-gray-600 mt-10 pb-6 text-center">
          <p>
            © Bible Athlete • <a href="/terms" className="hover:underline">Terms</a> • <a href="/privacy" className="hover:underline">Privacy</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
