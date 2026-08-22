"use client";

import { Users } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization settings and configuration.
          </p>
        </div>
        <Link
          href="/settings/members"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Users className="size-4" />
          Users
        </Link>
      </div>

      {isPending ? (
        <Loading label="Loading organization…" />
      ) : isError ? (
        <ErrorState title="Couldn't load organization" onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Organization identity
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="org-name">Name</Label>
                <Input
                  id="org-name"
                  value={organization?.name ?? ""}
                  readOnly
                  className="bg-muted/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="org-id">Organization ID</Label>
                <Input
                  id="org-id"
                  value={organization?.id ?? ""}
                  readOnly
                  className="bg-muted/30 font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
