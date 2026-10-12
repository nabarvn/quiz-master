"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Separator } from "@/components/ui";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

import {
  QUESTION_COUNT,
  QuizRequest,
  quizRequestSchema,
} from "@/lib/validators/quiz";

import {
  QUIZ_GENERATION_ERROR_CODE,
  QUIZ_GENERATION_ERROR_MESSAGE,
  QUIZ_GENERATION_ERROR_STATUS,
} from "@/lib/quiz-error";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CopyCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useTransition } from "react";

type CreateQuizProps = {
  topicParam: string;
};

const LOADING_MESSAGES = [
  "Generating questions...",
  "Still working...",
  "Hang tight...",
] as const;

const LOADING_MESSAGE_INTERVAL_MS = 10_000;

const CreateQuiz = ({ topicParam }: CreateQuizProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isNavigating, startTransition] = useTransition();

  const { mutate: startGame, isLoading } = useMutation({
    mutationFn: async ({ topic, gameType, questionCount }: QuizRequest) => {
      const response = await axios.post("/api/start-game", {
        topic: topic.toLowerCase(),
        gameType,
        questionCount,
      });

      return response.data;
    },
  });

  const isStarting = isLoading || isNavigating;

  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((step) => Math.min(step + 1, LOADING_MESSAGES.length - 1));
    }, LOADING_MESSAGE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLoading]);

  const form = useForm<QuizRequest>({
    resolver: zodResolver(quizRequestSchema),
    defaultValues: {
      topic: topicParam,
      gameType: "mcq",
      questionCount: QUESTION_COUNT.min,
    },
  });

  const onSubmit = async (data: QuizRequest) => {
    startGame(data, {
      onError: (error) => {
        if (
          axios.isAxiosError<{ code?: string }>(error) &&
          error.response?.status === QUIZ_GENERATION_ERROR_STATUS &&
          error.response.data?.code === QUIZ_GENERATION_ERROR_CODE
        ) {
          toast({
            title: "Quiz not ready",
            description: QUIZ_GENERATION_ERROR_MESSAGE,
            variant: "destructive",
          });

          return;
        }

        toast({
          title: "Error",
          description: "Something went wrong, please try again later.",
          variant: "destructive",
        });
      },
      onSuccess: ({ gameId }: { gameId: string }) => {
        startTransition(() => {
          if (form.getValues("gameType") === "mcq") {
            router.push(`/play/mcq/${gameId}`);
          } else if (form.getValues("gameType") === "open_ended") {
            router.push(`/play/open-ended/${gameId}`);
          }
        });
      },
    });
  };

  form.watch();

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[390px] lg:w-[750px] -mt-6 lg:-mt-2 xl:-mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quiz Constructor</CardTitle>

          <CardDescription>
            Curate your personalized knowledge test.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <FormField
                  name="topic"
                  control={form.control}
                  disabled={isStarting}
                  render={({ field }) => (
                    <FormItem className="relative lg:w-1/2">
                      <FormLabel>Topic</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter a topic..."
                          className="text-base"
                        />
                      </FormControl>

                      <FormDescription>
                        Please provide a quiz topic of your choice.
                      </FormDescription>

                      <FormMessage className="absolute -bottom-5" />
                    </FormItem>
                  )}
                />

                <FormField
                  name="questionCount"
                  control={form.control}
                  disabled={isStarting}
                  render={({ field }) => (
                    <FormItem className="relative lg:w-5/12">
                      <FormLabel>Number of Questions</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="How many questions?"
                          className="text-base"
                          min={QUESTION_COUNT.min}
                          max={QUESTION_COUNT.max}
                          onChange={(e) => {
                            form.setValue(
                              "questionCount",
                              parseInt(e.target.value),
                            );
                          }}
                        />
                      </FormControl>

                      <FormDescription>
                        Select the count of quiz questions to be set.
                      </FormDescription>

                      <FormMessage className="absolute -bottom-5" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <Button
                    size="icon"
                    type="button"
                    disabled={isStarting}
                    variant={
                      form.getValues("gameType") === "mcq"
                        ? "default"
                        : "secondary"
                    }
                    onClick={() => {
                      form.setValue("gameType", "mcq");
                    }}
                    className="w-1/2 rounded-none rounded-l-lg text-xs md:text-sm"
                  >
                    <CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
                  </Button>

                  <Separator orientation="vertical" />

                  <Button
                    size="icon"
                    type="button"
                    disabled={isStarting}
                    variant={
                      form.getValues("gameType") === "open_ended"
                        ? "default"
                        : "secondary"
                    }
                    onClick={() => form.setValue("gameType", "open_ended")}
                    className="w-1/2 rounded-none rounded-r-lg text-xs md:text-sm"
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> Open-Ended
                  </Button>
                </div>

                <div className="text-[0.8rem] text-muted-foreground">
                  Choose your preference of question format.
                </div>
              </div>

              <Button
                type="submit"
                disabled={isStarting}
                isLoading={isStarting}
                className="text-xs md:text-sm"
              >
                {isStarting ? LOADING_MESSAGES[loadingStep] : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuiz;
