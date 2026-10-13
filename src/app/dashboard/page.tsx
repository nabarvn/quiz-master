import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Balancer from "react-wrap-balancer";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

import {
  AttemptHistory,
  HotTopics,
  RecentActivity,
  StartQuiz,
} from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Quiz Master",
};

const DashboardPage = async () => {
  const session = await getAuthSession();

  if (!session) {
    // user is not logged in
    return redirect("/");
  }

  const getRecentGames = () =>
    db.game.findMany({
      take: 10,
      where: {
        userId: session.user.id,
      },
      orderBy: {
        timeStarted: "desc",
      },
    });

  const getTotalGameCount = () =>
    db.game.count({
      where: {
        userId: session.user.id,
      },
    });

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold tracking-tight w-full">
          <Balancer ratio={0.5}>
            Welcome to your quiz dashboard, {session.user.name?.split(" ")[0]}.
            🔥
          </Balancer>
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <StartQuiz />
        <AttemptHistory />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <HotTopics />

        <RecentActivity
          getRecentGames={getRecentGames}
          getTotalGameCount={getTotalGameCount}
        />
      </div>
    </main>
  );
};

export default DashboardPage;
