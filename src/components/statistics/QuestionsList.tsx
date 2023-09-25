"use client";

import { Fragment } from "react";
import { Question } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type QuestionsListProps = {
  questions: Question[];
};

const QuestionsList = ({ questions }: QuestionsListProps) => {
  return (
    questions[1] && (
      <Table className='mt-4'>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[10px]'>No.</TableHead>
            <TableHead>Question & Correct Answer</TableHead>
            <TableHead>Your Answer</TableHead>

            {questions[0]?.questionType === "open_ended" && (
              <TableHead className='w-[10px] text-right'>Accuracy</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          <Fragment>
            {questions.map(
              (
                { answer, question, userAnswer, percentageCorrect, isCorrect },
                index
              ) => {
                return (
                  <TableRow key={index}>
                    <TableCell className='font-medium'>{index + 1}</TableCell>

                    <TableCell>
                      {question}

                      <br />
                      <br />

                      <span className='font-semibold'>{answer}</span>
                    </TableCell>

                    {questions[0].questionType === "open_ended" ? (
                      <TableCell className={`font-semibold`}>
                        {userAnswer}
                      </TableCell>
                    ) : (
                      <TableCell
                        className={`${
                          isCorrect ? "text-green-700" : "text-red-700"
                        } font-semibold`}
                      >
                        {userAnswer}
                      </TableCell>
                    )}

                    {percentageCorrect && (
                      <TableCell className='text-right'>
                        {percentageCorrect}
                      </TableCell>
                    )}
                  </TableRow>
                );
              }
            )}
          </Fragment>
        </TableBody>
      </Table>
    )
  );
};

export default QuestionsList;
