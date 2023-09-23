import React from "react";

import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type AccuracyCardProps = { accuracy: number };

const AccuracyCard = ({ accuracy }: AccuracyCardProps) => {
  accuracy = Math.round(accuracy * 100) / 100;

  return (
    <Card className='md:col-span-3'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xl font-bold'>Average Accuracy</CardTitle>
        <Target size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent>
        <div className='text-sm font-medium'>{accuracy.toString() + "%"}</div>
      </CardContent>
    </Card>
  );
};

export default AccuracyCard;
