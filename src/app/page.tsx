import { Bot, MessagesSquare, ToolCase } from "lucide-react";
import Link from "next/link";

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
    <div className="flex min-h-svh w-full flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-lg font-semibold tracking-tight">NexAgent</span>
        <Link href="/auth" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-16 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Build agents your team can actually talk to.
          </h1>
          <p className="max-w-lg text-balance text-muted-foreground sm:text-lg">
            Configure AI agents, give them tools to call, and chat with them — all in one place.
          </p>
          <Link href="/auth" className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
            Get started
          </Link>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
