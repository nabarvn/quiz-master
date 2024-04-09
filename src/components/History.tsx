import Link from "next/link";
import { cn } from "@/lib/utils";
import { Game } from "@prisma/client";
import { buttonVariants } from "@/components/ui/Button";
import { DeleteGameButton } from "@/components/buttons";
import { Clock, CopyCheck, BookOpen } from "lucide-react";

type HistoryProps = {
  games?: Game[];
  getGames?: () => Promise<Game[]>;
};

const History = async ({ games = [], getGames }: HistoryProps) => {
  if (getGames) {
    games = await getGames();
  }

  return (
    <div className="space-y-8 mt-5">
      {games.map((game) => {
        return (
          <div key={game.id} className="flex items-start justify-between gap-4">
            <div className="flex items-start">
              {game.gameType === "mcq" ? (
                <CopyCheck className="w-3 md:w-4 h-3 md:h-4 mt-2 mr-2 md:mr-3 shrink-0" />
              ) : (
                <BookOpen className="w-3 md:w-4 h-3 md:h-4 mt-2 mr-2 md:mr-3 shrink-0" />
              )}

              <div className="space-y-1 ml-2 md:ml-4">
                <Link
                  href={`/statistics/${game.id}`}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "text-base underline leading-none h-fit px-0 py-1.5"
                  )}
                >
                  {game.topic}
                </Link>

                <p className="text-xs md:text-sm text-muted-foreground">
                  {game.gameType === "mcq" ? "Multiple Choice" : "Open-Ended"}
                </p>
              </div>
            </div>

            <div className="flex space-x-1">
              <p className="flex items-center text-xs md:text-sm text-primary rounded-lg w-fit px-1 md:px-2 py-1">
                <Clock className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                {new Date(game.timeStarted ?? 0).toLocaleDateString()}
              </p>

              <DeleteGameButton game={game} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default History;
