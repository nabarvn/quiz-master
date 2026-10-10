import { differenceInSeconds } from "date-fns";
import { Hourglass } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTimeDelta } from "@/lib/utils";

type DurationCardProps = {
  durationEnd: Date | null;
  startedAt: Date;
};

const DurationCard = ({ durationEnd, startedAt }: DurationCardProps) => {
  return (
    <Card className="md:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Duration</CardTitle>
        <Hourglass size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {durationEnd
            ? formatTimeDelta(differenceInSeconds(durationEnd, startedAt))
            : "—"}
        </div>
      </CardContent>
    </Card>
  );
};

export default DurationCard;
