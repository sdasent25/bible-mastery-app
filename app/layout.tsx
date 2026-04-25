'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getLocale, getMessages } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import AppLayout from "@/components/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function SoundToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return localStorage.getItem("sound") !== "off";
  });

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("sound", next ? "on" : "off");
  };

  return (
    <button
      onClick={toggle}
      className="bg-black/40 text-white px-3 py-2 rounded-lg backdrop-blur"
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
  const [locale] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return getLocale();
  });
  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = ['/', '/login', '/signup', '/terms', '/privacy'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      if (isPublicRoute) {
        setIsAuthenticated(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const authenticated = !!user;
      setIsAuthenticated(authenticated);

      // Redirect to login if not authenticated and not on public route
      if (!authenticated && !isPublicRoute) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [isPublicRoute, pathname, router]);

  useEffect(() => {
    const sounds = [
      "/sounds/correct.mp3",
      "/sounds/wrong.mp3",
      "/sounds/click.mp3",
      "/sounds/tap.mp3",
      "/sounds/level-up.mp3",
    ];

    sounds.forEach((src) => {
      const audio = new Audio(src);
      audio.preload = "auto";
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    void getMessages(locale);
  }, [locale]);

  // Show loading state while checking authentication
  if (isAuthenticated === null && !isPublicRoute) {
    return (
      <html
        lang={locale}
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col items-center justify-center">
          <div className="text-gray-200">Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
          <LanguageToggle />
          <SoundToggle />
        </div>
        {isPublicRoute ? (
          <>
            {children}
            <footer className="border-t border-white/10 bg-[#050816] px-6 py-8 text-center text-sm text-gray-200">
              <p>
                © Bible Athlete • <a href="/terms" className="hover:underline">Terms</a> • <a href="/privacy" className="hover:underline">Privacy</a>
              </p>
            </footer>
          </>
        ) : (
          <>
            <AppLayout>{children}</AppLayout>
            <footer className="mt-10 pb-6 text-center text-sm text-gray-300">
              <p>
                © Bible Athlete • <a href="/terms" className="hover:underline">Terms</a> • <a href="/privacy" className="hover:underline">Privacy</a>
              </p>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
