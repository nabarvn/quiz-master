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
  QuizConstructorInput,
  QuizConstructorValidator,
} from "@/lib/validators/quiz";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CopyCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

type CreateQuizProps = {
  topicParam: string;
};

const CreateQuiz = ({ topicParam }: CreateQuizProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { mutate: getQuestions, isLoading } = useMutation({
    mutationFn: async ({ topic, type, amount }: QuizConstructorInput) => {
      const response = await axios.post("/api/startGame", {
        topic: topic.toLowerCase(),
        type,
        amount,
      });
      return response.data;
    },
  });

  const form = useForm<QuizConstructorInput>({
    resolver: zodResolver(QuizConstructorValidator),
    defaultValues: {
      topic: topicParam,
      type: "open_ended",
      amount: 3,
    },
  });

  const onSubmit = async (data: QuizConstructorInput) => {
    getQuestions(data, {
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 500) {
            toast({
              title: "Error",
              description: "Something went wrong, please try again later.",
              variant: "destructive",
            });
          }
        }
      },
      onSuccess: ({ gameId }: { gameId: string }) => {
        setIsFetching(true);

        if (form.getValues("type") === "mcq") {
          router.push(`/play/mcq/${gameId}`);
        } else if (form.getValues("type") === "open_ended") {
          router.push(`/play/open-ended/${gameId}`);
        }

        setTimeout(() => {
          setIsFetching(false);
        }, 2000);
      },
    });
  };

  form.watch();

  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[390px] lg:w-[500px] -mt-6 lg:-mt-0 xl:-mt-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>Quiz Constructor</CardTitle>

          <CardDescription>
            Curate your personalized knowledge test.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                name='topic'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Topic</FormLabel>

                    <FormControl>
                      <Input {...field} placeholder='Enter a topic...' />
                    </FormControl>

                    <FormDescription>
                      Please provide a quiz topic of your choice.
                    </FormDescription>

                    <FormMessage className='absolute -bottom-5' />
                  </FormItem>
                )}
              />

              <FormField
                name='amount'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='How many questions?'
                        min={1}
                        max={10}
                        onChange={(e) => {
                          form.setValue("amount", parseInt(e.target.value));
                        }}
                      />
                    </FormControl>

                    <FormDescription>
                      Select the count of quiz questions to be set.
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-between'>
                <Button
                  type='button'
                  size='icon'
                  className='w-1/2 rounded-none rounded-l-lg text-xs md:text-sm'
                  variant={
                    form.getValues("type") === "mcq" ? "default" : "secondary"
                  }
                  onClick={() => {
                    form.setValue("type", "mcq");
                  }}
                >
                  <CopyCheck className='w-4 h-4 mr-2' /> Multiple Choice
                </Button>

                <Separator orientation='vertical' />

                <Button
                  type='button'
                  size='icon'
                  className='w-1/2 rounded-none rounded-r-lg text-xs md:text-sm'
                  variant={
                    form.getValues("type") === "open_ended"
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => form.setValue("type", "open_ended")}
                >
                  <BookOpen className='w-4 h-4 mr-2' /> Open-Ended
                </Button>
              </div>

              <Button
                type='submit'
                disabled={isLoading || isFetching}
                isLoading={isLoading || isFetching}
                className='text-xs md:text-sm'
              >
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuiz;
