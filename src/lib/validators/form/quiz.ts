import { z } from "zod";

export const QuizConstructorValidator = z.object({
  topic: z
    .string()
    .min(4, { message: "Topic must be atleast 4 characters long" })
    .max(50),
  type: z.enum(["mcq", "open_ended"]),
  amount: z.number().min(1).max(10),
});

export type QuizConstructorInput = z.infer<typeof QuizConstructorValidator>;
