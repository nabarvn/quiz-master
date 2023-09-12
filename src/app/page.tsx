import { Card } from "@/components/ui";
import { SignInButton } from "@/components";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

import Balancer from "react-wrap-balancer";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getAuthSession();

  if (session) {
    // user is logged in
    return redirect("/dashboard");
  }

  return (
    <main className='flex items-center justify-between p-24'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Card className='w-[300px] md:w-[400px]'>
          <CardHeader>
            <CardTitle className='md:text-xl'>
              Welcome to Quiz Master! 🔥
            </CardTitle>

            <CardDescription>
              <Balancer ratio={0.5}>
                This platform offers an intuitive as well as user-friendly
                interface, making quizzing fun and accessible for all.
              </Balancer>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignInButton text='Sign in with Google!' />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
