import { useMutation } from "@tanstack/react-query";

import { setRefreshToken } from "@/lib/storage/refresh-token";
import { useAuthStore } from "@/stores/auth.store";

import { login } from "../services/auth.service";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore.getState().setSession(data);
      setRefreshToken(data.refreshToken);
    },
  });
}
