import { Bot, MessagesSquare, ToolCase } from "lucide-react";

import { Logomark } from "@/components/layout/Sidebar";
import { AuthCard } from "@/features/auth/components/auth-card";

const highlights = [
  { icon: Bot, text: "Combine a model and a system prompt into an agent" },
  { icon: ToolCase, text: "Attach tools so agents can call your APIs" },
  { icon: MessagesSquare, text: "Chat in real time, with live tool-call status" },
];

export default function AuthPage() {
  return (
    <div className="flex min-h-svh w-full bg-background">
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden border-r border-border bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute top-[-160px] left-[-100px] size-[480px] rounded-full bg-primary/25 blur-[130px]" />
          <div className="absolute bottom-[-140px] right-[-80px] size-[380px] rounded-full bg-live/10 blur-[120px]" />
        </div>

        <div className="flex items-center gap-2.5">
          <Logomark />
          <span className="text-[15px] font-semibold tracking-tight">NexAgent</span>
        </div>

        <div className="flex flex-col gap-8">
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
            Build agents your team can actually talk to.
          </h2>
          <ul className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} NexAgent</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex items-center gap-2.5 lg:hidden">
          <Logomark />
          <span className="text-[15px] font-semibold tracking-tight">NexAgent</span>
        </div>
        <AuthCard />
      </div>
    </div>
  );
}
