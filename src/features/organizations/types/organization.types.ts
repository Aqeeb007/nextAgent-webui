export interface Organization {
  id: string;
  name: string;
}

export interface CreateOrganizationPayload {
  name: string;
}

// All roles a membership can hold. "owner" only ever arrives via GET
// (org-members list) — AddMemberDto excludes it from the invite payload to
// close off a privilege-escalation path, so it's never something the client
// sends. See InvitableRole below.
export type RoleSlug = "owner" | "admin" | "member";

// The subset invitable through POST /organizations/members.
export type InvitableRole = Exclude<RoleSlug, "owner">;

// The GET response's `role` is an object ({id, name, slug}), confirmed against
// the real API — distinct from the plain string the POST payload takes below.
export interface OrganizationRole {
  id: string;
  name: string;
  slug: RoleSlug;
}

// GET /organizations/members response shape (joined against users + roles —
// see organization-members.service.ts's listMembers).
export interface OrganizationMember {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: OrganizationRole;
  joinedAt: string;
}

export interface AddOrganizationMemberPayload {
  email: string;
  role: InvitableRole;
}

// POST /organizations/members returns the raw membership row (id,
// organizationId, userId, roleId) — not the joined shape listMembers returns.
export interface AddOrganizationMemberResult {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
}
