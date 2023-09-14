import { ZodError } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { strictOutput } from "@/lib/gpt";
import { GetQuestionsValidator } from "@/lib/validators/questions";
// import { getAuthSession } from "@/lib/auth";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // const session = await getAuthSession();

    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to create a quiz game." },
    //     {
    //       status: 401,
    //     }
    //   );
    // }

    const body = await req.json();

    const { topic, type, amount } = GetQuestionsValidator.parse(body);

    let questions: any;

    if (type === "mcq") {
      questions = await strictOutput(
        "You are a helpful AI agent that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words, store all questions and answers and options in a JSON array",
        new Array(amount).fill(
          `You are to generate a random hard mcq question about ${topic}`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
      );
    } else if (type === "open_ended") {
      questions = await strictOutput(
        "You are a helpful AI that is able to generate a pair of question and answers, the length of each answer should not be more than 15 words, store all the pairs of questions and answers in a JSON array",
        new Array(amount).fill(
          `You are to generate a random hard open-ended question about ${topic}`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        }
      );
    }

    return NextResponse.json(
      {
        questions: questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      console.error("elle gpt error", error);

      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}
