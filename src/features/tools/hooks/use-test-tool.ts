import { useMutation } from "@tanstack/react-query";

import { testTool } from "../services/tool.service";
import type { TestToolPayload } from "../types/tool.types";

export function useTestTool() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TestToolPayload }) =>
      testTool(id, payload),
  });
}
