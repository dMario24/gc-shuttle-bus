import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import { createClient } from "@/lib/supabase/server";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GSB | 기업 공동 셔틀",
  description: "기업 공동 셔틀 예약 및 관리 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let displayName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("gsb_users")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    role = profile?.role || null;
    displayName = profile?.full_name || user.email;
  }

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
        style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
      >
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <Navigation user={user} role={role} displayName={displayName} />
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
