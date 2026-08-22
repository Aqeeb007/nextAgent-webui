import { Bot } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Agent } from "@/features/agents/types/agent.types";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
