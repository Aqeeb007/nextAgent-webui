import { useMutation } from "@tanstack/react-query";

import { applySession } from "../services/session";
import { login } from "../services/auth.service";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: applySession,
  });
}
