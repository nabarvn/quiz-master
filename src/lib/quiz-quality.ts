import { z } from "zod";
import { compareTwoStrings } from "string-similarity";

export const mcqQuestionSchema = z.object({
  stem: z
    .string()
    .min(1)
    .describe(
      "Self-contained, positively worded player-facing question that states the complete problem without URLs, citations, markdown, answer labels, or clues to the answer.",
    ),
  correctAnswer: z
    .string()
    .min(1)
    .describe(
      "Exact text of the single unambiguously correct choice, parallel to the distractors and never a choice label.",
    ),
  distractors: z
    .array(z.string().min(1))
    .length(3)
    .describe(
      "Exactly three plausible but incorrect and mutually exclusive choices, parallel to the answer in semantic type, grammar, specificity, and approximate length.",
    ),
});

export const openEndedQuestionSchema = z.object({
  stem: z
    .string()
    .min(1)
    .describe(
      "Self-contained, positively worded player-facing question with one objectively defensible answer and no URLs, citations, markdown, or unstated context.",
    ),
  correctAnswer: z
    .string()
    .min(1)
    .describe(
      "Concise canonical answer as a natural standalone phrase suitable for hiding up to two terms; no aliases, alternatives, slash-separated variants, parenthetical notes, or commentary.",
    ),
});

type McqQuestion = z.infer<typeof mcqQuestionSchema>;
type OpenEndedQuestion = z.infer<typeof openEndedQuestionSchema>;

export type QuizValidationResult = {
  hardErrors: string[];
  softErrors: string[];
};

const MAX_ANSWER_WORDS = 15;

const COMPANY_SUFFIXES =
  /\b(?:co|company|corp|corporation|inc|incorporated|limited|llc|ltd|plc)\b$/;

const FORBIDDEN_OPTIONS = new Set([
  "all of the above",
  "none of the above",
  "both a and b",
  "all answers are correct",
]);

const WEB_ARTIFACT_PATTERN =
  /https?:\/\/|www\.|utm_source=|\[[^\]]+\]\([^)]+\)|cite|【[^】]*†[^】]*】/iu;

const PLACEHOLDER_CHOICE_PATTERN =
  /^(?:option|choice|answer)(?:\s*(?:[1-4]|[a-d]))?$|^[a-d]$/iu;

const NEGATIVE_STEM_PATTERN = /\b(?:not|except|least|incorrect|false)\b/iu;
const ANSWER_VARIANT_PATTERN = /\s(?:\/|\bor\b)\s|[()[\]]/iu;

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function wordCount(value: string) {
  const normalized = normalize(value);
  return normalized ? normalized.split(/\s+/).length : 0;
}

function containsPhrase(text: string, phrase: string) {
  if (!text || !phrase) return false;

  const textTokens = text.split(" ");
  const phraseTokens = phrase.split(" ");

  return textTokens.some((_, index) =>
    phraseTokens.every((token, offset) => textTokens[index + offset] === token),
  );
}

function normalizeCompanyName(value: string) {
  return normalize(value).replace(COMPANY_SUFFIXES, "").trim();
}

function similarity(first: string, second: string) {
  const normalizedFirst = normalize(first);
  const normalizedSecond = normalize(second);

  if (!normalizedFirst || !normalizedSecond) return 1;

  return compareTwoStrings(normalizedFirst, normalizedSecond);
}

function areExactDuplicates(first: string, second: string) {
  return normalize(first) === normalize(second);
}

function areEquivalentCompanyNames(first: string, second: string) {
  const normalizedFirst = normalizeCompanyName(first);
  const normalizedSecond = normalizeCompanyName(second);

  return normalizedFirst.length >= 3 && normalizedFirst === normalizedSecond;
}

function validateUniqueQuestions(questions: { stem: string }[]) {
  const result: QuizValidationResult = {
    hardErrors: [],
    softErrors: [],
  };

  questions.forEach(({ stem }, index) => {
    if (!normalize(stem)) {
      result.hardErrors.push(`Question ${index + 1} is empty.`);
    }

    if (WEB_ARTIFACT_PATTERN.test(stem)) {
      result.hardErrors.push(
        `Question ${index + 1} contains a URL, citation, or markdown link.`,
      );
    }

    if (NEGATIVE_STEM_PATTERN.test(stem)) {
      result.softErrors.push(
        `Question ${index + 1} uses negative wording; rewrite it as a positive, direct question.`,
      );
    }
  });

  for (let first = 0; first < questions.length; first += 1) {
    for (let second = first + 1; second < questions.length; second += 1) {
      const firstQuestion = questions[first].stem;
      const secondQuestion = questions[second].stem;

      if (areExactDuplicates(firstQuestion, secondQuestion)) {
        result.hardErrors.push(
          `Questions ${first + 1} and ${second + 1} are duplicates.`,
        );
      } else if (similarity(firstQuestion, secondQuestion) >= 0.95) {
        result.softErrors.push(
          `Questions ${first + 1} and ${second + 1} are duplicates or near-duplicates.`,
        );
      }
    }
  }

  return result;
}

export function validateMcqQuestions(questions: McqQuestion[]) {
  const result = validateUniqueQuestions(questions);

  questions.forEach((question, questionIndex) => {
    const choices = [question.correctAnswer, ...question.distractors];
    const choiceWordCounts = choices.map(wordCount);

    choices.forEach((choice, choiceIndex) => {
      if (!normalize(choice)) {
        result.hardErrors.push(
          `Question ${questionIndex + 1}, choice ${choiceIndex + 1} is empty.`,
        );
      }

      if (wordCount(choice) > MAX_ANSWER_WORDS) {
        result.hardErrors.push(
          `Question ${questionIndex + 1}, choice ${choiceIndex + 1} exceeds ${MAX_ANSWER_WORDS} words.`,
        );
      }

      if (FORBIDDEN_OPTIONS.has(normalize(choice))) {
        result.hardErrors.push(
          `Question ${questionIndex + 1}, choice ${choiceIndex + 1} uses a forbidden catch-all option.`,
        );
      }

      if (WEB_ARTIFACT_PATTERN.test(choice)) {
        result.hardErrors.push(
          `Question ${questionIndex + 1}, choice ${choiceIndex + 1} contains a URL, citation, or markdown link.`,
        );
      }

      if (PLACEHOLDER_CHOICE_PATTERN.test(normalize(choice))) {
        result.hardErrors.push(
          `Question ${questionIndex + 1}, choice ${choiceIndex + 1} is a placeholder or choice label.`,
        );
      }
    });

    const shortestChoice = Math.min(...choiceWordCounts);
    const longestChoice = Math.max(...choiceWordCounts);

    if (
      shortestChoice > 0 &&
      longestChoice - shortestChoice >= 3 &&
      longestChoice >= shortestChoice * 3
    ) {
      result.softErrors.push(
        `Question ${questionIndex + 1} has a conspicuous choice-length mismatch.`,
      );
    }

    const normalizedStem = normalize(question.stem);
    const normalizedAnswer = normalize(question.correctAnswer);

    if (
      normalizedAnswer.length >= 3 &&
      containsPhrase(normalizedStem, normalizedAnswer)
    ) {
      result.hardErrors.push(
        `Question ${questionIndex + 1} contains its answer verbatim.`,
      );
    }

    for (let first = 0; first < choices.length; first += 1) {
      for (let second = first + 1; second < choices.length; second += 1) {
        const firstChoice = choices[first];
        const secondChoice = choices[second];
        const choiceLabel = `Question ${questionIndex + 1}, choices ${first + 1} and ${second + 1}`;

        if (
          areExactDuplicates(firstChoice, secondChoice) ||
          areEquivalentCompanyNames(firstChoice, secondChoice)
        ) {
          result.hardErrors.push(`${choiceLabel} are duplicates.`);
        } else if (similarity(firstChoice, secondChoice) >= 0.92) {
          result.softErrors.push(`${choiceLabel} may be near-duplicates.`);
        }
      }
    }
  });

  return result;
}

export function validateOpenEndedQuestions(questions: OpenEndedQuestion[]) {
  const result = validateUniqueQuestions(questions);

  questions.forEach((question, index) => {
    if (!normalize(question.correctAnswer)) {
      result.hardErrors.push(`Question ${index + 1} answer is empty.`);
    }

    if (wordCount(question.correctAnswer) > MAX_ANSWER_WORDS) {
      result.hardErrors.push(
        `Question ${index + 1} answer exceeds ${MAX_ANSWER_WORDS} words.`,
      );
    }

    if (WEB_ARTIFACT_PATTERN.test(question.correctAnswer)) {
      result.hardErrors.push(
        `Question ${index + 1} answer contains a URL, citation, or markdown link.`,
      );
    }

    if (PLACEHOLDER_CHOICE_PATTERN.test(normalize(question.correctAnswer))) {
      result.hardErrors.push(
        `Question ${index + 1} answer is a placeholder or choice label.`,
      );
    }

    if (ANSWER_VARIANT_PATTERN.test(question.correctAnswer)) {
      result.softErrors.push(
        `Question ${index + 1} answer contains alternatives or parenthetical wording instead of one canonical phrase.`,
      );
    }
  });

  return result;
}
