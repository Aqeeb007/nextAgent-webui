"use client";

import { Building2, Users } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentOrganization } from "@/features/organizations/hooks/use-current-organization";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    data: organization,
    isPending,
    isError,
    refetch,
  } = useCurrentOrganization();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your organization settings and configuration."
        actions={
          <Link
            href="/settings/members"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Users className="size-4" />
            Users
          </Link>
        }
      />

      {isPending ? (
        <Loading label="Loading organization…" />
      ) : isError ? (
        <ErrorState title="Couldn't load organization" onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </div>
              <p className="text-sm font-medium text-foreground">Organization identity</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Name
                </span>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                  {organization?.name ?? "—"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Organization ID
                </span>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
                  {organization?.id ?? "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
