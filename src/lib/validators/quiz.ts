import { z } from "zod";

export const QUESTION_COUNT = {
  min: 3,
  max: 10,
} as const;

export const questionCountSchema = z
  .number()
  .int()
  .min(QUESTION_COUNT.min)
  .max(QUESTION_COUNT.max);

export const quizRequestSchema = z.object({
  topic: z
    .string()
    .min(4, { message: "Topic must be atleast 4 characters long" })
    .max(50),
  gameType: z.enum(["mcq", "open_ended"]),
  questionCount: questionCountSchema,
});

export type QuizRequest = z.infer<typeof quizRequestSchema>;
