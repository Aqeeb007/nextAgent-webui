import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          404
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
      </div>

      <Link href="/" className={cn(buttonVariants(), "h-10 px-6")}>
        Back to home
      </Link>
    </div>
  );
}
