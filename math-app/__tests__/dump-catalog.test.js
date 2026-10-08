/**
 * Catalog dumper — no-ops unless DUMP_CATALOG=1.
 * Run: DUMP_CATALOG=1 npx jest dump-catalog --ci
 * Writes docs/catalog.json (full unit/level tree) and docs/level-ids.json.
 */
describe('catalog dump', () => {
  it('writes catalog json when DUMP_CATALOG=1', () => {
    if (process.env.DUMP_CATALOG !== '1') return;
    const { allLevels, GRADES } = require('../src/core/curriculum');
    const fs = require('fs');
    const path = require('path');
    const catalog = {
      generatedAt: new Date().toISOString(),
      totalLevels: GRADES.reduce((sum, grade) => sum + allLevels(grade).length, 0),
      grades: GRADES.map((grade) => ({
        id: grade.id,
        title: grade.title,
        ages: grade.ages,
        levelCount: allLevels(grade).length,
        units: grade.units.map((unit) => ({
          id: unit.id,
          title: unit.title,
          emoji: unit.emoji,
          domain: unit.domain,
          levels: unit.levels.map((level) => ({
            id: level.id,
            title: level.title,
            kind: level.kind,
            difficulty: level.difficulty,
          })),
        })),
      })),
    };
    const docsDir = path.join(__dirname, '..', 'docs');
    fs.writeFileSync(path.join(docsDir, 'catalog.json'), `${JSON.stringify(catalog, null, 1)}\n`);
    fs.writeFileSync(
      path.join(docsDir, 'level-ids.json'),
      `${JSON.stringify(GRADES.flatMap((grade) => allLevels(grade).map((level) => level.id)), null, 0)}\n`,
    );
  });
});
