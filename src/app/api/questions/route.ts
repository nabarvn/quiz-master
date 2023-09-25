import { ZodError } from "zod";
import { strictOutput } from "@/lib/gpt";
import { GetQuestionsValidator } from "@/lib/validators/questions";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { topic, type, amount } = GetQuestionsValidator.parse(body);

    let questions: any;

    if (type === "mcq") {
      questions = await strictOutput(
        "You are a helpful AI agent that can generate sets of MCQ questions and answers, with each answer limited to 15 words. Please provide the output in the desired JSON array format.",
        new Array(amount).fill(
          `You are to generate a random hard MCQ question about ${topic}.`
        ),
        {
          question: "question (do not put double quotation marks)",
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
      );
    } else if (type === "open_ended") {
      questions = await strictOutput(
        "You are a helpful AI agent that can generate pairs of open-ended questions and answers, with each answer limited to 15 words. Please provide the output in the desired JSON array format.",
        new Array(amount).fill(
          `You are to generate a random hard open-ended question about ${topic}.`
        ),
        {
          question: "question (do not put double quotation marks)",
          answer: "answer with max length of 15 words",
        }
      );
    }

    return new Response(JSON.stringify({ questions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: error.issues }), {
        status: 400,
      });
    } else {
      console.error("elle gpt error", error);

      return new Response(
        JSON.stringify({ error: "An unexpected error occurred." }),
        {
          status: 500,
        }
      );
    }
  }
}
