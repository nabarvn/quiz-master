import keyword_extractor from "keyword-extractor";
import { compareTwoStrings } from "string-similarity";

const BLANK_COUNT = 2;

/* 
  FNV-1a constants provide a small, deterministic 32-bit hash.
*/
const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

function hash(value: string) {
  let result = FNV_OFFSET_BASIS;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, FNV_PRIME);
  }

  return result >>> 0;
}

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("en").trim();
}

function comparable(value: string) {
  return normalize(value).replace(/[^\p{L}\p{N}*]+/gu, "");
}

type Candidate = {
  end: number;
  start: number;
  value: string;
};

function getCandidates(answer: string) {
  const keywords = new Set(
    keyword_extractor
      .extract(answer, {
        language: "english",
        remove_digits: true,
        return_changed_case: false,
        remove_duplicates: true,
      })
      .map(comparable),
  );

  const tokens: Candidate[] = [];

  for (const match of answer.matchAll(/\S+/gu)) {
    if (match.index === undefined) continue;
    const leadingPunctuation = match[0].match(/^[([{"'“‘]+/u)?.[0].length ?? 0;

    const trailingPunctuation =
      match[0].match(/[)\]}"'”’.,;:!?]+$/u)?.[0].length ?? 0;

    const value = match[0].slice(
      leadingPunctuation,
      trailingPunctuation ? -trailingPunctuation : undefined,
    );

    if (!value) continue;

    tokens.push({
      end: match.index + leadingPunctuation + value.length,
      start: match.index + leadingPunctuation,
      value,
    });
  }

  const candidates = tokens.filter(({ value }) =>
    keywords.has(comparable(value)),
  );

  return candidates.length > 0 ? candidates : tokens;
}

export function createCloze(answer: string, questionId: string) {
  const uniqueCandidates = Array.from(
    new Map(
      getCandidates(answer).map((candidate) => [
        normalize(candidate.value),
        candidate,
      ]),
    ).values(),
  );

  const selected = uniqueCandidates
    .map((candidate) => ({
      candidate,
      order: hash(`${questionId}:${normalize(candidate.value)}`),
    }))
    .sort(
      (first, second) =>
        first.order - second.order ||
        (first.candidate.value < second.candidate.value
          ? -1
          : first.candidate.value > second.candidate.value
            ? 1
            : 0),
    )
    .slice(0, BLANK_COUNT)
    .map(({ candidate }) => candidate)
    .sort((first, second) => first.start - second.start);

  if (selected.length === 0) {
    return { expectedAnswers: [] as string[], parts: [answer] };
  }

  const expectedAnswers: string[] = [];
  const parts: string[] = [];

  let previousIndex = 0;

  for (const { end, start, value } of selected) {
    parts.push(answer.slice(previousIndex, start));
    expectedAnswers.push(value);
    previousIndex = end;
  }

  parts.push(answer.slice(previousIndex));
  return { expectedAnswers, parts };
}

const SKIPPED_BLANK_PLACEHOLDER = "Skipped";
const BLANK_SEPARATOR = "; ";

export function serializeBlankAnswers(blankAnswers: string[]) {
  return JSON.stringify(blankAnswers);
}

function parseJoinedBlankAnswers(userAnswer: string) {
  return userAnswer
    .split(BLANK_SEPARATOR)
    .map((answer) => (answer === SKIPPED_BLANK_PLACEHOLDER ? "" : answer));
}

export function parseBlankAnswers(userAnswer: string) {
  try {
    const parsed: unknown = JSON.parse(userAnswer);

    if (
      Array.isArray(parsed) &&
      parsed.every((answer) => typeof answer === "string")
    ) {
      return parsed;
    }

    return parseJoinedBlankAnswers(userAnswer);
  } catch {
    return parseJoinedBlankAnswers(userAnswer);
  }
}

export function scoreClozeAnswers(
  expectedAnswers: string[],
  submittedAnswers: string[],
) {
  if (expectedAnswers.length === 0) return 0;

  const totalSimilarity = expectedAnswers.reduce((total, expected, index) => {
    const submitted = normalize(submittedAnswers[index] ?? "");

    if (!submitted) return total;
    return total + compareTwoStrings(normalize(expected), submitted);
  }, 0);

  return Math.round((totalSimilarity / expectedAnswers.length) * 100);
}
