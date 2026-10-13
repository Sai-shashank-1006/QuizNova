/* QuizNova — GATE problem generator.
 *
 * Adds GATE topics to QUIZ_MATHS (js/maths.js), in learning order: General Aptitude and Engineering Mathematics
 * (common to every branch), then the CS/IT syllabus. Each topic has easy, medium and hard problems built from
 * random numbers, and every answer is worked out by code: schedules, page faults, hash tables, heaps, minimal DFAs,
 * K-map covers and normal forms are actually simulated or computed, not looked up. Explanations show the method.
 *
 * Makers return { q, a, ex, t } plus optional x/w (wrong options), u/pre (units), table (data or a matrix),
 * lines (numbered clues), code (a snippet), tf (a statement to judge), mono and noType — see js/maths.js.
 */
(() => {
  'use strict';
  const QM = window.QUIZ_MATHS;
  if (!QM || !QM.register) return;
  const { num, frac, gcd, lcm, sup, MINUS, poly, fact, nCr, signed, distinct, probW } = QM.helpers;

  /* ---------- Helpers ---------- */
  const sum = a => a.reduce((s, v) => s + v, 0);
  const round = (v, p) => Math.round(v * 10 ** p) / 10 ** p;
  const bin = (v, w) => v.toString(2).padStart(w, '0');
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const sub = v => String(v).replace(/\d/g, c => SUB[c]);
  const an = n => (/^(8|11|18)/.test(String(n)) ? 'an' : 'a');
  const pad2 = m => String(m).padStart(2, '0');
  const sorted = xs => xs.slice().sort((a, b) => a - b);
  const listNums = xs => sorted(xs).map(num).join(', ');
  // "3x − y" style sums: [[3, 'x'], [−1, 'y']]; a coefficient of ±1 is left out before a symbol.
  const terms = list => {
    let s = '';
    for (const [c, v] of list) {
      if (!c) continue;
      const t = (Math.abs(c) === 1 && v ? '' : num(Math.abs(c))) + v;
      s += s ? (c < 0 ? ` ${MINUS} ` : ' + ') + t : (c < 0 ? MINUS : '') + t;
    }
    return s || '0';
  };
  const ekx = k => (k === 0 ? '1' : `e${sup(k === 1 ? '' : k === -1 ? '-' : k)}ˣ`); // e^(kx)
  const coef = (c, s) => (c === 1 ? s : c === -1 ? MINUS + s : num(c) + s);
  const mat = (rows, name = 'A') => ({ matrix: true, label: `${name} =`, rows: rows.map(r => r.map(v => num(v))) });
  const det2 = m => m[0][0] * m[1][1] - m[0][1] * m[1][0];
  const minor = (m, i, j) => m.filter((_, r) => r !== i).map(row => row.filter((_, c) => c !== j));
  const det3 = m => m[0][0] * det2(minor(m, 0, 0)) - m[0][1] * det2(minor(m, 0, 1)) + m[0][2] * det2(minor(m, 0, 2));
  const charEq = (tr, d) => `${terms([[1, 'λ²'], [-tr, 'λ'], [d, '']])} = 0`;
  const theta = s => `Θ(${s})`;
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = d => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const NAMES = ['Ravi', 'Asha', 'Kiran', 'Meera', 'Arjun', 'Neha', 'Vikram', 'Divya'];
  const QUADS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 5, 14, 15]];
  const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]];

  /* ---------- 1. Numerical Ability (GATE General Aptitude) ----------
     GATE's numerical questions are aptitude problems pitched a level up, so this reuses js/aptitude.js's makers. */
  const fromApt = (kinds, lv) => kinds.flatMap(k => (QM.makersOf(k) || {})[lv] || []);
  const NUMERICAL = {
    easy: fromApt(['apt-percent', 'apt-ratio', 'apt-average', 'apt-series', 'apt-work', 'apt-speed', 'apt-profit'], 'medium'),
    medium: fromApt(['apt-percent', 'apt-ratio', 'apt-average', 'apt-series', 'apt-work', 'apt-speed', 'apt-profit'], 'hard'),
    hard: fromApt(['apt-pnc', 'apt-probability', 'apt-mixture', 'apt-number', 'apt-interest', 'apt-ages'], 'hard'),
  };

  /* ---------- 2. Analytical & Spatial Reasoning ---------- */
  const shift = (w, k) => w.replace(/[A-Z]/g, c => String.fromCharCode((((c.charCodeAt(0) - 65 + k) % 26) + 26) % 26 + 65));
  const CODE_WORDS = ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'LAMP', 'FISH', 'BIRD', 'RAIN', 'GOLD', 'CODE', 'DATA', 'GATE', 'EXAM', 'PLAN', 'TIME', 'WORD', 'MATH', 'ROAD', 'SHIP'];
  const letter = p => (p >= 1 && p <= 26 ? String.fromCharCode(64 + p) : null);
  const ANALYTICAL = {
    easy: [
      h => {
        const H = h.int(1, 12), M = 5 * h.int(0, 11), raw = Math.abs(30 * (H % 12) - 5.5 * M), ang = raw > 180 ? 360 - raw : raw;
        if (!ang || ang === 180) return null;
        return { t: 'Clock angles', q: `What is the smaller angle between the hour and minute hands of a clock at ${H}:${pad2(M)}?`, a: ang, u: '°', x: [Math.abs(30 * (H % 12) - 6 * M), Math.abs(30 * (H % 12) - 5 * M), 180 - ang],
          ex: `Angle = |30H ${MINUS} 5.5M| = |30 × ${H % 12} ${MINUS} 5.5 × ${M}| = ${num(raw)}°${raw > 180 ? `; the smaller angle is 360° ${MINUS} ${num(raw)}° = ${num(ang)}°` : ''}.` };
      },
      h => {
        const k = h.pick([1, 2, 3, 4, -1, -2, -3]), [w1, w2] = h.shuffle(CODE_WORDS).slice(0, 2), ans = shift(w2, k);
        return { t: 'Coding–decoding', q: `In a code language, ${w1} is written as ${shift(w1, k)}. How is ${w2} written in that code?`, a: ans, mono: true,
          w: distinct(ans, [shift(w2, -k), shift(w2, k + 1), shift(w2, k - 1), ans.split('').reverse().join(''), shift(w2, k + 2)]),
          ex: `Each letter moves ${Math.abs(k)} place${Math.abs(k) > 1 ? 's' : ''} ${k > 0 ? 'forward' : 'back'} in the alphabet (${w1[0]} → ${shift(w1[0], k)}), so ${w2} → ${ans}.` };
      },
      h => {
        const [p, q, r] = h.pick(TRIPLES), [dx, dy] = h.chance(0.5) ? [p, q] : [q, p], back = h.int(2, 9), north = dy + back, name = h.pick(NAMES);
        return { t: 'Direction sense', q: `${name} walks ${north} km north, turns right and walks ${dx} km, then turns right again and walks ${back} km. How far is ${name} from the starting point?`, a: r, u: ' km', x: [north + dx + back, dx + dy, north + dx - back],
          ex: `Net: ${north} ${MINUS} ${back} = ${dy} km north and ${dx} km east. Distance = √(${dy}² + ${dx}²) = ${r} km.` };
      },
      h => {
        if (h.chance(0.5)) {
          const a = h.int(3, 18), b = h.int(2, 26 - a), pos = a + b;
          return { t: 'Alphabet positions', q: `In the English alphabet, which letter is ${b} places to the right of the ${a}th letter from the left?`, a: letter(pos), w: distinct(letter(pos), [letter(pos - 1), letter(pos + 1 > 26 ? pos - 2 : pos + 1), letter(a), letter(Math.max(1, pos - 2))]),
            ex: `The ${a}th letter is ${letter(a)}; ${b} places to its right is position ${a} + ${b} = ${pos}: ${letter(pos)}.` };
        }
        const a = h.int(3, 18), b = h.int(2, 26 - a), pos = 27 - a - b;
        return { t: 'Alphabet positions', q: `In the English alphabet, which letter is ${b} places to the left of the ${a}th letter from the right?`, a: letter(pos), w: distinct(letter(pos), [letter(26 - a - b), letter(pos + 1), letter(27 - a), letter(Math.min(26, pos + 2))].filter(Boolean)),
          ex: `The ${a}th letter from the right is at position 27 ${MINUS} ${a} = ${27 - a} (${letter(27 - a)}); ${b} places to its left is ${27 - a} ${MINUS} ${b} = ${pos}: ${letter(pos)}.` };
      },
    ],
    medium: [
      h => {
        const n = h.int(3, 10), m = n - 2, k = h.int(0, 3), vals = [8, 12 * m, 6 * m * m, m ** 3];
        const what = ['exactly three painted faces', 'exactly two painted faces', 'exactly one painted face', 'no painted face'][k];
        const why = [`the 8 corner cubes`, `the edge cubes: 12 edges × (${n} ${MINUS} 2) = ${vals[1]}`, `the face centres: 6 faces × (${n} ${MINUS} 2)² = ${vals[2]}`, `the inner cube: (${n} ${MINUS} 2)³ = ${vals[3]}`][k];
        return { t: 'Painted cubes', q: `A cube is painted on all faces and cut into ${n ** 3} equal small cubes (${n} along each edge). How many small cubes have ${what}?`, a: vals[k], x: vals.filter((_, i) => i !== k), ex: `These are ${why}.` };
      },
      h => {
        const y = h.int(2001, 2032), d1 = new Date(Date.UTC(y, h.int(0, 11), h.int(1, 28))), gap = h.int(20, 330), d2 = new Date(d1.getTime() + gap * 86400000);
        const w1 = d1.getUTCDay(), w2 = d2.getUTCDay();
        return { t: 'Calendars', q: `If ${fmtDate(d1)} is a ${DAYS[w1]}, what day of the week is ${fmtDate(d2)}?`, a: DAYS[w2], w: [1, 6, 2, 5, 3].map(k => DAYS[(w2 + k) % 7]),
          ex: `They are ${gap} days apart = ${Math.floor(gap / 7)} weeks and ${gap % 7} day${gap % 7 === 1 ? '' : 's'}, so count ${gap % 7} on from ${DAYS[w1]}: ${DAYS[w2]}.` };
      },
      h => {
        const n = h.int(3, 8), ans = (n * (n + 1) * (2 * n + 1)) / 6;
        return { t: 'Counting figures', q: `How many squares of all sizes are there in a ${n} × ${n} grid of unit squares (like a ${n} × ${n} chessboard)?`, a: ans, x: [n * n, ans - n * n, ans + n], ex: `A square of side s fits in (${n} ${MINUS} s + 1)² places, so the total is 1² + 2² + … + ${n}² = ${ans}.` };
      },
      h => {
        let m, n; do { m = h.int(2, 7); n = h.int(2, 7); } while (m === n);
        const ans = nCr(m + 1, 2) * nCr(n + 1, 2);
        return { t: 'Counting figures', q: `How many rectangles (squares included) are there in a grid of ${m} × ${n} unit squares?`, a: ans, x: [m * n, nCr(m, 2) * nCr(n, 2), (m + 1) * (n + 1)],
          ex: `A rectangle is fixed by choosing 2 of the ${m + 1} vertical lines and 2 of the ${n + 1} horizontal lines: ${nCr(m + 1, 2)} × ${nCr(n + 1, 2)} = ${ans}.` };
      },
    ],
    hard: [
      h => {
        const H = h.int(1, 10), w = Math.floor((60 * H) / 11), r = (60 * H) % 11, txt = (a, b) => `${a}${b ? ` ${b}/11` : ''} minutes past ${H}`;
        return { t: 'Clocks', q: `At what time between ${H} and ${H + 1} o’clock are the hands of a clock together?`, a: txt(w, r), w: distinct(txt(w, r), [`${5 * H} minutes past ${H}`, txt(w + 1, r), txt(w, 11 - r), txt(w - 1, r)]),
          ex: `The minute hand gains 5.5° a minute and starts 30 × ${H} = ${30 * H}° behind: ${30 * H}/5.5 = 60 × ${H}/11 = ${txt(w, r).replace(` minutes past ${H}`, '')} minutes.` };
      },
      h => {
        let a, b, c; do { a = h.int(3, 8); b = h.int(3, 8); c = h.int(3, 8); } while (a === b && b === c);
        const [p, q, r] = [a - 2, b - 2, c - 2], k = h.int(0, 2);
        const vals = [4 * (p + q + r), 2 * (p * q + q * r + r * p), p * q * r];
        const what = ['exactly two painted faces', 'exactly one painted face', 'no painted face'][k];
        const why = [`edge cubes: 4[(${a} ${MINUS} 2) + (${b} ${MINUS} 2) + (${c} ${MINUS} 2)] = ${vals[0]}`, `face cubes: 2[${p}×${q} + ${q}×${r} + ${r}×${p}] = ${vals[1]}`, `inner cubes: ${p} × ${q} × ${r} = ${vals[2]}`][k];
        return { t: 'Painted cubes', q: `A ${a} cm × ${b} cm × ${c} cm block is painted on all faces and cut into 1 cm cubes. How many cubes have ${what}?`, a: vals[k], x: [...vals.filter((_, i) => i !== k), 8], ex: `Count the ${why}.` };
      },
      h => {
        const y = h.int(1901, 2099), mo = h.int(0, 11), dim = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate(), d = h.int(1, dim);
        const date = new Date(Date.UTC(y, mo, d)), N = y - 1, L = Math.floor(N / 4) - Math.floor(N / 100) + Math.floor(N / 400);
        const before = (Date.UTC(y, mo, 1) - Date.UTC(y, 0, 1)) / 86400000, o1 = (N + L) % 7, o2 = (before + d) % 7, w = date.getUTCDay();
        return { t: 'Calendars', q: `What day of the week was ${fmtDate(date)}?`, a: DAYS[w], w: [1, 6, 2, 5].map(k => DAYS[(w + k) % 7]),
          ex: `Odd days: ${N} full years with ${L} leap years give (${N} + ${L}) mod 7 = ${o1}; then ${before} + ${d} days this year give ${o2}. (${o1} + ${o2}) mod 7 = ${w}, and 0 is Sunday: ${DAYS[w]}.` };
      },
      h => {
        const N = h.int(120, 999), dgt = h.int(1, 9), places = [0, 0, 0];
        for (let v = 1; v <= N; v++) String(v).split('').reverse().forEach((c, i) => { if (+c === dgt) places[i]++; });
        const ans = sum(places);
        return { t: 'Number puzzles', q: `How many times is the digit ${dgt} written when all the numbers from 1 to ${N} are written down?`, a: ans, x: [places[0], places[0] + places[1], ans + 10],
          ex: `Count by place: units ${places[0]}, tens ${places[1]}, hundreds ${places[2]}. Total ${ans}.` };
      },
    ],
  };

  /* ---------- 3. Linear Algebra ---------- */
  const rand3 = (h, lo, hi) => [0, 1, 2].map(() => [0, 1, 2].map(() => h.int(lo, hi)));
  const indep = (u, v) => u[1] * v[2] - u[2] * v[1] || u[2] * v[0] - u[0] * v[2] || u[0] * v[1] - u[1] * v[0];
  function rankMatrix(h, rk) {
    const vec = () => [h.int(-3, 5), h.int(-3, 5), h.int(-3, 5)];
    if (rk === 1) {
      let v; do v = vec(); while (v.every(x => !x));
      const k2 = h.nz(-3, 3), k3 = h.nz(-3, 3);
      return { m: [v, v.map(x => k2 * x), v.map(x => k3 * x)], ex: `Row 2 = ${num(k2)} × row 1 and row 3 = ${num(k3)} × row 1, so only one row is independent: rank 1.` };
    }
    if (rk === 2) {
      let r1, r2; do { r1 = vec(); r2 = vec(); } while (!indep(r1, r2));
      const p = h.nz(-2, 3), q = h.nz(-2, 3);
      return { m: [r1, r2, r1.map((x, i) => p * x + q * r2[i])], ex: `Row 3 = ${num(p)} × row 1 ${q < 0 ? MINUS : '+'} ${Math.abs(q)} × row 2, so |A| = 0, while rows 1 and 2 are not multiples of each other: rank 2.` };
    }
    let m; do m = [vec(), vec(), vec()]; while (!det3(m));
    return { m, ex: `|A| = ${num(det3(m))} ≠ 0, so all three rows are independent: rank 3.` };
  }
  function eig2(h) {
    for (;;) {
      const l1 = h.int(-4, 9), l2 = h.int(-4, 9);
      if (l1 === l2) continue;
      const a = h.int(-3, 8), d = l1 + l2 - a, bc = a * d - l1 * l2;
      if (!bc) continue;
      const divs = [];
      for (let k = 1; k <= Math.min(12, Math.abs(bc)); k++) if (bc % k === 0 && Math.abs(bc / k) <= 12) divs.push(k, -k);
      if (!divs.length) continue;
      const b = h.pick(divs);
      return { m: [[a, b], [bc / b, d]], l1: Math.min(l1, l2), l2: Math.max(l1, l2) };
    }
  }
  const LINALG = {
    easy: [
      h => {
        const m = [[h.nz(-5, 9), h.nz(-5, 9)], [h.nz(-5, 9), h.nz(-5, 9)]], d = det2(m);
        return { t: 'Determinants', q: 'What is the determinant of A?', table: mat(m), a: d, x: [m[0][0] * m[1][1] + m[0][1] * m[1][0], m[0][0] * m[1][0] - m[0][1] * m[1][1], -d],
          ex: `|A| = ad ${MINUS} bc = ${signed(m[0][0])} × ${signed(m[1][1])} ${MINUS} ${signed(m[0][1])} × ${signed(m[1][0])} = ${num(d)}.` };
      },
      h => {
        const m = rand3(h, -4, 9), tr = m[0][0] + m[1][1] + m[2][2];
        return { t: 'Eigenvalues', q: 'What is the sum of the eigenvalues of A?', table: mat(m), a: tr, x: [sum(m[0]), m[0][0] * m[1][1] * m[2][2], tr + 2],
          ex: `The sum of the eigenvalues is the trace: ${signed(m[0][0])} + ${signed(m[1][1])} + ${signed(m[2][2])} = ${num(tr)}.` };
      },
      h => {
        let dg; do dg = [h.nz(-4, 8), h.nz(-4, 8), h.nz(-4, 8)]; while (new Set(dg).size < 3);
        const m = [[dg[0], h.int(-5, 9), h.int(-5, 9)], [0, dg[1], h.int(-5, 9)], [0, 0, dg[2]]];
        if (h.chance(0.5)) {
          const ans = listNums(dg);
          return { t: 'Eigenvalues', q: 'What are the eigenvalues of A?', table: mat(m), a: ans, w: distinct(ans, [listNums(m[0]), listNums([m[0][2], m[1][2], m[2][2]]), listNums(dg.map(v => -v)), listNums([dg[0], dg[1], m[0][1]])]),
            ex: `A is upper triangular, so its eigenvalues are the diagonal entries: ${ans}.` };
        }
        const p = dg[0] * dg[1] * dg[2];
        return { t: 'Determinants', q: 'What is the determinant of A?', table: mat(m), a: p, x: [sum(dg), m[0][0] * m[0][1] * m[0][2], -p],
          ex: `A is triangular, so |A| is the product of the diagonal: ${signed(dg[0])} × ${signed(dg[1])} × ${signed(dg[2])} = ${num(p)}.` };
      },
    ],
    medium: [
      h => {
        const m = rand3(h, -3, 5), d = det3(m), c = [0, 1, 2].map(j => det2(minor(m, 0, j)));
        return { t: 'Determinants', q: 'What is the determinant of A?', table: mat(m), a: d, x: [-d, m[0][0] * m[1][1] * m[2][2], m[0][0] * c[0] + m[0][1] * c[1] + m[0][2] * c[2]],
          ex: `Expand along row 1: ${signed(m[0][0])}(${num(c[0])}) ${MINUS} ${signed(m[0][1])}(${num(c[1])}) + ${signed(m[0][2])}(${num(c[2])}) = ${num(d)}.` };
      },
      h => {
        const { m, l1, l2 } = eig2(h), tr = l1 + l2, d = l1 * l2;
        return { t: 'Eigenvalues', q: 'What is the larger eigenvalue of A?', table: mat(m), a: l2, x: [l1, tr, d],
          ex: `Characteristic equation: ${charEq(tr, d)}, i.e. ${[l1, l2].map(l => (l ? `(λ ${l < 0 ? '+' : MINUS} ${Math.abs(l)})` : 'λ')).join('')} = 0, so λ = ${num(l1)} or ${num(l2)}.` };
      },
      h => {
        const rk = h.pick([1, 2, 2, 3]), { m, ex } = rankMatrix(h, rk);
        return { t: 'Rank', q: 'What is the rank of A?', table: mat(m), a: rk, x: [1, 2, 3, 0].filter(v => v !== rk), ex };
      },
      h => {
        let ls; do ls = [h.nz(-3, 5), h.nz(-3, 5), h.nz(-3, 5)]; while (new Set(ls).size < 3);
        const k = h.pick([2, 3, -2]), op = h.pick(['sq', 'shift', 'scale', 'inv']);
        const name = { sq: 'A²', shift: `A ${k < 0 ? MINUS : '+'} ${Math.abs(k)}I`, scale: `${num(k)}A`, inv: 'A⁻¹' }[op];
        const f = { sq: l => l * l, shift: l => l + k, scale: l => k * l }[op];
        const fmtInv = xs => xs.slice().sort((a, b) => 1 / a - 1 / b).map(l => frac(1, l)).join(', ');
        const ans = op === 'inv' ? fmtInv(ls) : listNums(ls.map(f));
        const w = op === 'inv' ? [listNums(ls.map(l => -l)), listNums(ls), fmtInv(ls.map(l => -l))] : [listNums(ls.map(l => 2 * l)), listNums(ls), listNums(ls.map(l => l + 1)), listNums(ls.map(l => l * l + k)), fmtInv(ls)];
        const why = { sq: 'Av = λv gives A²v = λ²v, so square each', shift: `(A ${k < 0 ? MINUS : '+'} ${Math.abs(k)}I)v = (λ ${k < 0 ? MINUS : '+'} ${Math.abs(k)})v, so add ${num(k)} to each`, scale: `multiply each by ${num(k)}`, inv: 'Av = λv gives A⁻¹v = (1/λ)v, so take reciprocals' }[op];
        return { t: 'Eigenvalues', q: `The eigenvalues of a 3 × 3 matrix A are ${listNums(ls)}. What are the eigenvalues of ${name}?`, a: ans, w: distinct(ans, w), ex: `${why[0].toUpperCase() + why.slice(1)}: ${ans}.` };
      },
      h => {
        let m, d; do { m = [[h.nz(-4, 7), h.nz(-4, 7)], [h.nz(-4, 7), h.nz(-4, 7)]]; d = det2(m); } while (!d || Math.abs(d) > 15);
        const [[a, b], [c, dd]] = m, pick = h.pick([['1, 2', -b], ['2, 1', -c], ['1, 1', dd], ['2, 2', a]]), ans = frac(pick[1], d);
        return { t: 'Inverse', q: `What is the (${pick[0]}) entry of A⁻¹?`, table: mat(m), a: ans, w: distinct(ans, [frac(-pick[1], d), frac(pick[1], 1), frac(d, pick[1] || 1), frac(pick[0] === '1, 2' ? b : pick[0] === '2, 1' ? c : pick[0] === '1, 1' ? a : dd, d)]),
          ex: `A⁻¹ = (1/|A|) [d, ${MINUS}b; ${MINUS}c, a] with |A| = ${num(d)}, so the (${pick[0]}) entry is ${num(pick[1])}/${num(d)}${ans === `${num(pick[1])}/${num(d)}` ? '' : ` = ${ans}`}.` };
      },
    ],
    hard: [
      h => {
        const a1 = h.int(1, 5), b1 = h.nz(-6, 9), c1 = h.int(1, 20), m = h.nz(-3, 4), a2 = m * a1, k = m * b1;
        let c2; do c2 = h.int(-20, 30); while (c2 === m * c1);
        return { t: 'Systems of equations', q: `For what value of k does the system ${terms([[a1, 'x'], [b1, 'y']])} = ${c1}, ${terms([[a2, 'x'], [1, 'ky']])} = ${num(c2)} have no solution?`, a: k, x: [b1, a2, -k, k + 1],
          ex: `No solution needs the determinant ${a1}k ${MINUS} ${signed(b1)} × ${signed(a2)} = 0, so k = ${num(k)}; and ${num(c2)} ≠ ${num(m)} × ${c1}, so the two lines are parallel, not the same.` };
      },
      h => {
        const n = h.pick([2, 3, 4]), d = h.nz(-5, 6), k = h.int(2, 3), op = h.pick(['kA', 'adj', 'sq', 'inv']);
        if (op === 'inv') return { t: 'Determinant rules', q: `A is a ${n} × ${n} matrix with |A| = ${num(d)}. What is |A⁻¹|?`, a: frac(1, d), w: distinct(frac(1, d), [num(d), num(-d), frac(1, d ** n), frac(-1, d)]), ex: `|A⁻¹| = 1/|A| = ${frac(1, d)}.` };
        const v = { kA: k ** n * d, adj: d ** (n - 1), sq: d * d }[op], name = { kA: `${k}A`, adj: 'adj(A)', sq: 'A²' }[op];
        const why = { kA: `|kA| = kⁿ|A| = ${k}${sup(n)} × ${signed(d)}`, adj: `|adj A| = |A|ⁿ⁻¹ = ${signed(d)}${sup(n - 1)}`, sq: `|A²| = |A|² = ${signed(d)}²` }[op];
        return { t: 'Determinant rules', q: `A is a ${n} × ${n} matrix with |A| = ${num(d)}. What is |${name}|?`, a: v, x: { kA: [k * d, k ** (n - 1) * d, k + d], adj: [d ** n, d, n * d], sq: [2 * d, d, d ** n] }[op], ex: `${why} = ${num(v)}.` };
      },
      h => {
        const n = h.int(2, 5), c = h.nz(-3, 6), m = Array.from({ length: n }, () => Array(n).fill(c));
        return { t: 'Eigenvalues', q: 'What is the non-zero eigenvalue of A?', table: mat(m), a: n * c, x: [c, n, c * n * n],
          ex: `All rows are equal, so rank 1: ${n - 1} eigenvalue${n > 2 ? 's are' : ' is'} 0, and the last equals the trace, ${n} × ${signed(c)} = ${num(n * c)}.` };
      },
      h => {
        let m, d; do { m = [[h.int(-4, 7), h.int(-4, 7)], [h.int(-4, 7), h.int(-4, 7)]]; d = det2(m); } while (!d || Math.abs(d) > 12);
        const t = m[0][0] + m[1][1], ans = frac(t, d);
        return { t: 'Cayley–Hamilton', q: 'By the Cayley–Hamilton theorem, A⁻¹ = pA + qI. What is q?', table: mat(m), a: ans, w: distinct(ans, [frac(-1, d), frac(-t, d), frac(d, t || 1), num(t)]),
          ex: `A² ${MINUS} (${num(t)})A + (${num(d)})I = 0. Multiply by A⁻¹: A ${MINUS} (${num(t)})I + (${num(d)})A⁻¹ = 0, so A⁻¹ = ((${num(t)})I ${MINUS} A)/(${num(d)}) and q = ${ans}.` };
      },
      h => {
        const rk = h.pick([1, 2, 2]), { m, ex } = rankMatrix(h, rk);
        return { t: 'Null space', q: 'How many linearly independent solutions does Ax = 0 have?', table: mat(m), a: 3 - rk, x: [rk, 3, 0].filter(v => v !== 3 - rk), ex: `${ex} Nullity = 3 ${MINUS} rank = ${3 - rk}.` };
      },
    ],
  };

  /* ---------- 4. Calculus ---------- */
  const xk = k => (k === 1 ? 'x' : `${k}x`);
  const fac = r => (r === 0 ? 'x' : `(x ${r < 0 ? '+' : MINUS} ${Math.abs(r)})`);
  const WALLIS = { 2: 'π/4', 3: '2/3', 4: '3π/16', 5: '8/15', 6: '5π/32', 7: '16/35' };
  const CALCULUS = {
    easy: [
      h => {
        let a, b; do { a = h.int(1, 9); b = h.int(1, 9); } while (a === b);
        const tan = h.chance(0.4), ans = frac(a, b);
        return { t: 'Limits', q: `What is lim(x→0) ${tan ? `tan(${xk(a)})/sin(${xk(b)})` : `sin(${xk(a)})/(${xk(b)})`}?`, a: ans, w: distinct(ans, [frac(b, a), '1', '0', frac(a * a, b)]),
          ex: `Near 0, sin(kx) ≈ kx${tan ? ' and tan(kx) ≈ kx' : ''}, so the limit is ${a}/${b} = ${ans}.` };
      },
      h => {
        const a = h.int(1, 5), b = h.int(1, 4), e = v => (v === 1 ? 'e' : `e${sup(v)}`), ans = e(a * b);
        return { t: 'Limits', q: `What is lim(x→∞) (1 + ${a}/x)${b === 1 ? 'ˣ' : `${sup(b)}ˣ`}?`, a: ans, w: distinct(ans, [e(a), e(a + b), e(b), '1', String(a * b)]),
          ex: `(1 + a/x)^(bx) → e^(ab) as x → ∞, so the limit is e^(${a} × ${b}) = ${ans}.` };
      },
      h => {
        const a = h.nz(-3, 4), b = h.int(-6, 6), c = h.int(-9, 9), k = h.int(-3, 3), d = 3 * a * k * k + 2 * b * k + c;
        return { t: 'Derivatives', q: `If f(x) = ${poly([[a, 3], [b, 2], [c, 1]])}, what is f′(${num(k)})?`, a: d, x: [a * k ** 3 + b * k * k + c * k, 3 * a * k + 2 * b + c, d + 2],
          ex: `f′(x) = ${poly([[3 * a, 2], [2 * b, 1], [c, 0]])}, so f′(${num(k)}) = ${num(d)}.` };
      },
      h => {
        const a = h.int(1, 4), b = h.int(-4, 6), c = h.int(-5, 8), k = h.int(1, 4), top = 2 * a * k ** 3 + 3 * b * k * k + 6 * c * k, ans = frac(top, 6);
        return { t: 'Integrals', q: `What is ∫₀${sup(k)} (${poly([[a, 2], [b, 1], [c, 0]])}) dx?`, a: ans, w: distinct(ans, [frac(a * k ** 3 + b * k * k + c * k, 1), frac(2 * a * k + b, 1), frac(top + 6, 6), frac(top, 3)]),
          ex: `Antiderivative ${terms([[a, 'x³/3'], [b, 'x²/2'], [c, 'x']])}; at x = ${k} (minus 0 at x = 0) it is ${ans}.` };
      },
    ],
    medium: [
      h => {
        const a = h.int(-3, 3), b = h.int(a + 1, 5), fa = -(a ** 3) + 3 * a * a * b, fb = -(b ** 3) + 3 * a * b * b;
        return { t: 'Maxima and minima', q: `What is the local maximum value of f(x) = ${poly([[2, 3], [-3 * (a + b), 2], [6 * a * b, 1]])}?`, a: fa, x: [fb, a, b],
          ex: `f′(x) = 6${fac(a)}${fac(b)} = 0 at x = ${num(a)}, ${num(b)}. f″(${num(a)}) = 6(${num(a)} ${MINUS} ${signed(b)}) < 0, so the maximum is f(${num(a)}) = ${num(fa)}.` };
      },
      h => {
        const n = h.int(2, 6), a = h.int(1, 4), ans = n * a ** (n - 1);
        return { t: 'Limits', q: `What is lim(x→${a}) (x${sup(n)} ${MINUS} ${a ** n})/(x ${MINUS} ${a})?`, a: ans, x: [a ** n, n * a ** n, (n - 1) * a ** (n - 1)],
          ex: `It is the derivative of x${sup(n)} at x = ${a} (or use L’Hôpital): ${n} × ${a}${sup(n - 1)} = ${ans}.` };
      },
      h => {
        const a = h.int(2, 8), ans = frac(a * a, 2);
        return { t: 'Limits', q: `What is lim(x→0) (1 ${MINUS} cos ${xk(a)})/x²?`, a: ans, w: distinct(ans, [frac(a, 2), String(a * a), '0', frac(a * a, 4)]),
          ex: `Near 0, 1 ${MINUS} cos(kx) ≈ (kx)²/2, so the limit is ${a}²/2 = ${ans}.` };
      },
      h => {
        const k = h.int(1, 6), ans = frac(k ** 3, 6);
        return { t: 'Area', q: `What is the area enclosed between y = x² and y = ${xk(k)}?`, a: ans, w: distinct(ans, [frac(k ** 3, 3), frac(k ** 2, 2), frac(k ** 3, 2), frac(k ** 3, 12)]),
          ex: `They meet at x = 0 and x = ${k}: ∫₀${sup(k)} (${xk(k)} ${MINUS} x²) dx = ${k}³/2 ${MINUS} ${k}³/3 = ${k}³/6 = ${ans}.` };
      },
      h => {
        const m = h.int(1, 4), n = h.int(1, 4), p = h.int(1, 3), q = h.nz(-2, 3), fx = m * p ** (m - 1) * q ** n, pw = (v, e) => (e === 1 ? v : `${v}${sup(e)}`);
        return { t: 'Partial derivatives', q: `If f(x, y) = ${pw('x', m)}${pw('y', n)}, what is ∂f/∂x at (${p}, ${num(q)})?`, a: fx, x: [n * p ** m * q ** (n - 1), p ** m * q ** n, fx + m],
          ex: `∂f/∂x = ${m === 1 ? '' : m}${m - 1 ? pw('x', m - 1) : ''}${pw('y', n)} → ${m} × ${p}${sup(m - 1)} × ${signed(q)}${sup(n)} = ${num(fx)}.` };
      },
    ],
    hard: [
      h => {
        const n = h.int(2, 7), fn = h.pick(['sin', 'cos']), ans = WALLIS[n], ks = [];
        for (let k = n; k >= 2; k -= 2) ks.push(`${k - 1}/${k}`);
        return { t: 'Definite integrals', q: `What is ∫₀^(π/2) ${fn}${sup(n)}x dx?`, a: ans, w: distinct(ans, [WALLIS[n === 7 ? 6 : n + 1], WALLIS[n === 2 ? 3 : n - 1], 'π/2', WALLIS[n === 2 ? 4 : n === 3 ? 5 : n - 2]]),
          ex: `Wallis’ formula: ${ks.join(' × ')}${n % 2 ? '' : ' × π/2'} = ${ans}.` };
      },
      h => {
        const n = h.int(2, 5), a = h.int(1, 3), ans = frac(fact(n), a ** (n + 1));
        return { t: 'Definite integrals', q: `What is ∫₀^∞ x${sup(n)}${ekx(-a)} dx?`, a: ans, w: distinct(ans, [frac(fact(n), a ** n), String(fact(n)), frac(fact(n - 1), a ** (n + 1)), frac(fact(n + 1), a ** (n + 1))]),
          ex: `Gamma function: ∫₀^∞ xⁿe^(${MINUS}ax) dx = n!/a^(n+1) = ${fact(n)}/${a ** (n + 1)} = ${ans}.` };
      },
      h => {
        const a = h.nz(-3, 3), k = h.int(2, 5), ans = frac(a ** k, fact(k));
        return { t: 'Taylor series', q: `What is the coefficient of x${sup(k)} in the Maclaurin series of ${ekx(a)}?`, a: ans, w: distinct(ans, [frac(a ** k, k), frac(a, fact(k)), frac(a ** (k - 1), fact(k - 1)), frac(1, fact(k))]),
          ex: `e^(ax) = Σ (ax)ⁿ/n!, so the x${sup(k)} term has ${signed(a)}${sup(k)}/${k}! = ${ans}.` };
      },
      h => {
        const q4 = h.pick(QUADS), pt = h.shuffle(q4.slice(0, 3)).map(v => (h.chance(0.3) ? -v : v)), d = q4[3];
        return { t: 'Gradient', q: `What is the magnitude of the gradient of f = x² + y² + z² at (${pt.map(num).join(', ')})?`, a: 2 * d, x: [d, 2 * sum(pt.map(Math.abs)), d * d],
          ex: `∇f = (2x, 2y, 2z) = (${pt.map(v => num(2 * v)).join(', ')}); |∇f| = 2√(${pt.map(v => v * v).join(' + ')}) = 2 × ${d} = ${2 * d}.` };
      },
      h => {
        const a = h.int(1, 4), b = h.int(1, 4), xy = h.chance(0.5), ans = xy ? frac(a * a * b * b, 4) : frac(a * b * (a + b), 2);
        return { t: 'Double integrals', q: `What is ∫₀${sup(a)} ∫₀${sup(b)} ${xy ? 'xy' : '(x + y)'} dy dx?`, a: ans, w: distinct(ans, xy ? [frac(a * b, 4), frac(a * a * b * b, 2), frac(a * b * (a + b), 2)] : [frac(a * b * (a + b), 4), String(a * b * (a + b)), frac(a * a * b * b, 4)]),
          ex: xy ? `∫₀${sup(a)} x dx × ∫₀${sup(b)} y dy = ${a * a}/2 × ${b * b}/2 = ${ans}.` : `∫∫ x = ${b} × ${a * a}/2 and ∫∫ y = ${a} × ${b * b}/2; total ${a}·${b}(${a} + ${b})/2 = ${ans}.` };
      },
    ],
  };

  /* ---------- 5. Probability & Statistics ---------- */
  const PROBSTAT = {
    easy: [
      h => {
        const kind = h.pick(['mean', 'median', 'mode']);
        if (kind === 'mean') {
          const n = h.int(5, 7), A = h.int(10, 40), xs = Array.from({ length: n - 1 }, () => A + h.int(-8, 8)), last = n * A - sum(xs);
          if (last <= 0) return null;
          const list = h.shuffle([...xs, last]), med = sorted(list)[(n - 1) >> 1];
          return { t: 'Mean, median, mode', q: `What is the mean of ${list.join(', ')}?`, a: A, x: [med, A + 1, Math.round((n * A) / (n - 1))], ex: `Sum ${n * A} ÷ ${n} = ${A}.` };
        }
        if (kind === 'median') {
          const list = Array.from({ length: 7 }, () => h.int(1, 60)), s = sorted(list);
          return { t: 'Mean, median, mode', q: `What is the median of ${list.join(', ')}?`, a: s[3], x: [list[3], s[2], s[4], Math.round(sum(list) / 7)], ex: `Sorted: ${s.join(', ')}. The middle (4th) value is ${s[3]}.` };
        }
        const vals = h.shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, 5), list = h.shuffle([...vals, vals[0], vals[0], vals[1]]);
        return { t: 'Mean, median, mode', q: `What is the mode of ${list.join(', ')}?`, a: vals[0], x: [vals[1], sorted(list)[4], vals[2]], ex: `${vals[0]} appears 3 times, more than any other value.` };
      },
      h => {
        if (h.chance(0.5)) {
          const n = h.int(1, 5), e = 3.5 * n;
          return { t: 'Expectation', q: n === 1 ? 'What is the expected value of the number shown by a fair die?' : `What is the expected sum when ${n} fair dice are rolled?`, a: e, x: [3 * n, 6 * n, e + 1], ex: `Each die averages (1 + … + 6)/6 = 3.5, so ${n} × 3.5 = ${num(e)}.` };
        }
        const n = h.int(4, 20), e = (n + 1) / 2;
        return { t: 'Expectation', q: `X is equally likely to be any of 1, 2, …, ${n}. What is E[X]?`, a: e, x: [n / 2, n, e + 1], ex: `E[X] = (1 + ${n})/2 = ${num(e)}.` };
      },
      h => {
        const A = h.int(2, 7), B = h.int(2, 7);
        if (h.chance(0.5)) {
          const AB = h.int(1, Math.min(A, B)), ans = (A + B - AB) / 10;
          if (ans > 1) return null;
          return { t: 'Probability rules', q: `P(A) = ${A / 10}, P(B) = ${B / 10} and P(A ∩ B) = ${AB / 10}. What is P(A ∪ B)?`, a: ans, x: [(A + B) / 10, (A * B) / 100, AB / 10 + 0.5], ex: `P(A ∪ B) = P(A) + P(B) ${MINUS} P(A ∩ B) = ${A / 10} + ${B / 10} ${MINUS} ${AB / 10} = ${num(ans)}.` };
        }
        const ans = round((A * 10 + B * 10 - A * B) / 100, 2);
        return { t: 'Probability rules', q: `A and B are independent with P(A) = ${A / 10} and P(B) = ${B / 10}. What is P(A ∪ B)?`, a: ans, x: [(A + B) / 10, (A * B) / 100, round(1 - (A * B) / 100, 2)],
          ex: `P(A ∩ B) = ${A / 10} × ${B / 10} = ${num((A * B) / 100)}; P(A ∪ B) = ${A / 10} + ${B / 10} ${MINUS} ${num((A * B) / 100)} = ${num(ans)}.` };
      },
    ],
    medium: [
      h => {
        const n = h.int(2, 10), ans = frac(n * n - 1, 12);
        return { t: 'Variance', q: n === 6 ? 'What is the variance of the number shown by a fair die?' : `X is equally likely to be any of 1, 2, …, ${n}. What is Var(X)?`, a: ans, w: distinct(ans, [frac(n + 1, 2), frac(n * n + 1, 12), frac(n * n - 1, 6), frac((n - 1) ** 2, 12)]),
          ex: `For 1 to n equally likely, Var = (n² ${MINUS} 1)/12 = (${n * n} ${MINUS} 1)/12 = ${ans}.` };
      },
      h => {
        const n = h.int(3, 6), k = h.int(0, n), [pn, pd] = h.pick([[1, 2], [1, 3], [1, 4], [2, 3]]), top = nCr(n, k) * pn ** k * (pd - pn) ** (n - k), den = pd ** n;
        return { t: 'Binomial distribution', q: `${pd === 2 ? 'A fair coin' : `A coin with P(head) = ${pn}/${pd}`} is tossed ${n} times. What is the probability of exactly ${k} head${k === 1 ? '' : 's'}?`, a: frac(top, den),
          w: probW(top, den, h, [frac(pn ** k * (pd - pn) ** (n - k), den), frac(nCr(n, k), 2 ** n), frac(k, n)]),
          ex: `P = ${n}C${k} × (${pn}/${pd})${sup(k)} × (${pd - pn}/${pd})${sup(n - k)} = ${nCr(n, k)} × ${pn ** k * (pd - pn) ** (n - k)}/${den} = ${frac(top, den)}.` };
      },
      h => {
        const a = h.pick([20, 30, 40, 50, 60, 70]), p = h.int(1, 6), q = h.int(1, 6), top = a * p, den = a * p + (100 - a) * q;
        return { t: 'Bayes’ theorem', q: `Machine A makes ${a}% of a factory’s bolts and machine B the rest. ${p}% of A’s bolts and ${q}% of B’s are defective. A bolt chosen at random is defective. What is the probability it came from A?`, a: frac(top, den),
          w: probW(top, den, h, [frac(a, 100), frac(p, p + q), frac(a * p, 10000)]), ex: `P(A | D) = ${a}·${p}/(${a}·${p} + ${100 - a}·${q}) = ${top}/${den} = ${frac(top, den)}.` };
      },
      h => {
        const mu = h.int(10, 40); let d;
        do { d = [h.int(-6, 6), h.int(-6, 6), h.int(-6, 6), h.int(-6, 6)]; d.push(-sum(d)); } while (Math.abs(d[4]) > 9 || d.every(v => !v));
        const xs = d.map(v => mu + v), S = sum(d.map(v => v * v));
        return { t: 'Variance', q: `What is the variance of ${xs.join(', ')} (dividing by n)?`, a: S / 5, x: [S / 4, S, Math.sqrt(S / 5)], ex: `Mean ${mu}; squared deviations ${d.map(v => v * v).join(' + ')} = ${S}; variance = ${S}/5 = ${num(S / 5)}.` };
      },
      h => {
        const vals = sorted(h.shuffle([0, 1, 2, 3, 4, 5, 6, 8, 10]).slice(0, 3)); let ps;
        do ps = [h.int(1, 7), h.int(1, 7)]; while (sum(ps) >= 10);
        ps.push(10 - sum(ps));
        const E = sum(vals.map((v, i) => v * ps[i])) / 10;
        return { t: 'Expectation', q: 'X has the distribution in the table. What is E[X]?', table: { head: ['x', ...vals.map(String)], rows: [['P(X = x)', ...ps.map(p => num(p / 10))]] }, a: E, x: [sum(vals) / 3, sum(vals), E + 0.5],
          ex: `E[X] = Σ x·P(x) = ${vals.map((v, i) => `${v} × ${num(ps[i] / 10)}`).join(' + ')} = ${num(E)}.` };
      },
    ],
    hard: [
      h => {
        const l = h.int(1, 4), kind = h.pick(['zero', 'one', 'atMostOne']), e = `e${sup(-l)}`;
        const ans = { zero: e, one: `${l === 1 ? '' : l}${e}`, atMostOne: `${1 + l}${e}` }[kind];
        return { t: 'Poisson distribution', q: `X has a Poisson distribution with mean ${l}. What is ${{ zero: 'P(X = 0)', one: 'P(X = 1)', atMostOne: 'P(X ≤ 1)' }[kind]}?`, a: ans,
          w: distinct(ans, [e, `${l === 1 ? '' : l}${e}`, `${1 + l}${e}`, `1 ${MINUS} ${e}`, `${l}e${sup(l)}`]), ex: `P(X = k) = e^(${MINUS}λ)λᵏ/k! with λ = ${l}${kind === 'atMostOne' ? `: P(0) + P(1) = e${sup(-l)}(1 + ${l})` : ''}, so ${ans}.` };
      },
      h => {
        const mu = h.int(2, 10), t = h.int(1, mu), memo = h.chance(0.5), s = h.int(1, 5), ex = v => `e^(${MINUS}${v})`, ans = ex(frac(t, mu));
        return { t: 'Exponential distribution', q: memo ? `The lifetime of a bulb is exponential with mean ${mu} years. It has already lasted ${s} years. What is the probability it lasts ${t} more?` : `X is exponential with mean ${mu}. What is P(X > ${t})?`,
          a: ans, w: distinct(ans, [`1 ${MINUS} ${ans}`, ex(frac(mu, t)), ex(frac(t + (memo ? s : 0), mu)), ex(frac(t, mu * 2)), ex(String(t)), frac(t, mu)]),
          ex: `P(X > t) = e^(${MINUS}t/mean)${memo ? '; being memoryless, the time already lasted doesn’t matter' : ''}: ${ans}.` };
      },
      h => {
        const a = h.int(0, 5), b = a + h.int(2, 12), kind = h.pick(['var', 'prob']);
        if (kind === 'var') {
          const ans = frac((b - a) ** 2, 12);
          return { t: 'Uniform distribution', q: `X is uniform on [${a}, ${b}]. What is Var(X)?`, a: ans, w: distinct(ans, [frac(b - a, 12), frac((b - a) ** 2, 4), frac(a + b, 2), frac((b * b - a * a), 12)]), ex: `Var = (b ${MINUS} a)²/12 = ${b - a}²/12 = ${ans}.` };
        }
        const c = h.int(a + 1, b - 1), ans = frac(c - a, b - a);
        return { t: 'Uniform distribution', q: `X is uniform on [${a}, ${b}]. What is P(X < ${c})?`, a: ans, w: probW(c - a, b - a, h, [frac(c, b), frac(b - c, b - a)]), ex: `P = (${c} ${MINUS} ${a})/(${b} ${MINUS} ${a}) = ${ans}.` };
      },
      h => {
        const mu = h.int(-5, 10), v = h.int(1, 9), a = h.nz(-4, 4), b = h.int(-6, 9), askVar = h.chance(0.6);
        if (askVar) return { t: 'Expectation and variance', q: `E[X] = ${num(mu)} and Var(X) = ${v}. What is Var(${terms([[a, 'X'], [b, '']])})?`, a: a * a * v, x: [a * v, a * a * v + b, Math.abs(a) * v + b], ex: `Var(aX + b) = a²·Var(X) = ${a * a} × ${v} = ${a * a * v} (adding a constant changes nothing).` };
        return { t: 'Expectation and variance', q: `E[X] = ${num(mu)} and Var(X) = ${v}. What is E[${terms([[a, 'X'], [b, '']])}]?`, a: a * mu + b, x: [a * mu, mu + b, a * a * mu + b], ex: `E[aX + b] = a·E[X] + b = ${num(a)} × ${signed(mu)} + ${signed(b)} = ${num(a * mu + b)}.` };
      },
      h => {
        const [pn, pd] = h.pick([[1, 6], [1, 4], [1, 3], [2, 5], [1, 5], [3, 10], [2, 7]]), ans = frac(pd, pn);
        return { t: 'Geometric distribution', q: `Each attempt succeeds with probability ${pn}/${pd}, independently. What is the expected number of attempts up to and including the first success?`, a: ans, w: distinct(ans, [frac(pd - pn, pn), frac(pn, pd), frac(pd, pd - pn), frac(2 * pd, pn)]),
          ex: `For a geometric distribution E = 1/p = ${pd}/${pn}${ans === `${pd}/${pn}` ? '' : ` = ${ans}`}.` };
      },
    ],
  };

  /* ---------- 6. Differential Equations ---------- */
  const D1 = 'dy/dx', D2 = 'd²y/dx²', D3 = 'd³y/dx³';
  const RADICAL_DE = [
    [`${D2} = [1 + (${D1})²]^(3/2)`, 2, 2, 'Squaring gives (y″)² = (1 + (y′)²)³'],
    [`${D2} = √(1 + (${D1})³)`, 2, 2, 'Squaring gives (y″)² = 1 + (y′)³'],
    [`√(${D1}) + y = x`, 1, 1, 'Rearranging and squaring gives y′ = (x − y)²'],
    [`(${D3})^(2/3) = ${D2}`, 3, 2, 'Cubing gives (y‴)² = (y″)³'],
    [`${D1} = √(x + y)`, 1, 1, 'y′ already appears to the first power'],
    [`(${D2})³ = (1 + ${D1})²`, 2, 3, 'It is already a polynomial in the derivatives'],
  ];
  const deEq = (b, c) => `${terms([[1, 'y″'], [b, 'y′'], [c, 'y']])} = 0`;
  const C12 = (r1, r2) => `y = C₁${ekx(r1)} + C₂${ekx(r2)}`;
  const trig = (al, be) => { const inner = `C₁cos ${be === 1 ? '' : be}x + C₂sin ${be === 1 ? '' : be}x`; return al ? `y = ${ekx(al)}(${inner})` : `y = ${inner}`; };
  const DIFFEQ = {
    easy: [
      h => {
        const o = h.int(1, 3), p = h.int(1, 4), q = h.int(1, 5), c = h.int(2, 9), dn = [D1, D2, D3][o - 1];
        const eq = `${p === 1 ? dn : `(${dn})${sup(p)}`}${o > 1 ? ` + (${D1})${sup(q)}` : ''} + ${c}y = ${o > 1 ? '0' : 'sin x'}`, ans = `Order ${o}, degree ${p}`;
        return { t: 'Order and degree', q: `What are the order and degree of ${eq}?`, a: ans, w: distinct(ans, [`Order ${p}, degree ${o}`, `Order ${o}, degree ${q}`, `Order ${o + 1}, degree ${p}`, `Order ${o}, degree ${p + 1}`]),
          ex: `Order = the highest derivative (${dn}) = ${o}; degree = its power = ${p}.` };
      },
      h => {
        const k = h.nz(-3, 3), y0 = h.int(1, 6), c = v => (y0 === 1 ? '' : y0) + v, ans = `y = ${c(ekx(k))}`;
        return { t: 'First-order equations', q: `What is the solution of dy/dx = ${coef(k, 'y')} with y(0) = ${y0}?`, a: ans, w: distinct(ans, [`y = ${c(ekx(-k))}`, `y = ${y0} + ${ekx(k)}`, `y = ${ekx(k * y0)}`, `y = ${c(ekx(k + 1))}`]),
          ex: `Separate: dy/y = ${num(k)} dx, so y = Ce^(${num(k)}x); y(0) = ${y0} gives C = ${y0}.` };
      },
    ],
    medium: [
      h => {
        const kind = h.pick(['real', 'real', 'repeat', 'complex']);
        if (kind === 'real') {
          let r1, r2; do { r1 = h.nz(-5, 5); r2 = h.nz(-5, 5); } while (r1 >= r2 || r1 === -r2);
          const ans = C12(r1, r2);
          return { t: 'Second-order linear', q: `What is the general solution of ${deEq(-(r1 + r2), r1 * r2)}?`, a: ans, w: distinct(ans, [C12(-r2, -r1), `y = (C₁ + C₂x)${ekx(r1)}`, C12(r1, -r2), trig(0, Math.abs(r1) || 1)]),
            ex: `Auxiliary equation ${terms([[1, 'm²'], [-(r1 + r2), 'm'], [r1 * r2, '']])} = 0 has roots ${num(r1)} and ${num(r2)}, so ${ans}.` };
        }
        if (kind === 'repeat') {
          const r = h.nz(-4, 4), ans = `y = (C₁ + C₂x)${ekx(r)}`;
          return { t: 'Second-order linear', q: `What is the general solution of ${deEq(-2 * r, r * r)}?`, a: ans, w: distinct(ans, [C12(r, -r), `y = (C₁ + C₂x)${ekx(-r)}`, C12(r, 2 * r), trig(0, Math.abs(r))]),
            ex: `Auxiliary equation (m ${r < 0 ? '+' : MINUS} ${Math.abs(r)})² = 0 has a repeated root ${num(r)}, so ${ans}.` };
        }
        const al = h.int(-3, 3), be = h.int(1, 4), ans = trig(al, be);
        return { t: 'Second-order linear', q: `What is the general solution of ${deEq(-2 * al, al * al + be * be)}?`, a: ans, w: distinct(ans, [C12(al - be, al + be), trig(-al, be) === ans ? trig(al, 2 * be) : trig(-al, be), trig(al, be + 1), `y = (C₁ + C₂x)${ekx(al || be)}`]),
          ex: `Auxiliary roots m = ${al ? `${num(al)} ± ` : '±'}${be === 1 ? '' : be}i (complex), so ${ans}.` };
      },
      h => {
        const pool = [
          (k => [`dy/dx + (${k}/x)y = x`, `x${sup(k)}`, [`e${sup(k)}ˣ`, `x${sup(-k)}`, `${k}x`, 'ln x'], `e^(∫${k}/x dx) = e^(${k} ln x) = x${sup(k)}`])(h.int(1, 4)),
          (k => [`dy/dx + ${k}y = x`, `e${sup(k)}ˣ`, [`e${sup(-k)}ˣ`, `x${sup(k)}`, `${k}eˣ`], `e^(∫${k} dx) = e${sup(k)}ˣ`])(h.int(2, 5)),
          ['dy/dx + 2xy = x', 'e^(x²)', ['e²ˣ', 'e^(−x²)', 'x²'], 'e^(∫2x dx) = e^(x²)'],
          ['dy/dx + y tan x = sec x', 'sec x', ['cos x', 'tan x', 'e^(tan x)'], 'e^(∫tan x dx) = e^(ln sec x) = sec x'],
          ['dy/dx + y cot x = 1', 'sin x', ['cos x', 'cot x', 'cosec x'], 'e^(∫cot x dx) = e^(ln sin x) = sin x'],
        ];
        const [eq, ans, w, why] = h.pick(pool);
        return { t: 'Integrating factor', q: `What is the integrating factor of ${eq}?`, a: ans, w: distinct(ans, w), ex: `IF = e^(∫P dx) = ${why}.` };
      },
    ],
    hard: [
      h => {
        let r1, r2; do { r1 = h.nz(-4, 4); r2 = h.nz(-4, 4); } while (r1 === r2 || r1 === -r2);
        const c1 = h.nz(-4, 5), c2 = h.nz(-4, 5), A = c1 + c2, B = r1 * c1 + r2 * c2;
        return { t: 'Initial value problems', q: `${deEq(-(r1 + r2), r1 * r2)} with y(0) = ${num(A)} and y′(0) = ${num(B)} has solution y = C₁${ekx(r1)} + C₂${ekx(r2)}. What is C₁?`, a: c1, x: [c2, A, B],
          ex: `C₁ + C₂ = ${num(A)} and ${terms([[r1, 'C₁'], [r2, 'C₂']])} = ${num(B)} give C₁ = (${num(B)} ${MINUS} ${signed(r2)}·${signed(A)})/(${num(r1)} ${MINUS} ${signed(r2)}) = ${num(c1)}.` };
      },
      h => {
        let m1, m2; do { m1 = h.nz(-3, 4); m2 = h.nz(-3, 4); } while (m1 >= m2);
        const a = 1 - m1 - m2, b = m1 * m2, xp = m => (m === 1 ? 'x' : `x${sup(m)}`), ans = `y = C₁${xp(m1)} + C₂${xp(m2)}`;
        return { t: 'Cauchy–Euler equations', q: `What is the general solution of ${terms([[1, 'x²y″'], [a, 'xy′'], [b, 'y']])} = 0?`, a: ans, w: distinct(ans, [`y = C₁${xp(-m2)} + C₂${xp(-m1)}`, `y = C₁${ekx(m1)} + C₂${ekx(m2)}`, `y = C₁${xp(m1 + 1)} + C₂${xp(m2 + 1)}`, `y = (C₁ + C₂ ln x)${xp(m1)}`]),
          ex: `Try y = xᵐ: ${terms([[1, `m(m ${MINUS} 1)`], [a, 'm'], [b, '']])} = 0 → ${terms([[1, 'm²'], [a - 1, 'm'], [b, '']])} = 0 → m = ${num(m1)}, ${num(m2)}.` };
      },
      h => {
        const a = h.int(-4, 5), b = h.int(-6, 8), k = h.nz(-3, 3), D = k * k + a * k + b;
        if (!D) return null;
        const ans = frac(1, D);
        return { t: 'Particular integrals', q: `The particular integral of ${terms([[1, 'y″'], [a, 'y′'], [b, 'y']])} = ${ekx(k)} is A${ekx(k)}. What is A?`, a: ans, w: distinct(ans, [frac(1, k * k + b), frac(-1, D), frac(k, D), frac(1, D + 1)]),
          ex: `Put y = A${ekx(k)}: A(k² + ${signed(a)}k + ${signed(b)}) = 1 with k = ${num(k)}, so A = ${ans}.` };
      },
      h => {
        const [eq, o, d, why] = h.pick(RADICAL_DE), ans = `Order ${o}, degree ${d}`;
        return { t: 'Order and degree', q: `What are the order and degree of ${eq}?`, a: ans, w: distinct(ans, [`Order ${o}, degree ${d + 1}`, `Order ${d}, degree ${o}`, `Order ${o}, degree not defined`, `Order ${o + 1}, degree ${d}`]),
          ex: `${why}. Order ${o}, degree ${d}.` };
      },
    ],
  };

  /* ---------- 7. Numerical Methods ---------- */
  const NM_FACTS = [
    ['What is the order of convergence of the Newton–Raphson method (simple root)?', '2 (quadratic)', ['1 (linear)', '1.618', '3 (cubic)'], 'The error is roughly squared at each step'],
    ['What is the order of convergence of the bisection method?', '1 (linear)', ['2 (quadratic)', '1.618', '0.5'], 'The bracket halves each step, a fixed ratio of ½'],
    ['What is the order of convergence of the secant method?', '1.618', ['1 (linear)', '2 (quadratic)', '1.5'], 'Its order is the golden ratio (1 + √5)/2 ≈ 1.618'],
    ['Simpson’s 1/3 rule is exact for polynomials up to which degree?', '3', ['2', '1', '4'], 'It fits parabolas, yet the cubic error terms cancel, so it is exact up to degree 3'],
    ['The trapezoidal rule is exact for polynomials up to which degree?', '1', ['2', '0', '3'], 'It joins points with straight lines, so it is exact only for straight lines'],
    ['Simpson’s 1/3 rule needs the number of intervals to be:', 'Even', ['Odd', 'A multiple of 3', 'Any number'], 'Each parabola spans a pair of intervals'],
    ['Simpson’s 3/8 rule needs the number of intervals to be:', 'A multiple of 3', ['Even', 'Odd', 'A multiple of 4'], 'Each cubic spans three intervals'],
    ['The error of the composite trapezoidal rule is of order:', 'h²', ['h', 'h³', 'h⁴'], 'Error ≈ (b − a)h²f″/12'],
    ['The error of composite Simpson’s 1/3 rule is of order:', 'h⁴', ['h²', 'h³', 'h⁵'], 'Error ≈ (b − a)h⁴f⁗/180'],
    ['The global error of Euler’s method is of order:', 'h', ['h²', 'h³', 'h⁴'], 'Each step errs by about h², over (b − a)/h steps'],
    ['The global error of the classical 4th-order Runge–Kutta method is of order:', 'h⁴', ['h²', 'h³', 'h⁵'], 'That is what “4th order” means: local error h⁵, global h⁴'],
  ];
  const EULER_F = [['x + y', (x, y) => x + y], ['x − y', (x, y) => x - y], ['2y', (x, y) => 2 * y], ['x + 2y', (x, y) => x + 2 * y], ['y − x', (x, y) => y - x], ['1 + xy', (x, y) => 1 + x * y]];
  const NUMERICAL_M = {
    easy: [
      h => {
        const N = h.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 18, 19, 20, 23, 24]), x0 = h.pick([Math.floor(Math.sqrt(N)), Math.ceil(Math.sqrt(N))]), x1 = round((x0 * x0 + N) / (2 * x0), 4);
        return { t: 'Newton–Raphson', q: `Newton–Raphson is applied to f(x) = x² ${MINUS} ${N} with x₀ = ${x0}. What is x₁ (to 4 decimal places)?`, a: x1, noType: true, x: [round((x0 + N) / 2, 4), round(x0 + (x0 * x0 - N) / (2 * x0), 4), round(N / x0, 4)],
          ex: `x₁ = x₀ ${MINUS} f(x₀)/f′(x₀) = ${x0} ${MINUS} (${num(x0 * x0 - N)})/${2 * x0} = ${num(x1)}.` };
      },
      h => { const [q, a, w, why] = h.pick(NM_FACTS); return { t: 'Methods and errors', q, a, w, ex: `${why}: ${a}.` }; },
      h => {
        let N; do N = h.int(2, 60); while (Number.isInteger(Math.sqrt(N)));
        const p = Math.floor(Math.sqrt(N)), steps = h.int(1, 2), f = x => x * x - N, notes = [];
        let lo = p, hi = p + 1;
        for (let i = 0; i < steps; i++) { const m = (lo + hi) / 2; notes.push(`f(${num(m)}) = ${num(f(m))}`); if (f(lo) * f(m) < 0) hi = m; else lo = m; }
        const iv = (a, b) => `[${num(a)}, ${num(b)}]`, ans = iv(lo, hi), cand = steps === 1 ? [iv(p, p + 0.5), iv(p + 0.5, p + 1)] : [iv(p, p + 0.25), iv(p + 0.25, p + 0.5), iv(p + 0.5, p + 0.75), iv(p + 0.75, p + 1)];
        return { t: 'Bisection', q: `Bisection is applied to f(x) = x² ${MINUS} ${N} on [${p}, ${p + 1}]. After ${steps} iteration${steps > 1 ? 's' : ''}, which interval holds the root?`, a: ans, w: distinct(ans, [...cand, iv(p, p + 1), iv(p - 0.5, p)]),
          ex: `${notes.join('; ')}. Keep the half where f changes sign: ${ans}.` };
      },
    ],
    medium: [
      h => {
        const n = h.pick([4, 6]), hh = h.pick([0.5, 1, 2]), x0 = h.int(0, 2), ys = Array.from({ length: n + 1 }, () => h.int(0, 20)), inner = sum(ys.slice(1, -1));
        const T = round(hh * ((ys[0] + ys[n]) / 2 + inner), 6), xs = ys.map((_, i) => num(x0 + i * hh));
        return { t: 'Trapezoidal rule', q: `Using the trapezoidal rule on the table, what is ∫ y dx from x = ${xs[0]} to ${xs[n]}?`, table: { head: ['x', ...xs], rows: [['y', ...ys.map(String)]] }, a: T, x: [hh * sum(ys), round(hh * (ys[0] + ys[n] + inner), 6), T + hh],
          ex: `h = ${hh}: (h/2)[y₀ + 2(${ys.slice(1, -1).join(' + ')}) + y${sub(n)}] = ${num(hh / 2)} × ${ys[0] + ys[n] + 2 * inner} = ${num(T)}.` };
      },
      h => {
        const n = h.pick([2, 4, 6]), hh = h.pick([3, 1.5, 0.3, 0.6]), ys = Array.from({ length: n + 1 }, () => h.int(0, 20));
        const odd = ys.filter((_, i) => i % 2 === 1 && i < n), even = ys.filter((_, i) => i % 2 === 0 && i > 0 && i < n), K = ys[0] + 4 * sum(odd) + 2 * sum(even) + ys[n], S = round((K * hh) / 3, 6), xs = ys.map((_, i) => num(i * hh));
        return { t: 'Simpson’s rule', q: `Using Simpson’s 1/3 rule on the table, what is ∫ y dx from x = 0 to ${xs[n]}?`, table: { head: ['x', ...xs], rows: [['y', ...ys.map(String)]] }, a: S, x: [round(hh * ((ys[0] + ys[n]) / 2 + sum(ys.slice(1, -1))), 6), round(K * hh, 6), round(S + 1, 6)],
          ex: `(h/3)[y₀ + 4(${odd.join(' + ')}) + 2(${even.join(' + ') || '0'}) + y${sub(n)}] = ${num(hh / 3)} × ${K} = ${num(S)}.` };
      },
      h => {
        const [fs, f] = h.pick(EULER_F), y0 = h.int(1, 2), hh = h.pick([0.1, 0.2]), steps = h.int(1, 2), notes = [];
        let x = 0, y = y0;
        for (let i = 0; i < steps; i++) { const ny = round(y + hh * f(x, y), 6); notes.push(`y${sub(i + 1)} = ${num(y)} + ${hh} × ${num(round(f(x, y), 6))} = ${num(ny)}`); y = ny; x = round(x + hh, 6); }
        return { t: 'Euler’s method', q: `Using Euler’s method with h = ${hh} on dy/dx = ${fs}, y(0) = ${y0}, what is y(${num(x)})?`, a: y, x: [round(y0 + x * f(0, y0), 6) === y ? round(y + hh, 6) : round(y0 + x * f(0, y0), 6), round(y + hh * f(x, y), 6), round(y0 + hh, 6)],
          ex: `yₙ₊₁ = yₙ + h·f(xₙ, yₙ): ${notes.join('; ')}.` };
      },
    ],
    hard: [
      h => {
        const b = h.int(1, 4), n = h.pick([2, 4]), ans = frac(b ** 3, 6 * n * n);
        return { t: 'Integration errors', q: `The trapezoidal rule with ${n} equal intervals is used for ∫₀${sup(b)} x² dx. By how much does it overestimate the exact value?`, a: ans, w: distinct(ans, [frac(b ** 3, 12 * n * n), frac(b ** 3, 6 * n), '0', frac(b ** 3, 3 * n * n)]),
          ex: `Exact = ${b}³/3 = ${frac(b ** 3, 3)}; trapezoidal = ${frac(b ** 3 * (2 * n * n + 1), 6 * n * n)}. Difference = b³/(6n²) = ${ans}.` };
      },
      h => {
        const b = h.int(1, 4), ans = frac(b ** 4, 4);
        return { t: 'Integration errors', q: `What value does Simpson’s 1/3 rule with 2 intervals give for ∫₀${sup(b)} x³ dx?`, a: ans, w: distinct(ans, [frac(5 * b ** 4, 16), frac(b ** 4, 3), frac(b ** 4, 2)]),
          ex: `Simpson’s rule is exact for cubics, so it gives the exact value ${b}⁴/4 = ${ans} (trapezoidal would give ${frac(5 * b ** 4, 16)}).` };
      },
      h => {
        const N = h.pick([3, 4, 6, 7, 8, 9]), x0 = 0.1, x1 = round(x0 * (2 - N * x0), 6);
        return { t: 'Newton–Raphson', q: `To find 1/${N}, Newton–Raphson is applied to f(x) = 1/x ${MINUS} ${N} with x₀ = 0.1. What is x₁?`, a: x1, x: [round(x0 * (2 + N * x0), 6), round(x0 - (1 / x0 - N), 6), round((x0 + 1 / (N * x0)) / 2, 6)],
          ex: `f′(x) = ${MINUS}1/x², so xₙ₊₁ = xₙ ${MINUS} (1/xₙ ${MINUS} ${N})/(${MINUS}1/xₙ²) = xₙ(2 ${MINUS} ${N}xₙ) = 0.1 × ${num(round(2 - N * x0, 6))} = ${num(x1)}.` };
      },
      h => {
        const a11 = h.pick([4, 5, 8, 10]), a22 = h.pick([4, 5, 8, 10]), a12 = h.int(1, 3), a21 = h.int(1, 3), b1 = h.int(5, 30), b2 = h.int(5, 30);
        const x1 = b1 / a11, y1 = round((b2 - a21 * x1) / a22, 6);
        return { t: 'Gauss–Seidel', q: `One Gauss–Seidel iteration is applied to ${a11}x + ${a12 === 1 ? '' : a12}y = ${b1}, ${a21 === 1 ? '' : a21}x + ${a22}y = ${b2}, starting from x = y = 0. What is y after it?`, a: y1, noType: true, x: [round(b2 / a22, 6), round((b2 + a21 * x1) / a22, 6), round(x1, 6)],
          ex: `x₁ = ${b1}/${a11} = ${num(x1)}; Gauss–Seidel uses it at once: y₁ = (${b2} ${MINUS} ${a21} × ${num(x1)})/${a22} = ${num(y1)}.` };
      },
    ],
  };

  /* ---------- 8. Discrete Mathematics ---------- */
  const RELATIONS = [
    ['relations', n => 2 ** (n * n), n => `2^(n²) = 2${sup(n * n)}`],
    ['reflexive relations', n => 2 ** (n * n - n), n => `2^(n² ${MINUS} n) = 2${sup(n * n - n)}`],
    ['symmetric relations', n => 2 ** ((n * (n + 1)) / 2), n => `2^(n(n + 1)/2) = 2${sup((n * (n + 1)) / 2)}`],
    ['relations that are both reflexive and symmetric', n => 2 ** ((n * (n - 1)) / 2), n => `2^(n(n ${MINUS} 1)/2) = 2${sup((n * (n - 1)) / 2)}`],
    ['antisymmetric relations', n => 2 ** n * 3 ** ((n * (n - 1)) / 2), n => `2ⁿ × 3^(n(n ${MINUS} 1)/2) = 2${sup(n)} × 3${sup((n * (n - 1)) / 2)}`],
    ['asymmetric relations', n => 3 ** ((n * (n - 1)) / 2), n => `3^(n(n ${MINUS} 1)/2) = 3${sup((n * (n - 1)) / 2)}`],
  ];
  const stirling2 = (n, k) => { const S = [[1]]; for (let i = 1; i <= n; i++) { S[i] = [0]; for (let j = 1; j <= i; j++) S[i][j] = j * (S[i - 1][j] || 0) + (S[i - 1][j - 1] || 0); } return S[n][k] || 0; };
  const bell = n => { let s = 0; for (let k = 0; k <= n; k++) s += stirling2(n, k); return s; };
  const phi = n => { let c = 0; for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) c++; return c; };
  const derange = n => { const d = [1, 0]; for (let i = 2; i <= n; i++) d[i] = (i - 1) * (d[i - 1] + d[i - 2]); return d[n]; };
  const LOGIC = { '∧': (a, b) => a && b, '∨': (a, b) => a || b, '→': (a, b) => !a || b, '↔': (a, b) => a === b };
  function formula(h) {
    const lit = () => { const v = h.pick(['p', 'q', 'r']), neg = h.chance(0.3); return { s: (neg ? '¬' : '') + v, f: e => (neg ? !e[v] : e[v]) }; };
    const node = (a, b) => { const op = h.pick(Object.keys(LOGIC)); return { s: `(${a.s} ${op} ${b.s})`, f: e => LOGIC[op](a.f(e), b.f(e)) }; };
    const left = node(lit(), lit()), right = h.chance(0.5) ? lit() : node(lit(), lit()), op = h.pick(Object.keys(LOGIC)), neg = h.chance(0.2);
    const body = `${left.s} ${op} ${right.s}`;
    return { s: neg ? `¬(${body})` : body, f: e => { const v = LOGIC[op](left.f(e), right.f(e)); return neg ? !v : v; } };
  }
  const DISCRETE = {
    easy: [
      h => {
        const n = h.int(2, 4), i = h.int(0, RELATIONS.length - 1), [name, f, why] = RELATIONS[i];
        return { t: 'Relations', q: `How many ${name} are there on a set with ${n} elements?`, a: f(n), x: RELATIONS.filter((_, j) => j !== i).map(r => r[1](n)), ex: `${why(n)} = ${f(n)}.` };
      },
      h => {
        const m = h.int(2, 4), n = h.int(m, 6), one = h.chance(0.4), ans = one ? fact(n) / fact(n - m) : n ** m;
        return { t: 'Functions', q: `How many ${one ? 'one-to-one ' : ''}functions are there from a set of ${m} elements to a set of ${n} elements?`, a: ans, x: one ? [n ** m, nCr(n, m), m ** n] : [m ** n, n * m, 2 ** (m * n)],
          ex: one ? `The ${m} elements take different images: ${n} × ${n - 1}${m > 2 ? ` × …` : ''} (${m} factors) = ${ans}.` : `Each of the ${m} elements has ${n} choices: ${n}${sup(m)} = ${ans}.` };
      },
      h => {
        const v = h.pick(['complete', 'tree', 'regular', 'handshake']);
        if (v === 'complete') { const n = h.int(4, 20), e = (n * (n - 1)) / 2; return { t: 'Graphs', q: `How many edges does the complete graph K${sub(n)} have?`, a: e, x: [n * (n - 1), n - 1, e + n], ex: `Every pair is joined: ${n}C2 = ${e}.` }; }
        if (v === 'tree') { const n = h.int(5, 40); return { t: 'Graphs', q: `A tree has ${n} vertices. How many edges does it have?`, a: n - 1, x: [n, n + 1, n - 2], ex: `A tree on n vertices always has n ${MINUS} 1 = ${n - 1} edges.` }; }
        if (v === 'regular') { let n, k; do { n = h.int(5, 20); k = h.int(2, 6); } while ((n * k) % 2 || k >= n); return { t: 'Graphs', q: `A simple graph has ${n} vertices, each of degree ${k}. How many edges does it have?`, a: (n * k) / 2, x: [n * k, n + k, (n * (n - 1)) / 2], ex: `Sum of degrees = 2 × edges: ${n} × ${k} = ${n * k}, so ${(n * k) / 2} edges.` }; }
        let e, d; do { e = h.int(10, 60); d = h.int(2, 6); } while ((2 * e) % d);
        return { t: 'Graphs', q: `A graph has ${e} edges and every vertex has degree ${d}. How many vertices does it have?`, a: (2 * e) / d, x: [e / d, e * d, 2 * e], ex: `Sum of degrees = 2 × ${e} = ${2 * e} = ${d} × vertices, so ${(2 * e) / d}.` };
      },
      h => {
        const n = h.int(1, 3), pp = h.chance(0.5), ans = pp ? 2 ** (2 ** n) : 2 ** n;
        return { t: 'Sets', q: `A has ${n} element${n > 1 ? 's' : ''}. How many elements does ${pp ? 'P(P(A))' : 'P(A)'} have?`, a: ans, x: pp ? [2 ** n, 2 ** (2 * n), 2 ** (n + 1)] : [2 * n, n * n, 2 ** n - 1], ex: pp ? `|P(A)| = 2${sup(n)} = ${2 ** n}, so |P(P(A))| = 2${sup(2 ** n)} = ${ans}.` : `A set of n elements has 2ⁿ = ${ans} subsets.` };
      },
    ],
    medium: [
      h => {
        const n = h.int(2, 4), m = h.int(n + 1, 6); let s = 0; const parts = [];
        for (let k = 0; k <= n; k++) { const t = (-1) ** k * nCr(n, k) * (n - k) ** m; s += t; parts.push(`${k ? (k % 2 ? `${MINUS} ` : '+ ') : ''}${nCr(n, k)}·${n - k}${sup(m)}`); }
        return { t: 'Counting functions', q: `How many onto functions are there from a set of ${m} elements to a set of ${n} elements?`, a: s, x: [n ** m, nCr(m, n) * fact(n), s + n], ex: `Inclusion–exclusion: ${parts.join(' ')} = ${s}.` };
      },
      h => {
        const n = h.int(2, 4), kind = h.pick(['all', 'self-dual', 'symmetric']);
        const v = { all: 2 ** (2 ** n), 'self-dual': 2 ** (2 ** (n - 1)), symmetric: 2 ** (n + 1) }[kind];
        const why = { all: `2^(2ⁿ) = 2${sup(2 ** n)}`, 'self-dual': `a self-dual function is fixed by half its rows: 2^(2ⁿ⁻¹) = 2${sup(2 ** (n - 1))}`, symmetric: `a symmetric function depends only on how many inputs are 1 (0 to ${n}): 2${sup(n + 1)}` }[kind];
        return { t: 'Boolean functions', q: `How many ${kind === 'all' ? '' : kind + ' '}Boolean functions of ${n} variables are there?`, a: v, x: [2 ** (2 ** n), 2 ** (2 ** (n - 1)), 2 ** (n + 1), 2 ** n].filter(x => x !== v), ex: `${why[0].toUpperCase() + why.slice(1)} = ${v}.` };
      },
      h => {
        let a, b; do { a = h.int(2, 13); b = h.int(2, 13); } while (a >= b);
        const N = h.int(100, 1000), L = lcm(a, b), A = Math.floor(N / a), B = Math.floor(N / b), AB = Math.floor(N / L), kind = h.pick(['or', 'neither', 'only']);
        const ans = { or: A + B - AB, neither: N - (A + B - AB), only: A - AB }[kind];
        const q = { or: `divisible by ${a} or ${b}`, neither: `divisible by neither ${a} nor ${b}`, only: `divisible by ${a} but not by ${b}` }[kind];
        return { t: 'Inclusion–exclusion', q: `How many integers from 1 to ${N} are ${q}?`, a: ans, x: { or: [A + B, A + B - 2 * AB, N - ans], neither: [N - A - B, A + B - AB, ans + AB], only: [A, A - B, A + AB] }[kind],
          ex: `⌊${N}/${a}⌋ = ${A}, ⌊${N}/${b}⌋ = ${B}, ⌊${N}/${L}⌋ = ${AB} (LCM ${L}). ${{ or: `${A} + ${B} ${MINUS} ${AB}`, neither: `${N} ${MINUS} (${A} + ${B} ${MINUS} ${AB})`, only: `${A} ${MINUS} ${AB}` }[kind]} = ${ans}.` };
      },
      h => {
        const kind = h.pick(['month', 'suit', 'colour']), k = h.int(2, 6);
        if (kind === 'colour') { const c = h.int(3, 8), ans = c * (k - 1) + 1; return { t: 'Pigeonhole principle', q: `A drawer has socks of ${c} colours. How many must you take out (in the dark) to be sure of ${k} of the same colour?`, a: ans, x: [c * k, c + k, c * (k - 1)], ex: `With ${c} × ${k - 1} = ${c * (k - 1)} socks you could still have only ${k - 1} of each colour; one more forces ${k}: ${ans}.` }; }
        const [n, what] = kind === 'month' ? [12, `people to be sure that ${k} share a birth month`] : [4, `cards from a pack to be sure of ${k} of the same suit`], ans = n * (k - 1) + 1;
        return { t: 'Pigeonhole principle', q: `What is the least number of ${what}?`, a: ans, x: [n * k, n * (k - 1), n * k + 1], ex: `${n} groups × ${k - 1} = ${n * (k - 1)} can avoid it; one more forces ${k}: ${ans}.` };
      },
      h => {
        const pool = [
          (n => [`the complete graph K${sub(n)}`, n, `every vertex is joined to every other, so all ${n} need different colours`])(h.int(3, 9)),
          (n => [`a cycle with ${n} vertices`, n % 2 ? 3 : 2, n % 2 ? 'an odd cycle cannot be 2-coloured' : 'an even cycle alternates two colours'])(h.int(4, 11)),
          (n => [`a wheel with ${n} rim vertices (plus a hub)`, n % 2 ? 4 : 3, `the hub needs its own colour and the rim cycle needs ${n % 2 ? 3 : 2}`])(h.int(4, 11)),
          (n => [`a tree with ${n} vertices`, 2, 'trees are bipartite'])(h.int(5, 15)),
          (n => [`the complete bipartite graph K${sub(n)},${sub(n + 1)}`, 2, 'bipartite graphs need just 2'])(h.int(2, 6)),
          ['the Petersen graph', 3, 'it has odd cycles (5-cycles) but a 3-colouring exists'],
        ];
        const [g, v, why] = h.pick(pool);
        return { t: 'Graph colouring', q: `What is the chromatic number of ${g}?`, a: v, x: [2, 3, 4, 5].filter(x => x !== v), ex: `${why[0].toUpperCase() + why.slice(1)}: ${v}.` };
      },
      h => {
        const n = h.int(3, 7), d = derange(n);
        return { t: 'Derangements', q: `${n} letters are put into ${n} addressed envelopes at random. In how many ways does no letter go into its own envelope?`, a: d, x: [fact(n) - 1, fact(n - 1), derange(n - 1)], ex: `Derangements: Dₙ = (n ${MINUS} 1)(Dₙ₋₁ + Dₙ₋₂), so D${sub(n)} = ${d}.` };
      },
    ],
    hard: [
      h => {
        const kind = h.pick(['labelled', 'Kn', 'cycle', 'K2n']), n = h.int(3, 7);
        const v = { labelled: n ** (n - 2), Kn: n ** (n - 2), cycle: n, K2n: n * 2 ** (n - 1) }[kind];
        const q = { labelled: `How many different trees can be formed on ${n} labelled vertices?`, Kn: `How many spanning trees does K${sub(n)} have?`, cycle: `How many spanning trees does a cycle with ${n} vertices have?`, K2n: `How many spanning trees does K${sub(2)},${sub(n)} have?` }[kind];
        const why = { labelled: `Cayley’s formula nⁿ⁻² = ${n}${sup(n - 2)}`, Kn: `Cayley’s formula nⁿ⁻² = ${n}${sup(n - 2)}`, cycle: 'remove any one of its n edges', K2n: `K₂,ₙ has n·2ⁿ⁻¹ = ${n} × 2${sup(n - 1)}` }[kind];
        return { t: 'Trees', q, a: v, x: [n ** (n - 1), fact(n), 2 ** n, n - 1].filter(x => x !== v), ex: `${why[0].toUpperCase() + why.slice(1)} = ${v}.` };
      },
      h => {
        const n = h.int(3, 6);
        if (h.chance(0.5)) { const b = bell(n); return { t: 'Partitions', q: `How many equivalence relations are there on a set of ${n} elements?`, a: b, x: [2 ** n, bell(n - 1), b + n], ex: `They match the partitions of the set: the Bell number B${sub(n)} = ${b}.` }; }
        const k = h.int(2, n - 1), s = stirling2(n, k);
        return { t: 'Partitions', q: `In how many ways can a set of ${n} elements be split into ${k} non-empty unlabelled subsets?`, a: s, x: [nCr(n, k), s * fact(k), stirling2(n, k - 1) || s + 1], ex: `Stirling number S(${n}, ${k}) = k·S(n ${MINUS} 1, k) + S(n ${MINUS} 1, k ${MINUS} 1) = ${s}.` };
      },
      h => {
        const n = h.pick([8, 9, 10, 12, 14, 15, 16, 18, 20, 24]);
        if (h.chance(0.5)) { const k = h.int(2, n - 1), o = n / gcd(n, k); return { t: 'Groups', q: `What is the order of ${k} in the group (ℤ${sub(n)}, + mod ${n})?`, a: o, x: [n, k, gcd(n, k)].filter(x => x !== o), ex: `Order = n/gcd(n, k) = ${n}/${gcd(n, k)} = ${o}.` }; }
        const p = phi(n);
        return { t: 'Groups', q: `How many generators does the cyclic group (ℤ${sub(n)}, + mod ${n}) have?`, a: p, x: [n - 1, n / 2, p + 2], ex: `The generators are the k coprime to ${n}: φ(${n}) = ${p}.` };
      },
      h => {
        const n = h.int(3, 12), f = [0, 1]; for (let i = 2; i <= n + 2; i++) f[i] = f[i - 1] + f[i - 2];
        return { t: 'Recurrences', q: `How many binary strings of length ${n} have no two consecutive 1s?`, a: f[n + 2], x: [2 ** (n - 1), f[n + 1], f[n + 3]], ex: `aₙ = aₙ₋₁ (ends in 0) + aₙ₋₂ (ends in 01), with a₁ = 2, a₂ = 3: Fibonacci, so a${sub(n)} = ${f[n + 2]}.` };
      },
      h => {
        const F = formula(h), rows = [];
        for (let i = 7; i >= 0; i--) { const e = { p: !!(i & 4), q: !!(i & 2), r: !!(i & 1) }; rows.push({ e, v: F.f(e), name: ['p', 'q', 'r'].map(k => (e[k] ? 'T' : 'F')).join('') }); }
        const T = rows.filter(r => r.v), c = T.length, show = c <= 4 ? `True in rows (p, q, r) = ${T.map(r => r.name).join(', ') || 'none'}` : `False only in rows ${rows.filter(r => !r.v).map(r => r.name).join(', ') || 'none'}`;
        return { t: 'Propositional logic', q: `In how many of the 8 rows of its truth table is ${F.s} true?`, a: c, x: [8 - c, c + 1, c - 1], ex: `${show}: ${c} of 8.` };
      },
      h => {
        const n = h.int(6, 15), k = h.int(2, 4), ans = ((n - k) * (n - k + 1)) / 2;
        return { t: 'Graphs', q: `What is the largest number of edges a simple graph with ${n} vertices and ${k} components can have?`, a: ans, x: [((n - k + 1) * (n - k + 2)) / 2, (n * (n - 1)) / 2 - k, n - k], ex: `Put ${n - k + 1} vertices in one complete component and leave ${k - 1} isolated: (n ${MINUS} k)(n ${MINUS} k + 1)/2 = ${ans}.` };
      },
    ],
  };

  /* ---------- 9. Digital Logic ---------- */
  const GATE_COUNTS = [
    ['XOR', 'NAND', 4, 't = (AB)′, then A ⊕ B = ((At)′(Bt)′)′'], ['XNOR', 'NAND', 5, 'the 4-gate XOR plus one NAND used as an inverter'],
    ['XOR', 'NOR', 5, 'the 4-gate XNOR plus one NOR used as an inverter'], ['XNOR', 'NOR', 4, 't = (A + B)′, then A ⊙ B = ((A + t)′ + (B + t)′)′'],
    ['OR', 'NAND', 3, 'A + B = (A′B′)′: two NANDs as inverters and one more'], ['AND', 'NOR', 3, 'AB = (A′ + B′)′: two NORs as inverters and one more'],
    ['AND', 'NAND', 2, 'a NAND followed by a NAND inverter'], ['OR', 'NOR', 2, 'a NOR followed by a NOR inverter'],
  ];
  const VARS = ['A', 'B', 'C', 'D'];
  const cubeText = (c, nv) => VARS.slice(0, nv).map((v, i) => { const bit = nv - 1 - i; return c.care >> bit & 1 ? v + (c.val >> bit & 1 ? '' : '′') : ''; }).join('') || '1';
  function primes(nv, ones) {
    const set = new Set(ones), imps = [];
    for (let c = 0; c < 3 ** nv; c++) {
      let care = 0, val = 0, t = c;
      for (let i = 0; i < nv; i++) { const d = t % 3; t = (t - d) / 3; if (d < 2) { care |= 1 << i; val |= d << i; } }
      const ms = [];
      for (let m = 0; m < 2 ** nv; m++) if ((m & care) === val) ms.push(m);
      if (ms.every(m => set.has(m))) imps.push({ care, val, ms });
    }
    return imps.filter(a => !imps.some(b => b.ms.length > a.ms.length && a.ms.every(m => b.ms.includes(m))));
  }
  function minCover(ones, pis) {
    const lits = p => VARS.length - 0 - (p.ms.length === 1 ? 0 : Math.log2(p.ms.length)); // fewer minterms → more literals
    for (let k = 1; k <= pis.length; k++) {
      let best = null;
      const pick = (start, chosen) => {
        if (chosen.length === k) {
          const cov = new Set(chosen.flatMap(p => p.ms));
          if (ones.every(m => cov.has(m))) { const cost = sum(chosen.map(lits)); if (!best || cost < best.cost) best = { set: chosen.slice(), cost }; }
          return;
        }
        for (let i = start; i < pis.length; i++) { chosen.push(pis[i]); pick(i + 1, chosen); chosen.pop(); }
      };
      pick(0, []);
      if (best) return best.set;
    }
    return pis;
  }
  const ieeeHex = v => { const dv = new DataView(new ArrayBuffer(4)); dv.setFloat32(0, v); return dv.getUint32(0); };
  const hex8 = u => (u >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const DIGITAL = {
    easy: [
      h => {
        const dir = h.pick(['b2d', 'd2b', 'h2d', 'd2h']);
        if (dir === 'b2d') { const v = h.int(20, 255), b = bin(v, 8); return { t: 'Number systems', q: `What is the binary number ${b} in decimal?`, a: v, x: [parseInt(b.split('').reverse().join(''), 2), v + 1, v ^ 16], ex: `${b.split('').map((c, i) => (c === '1' ? 2 ** (7 - i) : 0)).filter(Boolean).join(' + ')} = ${v}.` }; }
        if (dir === 'd2b') { const v = h.int(20, 255), ans = bin(v, 8); return { t: 'Number systems', q: `What is ${v} in 8-bit binary?`, a: ans, mono: true, w: distinct(ans, [bin(v + 1, 8), bin(v - 1, 8), bin(v ^ 16, 8), ans.split('').reverse().join('')]), ex: `${v} = ${ans.split('').map((c, i) => (c === '1' ? 2 ** (7 - i) : 0)).filter(Boolean).join(' + ')} → ${ans}.` }; }
        if (dir === 'h2d') { const v = h.int(256, 4095), x = v.toString(16).toUpperCase(); return { t: 'Number systems', q: `What is the hexadecimal number ${x} in decimal?`, a: v, x: [parseInt(x, 10) || v + 16, v + 16, v - 1], ex: `${x.split('').map((c, i) => `${parseInt(c, 16)}×16${sup(x.length - 1 - i)}`).join(' + ')} = ${v}.` }; }
        const v = h.int(256, 4095), ans = v.toString(16).toUpperCase();
        return { t: 'Number systems', q: `What is ${v} in hexadecimal?`, a: ans, mono: true, w: distinct(ans, [(v + 1).toString(16).toUpperCase(), (v + 16).toString(16).toUpperCase(), v.toString(8), ans.split('').reverse().join('')]), ex: `Divide by 16 repeatedly and read the remainders upwards: ${ans}.` };
      },
      h => {
        const k = h.int(1, 127), ans = bin(256 - k, 8);
        return { t: 'Two’s complement', q: `What is the 8-bit two’s complement representation of ${MINUS}${k}?`, a: ans, mono: true, w: distinct(ans, [bin(255 - k, 8), bin(128 + k, 8), bin(k, 8)]), ex: `${k} = ${bin(k, 8)}; invert the bits → ${bin(255 - k, 8)}; add 1 → ${ans}.` };
      },
      h => {
        const n = h.int(4, 16), p = 2 ** (n - 1), ans = `${MINUS}${p} to ${p - 1}`;
        return { t: 'Two’s complement', q: `What is the range of ${an(n)} ${n}-bit two’s complement integer?`, a: ans, w: distinct(ans, [`${MINUS}${p - 1} to ${p - 1}`, `${MINUS}${p} to ${p}`, `0 to ${2 * p - 1}`]), ex: `${n} bits give ${MINUS}2${sup(n - 1)} to 2${sup(n - 1)} ${MINUS} 1: ${ans}.` };
      },
      h => {
        const k = h.int(1, 6), N = 2 ** k;
        return { t: 'Multiplexers', q: `How many select lines does a ${N}:1 multiplexer need?`, a: k, x: [N, N / 2, k + 1], ex: `${k} select lines choose among 2${sup(k)} = ${N} inputs.` };
      },
    ],
    medium: [
      h => {
        const v = h.pick(['mod', 'unused', 'johnson', 'ring']);
        if (v === 'johnson') { const n = h.int(3, 8); return { t: 'Counters', q: `How many states does a Johnson (twisted-ring) counter with ${n} flip-flops have?`, a: 2 * n, x: [n, 2 ** n, 2 * n - 1], ex: `A Johnson counter with n flip-flops cycles through 2n = ${2 * n} states.` }; }
        if (v === 'ring') { const n = h.int(3, 12); return { t: 'Counters', q: `How many flip-flops does a ring counter need to count ${n} states?`, a: n, x: [Math.ceil(Math.log2(n)), n - 1, 2 * n], ex: `A ring counter passes a single 1 around, so it needs one flip-flop per state: ${n}.` }; }
        let N; do N = h.int(5, 100); while (Number.isInteger(Math.log2(N)));
        const ff = Math.ceil(Math.log2(N));
        if (v === 'mod') return { t: 'Counters', q: `What is the minimum number of flip-flops for a mod-${N} counter?`, a: ff, x: [ff + 1, ff - 1, Math.floor(N / 2)], ex: `2${sup(ff - 1)} = ${2 ** (ff - 1)} < ${N} ≤ 2${sup(ff)} = ${2 ** ff}, so ${ff}.` };
        return { t: 'Counters', q: `A mod-${N} counter is built with the minimum number of flip-flops. How many of its states are unused?`, a: 2 ** ff - N, x: [N - 2 ** (ff - 1), 2 ** ff, ff], ex: `${ff} flip-flops give ${2 ** ff} states; ${2 ** ff} ${MINUS} ${N} = ${2 ** ff - N} unused.` };
      },
      h => {
        const [f, g, n, how] = h.pick(GATE_COUNTS);
        return { t: 'Universal gates', q: `What is the minimum number of 2-input ${g} gates needed to make a 2-input ${f} gate?`, a: n, x: [1, 2, 3, 4, 5, 6].filter(v => v !== n), ex: `${how[0].toUpperCase() + how.slice(1)}: ${n} gates.` };
      },
      h => {
        let tms, ones;
        do {
          tms = Array.from({ length: h.int(2, 3) }, () => { const care = h.int(1, 7), val = h.int(0, 7) & care; return { care, val }; });
          ones = []; for (let m = 0; m < 8; m++) if (tms.some(c => (m & c.care) === c.val)) ones.push(m);
        } while (ones.length < 2 || ones.length > 6);
        const sig = ms => `Σm(${ms.join(', ')})`, rev = m => ((m & 1) << 2) | (m & 2) | (m >> 2), ans = sig(ones);
        const comp = [0, 1, 2, 3, 4, 5, 6, 7].filter(m => !ones.includes(m)), expr = tms.map(c => cubeText(c, 3)).join(' + ');
        return { t: 'Minterms', q: `F(A, B, C) = ${expr}. Which minterms make up F?`, a: ans, mono: true, w: distinct(ans, [sig(comp), sig(sorted(ones.map(rev))), sig(ones.slice(0, -1)), sig(sorted([...new Set([...ones, comp[0]])]))]),
          ex: `With A as the most significant bit: ${tms.map(c => `${cubeText(c, 3)} → ${[0, 1, 2, 3, 4, 5, 6, 7].filter(m => (m & c.care) === c.val).join(', ')}`).join('; ')}. So F = ${ans}.` };
      },
      h => {
        const n = h.int(4, 6), v = h.int(1, 2 ** n - 1), g = v ^ (v >> 1), toGray = h.chance(0.5);
        if (toGray) return { t: 'Gray code', q: `What is the ${n}-bit Gray code of the binary number ${bin(v, n)}?`, a: bin(g, n), mono: true, w: distinct(bin(g, n), [bin(v >> 1, n), bin((v ^ (v << 1)) & (2 ** n - 1), n), bin(~v & (2 ** n - 1), n), bin(g ^ 1, n)]), ex: `Gray = b XOR (b >> 1): ${bin(v, n)} XOR ${bin(v >> 1, n)} = ${bin(g, n)}.` };
        return { t: 'Gray code', q: `The Gray code ${bin(g, n)} stands for which binary number?`, a: bin(v, n), mono: true, w: distinct(bin(v, n), [bin(g ^ (g >> 1), n), bin(g, n), bin(~v & (2 ** n - 1), n), bin(v ^ 1, n)]), ex: `Copy the first bit, then each next binary bit = previous binary bit XOR the Gray bit: ${bin(v, n)}.` };
      },
    ],
    hard: [
      h => {
        let ones, pis;
        do { const k = h.int(4, 9); ones = sorted(h.shuffle([...Array(16).keys()]).slice(0, k)); pis = primes(4, ones); } while (pis.length > 12);
        const cover = minCover(ones, pis), ess = pis.filter(p => p.ms.some(m => ones.includes(m) && pis.filter(q => q.ms.includes(m)).length === 1));
        const kind = h.pick(['terms', 'primes', 'essential']), v = { terms: cover.length, primes: pis.length, essential: ess.length }[kind];
        const q = { terms: 'How many product terms does a minimal sum-of-products form of F have?', primes: 'How many prime implicants does F have?', essential: 'How many essential prime implicants does F have?' }[kind];
        const ex = { terms: `A minimal cover: F = ${cover.map(c => cubeText(c, 4)).join(' + ')} (${cover.length} terms).`, primes: `Prime implicants: ${pis.map(c => cubeText(c, 4)).join(', ')} (${pis.length}).`, essential: `Prime implicants ${pis.map(c => cubeText(c, 4)).join(', ')}; essential (sole cover of some minterm): ${ess.map(c => cubeText(c, 4)).join(', ') || 'none'} → ${ess.length}.` }[kind];
        return { t: 'K-map minimisation', q: `F(A, B, C, D) = Σm(${ones.join(', ')}). ${q}`, a: v, x: [cover.length, pis.length, ess.length, v + 1, v - 1].filter(x => x !== v && x >= 0), ex };
      },
      h => {
        const m = 2 * h.int(0, 63) + 1, k = h.int(0, 6), s = h.chance(0.4) ? -1 : 1, v = (s * m) / 2 ** k;
        if (Math.abs(v) < 0.03 || Math.abs(v) > 1000) return null;
        const u = ieeeHex(v), e = ((u >>> 23) & 255) - 127, f = bin(u & 0x7fffff, 23), fShort = f.replace(/0+$/, '') || '0', ans = `0x${hex8(u)}`;
        return { t: 'IEEE 754', q: `What is the IEEE 754 single-precision representation of ${num(v)}, in hexadecimal?`, a: ans, mono: true, w: distinct(ans, [`0x${hex8(u ^ 0x80000000)}`, `0x${hex8(u + 0x00800000)}`, `0x${hex8(u - 0x00800000)}`, `0x${hex8((u & 0x807fffff) | ((e + 126) << 23))}`]),
          ex: `${num(v)} = ${s < 0 ? MINUS : ''}1.${fShort} × 2${sup(e)} in binary. Sign ${s < 0 ? 1 : 0}, exponent ${e} + 127 = ${e + 127} = ${bin(e + 127, 8)}, fraction ${fShort}0…: ${ans}.` };
      },
      h => {
        const k = h.pick([2, 4, 8]), j = k === 8 ? 2 : h.int(2, k === 2 ? 5 : 3), N = k ** j, c = (N - 1) / (k - 1), lv = [];
        for (let w = N / k; w >= 1; w /= k) lv.push(w);
        return { t: 'Multiplexers', q: `How many ${k}:1 multiplexers are needed to build a ${N}:1 multiplexer?`, a: c, x: [N / k, N, N / k + 1], ex: `Build a tree: ${lv.join(' + ')} = ${c}.` };
      },
      h => {
        const same = h.chance(0.6), sgn = h.chance(0.5) ? 1 : -1, a = same ? sgn * h.int(40, 127) : h.int(-128, 127), b = same ? sgn * h.int(40, 127) : h.int(-128, 127), s = a + b;
        const r = ((s % 256) + 256) % 256, ov = s > 127 || s < -128, enc = v => bin(((v % 256) + 256) % 256, 8), opt = (bits, o) => `${bits}, ${o ? 'overflow' : 'no overflow'}`;
        const ans = opt(bin(r, 8), ov);
        return { t: 'Two’s complement', q: `Two 8-bit two’s complement numbers ${enc(a)} and ${enc(b)} are added. What is the 8-bit result, and is there an overflow?`, a: ans, mono: true, w: distinct(ans, [opt(bin(r, 8), !ov), opt(bin(r ^ 128, 8), ov), opt(bin(r ^ 128, 8), !ov)]),
          ex: `In decimal: ${num(a)} + ${signed(b)} = ${num(s)}, which ${ov ? 'is outside' : 'fits in'} ${MINUS}128…127. The 8-bit sum is ${bin(r, 8)}${ov ? ' — two numbers of the same sign gave a result of the other sign' : ''}.` };
      },
    ],
  };

  /* ---------- 10. Computer Organization ---------- */
  const sizeOf = p => (p >= 30 ? `${2 ** (p - 30)} GB` : p >= 20 ? `${2 ** (p - 20)} MB` : p >= 10 ? `${2 ** (p - 10)} KB` : `${2 ** p} bytes`);
  const pageOf = p => (p >= 10 ? sizeOf(p) : `${2 ** p}-byte`); // "4 KB pages", "512-byte pages"
  const COA = {
    easy: [
      h => {
        const n = h.int(12, 34);
        if (h.chance(0.5)) return { t: 'Memory addressing', q: `How many address lines does a byte-addressable memory of ${sizeOf(n)} need?`, a: n, x: [n - 1, n + 1, n - 10], ex: `${sizeOf(n)} = 2${sup(n)} bytes, so ${n} address lines.` };
        return { t: 'Memory addressing', q: `A byte-addressable memory has ${n} address lines. How much memory can it address?`, a: sizeOf(n), w: distinct(sizeOf(n), [sizeOf(n - 1), sizeOf(n + 1), sizeOf(n + 3), sizeOf(n - 10)]), ex: `2${sup(n)} bytes = ${sizeOf(n)}.` };
      },
      h => {
        const IC = 100 * h.int(1, 20), CPI = h.pick([1, 1.5, 2, 2.5, 3, 4]), f = h.pick([1, 2, 2.5, 4]), t = round((IC * CPI) / f, 6);
        return { t: 'Performance', q: `A program executes ${IC} million instructions at an average CPI of ${CPI} on a ${f} GHz processor. How long does it run, in milliseconds?`, a: t, u: ' ms', x: [IC * CPI * f, IC / f, round(t / 1000, 6)],
          ex: `Time = IC × CPI ÷ clock = ${IC} × 10⁶ × ${CPI} ÷ (${f} × 10⁹) s = ${num(t)} ms.` };
      },
      h => {
        const k = h.int(3, 8), n = h.int(10, 500);
        return { t: 'Pipelining', q: `An ideal ${k}-stage pipeline runs ${n} instructions. How many clock cycles does it take?`, a: k + n - 1, x: [k * n, n, k + n], ex: `The first instruction takes ${k} cycles and each of the other ${n - 1} finishes one cycle later: ${k} + ${n} ${MINUS} 1 = ${k + n - 1}.` };
      },
      h => {
        const [m, v] = h.pick([[1, 4], [1, 8], [2, 8], [4, 4], [16, 1], [8, 8], [2, 4]]), M = m * 2 ** h.int(1, 5), w = v * 2 ** h.int(0, 3), c = (M / m) * (w / v);
        return { t: 'Memory chips', q: `How many ${m}K × ${v} RAM chips are needed to build a ${M}K × ${w} memory?`, a: c, x: [M / m, w / v, c * 2], ex: `(${M}K/${m}K) rows × (${w}/${v}) chips per row = ${M / m} × ${w / v} = ${c}.` };
      },
    ],
    medium: [
      h => {
        const A = h.pick([16, 20, 24, 32]), cb = h.int(10, Math.min(16, A - 4)), bb = h.int(2, 7), kb = h.pick([0, 0, 1, 2, 3]), sets = cb - bb - kb;
        if (sets < 1) return null;
        const tag = A - sets - bb, k = 2 ** kb, askIdx = h.chance(0.3), assoc = k === 1 ? 'direct-mapped' : `${k}-way set-associative`;
        const ex = `Offset = log₂ ${2 ** bb} = ${bb} bits; ${k === 1 ? 'lines' : 'sets'} = ${sizeOf(cb)}/(${2 ** bb}${k > 1 ? ` × ${k}` : ''}) = 2${sup(sets)} → index ${sets} bits; tag = ${A} ${MINUS} ${sets} ${MINUS} ${bb} = ${tag}.`;
        return { t: 'Cache mapping', q: `A ${assoc} cache of ${sizeOf(cb)} uses ${2 ** bb}-byte blocks and ${A}-bit byte addresses. How many ${askIdx ? 'index' : 'tag'} bits are there?`, a: askIdx ? sets : tag, x: askIdx ? [sets + kb + 1, cb, tag] : [tag - kb || tag + 1, A - bb, sets], ex };
      },
      h => {
        const t = h.int(1, 5), m = h.int(2, 20), p = 10 * h.int(2, 20), ans = round(t + (m * p) / 100, 6);
        return { t: 'Memory performance', q: `A cache has a hit time of ${t} ns, a miss rate of ${m}% and a miss penalty of ${p} ns. What is the average memory access time?`, a: ans, u: ' ns', x: [(m * p) / 100, t + p, round(t * (1 - m / 100) + (p * m) / 100, 6)],
          ex: `AMAT = hit time + miss rate × penalty = ${t} + ${m / 100} × ${p} = ${num(ans)} ns.` };
      },
      h => {
        const k = h.int(4, 6), ds = Array.from({ length: k }, () => 10 * h.int(10, 30)), latch = 5 * h.int(0, 4), N = 100 * h.int(1, 10), cyc = Math.max(...ds) + latch, ans = round(((k + N - 1) * cyc) / 1000, 6);
        return { t: 'Pipelining', q: `A ${k}-stage pipeline has stage delays of ${ds.join(', ')} ps and a latch delay of ${latch} ps. How long does it take to run ${N} instructions, in ns?`, a: ans, u: ' ns', x: [round((N * sum(ds)) / 1000, 6), round((N * cyc) / 1000, 6), round(((k + N) * cyc) / 1000, 6)],
          ex: `Clock = slowest stage + latch = ${Math.max(...ds)} + ${latch} = ${cyc} ps; time = (${k} + ${N} ${MINUS} 1) × ${cyc} ps = ${num(ans)} ns.` };
      },
      h => {
        const f = h.pick([10, 15, 20, 25, 30]), p = h.int(1, 4), ld = h.chance(0.5) ? [h.pick([10, 20, 30]), h.int(1, 2)] : null, cpi = round(1 + (f * p) / 100 + (ld ? (ld[0] * ld[1]) / 100 : 0), 6);
        return { t: 'Performance', q: `In a pipeline with an ideal CPI of 1, ${f}% of instructions are branches with a ${p}-cycle penalty${ld ? ` and ${ld[0]}% are loads that stall ${ld[1]} cycle${ld[1] > 1 ? 's' : ''}` : ''}. What is the effective CPI?`, a: cpi, x: [1 + p, round(cpi - 1, 6), round(1 + (f * (p + 1)) / 100, 6)],
          ex: `CPI = 1 + ${f / 100} × ${p}${ld ? ` + ${ld[0] / 100} × ${ld[1]}` : ''} = ${num(cpi)}.` };
      },
    ],
    hard: [
      h => {
        const A = 32, cb = h.int(12, 16), bb = h.int(4, 6), kb = h.pick([0, 1, 2]), wb = h.chance(0.5), lines = 2 ** (cb - bb), tag = A - (cb - bb - kb) - bb, per = tag + 1 + (wb ? 1 : 0), ans = lines * per;
        return { t: 'Cache mapping', q: `A ${kb ? `${2 ** kb}-way set-associative` : 'direct-mapped'} cache of ${sizeOf(cb)} has ${2 ** bb}-byte blocks and 32-bit addresses, with one valid bit${wb ? ' and one dirty bit' : ''} per line. How many bits does its tag directory need?`, a: ans, x: [lines * tag, lines * (per + 1), 2 ** (cb - bb - kb) * per],
          ex: `Lines = ${2 ** cb}/${2 ** bb} = ${lines}; tag = 32 ${MINUS} ${cb - bb - kb} (index) ${MINUS} ${bb} (offset) = ${tag}; ${per} bits per line × ${lines} = ${ans} bits.` };
      },
      h => {
        const tc = h.int(1, 10), tm = 10 * h.int(5, 20), hr = h.pick([0.8, 0.85, 0.9, 0.95]), hier = h.chance(0.5);
        const H = round(hr * tc + (1 - hr) * (tc + tm), 6), Sim = round(hr * tc + (1 - hr) * tm, 6);
        return { t: 'Memory performance', q: `A cache (access ${tc} ns) and main memory (access ${tm} ns) have a hit ratio of ${hr}. ${hier ? 'On a miss, memory is accessed only after the cache is checked' : 'The cache and memory are accessed at the same time'}. What is the average access time?`, a: hier ? H : Sim, u: ' ns', x: [hier ? Sim : H, round(hr * tc + tm, 6), round(tc + tm, 6)],
          ex: hier ? `T = h·tc + (1 ${MINUS} h)(tc + tm) = ${hr} × ${tc} + ${num(round(1 - hr, 6))} × ${tc + tm} = ${num(H)} ns.` : `T = h·tc + (1 ${MINUS} h)·tm = ${hr} × ${tc} + ${num(round(1 - hr, 6))} × ${tm} = ${num(Sim)} ns.` };
      },
      h => {
        const [rpm, rot] = h.pick([[3000, 20], [6000, 10], [7500, 8], [12000, 5], [15000, 4]]), S = h.pick([40, 50, 80, 100, 200]), seek = h.int(2, 10), tr = rot / S, ans = round(seek + rot / 2 + tr, 6);
        return { t: 'Disks', q: `A disk spins at ${rpm} rpm with ${S} sectors per track and an average seek time of ${seek} ms. What is the average time to read one sector?`, a: ans, u: ' ms', x: [round(seek + rot + tr, 6), round(seek + rot / 2, 6), round(rot / 2 + tr, 6)],
          ex: `One turn = 60000/${rpm} = ${rot} ms; average rotational delay = ${num(rot / 2)} ms; one sector = ${rot}/${S} = ${num(tr)} ms. Total ${seek} + ${num(rot / 2)} + ${num(tr)} = ${num(ans)} ms.` };
      },
      h => {
        const L = h.pick([12, 16]), a = h.int(L === 12 ? 3 : 4, L === 12 ? 4 : 6), ob = L - 2 * a, slots = 2 ** ob, x = h.int(1, slots - 1), ans = (slots - x) * 2 ** a;
        return { t: 'Instruction formats', q: `A machine has ${L}-bit instructions and ${a}-bit address fields. It has ${x} two-address instructions. At most how many one-address instructions can it have?`, a: ans, x: [2 ** (L - a) - x, slots - x, (slots - x) * a],
          ex: `Two-address: ${L} ${MINUS} 2 × ${a} = ${ob} opcode bits → ${slots} patterns. ${slots - x} are free, and each extends with a ${a}-bit field: (${slots} ${MINUS} ${x}) × 2${sup(a)} = ${ans}.` };
      },
      h => {
        const R = h.pick([16, 32, 64]), N = h.int(20, 120), op = Math.ceil(Math.log2(N)), rb = Math.log2(R), imm = 32 - op - 2 * rb;
        return { t: 'Instruction formats', q: `A 32-bit instruction has an opcode, two register fields and an unsigned immediate. The CPU has ${N} instructions and ${R} registers. What is the largest immediate value?`, a: 2 ** imm - 1, x: [2 ** imm, 2 ** (imm - 1) - 1, 2 ** (imm + 1) - 1],
          ex: `Opcode ⌈log₂ ${N}⌉ = ${op} bits, registers 2 × ${rb} = ${2 * rb} bits, immediate 32 ${MINUS} ${op} ${MINUS} ${2 * rb} = ${imm} bits: max 2${sup(imm)} ${MINUS} 1 = ${2 ** imm - 1}.` };
      },
    ],
  };

  /* ---------- 11. Data Structures & Algorithms ---------- */
  const OPS = { '+': [1, (a, b) => a + b], '−': [1, (a, b) => a - b], '*': [2, (a, b) => a * b], '/': [2, (a, b) => a / b] };
  function exprTree(h, nOps, letters) {
    let leaves = letters ? h.shuffle(['a', 'b', 'c', 'd', 'e', 'f']).slice(0, nOps + 1).map(v => ({ v })) : Array.from({ length: nOps + 1 }, () => ({ v: h.int(1, 9) }));
    while (leaves.length > 1) {
      const i = h.int(0, leaves.length - 2), op = h.pick(letters ? ['+', '−', '*', '/'] : ['+', '−', '*']);
      leaves.splice(i, 2, { op, l: leaves[i], r: leaves[i + 1] });
    }
    return leaves[0];
  }
  const evalT = t => (t.op ? OPS[t.op][1](evalT(t.l), evalT(t.r)) : t.v);
  const postT = t => (t.op ? `${postT(t.l)} ${postT(t.r)} ${t.op}` : String(t.v));
  const preT = t => (t.op ? `${t.op} ${preT(t.l)} ${preT(t.r)}` : String(t.v));
  const inT = t => {
    if (!t.op) return String(t.v);
    const p = OPS[t.op][0], wrap = (c, right) => (c.op && (OPS[c.op][0] < p || (right && OPS[c.op][0] === p)) ? `(${inT(c)})` : inT(c));
    return `${wrap(t.l, false)} ${t.op} ${wrap(t.r, true)}`;
  };
  // Shunting-yard on our infix text; prec lets us model the "ignore precedence" slip.
  function toPostfix(s, prec) {
    const out = [], st = [];
    for (const tok of s.match(/[a-z0-9]+|[()+−*/]/g)) {
      if (/^[a-z0-9]+$/.test(tok)) out.push(tok);
      else if (tok === '(') st.push(tok);
      else if (tok === ')') { while (st[st.length - 1] !== '(') out.push(st.pop()); st.pop(); }
      else { while (st.length && st[st.length - 1] !== '(' && prec[st[st.length - 1]] >= prec[tok]) out.push(st.pop()); st.push(tok); }
    }
    while (st.length) out.push(st.pop());
    return out.join(' ');
  }
  const LOOPS = [
    ['for (i = 1; i <= n; i = i * 2)\n  for (j = 1; j <= n; j++)\n    x++;', 'n log n', 'The outer loop runs log n times, the inner n times each'],
    ['for (i = 1; i <= n; i = i * 2)\n  for (j = 1; j <= i; j++)\n    x++;', 'n', 'The inner loop runs 1 + 2 + 4 + … + n < 2n times in all'],
    ['for (i = 1; i <= n; i++)\n  for (j = 1; j <= i; j++)\n    x++;', 'n²', 'The inner loop runs 1 + 2 + … + n = n(n + 1)/2 times'],
    ['for (i = n; i > 1; i = i / 2)\n  x++;', 'log n', 'i halves each time'],
    ['for (i = 1; i * i <= n; i++)\n  x++;', '√n', 'It stops once i passes √n'],
    ['for (i = 1; i <= n; i++)\n  for (j = 1; j <= n; j = j + i)\n    x++;', 'n log n', 'The inner loop runs n/i times: n(1 + 1/2 + … + 1/n) ≈ n ln n'],
    ['for (i = 2; i <= n; i = i * i)\n  x++;', 'log log n', 'i squares each time: 2, 4, 16, 256…'],
    ['for (i = 1; i <= n; i++)\n  for (j = 1; j <= i * i; j++)\n    x++;', 'n³', 'The inner loop runs 1² + 2² + … + n² ≈ n³/3 times'],
    ['for (i = 1; i <= n; i++)\n  for (j = 1; j <= n; j = j * 2)\n    x++;', 'n log n', 'n outer passes, log n inner passes each'],
    ['for (i = n / 2; i <= n; i++)\n  for (j = 1; j <= n; j = 2 * j)\n    x++;', 'n log n', 'n/2 outer passes, log n inner passes each'],
  ];
  const THETAS = ['log n', 'n', 'n log n', 'n²', 'n³', '√n', 'log log n', 'n² log n'];
  const nPow = k => (k === 0 ? '' : k === 1 ? 'n' : `n${sup(k)}`);
  const thetaOf = (k, log) => theta([nPow(k), log ? 'log n' : ''].filter(Boolean).join(' ') || '1');
  function graph(h) {
    const n = h.int(5, 6), V = 'ABCDEF'.slice(0, n).split(''), E = new Map(), key = (a, b) => (a < b ? a + b : b + a);
    for (let i = 1; i < n; i++) { const j = h.int(0, i - 1); E.set(key(V[i], V[j]), h.int(1, 9)); }
    for (let t = 0; t < h.int(2, 4); t++) { const a = h.pick(V), b = h.pick(V); if (a !== b && !E.has(key(a, b))) E.set(key(a, b), h.int(1, 9)); }
    return { V, edges: [...E].map(([k, w]) => [k[0], k[1], w]) };
  }
  function shortest(G, s, t) {
    const dist = Object.fromEntries(G.V.map(v => [v, Infinity])), prev = {}, done = new Set();
    dist[s] = 0;
    while (done.size < G.V.length) {
      const u = G.V.filter(v => !done.has(v)).sort((a, b) => dist[a] - dist[b])[0];
      done.add(u);
      for (const [a, b, w] of G.edges) for (const [x, y] of [[a, b], [b, a]]) if (x === u && dist[u] + w < dist[y]) { dist[y] = dist[u] + w; prev[y] = u; }
    }
    const path = [t]; while (path[0] !== s) path.unshift(prev[path[0]]);
    return { d: dist[t], path };
  }
  function mst(G) {
    const parent = Object.fromEntries(G.V.map(v => [v, v])), find = v => (parent[v] === v ? v : (parent[v] = find(parent[v]))), used = [];
    for (const [a, b, w] of G.edges.slice().sort((x, y) => x[2] - y[2])) if (find(a) !== find(b)) { parent[find(a)] = find(b); used.push([a, b, w]); }
    return used;
  }
  const edgeTable = G => { const rows = []; for (let i = 0; i < G.edges.length; i += 2) rows.push([...G.edges.slice(i, i + 2).flatMap(([a, b, w]) => [`${a}–${b}`, String(w)])]); if (rows[rows.length - 1].length < 4) rows[rows.length - 1].push('', ''); return { head: ['Edge', 'Weight', 'Edge', 'Weight'], rows, rowHead: false }; };
  function heapInsert(keys, min) {
    const a = [], better = (x, y) => (min ? x < y : x > y);
    for (const k of keys) { a.push(k); let i = a.length - 1; while (i > 0 && better(a[i], a[(i - 1) >> 1])) { [a[i], a[(i - 1) >> 1]] = [a[(i - 1) >> 1], a[i]]; i = (i - 1) >> 1; } }
    return a;
  }
  function buildHeap(keys, min) {
    const a = keys.slice(), n = a.length, better = (x, y) => (min ? x < y : x > y);
    for (let s = (n >> 1) - 1; s >= 0; s--) { let i = s; for (;;) { const l = 2 * i + 1, r = l + 1; let b = i; if (l < n && better(a[l], a[b])) b = l; if (r < n && better(a[r], a[b])) b = r; if (b === i) break; [a[i], a[b]] = [a[b], a[i]]; i = b; } }
    return a;
  }
  function bst(keys) {
    const root = { k: keys[0] };
    for (const k of keys.slice(1)) { let n = root; for (;;) { const side = k < n.k ? 'l' : 'r'; if (!n[side]) { n[side] = { k }; break; } n = n[side]; } }
    return root;
  }
  const pre = n => (n ? [n.k, ...pre(n.l), ...pre(n.r)] : []), post = n => (n ? [...post(n.l), ...post(n.r), n.k] : []), inord = n => (n ? [...inord(n.l), n.k, ...inord(n.r)] : []);
  const level = n => { const out = [], q = [n]; while (q.length) { const x = q.shift(); out.push(x.k); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return out; };
  const height = n => (n ? 1 + Math.max(height(n.l), height(n.r)) : -1);
  const CATALAN = [1, 1, 2, 5, 14, 42, 132, 429];
  const DSA = {
    easy: [
      h => {
        const lo1 = h.pick([0, 1, -2]), lo2 = h.pick([0, 1, 5]), R = h.int(4, 12), C = h.int(4, 12), B = 100 * h.int(10, 40), s = h.pick([1, 2, 4, 8]), i = lo1 + h.int(0, R - 1), j = lo2 + h.int(0, C - 1), row = h.chance(0.6);
        const addr = row ? B + ((i - lo1) * C + (j - lo2)) * s : B + ((j - lo2) * R + (i - lo1)) * s, other = row ? B + ((j - lo2) * R + (i - lo1)) * s : B + ((i - lo1) * C + (j - lo2)) * s;
        return { t: 'Arrays', q: `A[${lo1}..${lo1 + R - 1}][${lo2}..${lo2 + C - 1}] is stored in ${row ? 'row' : 'column'}-major order from address ${B}, ${s} byte${s > 1 ? 's' : ''} per element. What is the address of A[${i}][${j}]?`, a: addr, x: [other, B + (i * C + j) * s, addr + s],
          ex: row ? `${B} + ((${i} ${MINUS} ${signed(lo1)}) × ${C} + (${j} ${MINUS} ${lo2})) × ${s} = ${addr}.` : `${B} + ((${j} ${MINUS} ${lo2}) × ${R} + (${i} ${MINUS} ${signed(lo1)})) × ${s} = ${addr}.` };
      },
      h => {
        const v = h.pick(['max', 'leaves', 'minh', 'level']);
        if (v === 'max') { const k = h.int(2, 9); return { t: 'Binary trees', q: `What is the maximum number of nodes in a binary tree of height ${k} (a single node has height 0)?`, a: 2 ** (k + 1) - 1, x: [2 ** k, 2 ** k - 1, 2 ** (k + 1)], ex: `1 + 2 + … + 2${sup(k)} = 2${sup(k + 1)} ${MINUS} 1 = ${2 ** (k + 1) - 1}.` }; }
        if (v === 'leaves') { const n = h.int(5, 60); return { t: 'Binary trees', q: `A full binary tree (every node has 0 or 2 children) has ${n} internal nodes. How many leaves does it have?`, a: n + 1, x: [n, 2 * n, n - 1], ex: `In a full binary tree, leaves = internal nodes + 1 = ${n + 1}.` }; }
        if (v === 'level') { const k = h.int(2, 10); return { t: 'Binary trees', q: `What is the maximum number of nodes at level ${k} of a binary tree (the root is at level 0)?`, a: 2 ** k, x: [2 ** (k + 1) - 1, 2 * k, 2 ** (k - 1)], ex: `Each level can double: 2${sup(k)} = ${2 ** k}.` }; }
        const n = h.int(10, 2000), m = Math.floor(Math.log2(n));
        return { t: 'Binary trees', q: `What is the minimum height of a binary tree with ${n} nodes (a single node has height 0)?`, a: m, x: [m + 1, Math.ceil(Math.log2(n)) === m ? m - 1 : Math.ceil(Math.log2(n)), n - 1], ex: `A complete tree is shortest: ⌊log₂ ${n}⌋ = ${m}.` };
      },
      h => {
        const one = h.chance(0.5), i = h.int(2, 40), kind = h.pick(['left', 'right', 'parent']);
        const v = one ? { left: 2 * i, right: 2 * i + 1, parent: Math.floor(i / 2) }[kind] : { left: 2 * i + 1, right: 2 * i + 2, parent: Math.floor((i - 1) / 2) }[kind];
        const f = one ? { left: '2i', right: '2i + 1', parent: '⌊i/2⌋' }[kind] : { left: '2i + 1', right: '2i + 2', parent: '⌊(i − 1)/2⌋' }[kind];
        return { t: 'Heaps', q: `A binary heap is stored in an array starting at index ${one ? 1 : 0}. At what index is the ${kind === 'parent' ? 'parent' : `${kind} child`} of the element at index ${i}?`, a: v, x: [2 * i, 2 * i + 1, 2 * i + 2, Math.floor(i / 2), Math.floor((i - 1) / 2)].filter(x => x !== v),
          ex: `With ${one ? '1' : '0'}-based indexing the ${kind === 'parent' ? 'parent' : `${kind} child`} of i is at ${f} = ${v}.` };
      },
      h => {
        const n = h.int(10, 5000), c = Math.floor(Math.log2(n)) + 1;
        return { t: 'Searching', q: `What is the largest number of comparisons binary search makes on a sorted array of ${n} elements?`, a: c, x: [c - 1, Math.ceil(n / 2), c + 1], ex: `Each comparison halves the range: ⌊log₂ ${n}⌋ + 1 = ${c}.` };
      },
    ],
    medium: [
      h => {
        let t, v; do { t = exprTree(h, h.int(3, 4), false); v = evalT(t); } while (Math.abs(v) > 200);
        return { t: 'Stacks', q: 'What does this postfix expression evaluate to?', code: postT(t), a: v, x: [v + 2, -v, evalT({ op: '+', l: t.l || t, r: t.r || t })], ex: `Push numbers; each operator pops two (the first popped is the right operand). As infix: ${inT(t)} = ${num(v)}.` };
      },
      h => {
        const t = exprTree(h, h.int(3, 4), true), infix = inT(t), ans = toPostfix(infix, { '+': 1, '−': 1, '*': 2, '/': 2 });
        if (ans !== postT(t)) return null;
        return { t: 'Stacks', q: 'What is the postfix form of this infix expression?', code: infix, a: ans, mono: true, w: distinct(ans, [toPostfix(infix, { '+': 1, '−': 1, '*': 1, '/': 1 }), preT(t), toPostfix(infix, { '+': 2, '−': 2, '*': 1, '/': 1 }), ans.split(' ').reverse().join(' ')]),
          ex: `* and / bind tighter than + and −, and equal operators group left to right; each operator follows its two operands: ${ans}.` };
      },
      h => {
        const n = h.int(3, 7), bst2 = h.chance(0.6);
        return { t: 'Binary trees', q: bst2 ? `How many different binary search trees can hold ${n} distinct keys?` : `How many structurally different binary trees have ${n} nodes?`, a: CATALAN[n], x: [fact(n), 2 ** n - n, CATALAN[n - 1]], ex: `The Catalan number C${sub(n)} = (2n)!/((n + 1)!n!) = ${CATALAN[n]}.` };
      },
      h => {
        const m = h.pick([7, 10, 11, 13]), cnt = h.int(6, Math.min(8, m - 1)); let keys, slots, coll; // never fill the table
        do {
          keys = []; while (keys.length < cnt) { const k = h.int(10, 99); if (!keys.includes(k)) keys.push(k); }
          const tab = Array(m).fill(null); slots = []; coll = 0;
          for (const k of keys) { let s = k % m; if (tab[s] !== null) coll++; while (tab[s] !== null) s = (s + 1) % m; tab[s] = k; slots.push(s); }
        } while (coll < 2 || slots[cnt - 1] === keys[cnt - 1] % m);
        const key = keys[cnt - 1], home = key % m, at = slots[cnt - 1];
        return { t: 'Hashing', q: `Keys ${keys.join(', ')} are inserted in that order into an empty table of size ${m} with h(k) = k mod ${m} and linear probing. In which slot does ${key} end up?`, a: at, x: [home, (home + 1) % m, (at + 1) % m],
          ex: `${key} mod ${m} = ${home}, but slot${at === (home + 1) % m ? '' : 's'} ${Array.from({ length: (at - home + m) % m }, (_, i) => (home + i) % m).join(', ')} ${at === (home + 1) % m ? 'is' : 'are'} taken, so it goes to ${at}.` };
      },
      h => {
        const b = h.pick([2, 3, 4]), a = h.pick([1, 2, 3, 4, 7, 8, 9, 16]), k = h.int(0, 3), bk = b ** k, e = Math.log(a) / Math.log(b);
        const ePow = Number.isInteger(round(e, 9)) ? (round(e, 9) === 0 ? '1' : nPow(round(e, 9))) : `n^(log${sub(b)}${a})`;
        const ans = a < bk ? thetaOf(k, false) : a === bk ? thetaOf(k, true) : theta(ePow);
        const f = k === 0 ? '1' : nPow(k), cmp = a < bk ? '<' : a === bk ? '=' : '>';
        return { t: 'Recurrences', q: `T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${f}. What is T(n)?`, a: ans, w: distinct(ans, [thetaOf(k, false), thetaOf(k, true), theta(ePow), thetaOf(k + 1, false), thetaOf(k, true).replace('log n', 'log² n')]),
          ex: `Master theorem: a = ${a}, b = ${b}, f(n) = Θ(${f === '1' ? '1' : f}). Compare a with bᵏ = ${b}${sup(k)} = ${bk}: ${a} ${cmp} ${bk}, so T(n) = ${ans}.` };
      },
    ],
    hard: [
      h => {
        const min = h.chance(0.5), keys = h.shuffle([...Array(30).keys()].map(v => v + 1)).slice(0, h.int(6, 8)), ins = heapInsert(keys, min), built = buildHeap(keys, min), byInsert = h.chance(0.6);
        const ans = (byInsert ? ins : built).join(', ');
        return { t: 'Heaps', q: `${keys.join(', ')} are ${byInsert ? 'inserted one by one into an empty' : 'turned into a'} binary ${min ? 'min' : 'max'}-heap${byInsert ? '' : ' with the bottom-up build-heap method'}. What is the resulting array?`, a: ans, mono: true,
          w: distinct(ans, [(byInsert ? built : ins).join(', '), keys.slice().sort((a, b) => (min ? a - b : b - a)).join(', '), heapInsert(keys, !min).join(', '), keys.join(', ')]),
          ex: byInsert ? `Each new key goes at the end and swaps upwards while it is ${min ? 'smaller' : 'larger'} than its parent: ${ans}.` : `Sift down each internal node from the last one to the root: ${ans}.` };
      },
      h => {
        const keys = h.shuffle([...Array(60).keys()].map(v => v + 10)).slice(0, h.int(7, 9)), root = bst(keys), kind = h.pick(['pre', 'post', 'level', 'height']);
        if (kind === 'height') { const ht = height(root); return { t: 'Binary search trees', q: `${keys.join(', ')} are inserted in that order into an empty BST. What is its height (a single node has height 0)?`, a: ht, x: [ht + 1, ht - 1, Math.floor(Math.log2(keys.length))], ex: `Root ${root.k}; the longest path down is ${ht} edges.` }; }
        const lists = { pre: pre(root), post: post(root), level: level(root), in: inord(root) }, ans = lists[kind].join(', ');
        return { t: 'Binary search trees', q: `${keys.join(', ')} are inserted in that order into an empty BST. What is its ${{ pre: 'preorder', post: 'postorder', level: 'level-order' }[kind]} traversal?`, a: ans, mono: true, w: distinct(ans, Object.values(lists).map(l => l.join(', '))),
          ex: `Root ${root.k}; ${{ pre: 'preorder visits root, left subtree, right subtree', post: 'postorder visits left subtree, right subtree, then root', level: 'level order reads the tree row by row' }[kind]}: ${ans}.` };
      },
      h => {
        const a = h.shuffle([...Array(20).keys()].map(v => v + 1)).slice(0, h.int(6, 8)), per = a.map((v, i) => a.slice(i + 1).filter(w => w < v).length), inv = sum(per);
        return { t: 'Sorting', q: `How many swaps does bubble sort make to sort ${a.join(', ')} in ascending order?`, a: inv, x: [inv + 1, (a.length * (a.length - 1)) / 2, inv - 1], ex: `Each swap fixes one inversion. Smaller numbers after each element: ${per.join(' + ')} = ${inv}.` };
      },
      h => {
        const G = graph(h), s = G.V[0], t = G.V[G.V.length - 1], { d, path } = shortest(G, s, t), direct = G.edges.find(([a, b]) => (a === s && b === t) || (a === t && b === s));
        if (path.length < 3) return null;
        const w = path.slice(1).map((v, i) => G.edges.find(([a, b]) => (a === v && b === path[i]) || (b === v && a === path[i]))[2]);
        return { t: 'Shortest paths', q: `In the undirected weighted graph below, what is the length of the shortest path from ${s} to ${t}?`, table: edgeTable(G), a: d, x: [direct ? direct[2] : d + 3, d + 1, sum(G.edges.map(e => e[2])) - d].filter(v => v > 0), ex: `Dijkstra from ${s}: ${path.join(' → ')} = ${w.join(' + ')} = ${d}.` };
      },
      h => {
        const G = graph(h), T = mst(G), wt = sum(T.map(e => e[2]));
        return { t: 'Minimum spanning trees', q: 'What is the total weight of a minimum spanning tree of the graph below?', table: edgeTable(G), a: wt, x: [wt + 1, sum(G.edges.map(e => e[2])), wt + Math.max(...G.edges.map(e => e[2]))], ex: `Kruskal: take the lightest edges that don’t form a cycle — ${T.map(([a, b, w]) => `${a}–${b} (${w})`).join(', ')} — total ${wt}.` };
      },
      h => {
        const [code, ans, why] = h.pick(LOOPS);
        return { t: 'Time complexity', q: 'What is the time complexity of this code?', code, lang: 'js', a: theta(ans), w: distinct(theta(ans), h.shuffle(THETAS).map(theta)), ex: `${why}: ${theta(ans)}.` };
      },
    ],
  };

  /* ---------- 12. Operating Systems ---------- */
  const procTable = ps => ({ head: ['Process', 'Arrival', 'Burst'], rows: ps.map(p => [`P${p.id}`, String(p.at), String(p.bt)]) });
  function procs(h, n, zero = false) {
    const ats = zero ? Array(n).fill(0) : [0, ...h.shuffle([...Array(9).keys()].map(v => v + 1)).slice(0, n - 1).sort((a, b) => a - b)];
    return ats.map((at, i) => ({ id: i + 1, at, bt: h.int(1, 9) }));
  }
  function schedule(ps, algo, q = 2) {
    const left = ps.map(p => ({ ...p, rem: p.bt })), done = {}, gantt = [];
    let t = 0;
    const run = (p, d) => { if (gantt.length && gantt[gantt.length - 1].id === p.id) gantt[gantt.length - 1].end = t + d; else gantt.push({ id: p.id, start: t, end: t + d }); t += d; p.rem -= d; if (!p.rem) done[p.id] = t; };
    if (algo === 'RR') {
      const queue = left.slice();
      while (queue.length) { const p = queue.shift(); run(p, Math.min(q, p.rem)); if (p.rem) queue.push(p); }
    } else {
      while (left.some(p => p.rem)) {
        const ready = left.filter(p => p.rem && p.at <= t);
        if (!ready.length) { t = Math.min(...left.filter(p => p.rem).map(p => p.at)); continue; }
        ready.sort(algo === 'FCFS' ? (a, b) => a.at - b.at || a.id - b.id : (a, b) => a.rem - b.rem || a.at - b.at || a.id - b.id);
        const p = ready[0];
        if (algo === 'SRTF') run(p, 1); else run(p, p.rem);
      }
    }
    const wt = ps.map(p => done[p.id] - p.at - p.bt);
    return { done, wt, avg: round(sum(wt) / ps.length, 6), gantt: gantt.map(g => `P${g.id} (${g.start}–${g.end})`).join(', ') };
  }
  function faults(refs, k, algo) {
    const mem = [], marks = [];
    let f = 0;
    refs.forEach((p, i) => {
      if (mem.includes(p)) { if (algo === 'LRU') { mem.splice(mem.indexOf(p), 1); mem.push(p); } marks.push(String(p)); return; }
      f++; marks.push(`${p}*`);
      if (mem.length === k) {
        if (algo === 'OPT') { const next = mem.map(x => { const j = refs.indexOf(x, i + 1); return j < 0 ? Infinity : j; }); mem.splice(next.indexOf(Math.max(...next)), 1); }
        else mem.shift();
      }
      mem.push(p);
    });
    return { f, marks: marks.join(' ') };
  }
  function seek(head, reqs, algo) {
    let pos = head, total = 0; const order = [];
    const go = c => { total += Math.abs(c - pos); pos = c; order.push(c); };
    if (algo === 'FCFS') reqs.forEach(go);
    else if (algo === 'SSTF') { const left = reqs.slice(); while (left.length) { left.sort((a, b) => Math.abs(a - pos) - Math.abs(b - pos)); if (left.length > 1 && Math.abs(left[0] - pos) === Math.abs(left[1] - pos)) return null; go(left.shift()); } }
    else {
      const up = sorted(reqs.filter(c => c > pos)), down = sorted(reqs.filter(c => c < pos)).reverse();
      up.forEach(go); if (algo === 'SCAN') go(199); down.forEach(go);
      if (algo === 'SCAN') order.splice(order.indexOf(199), 1, '199 (end)');
    }
    return { total, order: order.join(' → ') };
  }
  const OS = {
    easy: [
      h => {
        const n = h.int(2, 5), print = h.chance(0.5);
        return { t: 'Processes', q: print ? 'How many times does this program print "hi"?' : 'How many child processes does this program create (not counting the original)?', code: `${'fork();\n'.repeat(n)}printf("hi\\n");`, lang: 'js', a: print ? 2 ** n : 2 ** n - 1, x: [n, 2 * n, print ? 2 ** n - 1 : 2 ** n],
          ex: `Each fork() doubles the number of processes: 2${sup(n)} = ${2 ** n} in all${print ? ', and each prints once' : `, so ${2 ** n - 1} children`}.` };
      },
      h => {
        const L = h.int(16, 32), p = h.int(9, 14), kind = h.pick(['pages', 'offset', 'pnum']);
        if (kind === 'offset') return { t: 'Paging', q: `With ${pageOf(p)} pages, how many bits of a logical address are the page offset?`, a: p, x: [p + 1, L - p, p - 10], ex: `${sizeOf(p)} = 2${sup(p)} bytes, so the offset needs ${p} bits.` };
        if (kind === 'pnum') return { t: 'Paging', q: `A system has ${L}-bit logical addresses and ${pageOf(p)} pages. How many bits is the page number?`, a: L - p, x: [p, L, L - p + 1], ex: `Offset = ${p} bits (2${sup(p)} bytes per page); page number = ${L} ${MINUS} ${p} = ${L - p} bits.` };
        return { t: 'Paging', q: `A system has ${L}-bit logical addresses and ${pageOf(p)} pages. How many pages can a process have?`, a: 2 ** (L - p), x: [2 ** p, 2 ** (L - p - 1), L - p], ex: `${L} ${MINUS} ${p} = ${L - p} bits of page number: 2${sup(L - p)} = ${2 ** (L - p)} pages.` };
      },
      h => {
        const n = h.int(2, 8), k = h.int(2, 6), ans = n * (k - 1) + 1;
        return { t: 'Deadlocks', q: `${n} processes each need up to ${k} units of a resource. What is the fewest units that guarantees no deadlock?`, a: ans, x: [n * k, n * (k - 1), n + k], ex: `With ${n} × ${k - 1} = ${n * (k - 1)} units, each could hold ${k - 1} and wait forever; one more lets someone finish: ${ans}.` };
      },
      h => {
        const s = h.int(3, 10), P = h.int(1, s), V = h.int(1, 10), ans = s - P + V; // P ≤ s: no process ever blocks
        return { t: 'Semaphores', q: `A counting semaphore starts at ${s}. Then ${P} wait (P) and ${V} signal (V) operations are done on it. What is its final value?`, a: ans, x: [s + P - V, s - P, P - V], ex: `Each P takes 1 and each V adds 1: ${s} ${MINUS} ${P} + ${V} = ${num(ans)}.` };
      },
    ],
    medium: [
      h => {
        const algo = h.pick(['FCFS', 'SJF']), n = h.int(4, 5), ps = procs(h, n), r = schedule(ps, algo), other = schedule(ps, algo === 'FCFS' ? 'SJF' : 'FCFS');
        return { t: 'CPU scheduling', q: `Using ${algo === 'FCFS' ? 'FCFS' : 'non-preemptive SJF (ties: earlier arrival)'}, what is the average waiting time of these processes?`, table: procTable(ps), a: r.avg, x: [other.avg, round(r.avg + 1, 6), round(sum(ps.map((p, i) => r.done[p.id] - p.at)) / n, 6)],
          ex: `Order: ${r.gantt}. Waiting = finish ${MINUS} arrival ${MINUS} burst: ${r.wt.join(', ')}; average ${num(r.avg)}.` };
      },
      h => {
        const n = h.int(3, 5), q = h.int(2, 4), ps = procs(h, n, true), r = schedule(ps, 'RR', q), id = h.int(1, n), ask = h.chance(0.5);
        if (ask) return { t: 'CPU scheduling', q: `All these processes arrive at time 0 in the order shown. Using Round Robin with a time quantum of ${q}, when does P${id} finish?`, table: procTable(ps), a: r.done[id], x: [sum(ps.slice(0, id).map(p => p.bt)), r.done[id] + q, r.done[id] - 1], ex: `Gantt chart: ${r.gantt}. P${id} finishes at ${r.done[id]}.` };
        return { t: 'CPU scheduling', q: `All these processes arrive at time 0 in the order shown. Using Round Robin with a time quantum of ${q}, what is the average waiting time?`, table: procTable(ps), a: r.avg, x: [schedule(ps, 'FCFS').avg, round(r.avg + q, 6), round(r.avg - 1, 6)], ex: `Gantt chart: ${r.gantt}. Waiting times ${r.wt.join(', ')}; average ${num(r.avg)}.` };
      },
      h => {
        const hr = h.pick([0.8, 0.9, 0.95, 0.98]), t = h.pick([10, 20]), m = h.pick([50, 100, 150, 200]), E = round(hr * (t + m) + (1 - hr) * (t + 2 * m), 6);
        return { t: 'Paging', q: `TLB lookup takes ${t} ns and a memory access ${m} ns. With a TLB hit ratio of ${hr}, what is the effective memory access time (single-level paging)?`, a: E, u: ' ns', x: [round(hr * m + (1 - hr) * 2 * m, 6), round(t + m, 6), round(hr * (t + m) + (1 - hr) * (t + m), 6)],
          ex: `EAT = h(t + m) + (1 ${MINUS} h)(t + 2m) = ${hr} × ${t + m} + ${num(round(1 - hr, 6))} × ${t + 2 * m} = ${num(E)} ns.` };
      },
      h => {
        const L = h.int(24, 32), p = h.int(10, 14), e = h.pick([2, 4, 8]), bytesP = L - p + Math.log2(e), ans = sizeOf(bytesP);
        return { t: 'Paging', q: `A system has ${L}-bit logical addresses, ${sizeOf(p)} pages and ${e}-byte page table entries. How big is a process’s page table?`, a: ans, w: distinct(ans, [sizeOf(bytesP - 1), sizeOf(bytesP + 1), sizeOf(L - p), sizeOf(bytesP + 10)]),
          ex: `2${sup(L - p)} entries × ${e} bytes = 2${sup(bytesP)} bytes = ${ans}.` };
      },
    ],
    hard: [
      h => {
        const n = h.int(4, 5), ps = procs(h, n), r = schedule(ps, 'SRTF'), sj = schedule(ps, 'SJF');
        return { t: 'CPU scheduling', q: 'Using SRTF (preemptive SJF; ties go to the process that arrived first), what is the average waiting time?', table: procTable(ps), a: r.avg, x: [sj.avg === r.avg ? round(r.avg + 1, 6) : sj.avg, schedule(ps, 'FCFS').avg, round(r.avg + 0.5, 6)],
          ex: `Gantt chart: ${r.gantt}. Waiting times ${r.wt.join(', ')}; average ${num(r.avg)}.` };
      },
      h => {
        const k = h.int(3, 4), len = h.int(12, 15), refs = Array.from({ length: len }, () => h.int(0, 6)), algo = h.pick(['FIFO', 'LRU', 'OPT']), r = faults(refs, k, algo);
        if (new Set(refs).size <= k) return null;
        const others = ['FIFO', 'LRU', 'OPT'].filter(a => a !== algo).map(a => faults(refs, k, a).f);
        return { t: 'Page replacement', q: `With ${k} frames (initially empty), how many page faults does ${algo === 'OPT' ? 'optimal (OPT)' : algo} replacement cause for the reference string ${refs.join(', ')}?`, a: r.f, x: [...others, r.f + 1, r.f - 1], ex: `Faults marked *: ${r.marks} → ${r.f}.` };
      },
      h => {
        const algo = h.pick(['FCFS', 'SSTF', 'SCAN', 'LOOK']), head = h.int(40, 160); let reqs, r;
        do { reqs = []; while (reqs.length < h.int(6, 7)) { const c = h.int(0, 198); if (c !== head && !reqs.includes(c)) reqs.push(c); } r = seek(head, reqs, algo); } while (!r || !reqs.some(c => c < head) || !reqs.some(c => c > head));
        const dir = algo === 'SCAN' ? ', moving towards higher cylinders (it goes to cylinder 199 before reversing)' : algo === 'LOOK' ? ', moving towards higher cylinders' : '';
        const others = ['FCFS', 'SSTF', 'SCAN', 'LOOK'].filter(a => a !== algo).map(a => (seek(head, reqs, a) || {}).total).filter(Boolean);
        return { t: 'Disk scheduling', q: `A disk has cylinders 0–199 and the head is at ${head}${dir}. The queue is ${reqs.join(', ')}. What is the total head movement under ${algo}?`, a: r.total, x: others, ex: `${head} → ${r.order}: ${r.total} cylinders.` };
      },
      h => {
        const L = h.pick([32, 36, 40, 44, 48]), p = h.pick([12, 13, 14]), e = h.pick([4, 8]), bpl = p - Math.log2(e), lv = Math.ceil((L - p) / bpl);
        return { t: 'Paging', q: `A system has ${L}-bit virtual addresses, ${sizeOf(p)} pages and ${e}-byte page table entries. If each page table must fit in one page, how many levels of paging are needed?`, a: lv, x: [lv + 1, lv - 1, Math.ceil((L - p) / p)].filter(v => v > 0),
          ex: `One page holds 2${sup(p)}/${e} = 2${sup(bpl)} entries → ${bpl} bits per level. Page-number bits ${L} ${MINUS} ${p} = ${L - p}; ⌈${L - p}/${bpl}⌉ = ${lv} levels.` };
      },
    ],
  };

  /* ---------- 13. Databases ---------- */
  const closure = (X, fds) => { const c = new Set(X); for (let ch = true; ch;) { ch = false; for (const [l, r] of fds) if (l.every(a => c.has(a)) && r.some(a => !c.has(a))) { r.forEach(a => c.add(a)); ch = true; } } return c; };
  const subsets = attrs => { const out = []; for (let m = 1; m < 2 ** attrs.length; m++) out.push(attrs.filter((_, i) => m >> i & 1)); return out.sort((a, b) => a.length - b.length); };
  const keysOf = (attrs, fds) => { const keys = []; for (const S of subsets(attrs)) { if (keys.some(k => k.every(a => S.includes(a)))) continue; if (closure(S, fds).size === attrs.length) keys.push(S); } return keys; };
  const fdText = fds => fds.map(([l, r]) => `${l.join('')} → ${r.join('')}`).join(', ');
  const setT = s => `{${[...s].sort().join(', ')}}`;
  function randFDs(h, attrs, n) {
    const fds = [];
    while (fds.length < n) {
      const l = h.shuffle(attrs).slice(0, h.int(1, 2)).sort(), r = h.shuffle(attrs.filter(a => !l.includes(a))).slice(0, h.int(1, 2)).sort();
      if (!fds.some(([a, b]) => a.join('') === l.join('') && b.join('') === r.join(''))) fds.push([l, r]);
    }
    return fds;
  }
  function normalForm(attrs, fds) {
    const keys = keysOf(attrs, fds), prime = new Set(keys.flat()), single = fds.flatMap(([l, r]) => r.filter(a => !l.includes(a)).map(a => [l, a]));
    const isSuper = l => closure(l, fds).size === attrs.length;
    for (const k of keys) for (const S of subsets(k)) if (S.length < k.length) { const bad = [...closure(S, fds)].find(a => !prime.has(a) && !S.includes(a)); if (bad) return { nf: '1NF', keys, why: `${S.join('')} → ${bad}: part of key ${k.join('')} decides non-prime ${bad} (partial dependency)` }; }
    const v3 = single.find(([l, a]) => !isSuper(l) && !prime.has(a));
    if (v3) return { nf: '2NF', keys, why: `${v3[0].join('')} → ${v3[1]}: ${v3[0].join('')} is not a superkey and ${v3[1]} is not prime (transitive dependency)` };
    const vb = single.find(([l]) => !isSuper(l));
    if (vb) return { nf: '3NF', keys, why: `${vb[0].join('')} → ${vb[1]}: ${vb[0].join('')} is not a superkey, but ${vb[1]} is prime` };
    return { nf: 'BCNF', keys, why: 'every determinant is a superkey' };
  }
  function schedule2(h) {
    const n = h.int(2, 3), items = ['X', 'Y'], ops = [];
    for (let t = 1; t <= n; t++) for (let k = 0; k < h.int(2, 3); k++) ops.push({ t, k: h.pick(['R', 'W']), x: h.pick(items) });
    const per = Array.from({ length: n }, (_, i) => ops.filter(o => o.t === i + 1)), order = [];
    const idx = Array(n).fill(0);
    while (order.length < ops.length) { const t = h.pick([...Array(n).keys()].filter(i => idx[i] < per[i].length)); order.push(per[t][idx[t]++]); }
    const edges = new Set();
    order.forEach((a, i) => order.slice(i + 1).forEach(b => { if (a.t !== b.t && a.x === b.x && (a.k === 'W' || b.k === 'W')) edges.add(`${a.t}>${b.t}`); }));
    const perms = n === 2 ? [[1, 2], [2, 1]] : [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]];
    const ok = perms.filter(p => [...edges].every(e => { const [a, b] = e.split('>').map(Number); return p.indexOf(a) < p.indexOf(b); }));
    return { n, order, edges: [...edges], ok, perms };
  }
  const DBMS = {
    easy: [
      h => {
        const m = h.int(5, 50), n = h.int(5, 50), kind = h.pick(['cross', 'join', 'super1', 'super2']);
        if (kind === 'cross') return { t: 'Relational algebra', q: `R has ${m} tuples and S has ${n}. How many tuples does R × S have?`, a: m * n, x: [m + n, Math.max(m, n), m * n - 1], ex: `Every tuple of R pairs with every tuple of S: ${m} × ${n} = ${m * n}.` };
        if (kind === 'join') return { t: 'Relational algebra', q: `R(A, B) has ${m} tuples and S(B, C) has ${n}. B is the primary key of S and a non-null foreign key in R. How many tuples does R ⋈ S have?`, a: m, x: [m * n, n, Math.min(m, n) === m ? m + n : Math.min(m, n)], ex: `Each R tuple matches exactly one S tuple (B is S’s key and every R.B exists in S): ${m}.` };
        const k = h.int(3, 7);
        if (kind === 'super1') return { t: 'Keys', q: `A relation with ${k} attributes has exactly one candidate key, a single attribute. How many super keys does it have?`, a: 2 ** (k - 1), x: [2 ** k, 2 ** k - 1, k], ex: `Any superset of the key works: 2${sup(k - 1)} = ${2 ** (k - 1)}.` };
        return { t: 'Keys', q: `A relation with ${k} attributes has exactly two candidate keys, each a single attribute. How many super keys does it have?`, a: 3 * 2 ** (k - 2), x: [2 ** k, 2 ** (k - 1), 2 ** k - 2], ex: `Supersets of A or B: 2${sup(k - 1)} + 2${sup(k - 1)} ${MINUS} 2${sup(k - 2)} = ${3 * 2 ** (k - 2)}.` };
      },
      h => {
        if (h.chance(0.5)) { const m = h.int(2, 5), n = h.int(2, 5); return { t: 'Transactions', q: `T1 has ${m} operations and T2 has ${n}. How many different schedules (interleavings keeping each transaction’s order) are there?`, a: nCr(m + n, m), x: [fact(m + n), m * n, 2], ex: `Choose which ${m} of the ${m + n} positions belong to T1: ${m + n}C${m} = ${nCr(m + n, m)}.` }; }
        const k = h.int(2, 6);
        return { t: 'Transactions', q: `How many serial schedules are possible for ${k} transactions?`, a: fact(k), x: [k, 2 ** k, k * k], ex: `Any order of the ${k} transactions: ${k}! = ${fact(k)}.` };
      },
    ],
    medium: [
      h => {
        const attrs = h.chance(0.5) ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D', 'E', 'F'], fds = randFDs(h, attrs, h.int(4, 5)), X = h.shuffle(attrs).slice(0, h.int(1, 2)).sort(), c = closure(X, fds), ans = setT(c);
        const missing = attrs.filter(a => !c.has(a)), extra = [...c].filter(a => !X.includes(a));
        const w = [setT(new Set([...c, ...missing.slice(0, 1)])), setT(new Set([...c].filter(a => a !== extra[extra.length - 1]))), setT(new Set(X)), setT(new Set([...c, ...missing.slice(-1)]))];
        return { t: 'Functional dependencies', q: `R(${attrs.join(', ')}) has F = {${fdText(fds)}}. What is (${X.join('')})⁺?`, a: ans, mono: true, w: distinct(ans, w.concat([setT(new Set(attrs))])), ex: `Start with ${X.join('')} and keep applying FDs whose left side is inside: ${ans}.` };
      },
      h => {
        const attrs = ['A', 'B', 'C', 'D', 'E']; let fds, keys;
        do { fds = randFDs(h, attrs, h.int(3, 5)); keys = keysOf(attrs, fds); } while (keys.length !== 1 || keys[0].length > 3);
        const key = keys[0], ans = key.join(''), others = h.shuffle(subsets(attrs).filter(S => S.join('') !== ans && (S.length === key.length || (S.length === key.length + 1 && key.every(a => S.includes(a)))))).slice(0, 5).map(S => S.join(''));
        return { t: 'Keys', q: `R(${attrs.join(', ')}) has F = {${fdText(fds)}}. Which of these is a candidate key?`, a: ans, mono: true, w: distinct(ans, others), ex: `(${ans})⁺ = all attributes and no smaller set works; it is the only candidate key.${others.some(o => key.every(a => o.includes(a))) ? ' (A superset of it is a super key, not a candidate key.)' : ''}` };
      },
      h => {
        const B = h.pick([512, 1024, 2048, 4096]), K = h.pick([8, 9, 10, 12, 16, 20]), P = h.pick([4, 6, 8]), Pr = h.pick([6, 7, 8, 10]);
        if (h.chance(0.5)) { const p = Math.floor((B + K) / (P + K)); return { t: 'Indexing', q: `A B+ tree has ${B}-byte blocks, ${K}-byte keys and ${P}-byte block pointers. What is the most child pointers an internal node can have?`, a: p, x: [Math.floor(B / (P + K)) === p ? p + 1 : Math.floor(B / (P + K)), Math.floor(B / K), p - 1], ex: `p pointers and p ${MINUS} 1 keys must fit: ${P}p + ${K}(p ${MINUS} 1) ≤ ${B} → p ≤ ${num(round((B + K) / (P + K), 3))}, so ${p}.` }; }
        const m = Math.floor((B - P) / (K + Pr));
        return { t: 'Indexing', q: `A B+ tree leaf has ${B}-byte blocks, ${K}-byte keys, ${Pr}-byte record pointers and one ${P}-byte pointer to the next leaf. How many keys fit in a leaf?`, a: m, x: [Math.floor(B / (K + Pr)) === m ? m + 1 : Math.floor(B / (K + Pr)), Math.floor((B + K) / (P + K)), m - 1], ex: `m(${K} + ${Pr}) + ${P} ≤ ${B} → m ≤ ${num(round((B - P) / (K + Pr), 3))}, so ${m}.` };
      },
    ],
    hard: [
      h => {
        const attrs = ['A', 'B', 'C', 'D', 'E']; let fds, keys;
        do { fds = randFDs(h, attrs, h.int(3, 5)); keys = keysOf(attrs, fds); } while (keys.length < 2 || keys.length > 4);
        return { t: 'Keys', q: `How many candidate keys does R(${attrs.join(', ')}) have with F = {${fdText(fds)}}?`, a: keys.length, x: [1, keys.length + 1, keys.length + 2].filter(v => v !== keys.length), ex: `Checking closures of the smallest sets: ${keys.map(k => k.join('')).join(', ')} → ${keys.length}.` };
      },
      h => {
        const attrs = ['A', 'B', 'C', 'D', 'E'], want = h.pick(['1NF', '2NF', '3NF', 'BCNF']); let fds, r, tries = 0;
        do { fds = randFDs(h, attrs, h.int(3, 5)); r = normalForm(attrs, fds); } while (r.nf !== want && ++tries < 300);
        return { t: 'Normalisation', q: `What is the highest normal form of R(${attrs.join(', ')}) with F = {${fdText(fds)}}?`, a: r.nf, w: ['1NF', '2NF', '3NF', 'BCNF'].filter(v => v !== r.nf), ex: `Candidate key${r.keys.length > 1 ? 's' : ''}: ${r.keys.map(k => k.join('')).join(', ')}. ${r.why[0].toUpperCase() + r.why.slice(1)}, so ${r.nf}.` };
      },
      h => {
        let s; do s = schedule2(h); while (!(s.ok.length === 1 || (s.ok.length === 0 && s.edges.length)));
        const name = p => p.map(t => `T${t}`).join(' → '), ans = s.ok.length ? name(s.ok[0]) : 'Not conflict serializable';
        const table = { rowHead: false, head: Array.from({ length: s.n }, (_, i) => `T${i + 1}`), rows: s.order.map(o => Array.from({ length: s.n }, (_, i) => (o.t === i + 1 ? `${o.k}(${o.x})` : ''))) };
        const edges = s.edges.map(e => e.replace(/(\d)>(\d)/, 'T$1 → T$2')).join(', ');
        return { t: 'Serializability', q: 'Which serial order is this schedule conflict-equivalent to?', table, a: ans, w: distinct(ans, [...h.shuffle(s.perms.map(name)), 'Not conflict serializable', 'Any serial order']),
          ex: `Conflicting pairs give the edges ${edges}. ${s.ok.length ? `The only order respecting them is ${ans}.` : 'They form a cycle, so it is not conflict serializable.'}` };
      },
      h => {
        const attrs = ['A', 'B', 'C', 'D'], fds = randFDs(h, attrs, h.int(2, 4)), sk = subsets(attrs).filter(S => closure(S, fds).size === attrs.length), keys = keysOf(attrs, fds);
        return { t: 'Keys', q: `How many super keys does R(${attrs.join(', ')}) have with F = {${fdText(fds)}}?`, a: sk.length, x: [keys.length, 2 ** (attrs.length - 1), sk.length + 1].filter(v => v !== sk.length), ex: `Candidate keys ${keys.map(k => k.join('')).join(', ')}; every set containing one of them is a super key: ${sk.length}.` };
      },
    ],
  };

  /* ---------- 14. Computer Networks ---------- */
  const ip = v => [24, 16, 8, 0].map(s => (v >>> s) & 255).join('.');
  const maskOf = p => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);
  function mod2(data, gen) {
    const d = data.split('').map(Number), g = gen.split('').map(Number);
    for (let i = 0; i + g.length <= d.length; i++) if (d[i]) g.forEach((b, j) => { d[i + j] ^= b; });
    return d.slice(-(g.length - 1)).join('');
  }
  const CN = {
    easy: [
      h => {
        const p = h.int(20, 30), H = 2 ** (32 - p) - 2;
        return { t: 'IP addressing', q: `How many usable host addresses does a /${p} subnet have?`, a: H, x: [2 ** (32 - p), H + 1, 2 ** (31 - p)], ex: `${32 - p} host bits: 2${sup(32 - p)} ${MINUS} 2 (network and broadcast) = ${H}.` };
      },
      h => {
        const cls = h.pick(['A', 'B', 'C', 'D', 'E']), o1 = { A: h.int(1, 126), B: h.int(128, 191), C: h.int(192, 223), D: h.int(224, 239), E: h.int(240, 254) }[cls], addr = `${o1}.${h.int(0, 255)}.${h.int(0, 255)}.${h.int(1, 254)}`;
        const range = { A: '1–126', B: '128–191', C: '192–223', D: '224–239', E: '240–255' }[cls];
        return { t: 'IP addressing', q: `Which class does the IPv4 address ${addr} belong to?`, a: `Class ${cls}`, w: ['A', 'B', 'C', 'D', 'E'].filter(c => c !== cls).map(c => `Class ${c}`), ex: `Its first octet ${o1} is in ${range}: class ${cls}.` };
      },
      h => {
        const L = h.pick([500, 1000, 1500, 2000, 2500, 4000, 12500]), B = h.pick([1, 2, 4, 5, 8, 10, 100]), ms = round((8 * L) / (B * 1000), 6);
        return { t: 'Delays', q: `How long does it take to transmit a ${L}-byte frame on a ${B} Mbps link, in milliseconds?`, a: ms, u: ' ms', x: [round(L / (B * 1000), 6), round(ms * 8, 6), round(ms * 2, 6)], ex: `Transmission delay = bits ÷ rate = ${8 * L} ÷ ${B} × 10⁶ s = ${num(ms)} ms.` };
      },
      h => {
        const p = h.int(9, 30), ans = ip(maskOf(p));
        return { t: 'IP addressing', q: `What is the subnet mask for a /${p} prefix?`, a: ans, mono: true, w: distinct(ans, [ip(maskOf(p - 1)), ip(maskOf(p + 1)), ip(maskOf(p + 8 > 32 ? p - 8 : p + 8))]), ex: `${p} ones followed by ${32 - p} zeros: ${ans}.` };
      },
    ],
    medium: [
      h => {
        const v = ((h.int(1, 223) << 24) | (h.int(0, 255) << 16) | (h.int(0, 255) << 8) | h.int(0, 255)) >>> 0, p = h.int(16, 30), m = maskOf(p), net = (v & m) >>> 0, bc = (net | (~m >>> 0)) >>> 0, kind = h.pick(['net', 'bc', 'first', 'last']);
        const val = { net, bc, first: net + 1, last: bc - 1 }[kind], ans = ip(val), alt = q => { const mm = maskOf(q), n2 = (v & mm) >>> 0, b2 = (n2 | (~mm >>> 0)) >>> 0; return ip({ net: n2, bc: b2, first: n2 + 1, last: b2 - 1 }[kind]); };
        return { t: 'Subnetting', q: `What is the ${{ net: 'network address', bc: 'broadcast address', first: 'first usable host address', last: 'last usable host address' }[kind]} of ${ip(v)}/${p}?`, a: ans, mono: true, w: distinct(ans, [alt(p - 1), alt(p + 1), ip(v), ip({ net: bc, bc: net, first: bc - 1, last: net + 1 }[kind])]),
          ex: `Mask /${p} = ${ip(m)}. Network = address AND mask = ${ip(net)}; broadcast = ${ip(bc)}${kind === 'first' || kind === 'last' ? `; hosts run ${ip(net + 1)}–${ip(bc - 1)}` : ''}.` };
      },
      h => {
        const B = h.pick([1, 2, 4, 8]), L = 125 * h.pick([1, 2, 4, 8]) * B, Tt = (8 * L) / (B * 1000), Tp = h.pick([0.5, 1, 2, 3, 4, 5]) * Tt, d = Tp * 200, ans = frac(Tt * 2, (Tt + 2 * Tp) * 2);
        return { t: 'Flow control', q: `Stop-and-wait sends ${L}-byte frames over a ${B} Mbps link ${num(d)} km long (signal speed 2 × 10⁸ m/s). Ignoring ACK time, what is the link utilisation?`, a: ans, w: distinct(ans, [frac(Tt * 2, (Tt + Tp) * 2), frac(Tp * 2, (Tt + 2 * Tp) * 2), frac(1, 2), frac(Tt * 2, Tp * 4)]),
          ex: `Tt = ${8 * L} bits ÷ ${B} Mbps = ${num(Tt)} ms; Tp = ${num(d)} km ÷ 2×10⁵ km/s = ${num(Tp)} ms. U = Tt/(Tt + 2Tp) = ${num(Tt)}/${num(Tt + 2 * Tp)} = ${ans}.` };
      },
      h => {
        const a = h.int(1, 20), W = 1 + 2 * a, gbn = h.chance(0.5), bits = gbn ? Math.ceil(Math.log2(W + 1)) : Math.ceil(Math.log2(2 * W));
        return { t: 'Flow control', q: `A link has Tp/Tt = ${a}. What is the minimum number of sequence-number bits for ${gbn ? 'Go-Back-N' : 'Selective Repeat'} to keep it fully busy?`, a: bits, x: [Math.ceil(Math.log2(W)), bits + 1, bits - 1].filter(v => v !== bits && v > 0),
          ex: `Full use needs a window of 1 + 2a = ${W}. ${gbn ? `GBN allows 2ⁿ ${MINUS} 1 ≥ ${W}` : `SR allows 2ⁿ⁻¹ ≥ ${W}`} → n = ${bits}.` };
      },
      h => {
        const B = h.pick([3, 4, 6, 8, 10, 20]);
        if (h.chance(0.5)) { const L = h.pick([2, 4, 8, 16]), C = 2 * B * Math.log2(L); return { t: 'Channel capacity', q: `What is the maximum bit rate of a noiseless ${B} kHz channel using ${L} signal levels?`, a: C, u: ' kbps', x: [B * Math.log2(L), 2 * B * L, C * 2], ex: `Nyquist: 2B log₂ L = 2 × ${B} × ${Math.log2(L)} = ${C} kbps.` }; }
        const k = h.int(2, 10), snr = 2 ** k - 1;
        return { t: 'Channel capacity', q: `A ${B} kHz channel has a signal-to-noise ratio of ${snr}. What is its Shannon capacity?`, a: B * k, u: ' kbps', x: [2 * B * k, B * snr, B * (k - 1)], ex: `C = B log₂(1 + SNR) = ${B} × log₂ ${snr + 1} = ${B} × ${k} = ${B * k} kbps.` };
      },
      h => {
        const len = h.int(6, 8), words = []; while (words.length < h.int(3, 4)) { const w = bin(h.int(0, 2 ** len - 1), len); if (!words.includes(w)) words.push(w); }
        let d = len; words.forEach((a, i) => words.slice(i + 1).forEach(b => { d = Math.min(d, a.split('').filter((c, j) => c !== b[j]).length); }));
        const kind = h.pick(['d', 'detect', 'correct']), v = { d, detect: d - 1, correct: Math.floor((d - 1) / 2) }[kind];
        return { t: 'Error control', q: `A code has the codewords ${words.join(', ')}. ${{ d: 'What is its minimum Hamming distance?', detect: 'How many bit errors can it always detect?', correct: 'How many bit errors can it always correct?' }[kind]}`, a: v, x: [d, d - 1, Math.floor((d - 1) / 2), d + 1].filter(x => x !== v && x >= 0),
          ex: `The closest pair differ in ${d} bit${d > 1 ? 's' : ''}. Detects d ${MINUS} 1 = ${d - 1}, corrects ⌊(d ${MINUS} 1)/2⌋ = ${Math.floor((d - 1) / 2)}.` };
      },
    ],
    hard: [
      h => {
        const gen = h.pick(['1011', '1101', '10011', '11001', '1001']), len = h.int(7, 9), data = '1' + bin(h.int(0, 2 ** len - 1), len), r = gen.length - 1, rem = mod2(data + '0'.repeat(r), gen), frame = h.chance(0.5);
        const flip = s => s.slice(0, -1) + (s.slice(-1) === '0' ? '1' : '0'), bad = mod2(data, gen).padStart(r, '0');
        const ans = frame ? data + rem : rem;
        return { t: 'Error control', q: `Data ${data} is sent with CRC generator ${gen}. What ${frame ? 'frame is transmitted' : 'is the CRC (remainder)'}?`, a: ans, mono: true, w: distinct(ans, frame ? [data + bad, data + flip(rem), data + '0'.repeat(r), data + rem.split('').reverse().join('')] : [bad, flip(rem), rem.split('').reverse().join(''), '0'.repeat(r), '1'.repeat(r)]),
          ex: `Append ${r} zeros and divide ${data}${'0'.repeat(r)} by ${gen} using XOR: remainder ${rem}${frame ? `, so send ${data + rem}` : ''}.` };
      },
      h => {
        let C, rho, M; do { C = h.pick([1, 2, 4, 6, 8, 10, 16]); rho = h.pick([1, 2, 4, 5]); M = h.pick([6, 8, 10, 12, 20, 25]); } while (![1, 2, 4, 5, 8, 10, 16, 20, 25].includes(M - rho));
        const S = round(C / (M - rho), 6);
        return { t: 'Congestion control', q: `A token bucket holds ${C} megabits and refills at ${rho} Mbps. The line runs at ${M} Mbps. For how long can a full bucket send at the full line rate?`, a: S, u: ' s', x: [round(C / M, 6), round(C / rho, 6), round(C / (M + rho), 6)], ex: `S = C/(M ${MINUS} ρ) = ${C}/(${M} ${MINUS} ${rho}) = ${num(S)} s.` };
      },
      h => {
        const T = h.pick([8, 16, 32]), X = h.chance(0.3) ? 2 ** h.int(2, Math.log2(T)) : T + h.int(1, 8), r = X <= T ? Math.log2(X) : Math.log2(T) + (X - T);
        return { t: 'Congestion control', q: `TCP’s window starts at 1 MSS, doubles every RTT up to the threshold of ${T} MSS, then grows by 1 MSS per RTT. After how many RTTs does it first reach ${X} MSS?`, a: r, x: [X, Math.ceil(Math.log2(X)), r + 1, X - T].filter(v => v !== r && v > 0),
          ex: X <= T ? `Doubling: 1, 2, 4, … reaches ${X} after log₂ ${X} = ${r} RTTs.` : `Doubling reaches ${T} after ${Math.log2(T)} RTTs, then +1 per RTT: ${Math.log2(T)} + (${X} ${MINUS} ${T}) = ${r}.` };
      },
      h => {
        const D = 100 * h.int(10, 40), M = h.pick([420, 576, 620, 1000, 1500]), per = Math.floor((M - 20) / 8) * 8, n = Math.ceil(D / per), kind = h.pick(['count', 'offset', 'last']);
        const v = { count: n, offset: ((n - 1) * per) / 8, last: D - (n - 1) * per }[kind];
        return { t: 'IP fragmentation', q: `An IP datagram with ${D} bytes of data (20-byte header) crosses a link with an MTU of ${M} bytes. ${{ count: 'How many fragments are made?', offset: 'What is the fragment offset field of the last fragment?', last: 'How many data bytes does the last fragment carry?' }[kind]}`,
          a: v, x: { count: [Math.ceil(D / (M - 20)) === n ? n + 1 : Math.ceil(D / (M - 20)), Math.ceil(D / M), n - 1], offset: [(n - 1) * per, ((n - 1) * (M - 20)) / 8 | 0, v + per / 8], last: [per, D - n * (M - 20) + (M - 20), v + 20] }[kind].filter(x => x !== v && x > 0),
          ex: `Each fragment carries ⌊(${M} ${MINUS} 20)/8⌋ × 8 = ${per} data bytes, so ⌈${D}/${per}⌉ = ${n} fragments; the last starts at byte ${(n - 1) * per} (offset ${((n - 1) * per) / 8}) and carries ${D - (n - 1) * per}.` };
      },
      h => {
        const a = h.int(1, 10), W = h.int(2, 2 * a + 4), U = W >= 1 + 2 * a ? '1' : frac(W, 1 + 2 * a);
        return { t: 'Flow control', q: `A sliding-window protocol uses a window of ${W} frames on a link with Tp/Tt = ${a}. What is the link utilisation (no errors)?`, a: U, w: distinct(U, [frac(1, 1 + 2 * a), frac(W, 1 + a), frac(Math.min(W, 2 * a), 2 * a + 2), frac(W - 1, 1 + 2 * a)].filter(s => s !== '0')),
          ex: `U = min(1, W/(1 + 2a)) = min(1, ${W}/${1 + 2 * a}) = ${U}.` };
      },
    ],
  };

  /* ---------- 15. Theory of Computation ---------- */
  function minDFA(states, start, accept, delta, alpha = ['a', 'b']) {
    const reach = [start], seen = new Set(reach);
    for (let i = 0; i < reach.length; i++) for (const c of alpha) { const t = delta(reach[i], c); if (!seen.has(t)) { seen.add(t); reach.push(t); } }
    let part = new Map(reach.map(s => [s, accept(s) ? 1 : 0])), count = new Set(part.values()).size;
    for (;;) {
      const sig = new Map(), next = new Map();
      for (const s of reach) { const key = [part.get(s), ...alpha.map(c => part.get(delta(s, c)))].join(','); if (!sig.has(key)) sig.set(key, sig.size); next.set(s, sig.get(key)); }
      part = next;
      if (sig.size === count) break;
      count = sig.size;
    }
    const groups = {}; for (const [s, g] of part) (groups[g] = groups[g] || []).push(s);
    return { count, groups: Object.values(groups) };
  }
  const kmp = (w, s, c) => { const t = w.slice(0, s) + c; for (let k = Math.min(w.length, t.length); k >= 0; k--) if (t.endsWith(w.slice(0, k))) return k; return 0; };
  const randWord = (h, n) => Array.from({ length: n }, () => h.pick(['a', 'b'])).join('');
  const LANGS = [
    ['{aⁿbⁿ | n ≥ 0}', 1], ['{aⁿbⁿcⁿ | n ≥ 0}', 2], ['{aᵐbⁿ | m, n ≥ 0}', 0], ['{wwᴿ | w ∈ {a, b}*}', 1], ['{ww | w ∈ {a, b}*}', 2],
    ['{aᵖ | p is prime}', 2], ['{aᵐbⁿ | m ≠ n}', 1], ['{w | w has equally many a’s and b’s}', 1], ['{aⁿbⁿ | n ≤ 100}', 0], ['{aⁿ² | n ≥ 0}', 2],
    ['{aⁱbʲcᵏ | i = j or j = k}', 1], ['{aᵐbⁿcᵐ⁺ⁿ | m, n ≥ 0}', 1], ['{w | the number of a’s in w is divisible by 3}', 0], ['{aⁿbᵐcⁿdᵐ | m, n ≥ 1}', 2],
  ];
  const CLASSES = ['Regular', 'Context-free but not regular', 'Context-sensitive but not context-free', 'Not recursively enumerable'];
  const DECIDE = [
    ['Emptiness of a context-free grammar', true], ['Equivalence of two context-free grammars', false], ['Ambiguity of a context-free grammar', false], ['Membership (w ∈ L(G)) for a context-free grammar', true],
    ['Equivalence of two DFAs', true], ['Emptiness of a Turing machine’s language', false], ['Whether a Turing machine halts on a given input', false], ['Finiteness of a context-free language', true],
    ['Whether a context-free language is regular', false], ['Whether L(G) = Σ* for a context-free grammar G', false], ['Whether a DFA accepts an infinite language', true], ['Emptiness of the intersection of two context-free languages', false],
  ];
  const CLOSURE = [
    ['Regular languages are closed under complement.', true], ['Context-free languages are closed under intersection.', false], ['Context-free languages are closed under union.', true], ['Context-free languages are closed under complement.', false],
    ['The intersection of a context-free language and a regular language is context-free.', true], ['Deterministic context-free languages are closed under complement.', true], ['Deterministic context-free languages are closed under union.', false],
    ['Recursive languages are closed under complement.', true], ['Recursively enumerable languages are closed under complement.', false], ['Regular languages are closed under reversal.', true], ['Context-free languages are closed under Kleene star.', true],
  ];
  const STRING_PROPS = [
    ['contain no two consecutive a’s', s => !s.includes('aa'), 'aₙ = aₙ₋₁ + aₙ₋₂ (Fibonacci)'],
    ['contain the substring ab', s => s.includes('ab'), 'only the n + 1 strings of the form b*a* avoid ab'],
    ['start and end with the same symbol', s => s[0] === s[s.length - 1], 'the last symbol is fixed by the first: 2ⁿ⁻¹'],
    ['have an even number of a’s', s => (s.match(/a/g) || []).length % 2 === 0, 'exactly half of all strings: 2ⁿ⁻¹'],
    ['have exactly two a’s', s => (s.match(/a/g) || []).length === 2, 'choose the two positions: nC2'],
    ['are palindromes', s => s === s.split('').reverse().join(''), 'the first ⌈n/2⌉ symbols decide the rest'],
  ];
  const REGEXES = [
    ['(a + b)*abb', /^[ab]*abb$/, 'the last three symbols are fixed: 2ⁿ⁻³'], ['a*b*', /^a*b*$/, 'choose where the a’s end: n + 1'], ['(ab + ba)*', /^(ab|ba)*$/, 'each pair is ab or ba: 2^(n/2) for even n'],
    ['(a + b)*a(a + b)', /^[ab]*a[ab]$/, 'the second-last symbol is a: 2ⁿ⁻¹'], ['b*ab*ab*', /^b*ab*ab*$/, 'exactly two a’s: nC2'], ['(aa + b)*', /^(aa|b)*$/, 'tilings with b and aa: Fibonacci'],
    ['a(a + b)*b', /^a[ab]*b$/, 'first a, last b, middle free: 2ⁿ⁻²'],
  ];
  const TOC = {
    easy: [
      h => {
        const k = h.int(2, 4), n = h.int(2, 6), le = h.chance(0.4), v = le ? (k ** (n + 1) - 1) / (k - 1) : k ** n;
        return { t: 'Strings and languages', q: `How many strings of length ${le ? `at most ${n} (including the empty string)` : n} are there over an alphabet of ${k} symbols?`, a: v, x: [k ** n, k * n, k ** (n + 1)].filter(x => x !== v), ex: le ? `1 + ${k} + … + ${k}${sup(n)} = (${k}${sup(n + 1)} ${MINUS} 1)/${k - 1} = ${v}.` : `${k} choices for each of ${n} places: ${k}${sup(n)} = ${v}.` };
      },
      h => {
        const n = h.int(3, 12), sub2 = h.chance(0.5), v = sub2 ? (n * (n + 1)) / 2 + 1 : n + 1;
        return { t: 'Strings and languages', q: `How many ${sub2 ? 'substrings' : 'prefixes'} (including the empty string) does a string of ${n} distinct symbols have?`, a: v, x: [n, (n * (n + 1)) / 2, 2 ** n].filter(x => x !== v), ex: sub2 ? `Pick a start and an end: n(n + 1)/2 = ${(n * (n + 1)) / 2} non-empty, plus ε: ${v}.` : `Prefixes of length 0 to ${n}: ${v}.` };
      },
      h => {
        const k = h.int(2, 7), kind = h.pick(['len', 'acount']), what = kind === 'len' ? `whose length is divisible by ${k}` : `whose number of a’s is divisible by ${k}`;
        return { t: 'Finite automata', q: `How many states does the minimal DFA have for strings over {a, b} ${what}?`, a: k, x: [k + 1, k - 1, 2 ** k], ex: `It only needs to count ${kind === 'len' ? 'the length' : 'the a’s'} mod ${k}, and each remainder behaves differently: ${k} states.` };
      },
      h => { const [s, t] = h.pick(CLOSURE); return { t: 'Closure properties', q: s, tf: t, ex: `${t ? 'True' : 'False'}: ${s.replace(/\.$/, '')}${t ? '' : ' does not hold in general'}.` }; },
    ],
    medium: [
      h => {
        const kind = h.pick(['ends', 'contains', 'starts']), w = randWord(h, h.int(2, 4)), n = w.length;
        let d;
        if (kind === 'ends') d = minDFA(n + 1, 0, s => s === n, (s, c) => kmp(w, s, c));
        else if (kind === 'contains') d = minDFA(n + 1, 0, s => s === n, (s, c) => (s === n ? n : kmp(w, s, c)));
        else d = minDFA(n + 2, 0, s => s === n, (s, c) => (s === n ? n : s === n + 1 ? n + 1 : c === w[s] ? s + 1 : n + 1));
        const what = { ends: `ending with ${w}`, contains: `containing ${w} as a substring`, starts: `starting with ${w}` }[kind];
        const why = { ends: `Track the longest end of the input that matches a start of ${w}: ${n + 1} states`, contains: `Track progress towards ${w} (${n + 1} states, the last one a trap that accepts)`, starts: `${n + 1} states to read ${w}, plus a dead state for a wrong start` }[kind];
        return { t: 'Finite automata', q: `How many states does the minimal complete DFA have for strings over {a, b} ${what}?`, a: d.count, x: [n, n + 1, n + 2, 2 ** n].filter(x => x !== d.count), ex: `${why}: ${d.count}.` };
      },
      h => {
        const n = h.int(4, 8), [what, f, why] = h.pick(STRING_PROPS); let c = 0;
        for (let m = 0; m < 2 ** n; m++) if (f(bin(m, n).replace(/0/g, 'a').replace(/1/g, 'b'))) c++;
        return { t: 'Strings and languages', q: `How many strings of length ${n} over {a, b} ${what}?`, a: c, x: [2 ** (n - 1), 2 ** n - c, c + 1].filter(x => x !== c), ex: `${why[0].toUpperCase() + why.slice(1)} (n = ${n}): ${c}.` };
      },
      h => {
        const [L, cls] = h.pick(LANGS);
        return { t: 'Language classes', q: `Which best describes the language ${L}?`, a: CLASSES[cls], w: CLASSES.filter((_, i) => i !== cls), ex: `${L} is ${CLASSES[cls].toLowerCase()}.` };
      },
    ],
    hard: [
      h => {
        const kind = h.pick(['mod', 'kth', 'pair']);
        if (kind === 'kth') { const k = h.int(2, 4), d = minDFA(2 ** k, 2 ** k - 1, s => !(s >> (k - 1) & 1), (s, c) => ((s << 1) | (c === 'b' ? 1 : 0)) & (2 ** k - 1)); return { t: 'Finite automata', q: `How many states does the minimal DFA have for strings over {a, b} whose ${k === 2 ? '2nd' : k === 3 ? '3rd' : `${k}th`} symbol from the end is a?`, a: d.count, x: [k + 1, k, 2 * k].filter(x => x !== d.count), ex: `It must remember the last ${k} symbols, all distinguishable: 2${sup(k)} = ${d.count}.` }; }
        if (kind === 'pair') { const m = h.int(2, 4), n = h.int(2, 4), d = minDFA(m * n, 0, s => s === 0, (s, c) => (c === 'a' ? ((Math.floor(s / n) + 1) % m) * n + (s % n) : Math.floor(s / n) * n + ((s % n) + 1) % n)); return { t: 'Finite automata', q: `How many states does the minimal DFA have for strings over {a, b} whose number of a’s is divisible by ${m} and number of b’s by ${n}?`, a: d.count, x: [m + n, m * n + 1, Math.max(m, n)].filter(x => x !== d.count), ex: `Track (a’s mod ${m}, b’s mod ${n}): ${m} × ${n} = ${d.count} states, all distinguishable.` }; }
        const k = h.int(3, 9), d = minDFA(k, 0, s => s === 0, (s, c) => (2 * s + (c === 'b' ? 1 : 0)) % k, ['a', 'b']), merged = d.groups.filter(g => g.length > 1);
        return { t: 'Finite automata', q: `How many states does the minimal DFA have for binary strings whose value is divisible by ${k}? (Read the most significant bit first; the empty string counts as 0.)`, a: d.count, x: [k, k + 1, k - 1].filter(x => x !== d.count),
          ex: `Track the value mod ${k} (${k} remainders)${merged.length ? `; remainders ${merged.map(g => g.join(' and ')).join(', ')} behave the same and merge` : ', all of them distinguishable'}: ${d.count} states.` };
      },
      h => { const [s, t] = h.pick(DECIDE), claim = h.chance(0.5); return { t: 'Decidability', q: `${s} is ${claim ? 'decidable' : 'undecidable'}.`, tf: claim === t, ex: `${s} is ${t ? 'decidable' : 'undecidable'}.` }; },
      h => {
        const [re, rx, why] = h.pick(REGEXES), n = h.int(3, 9); let c = 0;
        for (let m = 0; m < 2 ** n; m++) if (rx.test(bin(m, n).replace(/0/g, 'a').replace(/1/g, 'b'))) c++;
        return { t: 'Regular expressions', q: `How many strings of length ${n} does the regular expression ${re} generate?`, a: c, x: [2 ** n, c + 1, c * 2 || 1].filter(x => x !== c), ex: `${why[0].toUpperCase() + why.slice(1)} → ${c}.` };
      },
    ],
  };

  /* ---------- Registration (learning order) ---------- */
  // GATE problems need working out; NAT-style typed answers come up often and may be decimals.
  const TX = { easy: 1.8, medium: 2.4, hard: 3 };
  const EM = ['gate-cs', 'gate-em'], CS = ['gate-cs'];
  const TOPICS = [
    ['gate-numerical', 'Numerical Ability', NUMERICAL, EM, true], ['gate-analytical', 'Analytical Reasoning', ANALYTICAL, EM, true],
    ['gate-linalg', 'Linear Algebra', LINALG, EM, false], ['gate-calculus', 'Calculus', CALCULUS, EM, false], ['gate-probstat', 'Probability & Statistics', PROBSTAT, EM, false],
    ['gate-diffeq', 'Differential Equations', DIFFEQ, ['gate-em'], false], ['gate-numerical-methods', 'Numerical Methods', NUMERICAL_M, ['gate-em'], false],
    ['gate-discrete', 'Discrete Mathematics', DISCRETE, CS, true], ['gate-digital', 'Digital Logic', DIGITAL, CS, false], ['gate-coa', 'Computer Organization', COA, CS, true],
    ['gate-dsa', 'Data Structures & Algorithms', DSA, CS, true], ['gate-os', 'Operating Systems', OS, CS, false], ['gate-dbms', 'Databases', DBMS, CS, true],
    ['gate-cn', 'Computer Networks', CN, CS, true], ['gate-toc', 'Theory of Computation', TOC, CS, true],
  ];
  for (const [kind, topic, makers, group, positive] of TOPICS) {
    if (!makers.easy.length || !makers.medium.length || !makers.hard.length) continue; // Numerical Ability needs js/aptitude.js
    QM.register(kind, makers, { topic, tx: TX, group, written: 0.3, decimals: true, positive });
  }
})();
