import { db } from "@/lib/db";
import { ZodError } from "zod";
import { getAuthSession } from "@/lib/auth";
import { isGameCompleted } from "@/lib/utils";
import { checkAnswerSchema } from "@/lib/validators/answer";

import {
  createCloze,
  scoreClozeAnswers,
  serializeBlankAnswers,
} from "@/lib/cloze";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: "You must be logged in." }), {
        status: 401,
      });
    }

    const body = await req.json();

    const submission = checkAnswerSchema.parse(body);
    const { questionId } = submission;

    const question = await db.question.findFirst({
      where: {
        id: questionId,
        game: {
          userId: session.user.id,
        },
      },
      include: {
        game: {
          select: {
            gameType: true,
            timeEnded: true,
            timeStarted: true,
          },
        },
      },
    });

    if (!question) {
      return new Response(JSON.stringify({ message: "Question not found" }), {
        status: 404,
      });
    }

    if (isGameCompleted(question.game)) {
      return new Response(JSON.stringify({ message: "Game already ended" }), {
        status: 409,
      });
    }

    if (question.game.gameType === "mcq") {
      if (!("userAnswer" in submission)) {
        return new Response(JSON.stringify({ message: "Invalid answer" }), {
          status: 400,
        });
      }

      const { userAnswer } = submission;

      const isCorrect =
        question.correctAnswer.toLowerCase().trim() ===
        userAnswer.toLowerCase().trim();

      await db.question.update({
        where: { id: questionId },
        data: { isCorrect, userAnswer, answeredAt: new Date() },
      });

      return new Response(JSON.stringify({ isCorrect }), {
        status: 200,
      });
    } else {
      if (!("blankAnswers" in submission)) {
        return new Response(JSON.stringify({ message: "Invalid answer" }), {
          status: 400,
        });
      }

      const { expectedAnswers } = createCloze(
        question.correctAnswer,
        question.id,
      );

      const blankAnswers = submission.blankAnswers.map((answer) =>
        answer.trim(),
      );

      if (blankAnswers.length !== expectedAnswers.length) {
        return new Response(JSON.stringify({ message: "Invalid answer" }), {
          status: 400,
        });
      }

      const isUnanswered = blankAnswers.every((answer) => !answer);

      if (isUnanswered) {
        await db.question.update({
          where: { id: questionId },
          data: {
            answeredAt: new Date(),
            similarity: null,
            userAnswer: null,
          },
        });

        return new Response(JSON.stringify({ similarity: null }), {
          status: 200,
        });
      }

      const similarity = scoreClozeAnswers(expectedAnswers, blankAnswers);

      await db.question.update({
        where: { id: questionId },
        data: {
          similarity,
          userAnswer: serializeBlankAnswers(blankAnswers),
          answeredAt: new Date(),
        },
      });

      return new Response(JSON.stringify({ similarity }), {
        status: 200,
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ message: error.issues }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
