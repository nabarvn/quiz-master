import type { Game, Question } from "@prisma/client";
import { isGameCompleted } from "@/lib/utils";

type SummaryGame = Pick<Game, "gameType" | "timeEnded" | "timeStarted"> & {
  questions: Pick<Question, "answeredAt" | "isCorrect" | "similarity">[];
};

export type QuizSummary = {
  answeredCount: number;
  isCompleted: boolean;
  correctCount: number | null;
  durationEnd: Date | null;
  gameType: Game["gameType"];
  scorePercentage: number;
  totalQuestions: number;
};

export function getQuizSummary(game: SummaryGame): QuizSummary {
  const { gameType, questions, timeEnded } = game;

  const totalQuestions = questions.length;
  const isCompleted = isGameCompleted(game);

  const lastAnsweredAt = questions.reduce<Date | null>(
    (latest, { answeredAt }) =>
      answeredAt && (!latest || answeredAt > latest) ? answeredAt : latest,
    null,
  );

  const answeredCount = questions.filter(
    ({ isCorrect, similarity }) => isCorrect !== null || similarity !== null,
  ).length;

  const correctCount =
    gameType === "mcq"
      ? questions.filter(({ isCorrect }) => isCorrect).length
      : null;

  const earnedPoints =
    correctCount ??
    questions.reduce((sum, { similarity }) => sum + (similarity ?? 0) / 100, 0);

  return {
    answeredCount,
    isCompleted,
    correctCount,
    durationEnd: isCompleted ? timeEnded : lastAnsweredAt,
    gameType,
    scorePercentage: totalQuestions
      ? Math.round((earnedPoints / totalQuestions) * 100)
      : 0,
    totalQuestions,
  };
}
