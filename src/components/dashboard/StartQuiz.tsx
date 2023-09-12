"use client";

import { useRouter } from "next/navigation";
import { BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const StartQuiz = () => {
  const router = useRouter();

  return (
    <Card
      className='hover:cursor-pointer hover:opacity-75'
      onClick={() => router.push("/quiz")}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl font-bold'>Start Quiz!</CardTitle>
        <BrainCircuit size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <p className='text-sm text-muted-foreground'>
          Challenge yourself to a quiz with a topic of your choice.
        </p>
      </CardContent>
    </Card>
  );
};

export default StartQuiz;
