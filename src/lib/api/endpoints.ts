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
    // Multiple conversations per (agent, user) — list/create live on the
    // collection, messages are nested under a specific conversation.
    conversations: {
      list: (agentId: string) => `/agents/${agentId}/conversations`,
      detail: (agentId: string, conversationId: string) =>
        `/agents/${agentId}/conversations/${conversationId}`,
      messages: (agentId: string, conversationId: string) =>
        `/agents/${agentId}/conversations/${conversationId}/messages`,
    },
  },
} as const;
