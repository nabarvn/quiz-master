import Link from "next/link";
import { cn } from "@/lib/utils";
import { Game } from "@prisma/client";
import { Clock, CopyCheck, Edit2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

type HistoryProps = {
  games?: Game[];
  getGames?: () => Promise<Game[]>;
};

const History = async ({ games = [], getGames }: HistoryProps) => {
  if (getGames) {
    games = await getGames();
  }

  return (
    <div className='space-y-8 mt-5'>
      {games.map((game) => {
        return (
          <div key={game.id} className='flex items-center justify-between'>
            <div className='flex items-center'>
              {game.gameType === "mcq" ? (
                <CopyCheck className='mr-3' />
              ) : (
                <Edit2 className='mr-3' />
              )}

              <div className='space-y-1 ml-4'>
                <Link
                  href={`/statistics/${game.id}`}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "text-base underline leading-none p-0"
                  )}
                >
                  {game.topic}
                </Link>

                <p className='flex items-center text-xs text-white rounded-lg w-fit bg-slate-800 px-2 py-1'>
                  <Clock className='w-4 h-4 mr-1' />
                  {new Date(game.timeStarted ?? 0).toLocaleDateString()}
                </p>

                <p className='text-sm text-muted-foreground'>
                  {game.gameType === "mcq" ? "Multiple Choice" : "Open-Ended"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default History;
