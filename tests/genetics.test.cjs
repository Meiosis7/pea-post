const test = require('node:test');
const assert = require('node:assert/strict');
let Genetics = {};
try { Genetics = require('../genetics.js'); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }

test('gametes retain equal-probability allele copies and independent assortment', () => {
  assert.equal(typeof Genetics.gametes, 'function');
  assert.deepEqual(Genetics.gametes('Aa'), ['A', 'a']);
  assert.deepEqual(Genetics.gametes('AA'), ['A', 'A']);
  assert.deepEqual(Genetics.gametes('YyRr'), ['YR', 'Yr', 'yR', 'yr']);
});
test('Mendel monohybrid self-cross gives genotype 1:2:1 and phenotype 3:1', () => {
  assert.equal(typeof Genetics.cross, 'function');
  assert.deepEqual(Genetics.cross('Aa', 'Aa'), {
    genotypes: { AA: .25, Aa: .5, aa: .25 },
    phenotypes: { '紫花': .75, '白花': .25 }
  });
});
test('dihybrid self-cross gives phenotype 9:3:3:1', () => {
  assert.equal(typeof Genetics.cross, 'function');
  assert.deepEqual(Genetics.cross('YyRr', 'YyRr').phenotypes, {
    '黄色圆粒': 9 / 16, '黄色皱粒': 3 / 16, '绿色圆粒': 3 / 16, '绿色皱粒': 1 / 16
  });
});
test('testcross ratios are 1:1 and 1:1:1:1', () => {
  assert.equal(typeof Genetics.cross, 'function');
  assert.deepEqual(Genetics.cross('Aa', 'aa').phenotypes, { '紫花': .5, '白花': .5 });
  assert.deepEqual(Genetics.cross('YyRr', 'yyrr').phenotypes, {
    '黄色圆粒': .25, '黄色皱粒': .25, '绿色圆粒': .25, '绿色皱粒': .25
  });
});
test('homozygous parents give a uniform heterozygous F1', () => {
  assert.equal(typeof Genetics.cross, 'function');
  assert.deepEqual(Genetics.cross('YYRR', 'yyrr'), { genotypes: { YyRr: 1 }, phenotypes: { '黄色圆粒': 1 } });
});
test('canonicalization puts uppercase alleles first', () => {
  assert.equal(typeof Genetics.cross, 'function');
  assert.deepEqual(Genetics.cross('aA', 'aa'), Genetics.cross('Aa', 'aa'));
  assert.deepEqual(Genetics.cross('yYrR', 'yyrr'), Genetics.cross('YyRr', 'yyrr'));
});
test('all valid parent crosses conserve total probability and are symmetric', () => {
  assert.equal(typeof Genetics.cross, 'function');
  const parents = ['YYRR','YYRr','YYrr','YyRR','YyRr','Yyrr','yyRR','yyRr','yyrr'];
  for (const a of parents) for (const b of parents) {
    const result = Genetics.cross(a,b);
    assert.equal(Object.values(result.genotypes).reduce((a,b) => a+b,0),1);
    assert.equal(Object.values(result.phenotypes).reduce((a,b) => a+b,0),1);
    assert.deepEqual(result,Genetics.cross(b,a));
  }
});
test('malformed input and mismatched genes are rejected', () => {
  assert.equal(typeof Genetics.gametes, 'function');
  for (const input of ['', 'A', 'AAA', 'AB', 'AaAa', 'YyRRx', 'YyR1', null, 42, 'Bb']) assert.throws(() => Genetics.gametes(input), /genotype/i);
  assert.throws(() => Genetics.cross('Aa','YyRr'), /gene/i);
});
test('sampling returns exactly n offspring and follows injected random source', () => {
  assert.equal(typeof Genetics.sample, 'function');
  assert.deepEqual(Genetics.sample('Aa','Aa',4,() => 0), { '紫花':4 });
  assert.deepEqual(Genetics.sample('Aa','Aa',4,() => .99), { '白花':4 });
  assert.deepEqual(Genetics.sample('Aa','Aa',0), {});
  assert.throws(() => Genetics.sample('Aa','Aa',-1), /count/i);
  assert.throws(() => Genetics.sample('Aa','Aa',2.5), /count/i);
});
