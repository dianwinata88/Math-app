// Space Explorer palette: deep-space navy base with neon cyan/violet/gold accents.
export const colors = {
  sky: '#5CE1FF', // neon cyan — accents, pressed states
  skyDeep: '#2E7CF6', // ion blue — primary actions, selection
  grass: '#2FBF71', // correct-answer green
  leaf: '#1FA86B', // go / success green
  sun: '#FFD66B', // starlight gold
  coral: '#FF5C7A', // wrong-answer / danger
  grape: '#8B5CF6', // nebula violet — secondary accent
  cream: '#070B22', // deep space — default screen background
  ink: '#F2F6FF', // starlight white — primary text
  inkSoft: '#9AA7C7', // muted starlight — secondary text
  card: '#131B3D', // spaceship panel
  locked: '#3A4470', // dim hull — locked / disabled
  gold: '#FFC94D', // treasure gold
  nebula: '#1B2450', // raised panel interior
  void: '#05081C', // deepest space — progress track, overlays
  glow: '#3DDCFF', // neon glow — panel edges (use with alpha)
};

export const gradeColors: Record<string, string> = {
  prek: '#E14D7A',
  k: '#E8962E',
  g1: '#3D9B62',
  g2: '#2E8FD6',
  g3: '#7C4DE8',
  g4: '#D9408F',
  g5: '#2B6FE0',
};

export const radius = {
  sm: 10,
  md: 18,
  lg: 28,
  pill: 999,
};

export const spacing = (n: number) => n * 8;
