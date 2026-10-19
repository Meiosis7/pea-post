(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Genetics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Mendelian model: complete dominance, independent assortment and equally viable offspring.
  function pairs(genotype) {
    if (typeof genotype !== 'string' || !/^(?:[Aa]{2}|[Yy]{2}[Rr]{2})$/.test(genotype)) {
      throw new TypeError('Invalid genotype: expected AA/Aa/aa or a Y/y pair followed by an R/r pair.');
    }
    return genotype.match(/.{2}/g).map(pair => pair.split('').sort().join(''));
  }

  function gametes(genotype) {
    return pairs(genotype).reduce((result, pair) => result.flatMap(prefix => [prefix + pair[0], prefix + pair[1]]), ['']);
  }

  function phenotype(genotype) {
    if (genotype.length === 2) return genotype.includes('A') ? '紫花' : '白花';
    return (genotype.includes('Y') ? '黄色' : '绿色') + (genotype.includes('R') ? '圆粒' : '皱粒');
  }

  function cross(a, b) {
    const first = gametes(a);
    const second = gametes(b);
    if (a.length !== b.length) throw new TypeError('Cannot cross genotypes with different genes.');
    const genotypes = {};
    const phenotypes = {};
    const weight = 1 / (first.length * second.length);
    for (const x of first) for (const y of second) {
      const genotype = [...x].map((allele, i) => [allele, y[i]].sort().join('')).join('');
      const trait = phenotype(genotype);
      genotypes[genotype] = (genotypes[genotype] || 0) + weight;
      phenotypes[trait] = (phenotypes[trait] || 0) + weight;
    }
    return { genotypes, phenotypes };
  }

  function sample(a, b, n, rng = Math.random) {
    if (!Number.isSafeInteger(n) || n < 0) throw new TypeError('Offspring count must be a nonnegative integer.');
    const distribution = Object.entries(cross(a, b).phenotypes);
    const counts = {};
    for (let i = 0; i < n; i++) {
      let draw = rng();
      if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Random source must return a number in [0, 1).');
      let selected = distribution[distribution.length - 1][0];
      for (const [trait, probability] of distribution) {
        if (draw < probability) { selected = trait; break; }
        draw -= probability;
      }
      counts[selected] = (counts[selected] || 0) + 1;
    }
    return counts;
  }

  return Object.freeze({ gametes, cross, sample });
});
