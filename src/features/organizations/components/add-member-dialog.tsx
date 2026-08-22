"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddMember } from "@/features/organizations/hooks/use-add-member";
import type { InvitableRole } from "@/features/organizations/types/organization.types";
import { getErrorMessage } from "@/lib/api/error";

const ROLE_LABELS: Record<InvitableRole, string> = {
  member: "Member",
  admin: "Admin",
};

export function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<InvitableRole>("member");
  const { mutate, isPending, error, reset } = useAddMember();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setRole("member");
      reset();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    mutate(
      { email: String(formData.get("email")), role },
      { onSuccess: () => handleOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <UserPlus className="size-4" />
            Add member
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Invite someone to this organization by email.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-member-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              name="email"
              type="email"
              placeholder="teammate@company.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as InvitableRole)}
            >
              <SelectTrigger id="member-role" className="w-full">
                <SelectValue placeholder="Select a role">
                  {(value: InvitableRole) => ROLE_LABELS[value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{ROLE_LABELS.member}</SelectItem>
                <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-member-form" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Adding…" : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
