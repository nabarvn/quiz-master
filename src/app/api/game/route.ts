import axios from "axios";
import { z } from "zod";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { QuizConstructorValidator } from "@/lib/validators/quiz";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to create a quiz game." },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const { topic, type, amount } = QuizConstructorValidator.parse(body);

    const game = await db.game.create({
      data: {
        topic,
        gameType: type,
        userId: session.user.id,
        timeStarted: new Date(),
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

    const { data } = await axios.post(
      `${process.env.BASE_URL as string}/api/questions`,
      {
        topic,
        type,
        amount,
      }
    );

    if (type === "mcq") {
      type mcqQuestion = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
      };

      const manyData = data.questions.map((question: mcqQuestion) => {
        // mix up the options lol
        const options = [
          question.answer,
          question.option1,
          question.option2,
          question.option3,
        ].sort(() => Math.random() - 0.5);

        return {
          gameId: game.id,
          questionType: "mcq",
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
        };
      });

      await db.question.createMany({
        data: manyData,
      });
    } else if (type === "open_ended") {
      type openQuestion = {
        question: string;
        answer: string;
      };

      const manyData = data.questions.map((question: openQuestion) => {
        return {
          gameId: game.id,
          questionType: "open_ended",
          question: question.question,
          answer: question.answer,
        };
      });

      await db.question.createMany({
        data: manyData,
      });
    }

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a quiz game." },
        {
          status: 401,
        }
      );
    }

    const url = new URL(req.url);

    const gameId = url.searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "You must provide a game id." },
        {
          status: 400,
        }
      );
    }

    const game = await db.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        questions: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { game },
      {
        status: 400,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      {
        status: 500,
      }
    );
  }
}
