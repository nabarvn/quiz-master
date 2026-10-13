import type { Game } from "@prisma/client";

import { History } from "@/components";
import { Card } from "@/components/ui";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type RecentActivityProps = {
  getRecentGames: () => Promise<Game[]>;
  getTotalGameCount: () => Promise<number>;
};

const RecentActivity = async ({
  getRecentGames,
  getTotalGameCount,
}: RecentActivityProps) => {
  const [recentGames, totalGameCount] = await Promise.all([
    getRecentGames(),
    getTotalGameCount(),
  ]);

  return (
    <Card className="col-span-4 lg:col-span-3 h-[315px] md:h-[630px] lg:h-[500px] xl:h-[583px]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>

        <CardDescription>
          {`You have played a total of ${totalGameCount} ${
            totalGameCount === 1 ? "quiz" : "quizzes"
          }.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative overflow-y-auto h-[205px] md:h-[515px] lg:h-[384px] xl:h-[470px] thin-scrollbar-thumb-gray thin-scrollbar-thumb-rounded thin-scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch pb-6 px-4 md:px-6">
        {totalGameCount !== 0 ? (
          <History games={recentGames} />
        ) : (
          <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-center">
            Nothing to display yet.
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
