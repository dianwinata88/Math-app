export const PREK_CRITTERS = [
  { emoji: '🐶', name: 'puppy' },
  { emoji: '🐱', name: 'kitty' },
  { emoji: '🐰', name: 'bunny' },
  { emoji: '🐥', name: 'chick' },
  { emoji: '🦴', name: 'bone' },
  { emoji: '🎾', name: 'ball' },
  { emoji: '🐞', name: 'ladybug' },
  { emoji: '🌼', name: 'flower' },
  { emoji: '🦋', name: 'butterfly' },
  { emoji: '🐿️', name: 'squirrel' },
] as const;

export const STORY_CONTEXTS = [
  { emoji: '🐸', noun: 'frogs', place: 'on a log' },
  { emoji: '🍎', noun: 'apples', place: 'in a basket' },
  { emoji: '⚽', noun: 'balls', place: 'in the net' },
  { emoji: '🚀', noun: 'rockets', place: 'on the launch pad' },
  { emoji: '🐠', noun: 'fish', place: 'in the reef' },
  { emoji: '🦕', noun: 'dinos', place: 'by the lake' },
] as const;

export const SHAPES_2D = [
  { name: 'circle', glyph: '🔴' },
  { name: 'square', glyph: '🟦' },
  { name: 'triangle', glyph: '🔺' },
  { name: 'rectangle', glyph: '▬' },
  { name: 'star', glyph: '⭐' },
] as const;

export const SHAPE_OBJECTS_2D = [
  { shape: 'circle', items: ['🍪', '🍩', '🕒', '🌕'] },
  { shape: 'triangle', items: ['🍕', '⚠️', '📐'] },
  { shape: 'rectangle', items: ['🚪', '📱', '💵'] },
  { shape: 'square', items: ['🖼️', '🧇', '🔲'] },
  { shape: 'star', items: ['🌟', '⭐'] },
] as const;

export const SOLIDS_3D = [
  { name: 'sphere', items: ['⚽', '🏀', '🌍', '🔮'] },
  { name: 'cube', items: ['🎲', '🧊', '📦'] },
  { name: 'cone', items: ['🍦', '🎉'] },
  { name: 'cylinder', items: ['🥫', '🧻', '🔋', '🪵'] },
] as const;

export const COLOR_GROUPS = [
  { name: 'red', square: '🟥', items: ['🍎', '🍓', '🌹', '🚒', '❤️'] },
  { name: 'yellow', square: '🟨', items: ['🍌', '🌻', '🐥', '🌕', '⭐'] },
  { name: 'green', square: '🟩', items: ['🥦', '🐸', '🍀', '🥒', '🌲'] },
  { name: 'blue', square: '🟦', items: ['💙', '🧢', '🐟', '🫐', '🌀'] },
  { name: 'orange', square: '🟧', items: ['🍊', '🥕', '🏀', '🦊', '🎃'] },
  { name: 'purple', square: '🟪', items: ['🍇', '🍆', '💜', '🔮', '☂️'] },
] as const;

export const COLOR_SQUARES: Record<(typeof COLOR_GROUPS)[number]['name'], string> = {
  red: '🟥',
  orange: '🟧',
  yellow: '🟨',
  green: '🟩',
  blue: '🟦',
  purple: '🟪',
};

export const BIG_THINGS = ['🐘', '🐳', '🦒', '🚌', '🏠', '🌳'] as const;
export const SMALL_THINGS = ['🐭', '🐜', '🐞', '🍓', '🔑', '🐣'] as const;
export const TALL_THINGS = ['🦒', '🏢', '🌳', '🗼'] as const;
export const SHORT_THINGS = ['🐕', '🏠', '🌷', '🍄'] as const;
export const HEAVY_THINGS = ['🐘', '🚗', '🪨', '🐻', '🚚'] as const;
export const LIGHT_THINGS = ['🪶', '🎈', '🍃', '🐞', '🧦'] as const;

export const CONTAINERS = [
  { emoji: '🥄', name: 'spoon' },
  { emoji: '🥤', name: 'cup' },
  { emoji: '🪣', name: 'bucket' },
  { emoji: '🛁', name: 'bathtub' },
] as const;

export const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
] as const;

export const PATTERN_SETS = {
  colors: ['🔴', '🔵', '🟡', '🟢', '🟣'],
  animals: ['🐶', '🐱', '🐰', '🐸', '🐥'],
  fruit: ['🍎', '🍌', '🍇', '🍓'],
  dino: ['🦕', '🦖', '🥚', '🌋'],
} as const;
