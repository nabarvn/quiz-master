import { Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { QuizSummary } from "@/lib/quiz-statistics";

type MetricCardProps = {
  summary: QuizSummary;
};

const MetricCard = ({ summary }: MetricCardProps) => {
  const {
    answeredCount,
    correctCount,
    gameType,
    isCompleted,
    scorePercentage,
    totalQuestions,
  } = summary;

  const metricDetails: string[] = [];

  if (gameType === "mcq") {
    metricDetails.push(`${correctCount}/${totalQuestions} correct`);

    if (!isCompleted) {
      metricDetails.push(`${answeredCount}/${totalQuestions} answered`);
    }
  } else {
    metricDetails.push(`${answeredCount}/${totalQuestions} attempted`);
  }

  return (
    <Card className="md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {gameType === "mcq" ? "Score" : "Average Similarity"}
        </CardTitle>

        <Target size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {scorePercentage}%
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {metricDetails.join(" · ")}
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
