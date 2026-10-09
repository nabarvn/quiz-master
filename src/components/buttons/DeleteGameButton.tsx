"use client";

import axios from "axios";
import { useTransition } from "react";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { GameActionRequest } from "@/lib/validators/game";

type DeleteGameButtonProps = {
  gameId: string;
};

const DeleteGameButton = ({ gameId }: DeleteGameButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, startTransition] = useTransition();

  const { mutate: deleteGame, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const payload: GameActionRequest = {
        gameId,
      };

      const response = await axios.post(`/api/delete-game`, payload);

      return response.data;
    },

    onSuccess: ({ isGameDeleted }: { isGameDeleted: boolean }) => {
      if (isGameDeleted) {
        startTransition(() => {
          router.refresh();

          toast({
            title: "Deleted",
            description: "Game deleted successfully!",
            variant: "default",
          });
        });
      } else {
        toast({
          title: "Deletion Error",
          description: "There was an error. Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  const isBusy = isDeleting || isRefreshing;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => deleteGame()}
      disabled={isBusy}
      className="rounded-lg self-end"
    >
      {isBusy ? (
        <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" />
      ) : (
        <Trash2 className="w-3 md:w-4 h-3 md:h-4 shrink-0" />
      )}
    </Button>
  );
};

export default DeleteGameButton;
