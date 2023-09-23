import { db } from "@/lib/db";
import { ZodError } from "zod";
import { compareTwoStrings } from "string-similarity";
import { CheckAnswerValidator } from "@/lib/validators/answer";
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

    const { questionId, userInput } = CheckAnswerValidator.parse(body);

    const question = await db.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return new Response(JSON.stringify({ message: "Question not found" }), {
        status: 404,
      });
    }

    await db.question.update({
      where: { id: questionId },
      data: { userAnswer: userInput },
    });

    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();

      await db.question.update({
        where: { id: questionId },
        data: { isCorrect },
      });

      return new Response(JSON.stringify({ isCorrect }), {
        status: 200,
      });
    } else if (question.questionType === "open_ended") {
      let percentageSimilar = compareTwoStrings(
        question.answer.toLowerCase().trim(),
        userInput.toLowerCase().trim()
      );

      percentageSimilar = Math.round(percentageSimilar * 100);

      await db.question.update({
        where: { id: questionId },
        data: { percentageCorrect: percentageSimilar },
      });

      return new Response(JSON.stringify({ percentageSimilar }), {
        status: 200,
      });
    }

    // in case none of the `if` conditions are met, return an appropriate response
    return new Response(
      JSON.stringify({ message: "Unsupported question type" }),
      {
        status: 400,
      }
    );
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
