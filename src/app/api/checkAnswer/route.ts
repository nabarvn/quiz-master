import { db } from "@/lib/db";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { compareTwoStrings } from "string-similarity";
import { CheckAnswerValidator } from "@/lib/validators/answer";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();

    const { questionId, userInput } = CheckAnswerValidator.parse(body);

    const question = await db.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
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

      return NextResponse.json(
        {
          isCorrect,
        },
        { status: 200 }
      );
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

      return NextResponse.json(
        {
          percentageSimilar,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
}
