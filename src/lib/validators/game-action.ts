import { z } from "zod";

export const GameActionValidator = z.object({
  gameId: z.string(),
});

export type GameActionRequest = z.infer<typeof GameActionValidator>;
