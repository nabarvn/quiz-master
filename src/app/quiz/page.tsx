import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateQuiz } from "@/components";

export const metadata: Metadata = {
  title: "Quiz Constructor | Quiz Master",
};

type QuizPageProps = {
  searchParams: {
    topic?: string;
  };
};

const QuizPage = async ({ searchParams }: QuizPageProps) => {
  const session = await getAuthSession();

  if (!session) {
    // user is not logged in
    return redirect("/");
  }

  return (
    <main className='relative mx-auto min-h-screen max-w-7xl'>
      <CreateQuiz topicParam={searchParams.topic ?? ""} />
    </main>
  );
};

export default QuizPage;
