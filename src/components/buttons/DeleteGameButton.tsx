"use client";

import axios from "axios";
import { Game } from "@prisma/client";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { GameActionRequest } from "@/lib/validators/game-action";

type DeleteGameButtonProps = {
  game: Game;
};

const DeleteGameButton = ({ game }: DeleteGameButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: deleteGame, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const payload: GameActionRequest = {
        gameId: game.id,
      };

      const response = await axios.post(`/api/deleteGame`, payload);

      return response.data;
    },

    onSuccess: ({ isGameDeleted }) => {
      if (isGameDeleted) {
        toast({
          title: "Deleted",
          description: "Game deleted successfully!",
          variant: "success",
        });

        router.refresh();
      } else {
        toast({
          title: "Deletion Error",
          description: "There was an error. Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isDeleting}
      onClick={() => deleteGame()}
      className="rounded-lg self-end"
    >
      {isDeleting ? (
        <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" />
      ) : (
        <Trash2 className="w-3 md:w-4 h-3 md:h-4 shrink-0" />
      )}
    </Button>
  );
};

export default DeleteGameButton;
