export const measureTools = [
  { object: 'a crayon', tool: 'an inch ruler' },
  { object: 'a classroom door', tool: 'a yardstick' },
  { object: 'a soccer field', tool: 'a measuring tape' },
  { object: 'a long hallway rug', tool: 'a meter stick' },
  { object: 'a pencil', tool: 'an inch ruler' },
  { object: 'a playground', tool: 'a measuring tape' },
];

export const estimateObjects = [
  { object: 'a jump rope', answer: '2 m', distractors: ['2 cm', '20 m', '2 in'] },
  { object: 'an ant', answer: '1 cm', distractors: ['1 m', '10 cm', '1 ft'] },
  { object: 'a skateboard', answer: '80 cm', distractors: ['80 m', '8 cm', '80 in'] },
  { object: 'a playground slide', answer: '3 m', distractors: ['3 cm', '30 m', '3 in'] },
  { object: 'a sticker', answer: '2 cm', distractors: ['2 m', '20 cm', '2 ft'] },
  { object: 'a soccer goal', answer: '7 ft', distractors: ['7 in', '70 ft', '7 cm'] },
  { object: 'a napkin', answer: '30 cm', distractors: ['30 m', '3 cm', '30 ft'] },
  { object: 'a toothbrush', answer: '6 in', distractors: ['6 ft', '60 in', '6 m'] },
];

export const solidBank = [
  { name: 'cube', faces: 6, edges: 12, vertices: 8 },
  { name: 'rectangular prism', faces: 6, edges: 12, vertices: 8 },
  { name: 'square pyramid', faces: 5, edges: 8, vertices: 5 },
  { name: 'triangular prism', faces: 5, edges: 9, vertices: 6 },
  { name: 'cylinder', faces: 2, edges: 0, vertices: 0 },
  { name: 'cone', faces: 1, edges: 0, vertices: 0 },
];

export const polyBank = [
  { name: 'triangle', sides: 3 },
  { name: 'quadrilateral', sides: 4 },
  { name: 'pentagon', sides: 5 },
  { name: 'hexagon', sides: 6 },
  { name: 'octagon', sides: 8 },
];

export const ampmBank = [
  { text: 'eat lunch at school', answer: 'PM' },
  { text: 'see the sun come up', answer: 'AM' },
  { text: 'brush your teeth before bed', answer: 'PM' },
  { text: 'line up for morning recess', answer: 'AM' },
  { text: 'ride the bus home from school', answer: 'PM' },
  { text: 'hear the morning announcements', answer: 'AM' },
  { text: 'have a bedtime story', answer: 'PM' },
];

export const storyThings = [
  { singular: 'marble', plural: 'marbles', emoji: '🔮' },
  { singular: 'sticker', plural: 'stickers', emoji: '🏷️' },
  { singular: 'crayon', plural: 'crayons', emoji: '🖍️' },
  { singular: 'book', plural: 'books', emoji: '📚' },
  { singular: 'card', plural: 'cards', emoji: '🃏' },
  { singular: 'bead', plural: 'beads', emoji: '📿' },
  { singular: 'balloon', plural: 'balloons', emoji: '🎈' },
  { singular: 'stamp', plural: 'stamps', emoji: '📮' },
];

export const graphSubjects = [
  { name: 'crabs', emoji: '🦀' },
  { name: 'shells', emoji: '🐚' },
  { name: 'pearls', emoji: '🦪' },
  { name: 'boats', emoji: '⛵' },
  { name: 'fish', emoji: '🐟' },
];

export const multCombos: [number, number][] = [];
for (let a = 1; a <= 5; a += 1) {
  for (let b = 2; b <= 5; b += 1) {
    multCombos.push([a, b]);
  }
}

export const fractionWordBank = [
  { parts: 2, name: 'halves', single: 'one half' },
  { parts: 3, name: 'thirds', single: 'one third' },
  { parts: 4, name: 'fourths', single: 'one fourth' },
];
