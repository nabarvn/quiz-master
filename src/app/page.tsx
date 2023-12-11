import Link from "next/link";
import { SignInButton } from "@/components";
import { Heading, Paragraph } from "@/components/ui";

import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Balancer from "react-wrap-balancer";

export default async function Home() {
  const session = await getAuthSession();

  if (session) {
    // user is logged in
    return redirect("/dashboard");
  }

  return (
    <main className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
      <div className='flex flex-col items-center gap-6 w-[300px] md:w-[500px] lg:w-[700px] xl:w-[900px] mt-10'>
        <div className='flex max-w-fit items-center justify-center rounded-full border border-slate-200 dark:border-slate-500 bg-white/75 dark:bg-slate-900 shadow-md backdrop-blur transition-all hover:border-slate-300 dark:hover:border-slate-700 px-5 py-1'>
          <Link
            target='_blank'
            referrerPolicy='no-referrer'
            href='https://github.com/nabarvn/quiz-master'
            className='text-xs font-semibold text-slate-900 dark:text-slate-100'
          >
            Star on GitHub 🌟
          </Link>
        </div>

        <Heading
          size='lg'
          className='text-center text-slate-900 dark:text-slate-100'
        >
          <Balancer ratio={0.5}>
            Unleash Your Inner Genius with Quiz Master.
          </Balancer>
        </Heading>

        <Paragraph className='text-center text-slate-900 dark:text-slate-100'>
          <Balancer ratio={0.5}>
            Test your knowledge and have fun with AI-powered quizzes.
          </Balancer>
        </Paragraph>

        <SignInButton text='Get Started' />
      </div>
    </main>
  );
}
