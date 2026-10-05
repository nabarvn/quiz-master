import { z } from "zod";

export const gameActionSchema = z.object({
  gameId: z.string(),
});

export const gameCompletionSchema = gameActionSchema.extend({
  timeEnded: z.coerce.date(),
});

export type GameActionRequest = z.infer<typeof gameActionSchema>;
export type GameCompletionRequest = z.infer<typeof gameCompletionSchema>;
