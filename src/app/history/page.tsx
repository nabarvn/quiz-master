import { db } from "@/lib/db";
import { Metadata } from "next";
import { History } from "@/components";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { DashboardButton } from "@/components/buttons";
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
    <main className="relative mx-auto min-h-screen max-w-7xl">
      <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[340px] md:w-[390px] lg:w-[500px] -mt-14 lg:-mt-7 xl:-mt-14">
        <Card className="border-none shadow-none bg-slate-50 dark:bg-slate-900">
          <CardHeader className="px-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">History</CardTitle>
              <DashboardButton />
            </div>
          </CardHeader>

          <CardContent className="relative overflow-y-auto border-2 rounded-sm h-[400px] bg-white dark:bg-slate-950 thin-scrollbar-thumb-gray thin-scrollbar-thumb-rounded thin-scrollbar-track-gray-lighter scrollbar-w-2 scrolling-touch pb-6 px-4 md:px-6">
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
              <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-center">
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
