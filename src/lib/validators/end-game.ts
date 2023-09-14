import { z } from "zod";

export const EndGameValidator = z.object({
  gameId: z.string(),
});

export type EndGameRequest = z.infer<typeof EndGameValidator>;
