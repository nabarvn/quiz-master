"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import Balancer from "react-wrap-balancer";
import { BrainCircuit } from "lucide-react";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const StartQuiz = () => {
  const { isDisabled, onClick: handleNavigationClick } = useNavigationLatch();

  return (
    <Card
      aria-disabled={isDisabled}
      className={cn("hover:cursor-pointer hover:opacity-75", {
        "pointer-events-none opacity-50": isDisabled,
      })}
      onClick={(event) => {
        handleNavigationClick(event);
        if (event.defaultPrevented) return;
        window.location.href = "/quiz";
      }}
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
};

export default StartQuiz;
