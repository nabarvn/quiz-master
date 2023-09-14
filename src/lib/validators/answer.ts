import { z } from "zod";

export const CheckAnswerValidator = z.object({
  userInput: z.string(),
  questionId: z.string(),
});

export type CheckAnswerRequest = z.infer<typeof CheckAnswerValidator>;
