"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import { History } from "lucide-react";
import { useNavigationLatch } from "@/hooks/use-navigation-latch";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const AttemptHistory = () => {
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
        window.location.href = "/history";
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">History</CardTitle>
        <History size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          View all previous quiz attempts.
        </p>
      </CardContent>
    </Card>
  );
};

export default AttemptHistory;
