"use client";

import { Card } from "@/components/ui";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { History } from "lucide-react";
import { useRouter } from "next/navigation";

const AttemptHistory = () => {
  const router = useRouter();

  return (
    <Card
      className='hover:cursor-pointer hover:opacity-75'
      onClick={() => router.push("/history")}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl font-bold'>History</CardTitle>
        <History size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <p className='text-sm text-muted-foreground'>
          View all past quiz attempts.
        </p>
      </CardContent>
    </Card>
  );
};

export default AttemptHistory;
