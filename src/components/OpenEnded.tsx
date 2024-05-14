"use client";

import { differenceInSeconds } from "date-fns";
import { Game, Question } from "@prisma/client";
import keyword_extractor from "keyword-extractor";
import { cn, formatTimeDelta } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/Button";

import {
  BarChart,
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useHydrated } from "react-hydration-provider";
import { CheckAnswerRequest } from "@/lib/validators/answer";
import { GameActionRequest } from "@/lib/validators/game-action";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

type OpenEndedProps = {
  game: Game & { questions: Pick<Question, "id" | "question" | "answer">[] };
};

const OpenEnded = ({ game }: OpenEndedProps) => {
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [blankAnswer, setBlankAnswer] = useState<string>("");
  const [averagePercentage, setAveragePercentage] = useState<number>(0);

  const { toast } = useToast();
  const hydrated = useHydrated();
  const [timeNow, setTimeNow] = useState<Date>(new Date());

  const currentQuestion = useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: GameActionRequest = {
        gameId: game.id,
      };

      const response = await axios.post(`/api/endGame`, payload);

      return response.data;
    },
  });

  const { mutate: checkAnswer, isLoading: isChecking } = useMutation({
    mutationFn: async () => {
      let filledAnswer = blankAnswer;

      document.querySelectorAll("#user-blank-input").forEach((input) => {
        if (input instanceof HTMLInputElement) {
          filledAnswer = !input.value
            ? filledAnswer.replace("_____", "[unanswered]")
            : filledAnswer.replace("_____", input.value);

          input.value = "";
        }
      });

      const payload: CheckAnswerRequest = {
        questionId: currentQuestion.id,
        userInput: filledAnswer,
      };

      const response = await axios.post(`/api/checkAnswer`, payload);

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
      onSuccess: ({ percentageSimilar }) => {
        toast({
          title: `Your answer is ${percentageSimilar}% similar to the correct answer.`,
        });

        setAveragePercentage((prev) => {
          return (prev + percentageSimilar) / (questionIndex + 1);
        });

        if (questionIndex === game.questions.length - 1) {
          endGame();
          setHasEnded(true);
          return;
        }

        setQuestionIndex((prev) => prev + 1);
      },
      onError: (error) => {
        console.error(error);

        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      },
    });
  }, [checkAnswer, questionIndex, toast, endGame, game.questions.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "Enter") {
        game.timeEnded.toUTCString() === game.timeStarted.toUTCString() &&
          handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [game.timeEnded, game.timeStarted, handleNext]);

  const blank = "_____";

  const keywords = useMemo(() => {
    const words = keyword_extractor.extract(currentQuestion?.answer, {
      language: "english",
      remove_digits: true,
      return_changed_case: false,
      remove_duplicates: false,
    });

    // mix the keywords and pick 2
    const shuffled = words.sort(() => 0.5 - Math.random());

    return shuffled.slice(0, 2);
  }, [currentQuestion?.answer]);

  const answerWithBlanks = useMemo(() => {
    const answerWithBlanks = keywords.reduce((acc, curr) => {
      return acc.replaceAll(curr, blank);
    }, currentQuestion?.answer);

    setBlankAnswer(answerWithBlanks);

    return answerWithBlanks;
  }, [currentQuestion?.answer, keywords, setBlankAnswer]);

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 -mt-20">
        <div className="font-semibold text-white bg-green-700 rounded-md whitespace-nowrap px-4 py-2 mt-2">
          You Completed in{" "}
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl w-[90vw] md:w-[80vw] -mt-10">
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

          <Card className="flex flex-row items-center h-fit mt-[26px] md:mt-0 p-2">
            <Target size={30} />

            <span className="text-2xl opacity-75 ml-3">
              {averagePercentage.toFixed(2)}
            </span>

            <Percent size={25} />
          </Card>
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

        <div className="flex flex-col items-center justify-center w-full mt-4">
          <div className="flex justify-start w-full mt-4">
            <h1 className="text-xl font-semibold">
              {/* replace the blanks with input elements */}
              {answerWithBlanks?.split(blank).map((part, index) => {
                return (
                  <Fragment key={index}>
                    {part}

                    {index === answerWithBlanks.split(blank).length - 1 ? (
                      ""
                    ) : (
                      <input
                        id="user-blank-input"
                        disabled={isChecking}
                        className="text-center border-b-2 border-black dark:border-white w-28 focus:border-2 focus:border-b-4 focus:outline-none"
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
            disabled={
              isChecking ||
              hasEnded ||
              game.timeEnded.toUTCString() !== game.timeStarted.toUTCString()
            }
            onClick={() => {
              handleNext();
            }}
          >
            {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  );
};

export default OpenEnded;
