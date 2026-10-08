// Data banks for the Grade 1 expansion pack (g1-pack.ts).
// All tables are readonly constants — generators stay deterministic because
// they only ever index into these with the seeded rng.

export const kidNames = ['Mia', 'Leo', 'Sam', 'Ava', 'Ben', 'Zoe', 'Max', 'Ivy', 'Eli', 'Nora', 'Kim', 'Raj'];

export const storyObjects = [
  { singular: 'apple', plural: 'apples', emoji: '🍎' },
  { singular: 'star', plural: 'stars', emoji: '⭐' },
  { singular: 'balloon', plural: 'balloons', emoji: '🎈' },
  { singular: 'cookie', plural: 'cookies', emoji: '🍪' },
  { singular: 'crayon', plural: 'crayons', emoji: '🖍️' },
  { singular: 'block', plural: 'blocks', emoji: '🧱' },
  { singular: 'flower', plural: 'flowers', emoji: '🌸' },
  { singular: 'car', plural: 'cars', emoji: '🚗' },
  { singular: 'kite', plural: 'kites', emoji: '🪁' },
  { singular: 'berry', plural: 'berries', emoji: '🍓' },
  { singular: 'ladybug', plural: 'ladybugs', emoji: '🐞' },
  { singular: 'donut', plural: 'donuts', emoji: '🍩' },
  { singular: 'teddy bear', plural: 'teddy bears', emoji: '🧸' },
  { singular: 'book', plural: 'books', emoji: '📚' },
  { singular: 'candy', plural: 'candies', emoji: '🍬' },
  { singular: 'marble', plural: 'marbles', emoji: '🔮' },
];

export const numberWords = [
  { word: 'eleven', value: 11 },
  { word: 'twelve', value: 12 },
  { word: 'thirteen', value: 13 },
  { word: 'fourteen', value: 14 },
  { word: 'fifteen', value: 15 },
  { word: 'sixteen', value: 16 },
  { word: 'seventeen', value: 17 },
  { word: 'eighteen', value: 18 },
  { word: 'nineteen', value: 19 },
  { word: 'twenty', value: 20 },
  { word: 'thirty', value: 30 },
  { word: 'forty', value: 40 },
  { word: 'fifty', value: 50 },
  { word: 'sixty', value: 60 },
  { word: 'seventy', value: 70 },
  { word: 'eighty', value: 80 },
  { word: 'ninety', value: 90 },
  { word: 'one hundred', value: 100 },
];

const onesWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const teenWords = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

export function numberToWords(n: number): string {
  if (n < 10) return onesWords[n];
  if (n < 20) return teenWords[n - 10];
  if (n === 100) return 'one hundred';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? tensWords[tens] : `${tensWords[tens]}-${onesWords[ones]}`;
}

export const coins = [
  { name: 'penny', plural: 'pennies', value: 1 },
  { name: 'nickel', plural: 'nickels', value: 5 },
  { name: 'dime', plural: 'dimes', value: 10 },
  { name: 'quarter', plural: 'quarters', value: 25 },
];

// Each entry has a unique `total` so match-pairs rights never collide.
export const coinCombos = [
  { text: '2 nickels', total: 10 },
  { text: '1 dime and 3 pennies', total: 13 },
  { text: '3 nickels', total: 15 },
  { text: '2 dimes and 2 pennies', total: 22 },
  { text: '1 quarter and 1 nickel', total: 30 },
  { text: '2 dimes and 1 nickel', total: 25 },
];

export const coinRiddles = [
  { clue: 'I am worth the same as 5 pennies.', answer: 'nickel' },
  { clue: 'I am worth the same as 2 nickels.', answer: 'dime' },
  { clue: 'I am worth the same as 10 pennies.', answer: 'dime' },
  { clue: 'I am worth the same as 5 nickels.', answer: 'quarter' },
  { clue: 'I am worth the same as 2 dimes and 1 nickel.', answer: 'quarter' },
];

export const dayEvents = ['wake up', 'eat breakfast', 'go to school', 'eat lunch', 'come home', 'eat dinner', 'go to bed'];

export const clockHandFacts = [
  { text: 'The short hand on a clock shows the hour.', truth: true },
  { text: 'The long hand on a clock shows the minutes.', truth: true },
  { text: 'The minute hand is the short hand.', truth: false },
  { text: 'At half past, the minute hand points to the 6.', truth: true },
  { text: "At o'clock, the minute hand points to the 12.", truth: true },
  { text: 'The hour hand is longer than the minute hand.', truth: false },
];

export const parityFacts = [
  { text: 'Even + even makes an even number.', truth: true },
  { text: 'Odd + odd makes an even number.', truth: true },
  { text: 'Even + odd makes an odd number.', truth: true },
  { text: 'Even + even makes an odd number.', truth: false },
  { text: 'Odd + odd makes an odd number.', truth: false },
  { text: 'Even + odd makes an even number.', truth: false },
  { text: '10 is an even number.', truth: true },
  { text: 'Numbers that end in 0, 2, 4, 6, or 8 are even.', truth: true },
];

export const emojiPatterns = [
  ['🔺', '🔵'],
  ['🍎', '🍌'],
  ['⭐', '🌙'],
  ['🟥', '🟦'],
  ['🐶', '🐱'],
  ['🔺', '🔵', '🟢'],
  ['🍎', '🍌', '🍇'],
];

export const flatShapes = [
  { name: 'triangle', emoji: '🔺', sides: 3, corners: 3 },
  { name: 'square', emoji: '🟥', sides: 4, corners: 4 },
  { name: 'rectangle', emoji: '🟦', sides: 4, corners: 4 },
  { name: 'circle', emoji: '⚪', sides: 0, corners: 0 },
  { name: 'hexagon', emoji: '⬡', sides: 6, corners: 6 },
  { name: 'trapezoid', emoji: '🔻', sides: 4, corners: 4 },
  { name: 'pentagon', emoji: '⬟', sides: 5, corners: 5 },
];

export const solidShapes = [
  { name: 'cube', flatFaces: 6, faceShape: 'square', emoji: '🧊' },
  { name: 'sphere', flatFaces: 0, faceShape: 'no flat face', emoji: '⚽' },
  { name: 'cylinder', flatFaces: 2, faceShape: 'circle', emoji: '🥫' },
  { name: 'cone', flatFaces: 1, faceShape: 'circle', emoji: '🍦' },
];

export const shapeFacts = [
  { shape: 'triangle', fact: '3 sides' },
  { shape: 'square', fact: '4 equal sides' },
  { shape: 'rectangle', fact: '4 square corners' },
  { shape: 'circle', fact: '0 sides' },
  { shape: 'hexagon', fact: '6 sides' },
  { shape: 'pentagon', fact: '5 sides' },
  { shape: 'cube', fact: '6 square faces' },
  { shape: 'sphere', fact: '0 flat faces' },
];

export const realWorldShapes = [
  { object: 'a soccer ball', shape: 'sphere' },
  { object: 'a soup can', shape: 'cylinder' },
  { object: 'a dice', shape: 'cube' },
  { object: 'an ice cream cone', shape: 'cone' },
  { object: 'a paper towel roll', shape: 'cylinder' },
  { object: 'a party hat', shape: 'cone' },
  { object: 'a toy block', shape: 'cube' },
  { object: 'a globe', shape: 'sphere' },
];

export const composeFacts = [
  { parts: '2 same-size squares put side by side', result: 'a rectangle', distractors: ['a triangle', 'a circle', 'a sphere'] },
  { parts: '2 triangles that are halves of a square', result: 'a square', distractors: ['a circle', 'a sphere', 'a cube'] },
  { parts: '2 same-size trapezoids', result: 'a hexagon', distractors: ['a triangle', 'a circle', 'a cube'] },
  { parts: '4 same-size small squares', result: 'a bigger square', distractors: ['a triangle', 'a circle', 'a sphere'] },
  { parts: '2 same-size right triangles', result: 'a rectangle', distractors: ['a circle', 'a hexagon', 'a sphere'] },
];

export const measureTools = [
  { object: 'a crayon', answer: 'inches', distractors: ['feet', 'miles'] },
  { object: 'a pencil', answer: 'inches', distractors: ['feet', 'miles'] },
  { object: 'a book', answer: 'inches', distractors: ['feet', 'yards'] },
  { object: 'a classroom wall', answer: 'feet', distractors: ['inches', 'centimeters'] },
  { object: 'a playground', answer: 'feet', distractors: ['inches', 'centimeters'] },
  { object: 'a toothbrush', answer: 'inches', distractors: ['feet', 'yards'] },
];

export const lengthEstimates = [
  { object: 'a crayon', answer: '3 inches', distractors: ['30 inches', '3 feet'] },
  { object: 'a toothbrush', answer: '5 inches', distractors: ['50 inches', '5 feet'] },
  { object: 'a shoe', answer: '8 inches', distractors: ['80 inches', '8 feet'] },
  { object: 'a picture book', answer: '9 inches', distractors: ['90 inches', '9 feet'] },
  { object: 'a pencil', answer: '7 inches', distractors: ['70 inches', '7 feet'] },
  { object: 'a door', answer: '7 feet', distractors: ['7 inches', '70 feet'] },
];

export const measureFacts = [
  { text: 'You can measure length with paper clips.', truth: true },
  { text: 'An inch is a unit for measuring length.', truth: true },
  { text: '12 inches make 1 foot.', truth: true },
  { text: 'A crayon is about 30 inches long.', truth: false },
  { text: 'When measuring with the same unit, a longer object has more units.', truth: true },
  { text: 'A door is about 2 inches tall.', truth: false },
];

// Unique rights: each half/fourth fact maps to a different answer value.
export const shareMatchFacts = [
  { left: 'one half of 4', right: '2' },
  { left: 'one fourth of 12', right: '3' },
  { left: 'one half of 8', right: '4' },
  { left: 'one fourth of 20', right: '5' },
  { left: 'one half of 12', right: '6' },
  { left: 'one fourth of 28', right: '7' },
];

export const shareFacts = [
  { text: 'Two halves make one whole.', truth: true },
  { text: 'A fourth is smaller than a half.', truth: true },
  { text: 'Four fourths make one whole.', truth: true },
  { text: 'Shares are fair when every part is the same size.', truth: true },
  { text: 'Two pieces of different sizes are still halves.', truth: false },
  { text: 'One half of 6 is 4.', truth: false },
  { text: 'One fourth of 8 is 2.', truth: true },
  { text: 'Cutting a whole into more equal parts makes bigger parts.', truth: false },
];

export const centsToDollars = [
  { cents: '5¢', dollars: '$0.05' },
  { cents: '10¢', dollars: '$0.10' },
  { cents: '25¢', dollars: '$0.25' },
  { cents: '30¢', dollars: '$0.30' },
  { cents: '50¢', dollars: '$0.50' },
  { cents: '75¢', dollars: '$0.75' },
  { cents: '100¢', dollars: '$1.00' },
];

export const coinDecimals = [
  { left: '1 nickel', right: '$0.05' },
  { left: '1 dime', right: '$0.10' },
  { left: '1 quarter', right: '$0.25' },
  { left: '3 dimes', right: '$0.30' },
  { left: '4 dimes', right: '$0.40' },
];

export const decimalFacts = [
  { text: '$0.15 means 15 cents.', truth: true },
  { text: '$1.00 is 100 cents.', truth: true },
  { text: '$0.50 is 5 cents.', truth: false },
  { text: '$2.25 means 2 dollars and 25 cents.', truth: true },
  { text: '$0.05 is 50 cents.', truth: false },
  { text: '$0.5 is the same as 50 cents.', truth: true },
  { text: '75 cents is written $75.00.', truth: false },
];
