import type { LevelDef, Question } from '../../src/core/types';

export function validateQuestion(question: Question, level: LevelDef): void {
  const fail = (reason: string): never => {
    throw new Error(`Level "${level.id}" has an invalid question: ${reason}`);
  };

  if (question.kind !== level.kind) fail(`kind "${question.kind}" does not match level kind "${level.kind}"`);
  if (!question.prompt.trim()) fail('prompt must not be empty');

  switch (question.kind) {
    case 'multiple-choice':
    case 'count-tap': {
      const options = question.options ?? fail('multiple-choice and count-tap questions need 2–6 options');
      if (options.length < 2 || options.length > 6) fail('multiple-choice and count-tap questions need 2–6 options');
      if (new Set(options.map((option) => option.id)).size !== options.length) fail('option ids must be unique');
      if (new Set(options.map((option) => option.label)).size !== options.length) fail('option labels must be unique');
      if (options.filter((option) => option.id === question.answer).length !== 1) fail('exactly one option id must equal the answer');
      break;
    }
    case 'number-pad':
      if (!/^\d{1,8}$/.test(question.answer)) fail('number-pad answer must contain one to eight digits');
      break;
    case 'true-false':
      if (question.answer !== 'true' && question.answer !== 'false') fail('true-false answer must be "true" or "false"');
      break;
    case 'match-pairs': {
      const pairs = question.pairs ?? fail('match-pairs questions need 2–5 pairs');
      if (pairs.length < 2 || pairs.length > 5) fail('match-pairs questions need 2–5 pairs');
      if (new Set(pairs.map((pair) => pair.left)).size !== pairs.length) fail('match-pairs left values must be unique');
      if (new Set(pairs.map((pair) => pair.right)).size !== pairs.length) fail('match-pairs right values must be unique');
      break;
    }
    case 'order-sequence': {
      const sequence = question.sequence ?? fail('order-sequence questions need 3–8 items');
      if (sequence.length < 3 || sequence.length > 8) fail('order-sequence questions need 3–8 items');
      if (new Set(sequence).size !== sequence.length) fail('order-sequence items must be unique');
      if (question.answer !== sequence.join('-')) fail('order-sequence answer must equal sequence.join("-")');
      break;
    }
  }
}
