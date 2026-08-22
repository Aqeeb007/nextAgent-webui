import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { HttpToolMethod } from "@/features/tools/types/tool.types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const METHOD_VARIANTS: Record<HttpToolMethod, BadgeVariant> = {
  GET: "outline",
  POST: "success",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "destructive",
};

export function MethodBadge({ method }: { method: HttpToolMethod }) {
  return (
    <Badge variant={METHOD_VARIANTS[method]} className="font-mono">
      {method}
    </Badge>
  );
}
