"use client";

import { Card } from "@/components/ui";
import Balancer from "react-wrap-balancer";
import { BrainCircuit } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const StartQuiz = () => (
  <Card
    className="hover:cursor-pointer hover:opacity-75"
    onClick={() => (window.location.href = "/quiz")}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-bold">Start Quiz!</CardTitle>
      <BrainCircuit size={21} strokeWidth={2.5} />
    </CardHeader>

    <CardContent>
      <p className="text-sm text-muted-foreground">
        <Balancer ratio={0.5}>
          Challenge yourself to a quiz with a topic of your choice.
        </Balancer>
      </p>
    </CardContent>
  </Card>
);

export default StartQuiz;
