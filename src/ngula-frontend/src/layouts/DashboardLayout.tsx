import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { DashboardHeader } from '@/components/DashboardHeader';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Mobile navigation drawer state, lifted here so both the TopBar (hamburger)
  // and the Sidebar (drawer + overlay) can share it.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)]">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
