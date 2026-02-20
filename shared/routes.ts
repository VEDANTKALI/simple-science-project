import { z } from 'zod';
import { insertExplanationSchema, explanations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  explanations: {
    list: {
      method: 'GET' as const,
      path: '/api/explanations' as const,
      responses: {
        200: z.array(z.custom<typeof explanations.$inferSelect>()),
      },
    },
    simplify: {
      method: 'POST' as const,
      path: '/api/explanations/simplify' as const,
      input: z.object({
        text: z.string().min(1, "Please provide some text to simplify"),
      }),
      responses: {
        200: z.object({
          originalText: z.string(),
          simplifiedText: z.string()
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SimplifyInput = z.infer<typeof api.explanations.simplify.input>;
export type SimplifyResponse = z.infer<typeof api.explanations.simplify.responses[200]>;
export type ExplanationListResponse = z.infer<typeof api.explanations.list.responses[200]>;
