import type { ReactNode } from "react";

import { MobileNav, Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileNav />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] overflow-hidden"
        >
          <div className="absolute top-[-220px] left-1/4 size-[420px] rounded-full bg-primary/15 blur-[110px]" />
          <div className="absolute top-[-160px] right-1/4 size-[360px] rounded-full bg-live/10 blur-[110px]" />
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
