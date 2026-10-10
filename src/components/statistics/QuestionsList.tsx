import { cn } from "@/lib/utils";
import { Fragment } from "react";
import type { Game, Question } from "@prisma/client";
import { createCloze, parseBlankAnswers } from "@/lib/cloze";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type QuestionsListProps = {
  gameType: Game["gameType"];
  questions: Question[];
};

type CorrectAnswerProps = {
  correctAnswer: string;
  isOpenEnded: boolean;
  questionId: string;
};

const ANSWER_STATUS = {
  unanswered: {
    textClassName: "text-muted-foreground",
    Icon: MinusCircle,
    label: "Unanswered",
  },
  correct: {
    textClassName: "text-green-700 dark:text-green-400",
    Icon: CheckCircle2,
    label: "Correct",
  },
  incorrect: {
    textClassName: "text-red-700 dark:text-red-400",
    Icon: XCircle,
    label: "Incorrect",
  },
} as const;

const CorrectAnswer = ({
  correctAnswer,
  isOpenEnded,
  questionId,
}: CorrectAnswerProps) => {
  if (!isOpenEnded) {
    return <span className="mt-2 block font-semibold">{correctAnswer}</span>;
  }

  const { expectedAnswers, parts: clozeParts } = createCloze(
    correctAnswer,
    questionId,
  );

  return (
    <span className="mt-2 block font-semibold">
      {clozeParts.map((part, index) => (
        <Fragment key={index}>
          {part}

          {expectedAnswers[index] && (
            <span
              className="underline decoration-2 underline-offset-4"
              title={`Blank ${index + 1}`}
            >
              {expectedAnswers[index]}
            </span>
          )}
        </Fragment>
      ))}
    </span>
  );
};

const OpenEndedAnswer = ({ userAnswer }: { userAnswer: string | null }) => {
  if (!userAnswer) {
    return <span className="text-muted-foreground">Unanswered</span>;
  }

  const blanks = parseBlankAnswers(userAnswer);

  return blanks.map((blank, index) => (
    <Fragment key={index}>
      {index > 0 && (
        <span className="font-normal text-muted-foreground">; </span>
      )}
      {blank ? (
        <span className="font-semibold">{blank}</span>
      ) : (
        <span className="font-normal text-muted-foreground">Skipped</span>
      )}
    </Fragment>
  ));
};

const QuestionsList = ({ gameType, questions }: QuestionsListProps) => {
  if (questions.length === 0) {
    return (
      <p className="mt-4 rounded-md border p-6 text-center text-muted-foreground">
        No questions were recorded for this quiz.
      </p>
    );
  }

  const isOpenEnded = gameType === "open_ended";

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10px]">No.</TableHead>
              <TableHead>Question & Correct Answer</TableHead>
              <TableHead>Your Answer</TableHead>

              {isOpenEnded && (
                <TableHead className="w-[10px]">Similarity</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {questions.map(
              (
                { correctAnswer, id, isCorrect, similarity, stem, userAnswer },
                index,
              ) => {
                const answerStatus =
                  isCorrect === null
                    ? "unanswered"
                    : isCorrect
                      ? "correct"
                      : "incorrect";

                const { Icon, label, textClassName } =
                  ANSWER_STATUS[answerStatus];

                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>

                    <TableCell>
                      {stem}

                      <CorrectAnswer
                        correctAnswer={correctAnswer}
                        isOpenEnded={isOpenEnded}
                        questionId={id}
                      />
                    </TableCell>

                    {isOpenEnded ? (
                      <TableCell>
                        <OpenEndedAnswer userAnswer={userAnswer} />
                      </TableCell>
                    ) : (
                      <TableCell>
                        <span
                          className={cn(
                            "flex items-start gap-2 font-semibold [&>svg]:mt-0.5",
                            textClassName,
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {userAnswer ?? "Unanswered"}
                          <span className="sr-only">{label}</span>
                        </span>
                      </TableCell>
                    )}

                    {isOpenEnded && (
                      <TableCell className="font-medium">
                        {similarity === null ? "—" : `${similarity}%`}
                      </TableCell>
                    )}
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuestionsList;
