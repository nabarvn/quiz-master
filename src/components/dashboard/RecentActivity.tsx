import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { Game } from "@prisma/client";
import { History } from "@/components";
import { Card } from "@/components/ui";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type RecentActivityProps = {
  getGames: () => Promise<Game[]>;
  getGamesCount: () => Promise<number>;
};

const RecentActivity = async ({
  getGames,
  getGamesCount,
}: RecentActivityProps) => {
  const session = await getAuthSession();

  if (!session?.user) {
    return redirect("/");
  }

  let games: Game[] = [];
  let gamesCount: number = 0;

  if (getGames) {
    games = await getGames();
  }

  if (getGamesCount) {
    gamesCount = await getGamesCount();
  }

  return (
    <Card className='col-span-4 lg:col-span-3 h-[315px] md:h-[630px] lg:h-[500px] xl:h-[583px]'>
      <CardHeader>
        <CardTitle className='text-xl font-bold'>Recent Activity</CardTitle>

        <CardDescription>
          You have played a total of {gamesCount} quizzes.
        </CardDescription>
      </CardHeader>

      <CardContent className='relative overflow-y-auto h-[205px] md:h-[520px] lg:h-[384px] xl:h-[475px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-500 scrollbar-thumb-rounded-sm'>
        {gamesCount !== 0 ? (
          <History games={games} />
        ) : (
          <span className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-center'>
            Nothing to display yet.
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
