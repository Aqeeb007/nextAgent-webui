"use client";

import { Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMemberDialog } from "@/features/organizations/components/add-member-dialog";
import { useCurrentMembership } from "@/features/organizations/hooks/use-current-membership";
import { useMembers } from "@/features/organizations/hooks/use-members";
import type { RoleSlug } from "@/features/organizations/types/organization.types";
import { canInviteMembers } from "@/features/organizations/utils/permissions";
import type { VariantProps } from "class-variance-authority";

const ROLE_BADGE_VARIANT: Record<RoleSlug, VariantProps<typeof badgeVariants>["variant"]> = {
  owner: "success",
  admin: "warning",
  member: "secondary",
};

export default function MembersPage() {
  const { data: members, isPending, isError, refetch } = useMembers();
  const { membership: currentMembership } = useCurrentMembership();
  const canInvite = canInviteMembers(currentMembership?.role.slug);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        description="Manage who has access to this organization."
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Members" }]}
        actions={
          currentMembership &&
          (canInvite ? (
            <AddMemberDialog />
          ) : (
            <p className="text-xs text-muted-foreground">
              Only owners and admins can add members.
            </p>
          ))
        }
      />

      {isPending ? (
        <Loading label="Loading members…" />
      ) : isError ? (
        <ErrorState title="Couldn't load members" onRetry={() => refetch()} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Add a teammate to this organization to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {member.firstName?.[0]?.toUpperCase()}
                        {member.lastName?.[0]?.toUpperCase()}
                      </div>
                      <span>
                        {member.firstName} {member.lastName}
                        {member.userId === currentMembership?.userId && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE_VARIANT[member.role.slug]}>
                      {member.role.name}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
