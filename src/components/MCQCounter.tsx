"use client";

import { Card } from "@/components/ui";
import { CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

type MCQCounterProps = {
  correctAnswers: number;
  wrongAnswers: number;
};

const MCQCounter = ({ correctAnswers, wrongAnswers }: MCQCounterProps) => {
  return (
    <Card className='flex flex-row items-center justify-center p-2'>
      <CheckCircle2 color='green' size={30} />
      <span className='text-2xl text-[green] mx-3'>{correctAnswers}</span>

      <Separator orientation='vertical' />

      <span className='text-2xl text-[red] mx-3'>{wrongAnswers}</span>
      <XCircle color='red' size={30} />
    </Card>
  );
};

export default MCQCounter;
