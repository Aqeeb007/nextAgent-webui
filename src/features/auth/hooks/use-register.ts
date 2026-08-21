import { useMutation } from "@tanstack/react-query";

import { setRefreshToken } from "@/lib/storage/refresh-token";
import { useAuthStore } from "@/stores/auth.store";

import { register } from "../services/auth.service";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      useAuthStore.getState().setSession(data);
      setRefreshToken(data.refreshToken);
    },
  });
}
