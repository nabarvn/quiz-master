import { db } from "@/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { MCQ } from "@/components";

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

  const game = await db.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  if (!game || game.gameType !== "mcq") {
    return redirect("/quiz");
  }

  return (
    <main className='relative mx-auto min-h-screen max-w-7xl'>
      <MCQ game={game} />
    </main>
  );
};

export default MultipleChoiceQuizPage;
