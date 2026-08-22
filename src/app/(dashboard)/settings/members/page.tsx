"use client";

import { Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMemberDialog } from "@/features/organizations/components/add-member-dialog";
import { useMembers } from "@/features/organizations/hooks/use-members";

export default function MembersPage() {
  const { data: members, isPending, isError, refetch } = useMembers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this organization.
          </p>
        </div>
        <AddMemberDialog />
      </div>

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
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role.slug === "admin" ? "default" : "outline"}>
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
