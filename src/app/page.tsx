import { ArrowRight, Bot, MessagesSquare, ToolCase } from "lucide-react";
import Link from "next/link";

import { Logomark } from "@/components/layout/Sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Bot,
    title: "Agents",
    description: "Combine a model and a system prompt to create an agent for any job.",
  },
  {
    icon: ToolCase,
    title: "Tools",
    description: "Attach HTTP tools so agents can call your APIs mid-conversation.",
  },
  {
    icon: MessagesSquare,
    title: "Conversations",
    description:
      "Chat with your agents in real time, with live status as they think and call tools.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-svh w-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden"
      >
        <div className="absolute top-[-260px] left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-primary/20 blur-[130px]" />
        <div className="absolute top-[-120px] right-[10%] size-[280px] rounded-full bg-live/10 blur-[110px]" />
      </div>

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="flex items-center gap-2.5">
          <Logomark />
          <span className="text-lg font-semibold tracking-tight">NexAgent</span>
        </span>
        <Link href="/auth" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-16 px-6 py-16 text-center">
        <div className="fade-up-item flex flex-col items-center gap-5">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            Now in preview
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Build agents your team can actually talk to.
          </h1>
          <p className="max-w-lg text-balance text-muted-foreground sm:text-lg">
            Configure AI agents, give them tools to call, and chat with them — all in one place.
          </p>
          <Link
            href="/auth"
            className={cn(buttonVariants({ size: "lg" }), "group mt-2 h-11 gap-2 px-6 text-[15px]")}
          >
            Get started
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              style={{ animationDelay: `${index * 90}ms` }}
              className="fade-up-item group flex flex-col gap-3 rounded-xl bg-card p-5 shadow-sm ring-1 ring-foreground/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/25"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
