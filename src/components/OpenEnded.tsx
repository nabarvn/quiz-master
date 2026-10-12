"use client";

import { useRouter } from "next/navigation";
import { differenceInSeconds } from "date-fns";
import { Game, Question } from "@prisma/client";
import { Button, buttonVariants } from "@/components/ui/Button";

import { createCloze } from "@/lib/cloze";
import { cn, formatTimeDelta } from "@/lib/utils";

import {
  BarChart,
  Check,
  ChevronRight,
  Loader2,
  Percent,
  Target,
  Timer,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

import axios from "axios";
import { LatchLink } from "@/components";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

import {
  firstUnansweredIndex,
  isAttemptFinished,
  markAttemptEnded,
  useActiveGame,
} from "@/hooks/use-active-game";

import { CheckAnswerRequest } from "@/lib/validators/answer";
import { GameCompletionRequest } from "@/lib/validators/game";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

type OpenEndedProps = {
  game: Game & {
    questions: Pick<
      Question,
      "id" | "stem" | "correctAnswer" | "answeredAt" | "similarity"
    >[];
  };
};

const OpenEnded = ({ game }: OpenEndedProps) => {
  const [questionIndex, setQuestionIndex] = useState(() =>
    firstUnansweredIndex(game.questions),
  );

  const [hasEndedLocally, setHasEndedLocally] = useState(() =>
    isAttemptFinished(game.questions),
  );

  const [averageSimilarity, setAverageSimilarity] = useState(() => {
    const answered = game.questions.filter(
      (question) => question.similarity !== null,
    );

    if (answered.length === 0) return 0;

    return (
      answered.reduce(
        (total, question) => total + (question.similarity ?? 0),
        0,
      ) / answered.length
    );
  });

  const router = useRouter();
  const { toast } = useToast();

  const { hydrated, isBlockedInAnotherTab, hasEndedInTab, endedAt } =
    useActiveGame(game.id, game.questions);

  const hasEnded = hasEndedLocally || hasEndedInTab;
  const [timeNow, setTimeNow] = useState<Date>(new Date());
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (hasEnded || stoppedAt) return;

    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasEnded, stoppedAt]);

  const currentQuestion = useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const cloze = useMemo(
    () => createCloze(currentQuestion.correctAnswer, currentQuestion.id),
    [currentQuestion.correctAnswer, currentQuestion.id],
  );

  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);

  useEffect(() => {
    setBlankAnswers(Array(cloze.expectedAnswers.length).fill(""));
  }, [cloze.expectedAnswers.length, currentQuestion.id]);

  const { mutate: checkAnswer, isLoading: isChecking } = useMutation({
    mutationFn: async () => {
      const payload: CheckAnswerRequest = {
        blankAnswers,
        questionId: currentQuestion.id,
      };

      const response = await axios.post(`/api/check-answer`, payload);

      return response.data;
    },
  });

  const { mutateAsync: endGame, isLoading: isEnding } = useMutation({
    mutationFn: async (timeEnded: Date) => {
      const payload: GameCompletionRequest = {
        gameId: game.id,
        timeEnded,
      };

      const response = await axios.post(`/api/end-game`, payload);

      return response.data;
    },
  });

  const handleNext = useCallback(() => {
    if (isChecking || isEnding) return;

    const submittedAt =
      questionIndex === game.questions.length - 1 ? new Date() : null;

    if (submittedAt) setStoppedAt(submittedAt);

    checkAnswer(undefined, {
      onSuccess: async ({ similarity }: { similarity: number | null }) => {
        if (similarity !== null) {
          toast({
            title: "Similarity Check",
            description: `Your answer is ${similarity}% similar to the correct answer.`,
            variant: "default",
          });
        }

        setAverageSimilarity((prev) => {
          return (
            (prev * questionIndex + (similarity ?? 0)) / (questionIndex + 1)
          );
        });

        if (submittedAt) {
          try {
            await endGame(submittedAt);
            markAttemptEnded(game.id, submittedAt);
            setHasEndedLocally(true);
          } catch {
            setStoppedAt(null);
            setTimeNow(new Date());

            toast({
              title: "Could not finish the quiz",
              description: "Please try again.",
              variant: "destructive",
            });
          }

          return;
        }

        setQuestionIndex((prev) => prev + 1);
        router.refresh();
      },
      onError: (error) => {
        if (submittedAt) {
          setStoppedAt(null);
          setTimeNow(new Date());
        }

        console.error(error);

        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      },
    });
  }, [
    checkAnswer,
    endGame,
    game.id,
    game.questions.length,
    isChecking,
    isEnding,
    questionIndex,
    router,
    toast,
  ]);

  const isLocked = isChecking || isEnding || hasEnded;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLocked) return;
      const key = event.key;

      if (key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, isLocked]);

  const isLastQuestion = questionIndex === game.questions.length - 1;

  const elapsed = formatTimeDelta(
    differenceInSeconds(endedAt ?? stoppedAt ?? timeNow, game.timeStarted),
  );

  if (hasEnded) {
    return (
      <div className="mx-auto flex h-full min-h-full w-fit flex-col justify-center">
        <div className="font-semibold text-white bg-green-700 rounded-md whitespace-nowrap px-4 py-2 mt-2">
          You Completed in {elapsed}
        </div>

        <LatchLink
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </LatchLink>
      </div>
    );
  }

  if (hydrated && isBlockedInAnotherTab) return null;

  return (
    hydrated && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl lg:max-w-5xl w-[90vw] md:w-[80vw] -mt-10">
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-col">
            {/* topic */}
            <div className="flex flex-col md:flex-row space-y-0.5 md:space-x-2">
              <p className="text-slate-400 md:self-center">Topic</p>

              <p className="text-white dark:text-slate-300 rounded-lg bg-slate-700 dark:bg-slate-950 px-2 py-1">
                {game.topic}
              </p>
            </div>

            <div className="flex self-start text-slate-400 mt-3">
              <Timer className="mr-2" />
              {elapsed}
            </div>
          </div>

          <Card className="flex flex-row items-center h-fit mt-[26px] md:mt-0 p-2">
            <Target size={30} />

            <span className="text-2xl opacity-75 ml-3">
              {averageSimilarity.toFixed(2)}
            </span>

            <Percent size={25} />
          </Card>
        </div>

        <Card className="w-full text-slate-700 dark:text-slate-300 mt-4">
          <CardHeader className="flex flex-row items-center space-y-0">
            <CardTitle className="text-center divide-y divide-slate-900 dark:divide-slate-300 mr-5">
              <div>{questionIndex + 1}</div>
              <div className="text-base">{game.questions.length}</div>
            </CardTitle>

            <CardDescription className="flex-grow text-lg text-slate-700 dark:text-slate-300">
              {currentQuestion?.stem}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col items-center justify-center w-full mt-4">
          <div
            key={currentQuestion.id}
            className="flex justify-start w-full mt-4"
          >
            <h1 className="text-xl font-semibold">
              {cloze.parts.map((part, index) => {
                return (
                  <Fragment key={index}>
                    {part}

                    {index === cloze.parts.length - 1 ? (
                      ""
                    ) : (
                      <input
                        disabled={isLocked}
                        value={blankAnswers[index] ?? ""}
                        onChange={(event) => {
                          setBlankAnswers((answers) =>
                            answers.map((answer, answerIndex) =>
                              answerIndex === index
                                ? event.target.value
                                : answer,
                            ),
                          );
                        }}
                        className="text-center border-b-2 border-black dark:border-white w-28 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        type="text"
                      />
                    )}
                  </Fragment>
                );
              })}
            </h1>
          </div>

          <Button
            size="default"
            variant="default"
            className="mt-4"
            disabled={isLocked}
            onClick={() => {
              handleNext();
            }}
          >
            {(isChecking || isEnding) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isLastQuestion ? "Finish" : "Next"}
            {isLastQuestion ? (
              <Check className="w-4 h-4 ml-2" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    )
  );
};

export default OpenEnded;
