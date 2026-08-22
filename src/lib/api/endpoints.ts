export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  organizations: {
    list: "/organizations",
    current: "/organizations/current",
    members: "/organizations/members",
  },
} as const;
