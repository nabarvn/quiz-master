import { z } from "zod";
import axios from "axios";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { quizRequestSchema } from "@/lib/validators/quiz";

import {
  QUIZ_GENERATION_ERROR_CODE,
  QUIZ_GENERATION_ERROR_MESSAGE,
  QUIZ_GENERATION_ERROR_STATUS,
} from "@/lib/quiz-error";

export const maxDuration = 300;

function shuffle<T>(values: readonly T[]) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new Response(
        JSON.stringify({
          error: "You must be logged in to create a quiz game.",
        }),
        {
          status: 401,
        },
      );
    }

    const body = await req.json();
    const { topic, gameType, questionCount } = quizRequestSchema.parse(body);

    const { data } = await axios.post(
      `${process.env.BASE_URL as string}/api/questions`,
      {
        topic,
        gameType,
        questionCount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const game = await db.game.create({
      data: {
        topic,
        gameType,
        userId: session.user.id,
      },
    });

    await db.topicCount.upsert({
      where: {
        topic,
      },
      create: {
        topic,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });

    if (gameType === "mcq") {
      type mcqQuestion = {
        stem: string;
        correctAnswer: string;
        distractors: string[];
      };

      const manyData = data.questions.map(
        (question: mcqQuestion, position: number) => {
          const options = shuffle([
            question.correctAnswer,
            ...question.distractors,
          ]);

          return {
            gameId: game.id,
            position,
            stem: question.stem,
            correctAnswer: question.correctAnswer,
            options: JSON.stringify(options),
          };
        },
      );

      await db.question.createMany({
        data: manyData,
      });
    } else if (gameType === "open_ended") {
      type openQuestion = {
        stem: string;
        correctAnswer: string;
      };

      const manyData = data.questions.map(
        (question: openQuestion, position: number) => {
          return {
            gameId: game.id,
            position,
            stem: question.stem,
            correctAnswer: question.correctAnswer,
          };
        },
      );

      await db.question.createMany({
        data: manyData,
      });
    }

    return new Response(JSON.stringify({ gameId: game.id }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues }), {
        status: 400,
      });
    } else if (
      axios.isAxiosError<{ code?: string }>(error) &&
      error.response?.status === QUIZ_GENERATION_ERROR_STATUS &&
      error.response.data?.code === QUIZ_GENERATION_ERROR_CODE
    ) {
      return new Response(
        JSON.stringify({
          code: QUIZ_GENERATION_ERROR_CODE,
          error: QUIZ_GENERATION_ERROR_MESSAGE,
        }),
        {
          status: QUIZ_GENERATION_ERROR_STATUS,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } else {
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred." }),
        {
          status: 500,
        },
      );
    }
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(
        JSON.stringify({
          error: "You must be logged in to create a quiz game.",
        }),
        {
          status: 401,
        },
      );
    }

    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");

    if (!gameId) {
      return new Response(
        JSON.stringify({ error: "You must provide a game id." }),
        {
          status: 400,
        },
      );
    }

    const game = await db.game.findFirst({
      where: {
        id: gameId,
        userId: session.user.id,
      },
      include: {
        questions: {
          orderBy: [{ position: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found." }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ game }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues }), {
        status: 400,
      });
    } else {
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred." }),
        {
          status: 500,
        },
      );
    }
  }
}
