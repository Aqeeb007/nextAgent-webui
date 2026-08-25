import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="flex flex-col gap-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-muted-foreground/50">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
