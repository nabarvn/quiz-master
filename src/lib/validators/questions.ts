import { z } from "zod";

export const GetQuestionsValidator = z.object({
  topic: z.string(),
  type: z.enum(["mcq", "open_ended"]),
  amount: z.number().int().positive().min(1).max(10),
});

export type GetQuestionsRequest = z.infer<typeof GetQuestionsValidator>;
