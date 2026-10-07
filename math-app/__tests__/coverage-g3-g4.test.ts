import { assertGradeCoverage } from './helpers/coverage';

describe('Grades 3–4 curriculum coverage', () => {
  it('covers Grade 3', () => {
    expect(() => assertGradeCoverage('g3')).not.toThrow();
  });

  it('covers Grade 4', () => {
    expect(() => assertGradeCoverage('g4')).not.toThrow();
  });
});
