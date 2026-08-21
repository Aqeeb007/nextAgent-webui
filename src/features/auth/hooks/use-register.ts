import { useMutation } from "@tanstack/react-query";

import { applySession } from "../services/session";
import { register } from "../services/auth.service";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess: applySession,
  });
}
