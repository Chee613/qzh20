import { z } from "zod";

import { isValidPasskey, normalizePasskey } from "@/lib/auth/password";

export const loginBodySchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .transform((value) => value.toLowerCase()),
  passkey: z
    .string()
    .transform(normalizePasskey)
    .refine(isValidPasskey, "Passkey must be in MMDDcode format"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
