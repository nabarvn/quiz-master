import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  return (
    <main className='mx-auto max-w-7xl p-8'>
      <div className='flex items-center'>
        <h2 className='text-2xl font-bold tracking-tight mr-2'>Dashboard</h2>
      </div>

      <div className='grid gap-4 md:grid-cols-2 mt-4'>
        <StartQuiz />
        <AttemptHistory />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4'>
        <HotTopics />
        <RecentActivity />
      </div>
    </main>
  );
};

export default DashboardPage;