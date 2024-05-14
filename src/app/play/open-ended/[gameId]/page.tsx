import Link from "next/link";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { OpenEnded } from "@/components";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/Button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Open-Ended Game | Quiz Master",
};

type OpenEndedQuizPageProps = {
  params: {
    gameId: string;
  };
};

const OpenEndedQuizPage = async ({
  params: { gameId },
}: OpenEndedQuizPageProps) => {
  const session = await getAuthSession();

  if (!session?.user) return redirect("/");

  const game = await db.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          answer: true,
        },
      },
    },
  });

  if (
    !game ||
    game.timeEnded.toUTCString() !== game.timeStarted.toUTCString()
  ) {
    return redirect("/quiz");
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-7xl">
      {game.questions[0] ? (
        <OpenEnded game={game} />
      ) : (
        <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] lg:w-[270px] -mt-20">
          <CardHeader>
            <CardTitle>GPT Response Error</CardTitle>

            <CardDescription>
              Please construct the quiz again with another topic.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Link className={buttonVariants()} href="/quiz">
              Retry
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default OpenEndedQuizPage;
