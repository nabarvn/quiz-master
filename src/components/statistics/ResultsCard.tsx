import { Award, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type ResultsCardProps = { accuracy: number };

const ResultsCard = ({ accuracy }: ResultsCardProps) => {
  return (
    <Card className='md:col-span-7'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-7'>
        <CardTitle className='text-xl font-bold'>Results</CardTitle>
        <Award size={21} strokeWidth={2.5} />
      </CardHeader>

      <CardContent className='flex flex-col items-center justify-center h-3/5'>
        {accuracy > 75 ? (
          <>
            <Trophy className='mr-4' stroke='gold' size={50} />

            <div className='flex flex-col text-2xl font-semibold text-yellow-500'>
              <span>Impressive!</span>

              <span className='text-sm text-center text-slate-700 dark:text-slate-300'>
                &gt; 75% accuracy
              </span>
            </div>
          </>
        ) : accuracy > 25 ? (
          <>
            <Trophy className='mr-4' stroke='silver' size={50} />

            <div className='flex flex-col text-2xl font-semibold text-stone-500'>
              <span>Good job!</span>
              <span className='text-sm text-center text-slate-700 dark:text-slate-300'>
                &gt; 25% accuracy
              </span>
            </div>
          </>
        ) : (
          <>
            <Trophy className='mr-4' stroke='brown' size={50} />

            <div className='flex flex-col text-2xl font-semibold text-amber-700'>
              <span>Nice try!</span>
              <span className='text-sm text-center text-slate-700 dark:text-slate-300'>
                &lt; 25% accuracy
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsCard;
