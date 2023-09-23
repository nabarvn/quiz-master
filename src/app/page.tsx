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
      <div className='flex flex-col items-center lg:items-start gap-6 w-[300px] md:w-[500px] lg:w-[700px] xl:w-[900px] mt-10'>
        <Heading
          size='lg'
          className='text-center lg:text-left text-slate-900 dark:text-slate-100'
        >
          <Balancer ratio={0.5}>
            Unleash Your Inner Genius with Quiz Master.
          </Balancer>
        </Heading>

        <Paragraph className='text-center lg:text-left text-slate-900 dark:text-slate-100'>
          <Balancer ratio={0.5}>
            Test your knowledge and have fun with AI-powered quizzes.
          </Balancer>
        </Paragraph>

        <SignInButton text='Get Started' />
      </div>
    </main>
  );
}
