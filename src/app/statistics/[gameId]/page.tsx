import Link from "next/link";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/Button";
import { LucideLayoutDashboard } from "lucide-react";

import {
  AccuracyCard,
  DurationCard,
  QuestionsList,
  ResultsCard,
} from "@/components/statistics";

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

  const game = await db.game.findUnique({
    where: { id: gameId },
    include: { questions: true },
  });

  if (!game) {
    return redirect("/quiz");
  }

  let accuracy: number = 0;

  if (game.gameType === "mcq") {
    let totalCorrect = game.questions.reduce((acc, question) => {
      if (question.isCorrect) {
        return acc + 1;
      }

      return acc;
    }, 0);

    accuracy = (totalCorrect / game.questions.length) * 100;
  } else if (game.gameType === "open_ended") {
    let totalPercentage = game.questions.reduce((acc, question) => {
      return acc + (question.percentageCorrect ?? 0);
    }, 0);

    accuracy = totalPercentage / game.questions.length;
  }

  accuracy = Math.round(accuracy * 100) / 100;

  return (
    <main className='mx-auto max-w-7xl p-8'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>Summary</h2>

        <div className='flex items-center space-x-2'>
          <Link
            href='/dashboard'
            className={cn(buttonVariants({ size: "sm" }), "text-base")}
          >
            <LucideLayoutDashboard className='w-4 h-4 mr-2' />
            Dashboard
          </Link>
        </div>
      </div>

      <div className='grid gap-4 mt-4 md:grid-cols-7'>
        <ResultsCard accuracy={accuracy} />

        <AccuracyCard accuracy={accuracy} />

        <DurationCard
          timeEnded={new Date(game.timeEnded ?? 0)}
          timeStarted={new Date(game.timeStarted ?? 0)}
        />
      </div>

      <QuestionsList questions={game.questions} />
    </main>
  );
};

export default StatisticsPage;
