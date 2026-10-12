"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { differenceInSeconds } from "date-fns";
import { Game, Question } from "@prisma/client";
import { cn, formatTimeDelta } from "@/lib/utils";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { LatchLink, MCQCounter } from "@/components";

import {
  firstUnansweredIndex,
  isAttemptFinished,
  markAttemptEnded,
  useActiveGame,
} from "@/hooks/use-active-game";

import { CheckAnswerRequest } from "@/lib/validators/answer";
import { GameCompletionRequest } from "@/lib/validators/game";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart, Check, ChevronRight, Loader2, Timer } from "lucide-react";

type MCQProps = {
  game: Game & {
    questions: Pick<
      Question,
      "id" | "stem" | "options" | "answeredAt" | "isCorrect"
    >[];
  };
};

type McqStats = {
  correctAnswers: number;
  wrongAnswers: number;
};

const MCQ = ({ game }: MCQProps) => {
  const [questionIndex, setQuestionIndex] = useState(() =>
    firstUnansweredIndex(game.questions),
  );

  const [hasEndedLocally, setHasEndedLocally] = useState(() =>
    isAttemptFinished(game.questions),
  );

  const [stats, setStats] = useState<McqStats>(() => ({
    correctAnswers: game.questions.filter(
      (question) => question.isCorrect === true,
    ).length,
    wrongAnswers: game.questions.filter(
      (question) => question.isCorrect === false,
    ).length,
  }));

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

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];

    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);

  const [selectedChoice, setSelectedChoice] = useState<number>(-1);

  const { mutate: checkAnswer, isLoading: isChecking } = useMutation({
    mutationFn: async () => {
      if (selectedChoice === -1) {
        toast({
          title: "Please Make a Choice",
          description: "Ensure you select an option before proceeding.",
          variant: "default",
        });

        return { isCorrect: null };
      }

      const payload: CheckAnswerRequest = {
        questionId: currentQuestion.id,
        userAnswer: options[selectedChoice],
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
      questionIndex === game.questions.length - 1 && selectedChoice !== -1
        ? new Date()
        : null;

    if (submittedAt) setStoppedAt(submittedAt);

    checkAnswer(undefined, {
      onSuccess: async ({ isCorrect }: { isCorrect: boolean | null }) => {
        if (isCorrect === null) {
          if (submittedAt) {
            setStoppedAt(null);
            setTimeNow(new Date());
          }

          return;
        }

        if (isCorrect) {
          setStats((prev) => ({
            ...prev,
            correctAnswers: prev.correctAnswers + 1,
          }));

          toast({
            title: "Correct",
            description: "You got it right!",
            variant: "success",
          });
        } else {
          setStats((prev) => ({
            ...prev,
            wrongAnswers: prev.wrongAnswers + 1,
          }));

          toast({
            title: "Incorrect",
            description: "You got it wrong!",
            variant: "destructive",
          });
        }

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
        setSelectedChoice(-1);
        router.refresh();
      },
      onError: () => {
        if (submittedAt) {
          setStoppedAt(null);
          setTimeNow(new Date());
        }

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
    selectedChoice,
    toast,
  ]);

  const isLocked = isChecking || isEnding || hasEnded;

  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLocked) return;
      const key = event.key;

      if (key >= "1" && key <= "4") {
        const index = Number(key) - 1;
        const button = buttonRefs.current[index];

        if (!button || button.disabled) return;

        setSelectedChoice(index);
        button.focus();
      } else if (key === "Enter") {
        if (!nextButtonRef.current || nextButtonRef.current.disabled) return;
        buttonRefs.current.forEach((button) => button?.blur());
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
        <div className="font-semibold text-white bg-green-500 rounded-md whitespace-nowrap px-4 py-2 mt-2">
          You Completed in&nbsp;
          {elapsed}
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl lg:max-w-5xl w-[90vw] md:w-[80vw] mt-10 lg:mt-5">
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

          <MCQCounter
            correctAnswers={stats.correctAnswers}
            wrongAnswers={stats.wrongAnswers}
          />
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

        <div className="flex flex-col items-center justify-center w-full mt-4 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-w-full gap-2">
            {options.map((option, index) => {
              return (
                <Button
                  key={index}
                  disabled={isLocked}
                  ref={(el) => (buttonRefs.current[index] = el)} // assign ref to each button
                  className="justify-start w-full border-slate-900 dark:border-slate-300 py-8"
                  onClick={() => setSelectedChoice(index)}
                  variant={selectedChoice === index ? "default" : "outline"}
                >
                  <div className="flex items-center justify-start">
                    <div
                      className={
                        selectedChoice === index
                          ? "border border-slate-300 dark:border-slate-900 rounded-md w-10 shrink-0 p-2 px-3 mr-5"
                          : "border border-slate-900 dark:border-slate-300 rounded-md w-10 shrink-0 p-2 px-3 mr-5"
                      }
                    >
                      {index + 1}
                    </div>

                    <div className="text-start self-start">{option}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          <Button
            ref={nextButtonRef}
            size="default"
            variant="default"
            className="mt-4"
            onClick={() => {
              handleNext();
            }}
            disabled={isLocked}
          >
            {(isChecking || isEnding) && selectedChoice !== -1 && (
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

export default MCQ;
