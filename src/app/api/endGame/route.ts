import { db } from "@/lib/db";
import { ZodError } from "zod";
import { EndGameValidator } from "@/lib/validators/end-game";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "You must be logged in." }), {
        status: 401,
      });
    }

    const body = await req.json();

    const { gameId } = EndGameValidator.parse(body);

    const game = await db.game.findUnique({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      return new Response(JSON.stringify({ message: "Game not found" }), {
        status: 404,
      });
    }

    await db.game.update({
      where: {
        id: gameId,
      },
      data: {
        timeEnded: new Date(),
      },
    });

    return new Response(JSON.stringify({ message: "Game ended" }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: error.issues }), {
        status: 400,
      });
    } else {
      return new Response(JSON.stringify({ error: "Something went wrong." }), {
        status: 500,
      });
    }
  }
}
