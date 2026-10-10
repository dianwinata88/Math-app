export const colors = {
  sky: '#A9C79B', // soft fern — borders, pressed states
  skyDeep: '#6E4F32', // bark brown — primary buttons, selections
  grass: '#C9E4A6', // soft leaf fill — correct/matched states
  leaf: '#5F9E4D', // leaf green — success, progress
  sun: '#F4C95D', // warm sun yellow — frames, badges
  coral: '#DE6B4F', // terracotta — errors
  grape: '#9B72B8', // elderberry
  cream: '#F6EEDC', // paper trail background
  ink: '#40342A', // bark-dark text
  inkSoft: '#7C6C58', // soft bark
  card: '#FFFDF5', // picture-book paper panel
  locked: '#CDBFA9', // trail-stone grey
  gold: '#E8A13D', // sunset orange — stars, XP accents
};

export const gradeColors: Record<string, string> = {
  prek: '#F29E7E', // fox peach
  k: '#E8A13D', // sunset honey
  g1: '#7FB069', // leaf
  g2: '#4FA3A5', // stream
  g3: '#9B72B8', // elderberry
  g4: '#D96B8C', // wildflower
  g5: '#4E7FA6', // river blue
};

export const radius = {
  sm: 12,
  md: 20,
  lg: 30,
  pill: 999,
};

export const spacing = (n: number) => n * 8;
