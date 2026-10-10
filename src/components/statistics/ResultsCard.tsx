import { cn } from "@/lib/utils";
import { Award, Trophy } from "lucide-react";
import type { QuizSummary } from "@/lib/quiz-statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type ResultsCardProps = {
  summary: QuizSummary;
};

type ResultTier = {
  minimumScore: number;
  message: string;
  colorClassName: string;
};

const INCOMPLETE_COLOR_CLASS_NAME = "text-slate-500";

const RESULT_TIERS: ResultTier[] = [
  {
    minimumScore: 90,
    message: "Impressive!",
    colorClassName: "text-yellow-500",
  },
  {
    minimumScore: 75,
    message: "Good job!",
    colorClassName: "text-stone-500",
  },
  {
    minimumScore: 50,
    message: "Nice try!",
    colorClassName: "text-amber-600",
  },
  {
    minimumScore: 0,
    message: "Keep practicing!",
    colorClassName: "text-slate-500",
  },
];

const ResultsCard = ({ summary }: ResultsCardProps) => {
  const { gameType, isCompleted, scorePercentage } = summary;
  const metricLabel = gameType === "mcq" ? "score" : "similarity";

  const selectedTierIndex = isCompleted
    ? RESULT_TIERS.findIndex(
        ({ minimumScore }) => scorePercentage >= minimumScore,
      )
    : -1;

  const selectedTier = RESULT_TIERS[selectedTierIndex];
  const resultMessage = selectedTier?.message ?? "Incomplete";

  const colorClassName =
    selectedTier?.colorClassName ?? INCOMPLETE_COLOR_CLASS_NAME;

  let resultDetail = "Quiz not finished";

  if (selectedTier) {
    const isLowestTier = selectedTierIndex === RESULT_TIERS.length - 1;

    resultDetail = isLowestTier
      ? `< ${RESULT_TIERS[selectedTierIndex - 1].minimumScore}% ${metricLabel}`
      : `≥ ${selectedTier.minimumScore}% ${metricLabel}`;
  }

  return (
    <Card className="md:col-span-7">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-xl font-bold">Results</CardTitle>
        <Award size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent
        className={cn(
          "flex flex-col items-center justify-center h-3/5",
          colorClassName,
        )}
      >
        <Trophy className="mr-4" size={50} />

        <div className="flex flex-col text-2xl font-semibold">
          <span>{resultMessage}</span>

          <span className="text-sm text-center text-slate-700 dark:text-slate-300">
            {resultDetail}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsCard;
