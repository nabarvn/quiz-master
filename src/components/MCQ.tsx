"use client";

import axios from "axios";
import Link from "next/link";
import { differenceInSeconds } from "date-fns";
import { Game, Question } from "@prisma/client";
import { cn, formatTimeDelta } from "@/lib/utils";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

import { MCQCounter } from "@/components";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useHydrated } from "react-hydration-provider";
import { CheckAnswerRequest } from "@/lib/validators/answer";
import { Button, buttonVariants } from "@/components/ui/Button";
import { GameActionRequest } from "@/lib/validators/game-action";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MCQProps = {
  game: Game & {
    questions: Pick<Question, "id" | "question" | "options">[];
  };
};

type StatsProps = {
  correctAnswers: number;
  wrongAnswers: number;
};

const MCQ = ({ game }: MCQProps) => {
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [hasEnded, setHasEnded] = useState<boolean>(false);

  const [stats, setStats] = useState<StatsProps>({
    correctAnswers: 0,
    wrongAnswers: 0,
  });

  const { toast } = useToast();
  const hydrated = useHydrated();
  const [timeNow, setTimeNow] = useState<Date>(new Date());
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number>(-1);

  const currentQuestion = useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const options = useMemo(() => {
    if (!currentQuestion) return [];

    if (!currentQuestion.options) return [];

    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);

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
        userInput: options[selectedChoice],
      };

      const response = await axios.post(`/api/checkAnswer`, payload);

      return response.data;
    },
  });

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: GameActionRequest = {
        gameId: game.id,
      };

      const response = await axios.post(`/api/endGame`, payload);

      return response.data;
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setTimeNow(new Date());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasEnded]);

  const handleNext = useCallback(() => {
    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }: { isCorrect: boolean | null }) => {
        if (isCorrect === null) return;

        if (isCorrect) {
          setStats((stats) => ({
            ...stats,
            correctAnswers: stats.correctAnswers + 1,
          }));

          toast({
            title: "Correct",
            description: "You got it right!",
            variant: "success",
          });
        } else {
          setStats((stats) => ({
            ...stats,
            wrongAnswers: stats.wrongAnswers + 1,
          }));

          toast({
            title: "Incorrect",
            description: "You got it wrong!",
            variant: "destructive",
          });
        }

        if (questionIndex === game.questions.length - 1) {
          endGame();
          setHasEnded(true);
          return;
        }

        setQuestionIndex((questionIndex) => questionIndex + 1);
        setSelectedChoice(-1);
      },
    });
  }, [checkAnswer, questionIndex, game.questions.length, toast, endGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "1") {
        setSelectedChoice(0);
        buttonFocus(0);
      } else if (key === "2") {
        setSelectedChoice(1);
        buttonFocus(1);
      } else if (key === "3") {
        setSelectedChoice(2);
        buttonFocus(2);
      } else if (key === "4") {
        setSelectedChoice(3);
        buttonFocus(3);
      } else if (key === "Enter") {
        if (buttonRefs) {
          buttonRefs.current.some((buttonRef) => buttonRef?.blur());
        }

        game.timeEnded.toUTCString() === game.timeStarted.toUTCString() &&
          handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [game.timeEnded, game.timeStarted, handleNext]);

  const buttonFocus = (index: number) => {
    const buttonRef = buttonRefs.current[index];

    if (buttonRef) {
      buttonRef.focus();
    }
  };

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 -mt-20">
        <div className="font-semibold text-white bg-green-500 rounded-md whitespace-nowrap px-4 py-2 mt-2">
          You Completed in&nbsp;
          {formatTimeDelta(differenceInSeconds(timeNow, game.timeStarted))}
        </div>

        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    hydrated && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl w-[90vw] md:w-[80vw] mt-5 lg:mt-10 xl:mt-5">
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

              {game.timeEnded.toUTCString() === game.timeStarted.toUTCString()
                ? formatTimeDelta(
                    differenceInSeconds(timeNow, game.timeStarted)
                  )
                : "Game Over"}
            </div>
          </div>

          <MCQCounter
            correctAnswers={stats.correctAnswers}
            wrongAnswers={stats.wrongAnswers}
          />
        </div>

        <Card className="w-full text-slate-700 dark:text-slate-300 mt-4">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-center divide-y divide-slate-900 dark:divide-slate-300 mr-5">
              <div>{questionIndex + 1}</div>
              <div className="text-base">{game.questions.length}</div>
            </CardTitle>

            <CardDescription className="flex-grow text-lg text-slate-700 dark:text-slate-300">
              {currentQuestion?.question}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col items-center justify-center w-full mt-4 mb-10">
          {options.map((option, index) => {
            return (
              <Button
                key={index}
                disabled={isChecking}
                ref={(el) => (buttonRefs.current[index] = el)} // assign ref to each button
                className="justify-start w-full border-slate-900 dark:border-slate-300 py-8 mb-4"
                onClick={() => setSelectedChoice(index)}
                variant={selectedChoice === index ? "default" : "outline"}
              >
                <div className="flex items-center justify-start">
                  <div
                    className={
                      selectedChoice === index
                        ? "border border-slate-300 dark:border-slate-900 rounded-md w-10 p-2 px-3 mr-5"
                        : "border border-slate-900 dark:border-slate-300 rounded-md w-10 p-2 px-3 mr-5"
                    }
                  >
                    {index + 1}
                  </div>

                  <div className="text-start">{option}</div>
                </div>
              </Button>
            );
          })}

          <Button
            size="default"
            variant="default"
            className="mt-2"
            onClick={() => {
              handleNext();
            }}
            disabled={
              isChecking ||
              hasEnded ||
              game.timeEnded.toUTCString() !== game.timeStarted.toUTCString()
            }
          >
            {isChecking && selectedChoice !== -1 && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  );
};

export default MCQ;
