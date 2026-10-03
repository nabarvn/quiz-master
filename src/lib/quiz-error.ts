export const QUIZ_GENERATION_ERROR_CODE = "QUIZ_GENERATION_FAILED";

export const QUIZ_GENERATION_ERROR_MESSAGE =
  "Couldn't build a solid quiz for this topic. Please try again.";

export const QUIZ_GENERATION_ERROR_STATUS = 502;

export class QuizGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizGenerationError";
  }
}
