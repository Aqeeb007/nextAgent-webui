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
  tools: {
    list: "/tools",
    detail: (id: string) => `/tools/${id}`,
    test: (id: string) => `/tools/${id}/test`,
  },
} as const;
