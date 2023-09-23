import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { History } from "@/components";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { LucideLayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "History | Quiz Master",
};

const HistoryPage = async () => {
  const session = await getAuthSession();

  if (!session?.user) {
    return redirect("/");
  }

  const gamesCount = await db.game.count({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <main className='relative mx-auto min-h-screen max-w-7xl'>
      <div className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[340px] md:w-[390px] lg:w-[500px] -mt-14'>
        <Card className='border-none shadow-none bg-slate-50 dark:bg-slate-900'>
          <CardHeader className='px-0'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl font-bold'>History</CardTitle>

              <Link
                href='/dashboard'
                className={cn(buttonVariants({ size: "sm" }), "text-base")}
              >
                <LucideLayoutDashboard className='w-4 h-4 mr-2' />
                Dashboard
              </Link>
            </div>
          </CardHeader>

          <CardContent className='relative overflow-y-auto border-2 rounded-sm h-[400px] bg-white dark:bg-slate-950 lg:scrollbar-thin lg:scrollbar-thumb-slate-300 lg:dark:scrollbar-thumb-slate-500 lg:scrollbar-thumb-rounded-sm'>
            {gamesCount !== 0 ? (
              <History
                getGames={async () => {
                  return await db.game.findMany({
                    take: 100,
                    where: {
                      userId: session.user.id,
                    },
                    orderBy: {
                      timeStarted: "desc",
                    },
                  });
                }}
              />
            ) : (
              <span className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
                Nothing to display yet.
              </span>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default HistoryPage;
