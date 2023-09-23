import { db } from "@/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { OpenEnded } from "@/components";

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

  if (!game || game.gameType !== "open_ended") {
    return redirect("/quiz");
  }

  return (
    <main className='relative mx-auto min-h-screen max-w-7xl'>
      <OpenEnded game={game} />
    </main>
  );
};

export default OpenEndedQuizPage;
