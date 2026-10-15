import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardButton } from "@/components/buttons";

import {
  MetricCard,
  DurationCard,
  QuestionsList,
  ResultsCard,
} from "@/components/statistics";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { getQuizSummary } from "@/lib/quiz-statistics";

export const metadata: Metadata = {
  title: "Statistics | Quiz Master",
};

type StatisticsPageProps = {
  params: {
    gameId: string;
  };
};

const StatisticsPage = async ({ params: { gameId } }: StatisticsPageProps) => {
  const session = await getAuthSession();

  if (!session?.user) {
    return redirect("/");
  }

  const game = await db.game.findFirst({
    where: {
      id: gameId,
      userId: session.user.id,
    },
    include: {
      questions: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!game) {
    return redirect("/quiz");
  }

  const summary = getQuizSummary(game);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Summary</h2>

        <div className="flex items-center space-x-2">
          <DashboardButton />
        </div>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-7">
        <ResultsCard summary={summary} />
        <MetricCard summary={summary} />

        <DurationCard
          durationEnd={summary.durationEnd}
          startedAt={game.timeStarted}
        />
      </div>

      <QuestionsList gameType={game.gameType} questions={game.questions} />
    </main>
  );
};

export default StatisticsPage;
