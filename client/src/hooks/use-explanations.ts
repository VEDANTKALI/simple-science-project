import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SimplifyInput } from "@shared/routes";
import { z } from "zod";

export function useExplanations() {
  return useQuery({
    queryKey: [api.explanations.list.path],
    queryFn: async () => {
      const res = await fetch(api.explanations.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      // Validate with Zod schema
      return api.explanations.list.responses[200].parse(await res.json());
    },
  });
}

export function useSimplify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SimplifyInput) => {
      // Runtime validation of input before sending
      const validatedInput = api.explanations.simplify.input.parse(data);

      const res = await fetch(api.explanations.simplify.path, {
        method: api.explanations.simplify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      });

      if (!res.ok) {
        // Try to parse error from backend if available
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 400) {
          throw new Error(errorData.message || "Invalid input provided.");
        }
        if (res.status === 500) {
          throw new Error(errorData.message || "Something went wrong on our end.");
        }
        throw new Error("Failed to simplify text");
      }

      return api.explanations.simplify.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate the history list so the new item appears immediately
      queryClient.invalidateQueries({ queryKey: [api.explanations.list.path] });
    },
  });
}
