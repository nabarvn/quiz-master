import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateQuiz } from "@/components";

export const metadata: Metadata = {
  title: "Quiz | Quiz Master",
};

const QuizPage = async () => {
  const session = await getAuthSession();

  if (!session) {
    // user is not logged in
    return redirect("/");
  }

  return (
    <main className='mx-auto max-w-7xl'>
      <CreateQuiz />
    </main>
  );
};

export default QuizPage;
