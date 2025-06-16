import { z } from "zod";

export const generateCardCodeSchema = z.object({
  count: z.number().min(1).max(100),
  expiryDays: z.number().min(1).max(365),
  prefix: z.string().optional(),
});

export const verifyCardCodeSchema = z.object({
  cardCode: z.string().min(8),
  usedBy: z.string().optional(),
});
