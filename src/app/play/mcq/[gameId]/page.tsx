import { db } from "@/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { LatchLink, MCQ } from "@/components";
import { isGameCompleted } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "MCQ Game | Quiz Master",
};

type MCQPageProps = {
  params: {
    gameId: string;
  };
};

const MultipleChoiceQuizPage = async ({ params: { gameId } }: MCQPageProps) => {
  const session = await getAuthSession();

  if (!session?.user) return redirect("/");

  const game = await db.game.findFirst({
    where: {
      id: gameId,
      userId: session.user.id,
    },
    include: {
      questions: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
        select: {
          id: true,
          stem: true,
          options: true,
          answeredAt: true,
          isCorrect: true,
        },
      },
    },
  });

  if (!game || isGameCompleted(game)) {
    return redirect("/quiz");
  }

  return (
    <main className="relative mx-auto h-full max-w-7xl">
      {game.questions[0] ? (
        <MCQ game={game} />
      ) : (
        <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] lg:w-[270px] -mt-20">
          <CardHeader>
            <CardTitle>GPT Response Error</CardTitle>

            <CardDescription>
              Please construct the quiz again with another topic.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LatchLink className={buttonVariants()} href="/quiz">
              Retry
            </LatchLink>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default MultipleChoiceQuizPage;
