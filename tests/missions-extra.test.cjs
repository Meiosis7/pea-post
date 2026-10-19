const test = require('node:test');
const assert = require('node:assert/strict');
const Genetics = require('../genetics.js');
let missions = [];
try { missions = require('../missions-extra.js'); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
const solutions = [
  [['YYrr', 'yyRR']],
  [['YyRr', 'YyRr']],
  [['YyRr', 'Yyrr']],
  [['Yyrr', 'yyrr']],
  [['yyRr', 'yyRr']],
  [['YYRr', 'YyRR'], ['YYRR', 'YyRr']],
  [['YyRr', 'Yyrr'], ['YyRr', 'yyRr']],
  [['yyRR', 'yyRr']]
];
const stock = ['YYRR','YYRr','YYrr','YyRR','YyRr','Yyrr','yyRR','yyRr','yyrr'];
test('eight advanced quests expose complete readable schema', () => {
  assert.equal(missions.length, 8);
  for (const mission of missions) {
    for (const key of ['title','short','topic','icon','from','copy','goal','condition','target','hint','insight']) assert.equal(typeof mission[key], 'string', key);
    assert.equal(mission.family, 2);
    assert.equal(typeof mission.check, 'function');
    assert.ok(mission.p >= 0 && mission.p <= 1);
    assert.ok(!mission.detective);
  }
});
for (let i = 0; i < 8; i++) test(`quest ${i+9}: all 81 pairings match intended solution set and forecast`, () => {
  assert.ok(missions[i], 'quest exists');
  const m = missions[i];
  const canonical = (a,b) => [a,b].sort().join(' × ');
  const expected = new Set(solutions[i].map(([a,b]) => canonical(a,b)));
  const actual = new Set();
  for (const a of stock) for (const b of stock) {
    const d = Genetics.cross(a,b);
    const valid = m.check(a,b,d);
    assert.equal(valid, expected.has(canonical(a,b)), `${a} × ${b}`);
    if (valid) {
      actual.add(canonical(a,b));
      assert.equal(d.phenotypes[m.target] || 0, m.p, `${a} × ${b} forecast`);
    }
  }
  assert.deepEqual(actual, expected);
  assert.ok(actual.size > 0);
});
