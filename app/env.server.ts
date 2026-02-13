import { z } from "zod";

const envSchema = z.object({
  // A token to increase the rate limiting from 60/hr to 1000/hr.
  // Optional: build succeeds without it; resources use YAML-only data when absent or invalid.
  GITHUB_TOKEN: z.string().optional(),
  NO_CACHE: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
