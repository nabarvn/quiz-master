"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrated } from "react-hydration-provider";

const ACTIVE_GAME_KEY = "activeGameId";
const ENDED_GAME_KEY = "endedGameId";
const ENDED_AT_KEY = "endedGameAt";

type AnsweredQuestion = {
  answeredAt: Date | string | null;
};

export function firstUnansweredIndex(questions: AnsweredQuestion[]) {
  const index = questions.findIndex((question) => !question.answeredAt);
  return index === -1 ? Math.max(questions.length - 1, 0) : index;
}

export function isAttemptFinished(questions: AnsweredQuestion[]) {
  return (
    questions.length > 0 && questions.every((question) => question.answeredAt)
  );
}

export function markAttemptEnded(gameId: string, endedAt: Date) {
  sessionStorage.setItem(ENDED_GAME_KEY, gameId);
  sessionStorage.setItem(ENDED_AT_KEY, String(endedAt.getTime()));
  sessionStorage.removeItem(ACTIVE_GAME_KEY);
}

export function useActiveGame(gameId: string, questions: AnsweredQuestion[]) {
  const router = useRouter();
  const hydrated = useHydrated();

  const hasProgress = questions.some((question) => question.answeredAt);

  const hasEndedInTab =
    hydrated && sessionStorage.getItem(ENDED_GAME_KEY) === gameId;

  const endedAt = hasEndedInTab
    ? new Date(Number(sessionStorage.getItem(ENDED_AT_KEY)))
    : null;

  const isBlockedInAnotherTab =
    hydrated &&
    hasProgress &&
    sessionStorage.getItem(ACTIVE_GAME_KEY) !== gameId;

  useEffect(() => {
    if (!hydrated || hasEndedInTab) return;
    if (sessionStorage.getItem(ACTIVE_GAME_KEY) === gameId) return;

    if (hasProgress) {
      router.replace(`/statistics/${gameId}`);
      return;
    }

    sessionStorage.setItem(ACTIVE_GAME_KEY, gameId);
  }, [gameId, hasEndedInTab, hasProgress, hydrated, router]);

  return { hydrated, isBlockedInAnotherTab, hasEndedInTab, endedAt };
}
