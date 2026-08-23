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
  agents: {
    list: "/agents",
    detail: (id: string) => `/agents/${id}`,
    tools: {
      list: (agentId: string) => `/agents/${agentId}/tools`,
      detail: (agentId: string, toolId: string) => `/agents/${agentId}/tools/${toolId}`,
    },
    // One conversation per (agent, user) — GET reads history, POST sends a
    // message (auto-creating the conversation on first send), DELETE resets
    // it. Same URL for all three; the verb does the work.
    chat: (agentId: string) => `/agents/${agentId}/chat`,
  },
} as const;
