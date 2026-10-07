import { db } from "@/lib/db";
import { ZodError } from "zod";
import { getAuthSession } from "@/lib/auth";
import { gameActionSchema } from "@/lib/validators/game";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "You must be logged in." }), {
        status: 401,
      });
    }

    const body = await req.json();

    const { gameId } = gameActionSchema.parse(body);

    const game = await db.game.findFirst({
      where: {
        id: gameId,
        userId: session.user.id,
      },
    });

    if (!game) {
      return new Response(JSON.stringify({ message: "Game not found" }), {
        status: 404,
      });
    }

    await db.game.delete({
      where: {
        id: gameId,
      },
    });

    return new Response(JSON.stringify({ isGameDeleted: true }), {
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
