'use client';

import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import Providers from './providers';
import { SearchInput } from './search';
import { ModeToggle } from '@/components/theme/mode';
import DesktopNav from '@/components/nav/DesktopNav';
import MobileNav from '@/components/nav/MobileNav';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-gradient-to-b from-[#FFFBFB] to-[#FAFAFF] dark:from-[#1A1A1A] dark:to-[#141414]">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <DesktopNav />
        <div className="flex flex-col sm:gap-4 sm:pt-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            {/* <DashboardBreadcrumb /> */}
            <SearchInput />
            <User />
            <ModeToggle />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-[#141414] dark:to-[#1A1A1A]">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}
