import { z } from "zod";

const requiredInProduction: z.RefinementEffect<
  string | undefined
>["refinement"] = (value, ctx) => {
  if (process.env.NODE_ENV === "production" && !value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Missing required environment variable " + ctx.path.join("."),
    });
  }
};

const envSchema = z.object({
  // A token to increase the rate limiting from 60/hr to 1000/hr
  GITHUB_TOKEN: z.string().optional().superRefine(requiredInProduction),
  NO_CACHE: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
