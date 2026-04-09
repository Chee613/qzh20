import { z } from "zod";

import { isValidBirthdayPassword } from "@/lib/auth/password";

export const loginBodySchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .transform((value) => value.toLowerCase()),
  birthdayPassword: z
    .string()
    .trim()
    .refine(isValidBirthdayPassword, "Birthday password must be in YYYYMMDD format"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
