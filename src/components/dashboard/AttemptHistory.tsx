"use client";

import { Card } from "@/components/ui";
import { History } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const AttemptHistory = () => (
  <Card
    className="hover:cursor-pointer hover:opacity-75"
    onClick={() => (window.location.href = "/history")}
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

export default AttemptHistory;
