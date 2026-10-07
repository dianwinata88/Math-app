import { assertGradeCoverage } from './helpers/coverage';

describe('PreK and Kindergarten curriculum coverage', () => {
  it('covers PreK', () => {
    assertGradeCoverage('prek');
  });

  it('covers Kindergarten', () => {
    assertGradeCoverage('k');
  });
});
