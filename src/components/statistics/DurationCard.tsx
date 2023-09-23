import { formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import { Hourglass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type DurationCardProps = {
  timeEnded: Date;
  timeStarted: Date;
};

const DurationCard = ({ timeEnded, timeStarted }: DurationCardProps) => {
  return (
    <Card className='md:col-span-4'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl font-bold'>Time Taken</CardTitle>
        <Hourglass size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <div className='text-sm font-medium'>
          {timeEnded.toUTCString() === timeStarted.toUTCString()
            ? "Quiz game has not been completed."
            : formatTimeDelta(differenceInSeconds(timeEnded, timeStarted))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DurationCard;
