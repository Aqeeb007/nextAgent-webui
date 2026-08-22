export interface Organization {
  id: string;
  name: string;
}

export type OrganizationMemberRole = "admin" | "member";

// The GET response's `role` is an object ({id, name, slug}), confirmed against
// the real API — distinct from the plain string the POST payload takes below.
export interface OrganizationRole {
  id: string;
  name: string;
  slug: OrganizationMemberRole;
}

export interface OrganizationMember {
  id: string;
  email: string;
  role: OrganizationRole;
}

export interface AddOrganizationMemberPayload {
  email: string;
  role: OrganizationMemberRole;
}
