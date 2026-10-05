import { z } from "zod";

export const checkAnswerSchema = z.union([
  z.object({
    questionId: z.string(),
    userAnswer: z.string(),
  }),
  z.object({
    blankAnswers: z.array(z.string()).max(2),
    questionId: z.string(),
  }),
]);

export type CheckAnswerRequest = z.infer<typeof checkAnswerSchema>;
