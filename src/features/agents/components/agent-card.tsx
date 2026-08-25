import { Bot } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agent } from "@/features/agents/types/agent.types";

interface AgentCardProps {
  agent: Agent;
  style?: CSSProperties;
}

export function AgentCard({ agent, style }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`} className="fade-up-item block" style={style}>
      <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/25">
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/5 text-primary transition-colors group-hover:from-primary/30 group-hover:to-primary/10">
            <Bot className="size-4" />
          </div>
          <CardTitle className="truncate" title={agent.name}>
            {agent.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {agent.description || "No description."}
          </p>
          <Badge variant="outline" className="w-fit font-mono">
            {agent.model}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
