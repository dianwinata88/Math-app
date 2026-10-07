import { assertGradeCoverage } from './helpers/coverage';

describe('Grades 1–2 curriculum coverage', () => {
  it('covers Grade 1', () => assertGradeCoverage('g1'));
  it('covers Grade 2', () => assertGradeCoverage('g2'));
});
