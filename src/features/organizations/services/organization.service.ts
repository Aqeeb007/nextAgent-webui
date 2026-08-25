import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

import type {
  AddOrganizationMemberPayload,
  AddOrganizationMemberResult,
  CreateOrganizationPayload,
  Organization,
  OrganizationMember,
} from "../types/organization.types";

export async function listOrganizations() {
  const { data } = await apiClient.get<Organization[]>(
    endpoints.organizations.list
  );
  return data;
}

export async function createOrganization(payload: CreateOrganizationPayload) {
  const { data } = await apiClient.post<Organization>(
    endpoints.organizations.list,
    payload
  );
  return data;
}

export async function getCurrentOrganization() {
  const { data } = await apiClient.get<Organization>(
    endpoints.organizations.current
  );
  return data;
}

export async function listMembers() {
  const { data } = await apiClient.get<OrganizationMember[]>(
    endpoints.organizations.members
  );
  return data;
}

export async function addMember(payload: AddOrganizationMemberPayload) {
  const { data } = await apiClient.post<AddOrganizationMemberResult>(
    endpoints.organizations.members,
    payload
  );
  return data;
}
