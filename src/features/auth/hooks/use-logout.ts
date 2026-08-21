import { useMutation } from "@tanstack/react-query";

import { getRefreshToken } from "@/lib/storage/refresh-token";

import { logout } from "../services/auth.service";
import { clearAuthSession } from "../services/session";

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logout(refreshToken);
      }
    },
    // Always clear the local session, even if the request fails (offline,
    // backend down, token already invalid) — logout shouldn't get stuck.
    onSettled: clearAuthSession,
  });
}
