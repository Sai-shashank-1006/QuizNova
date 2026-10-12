/* QuizNova — quantitative aptitude problem generator (competitive-exam style: SSC, banking, railways, placements).
 *
 * Adds 16 topics to QUIZ_MATHS (js/maths.js), in learning order, each with easy, medium and hard problems.
 * Like the maths generator, every problem is built from random numbers with the answer worked out first,
 * so answers are always right and questions never run out. Wrong options come from typical slips
 * (adding percentages, dividing by the selling price, forgetting the remainder…), and each question
 * carries its sub-topic (t) and a one-line worked solution that shows the formula.
 *
 * Makers return { q, a, ex, t } plus optional x (numeric slips), w (string wrong options), pre/u (₹, units),
 * st (true/false statement), mono and tx — see js/maths.js.
 */
(() => {
  'use strict';
  const QM = window.QUIZ_MATHS;
  if (!QM || !QM.register) return;
  const { num, frac, gcd, lcm, sup, MINUS } = QM.helpers;

  /* ---------- Helpers ---------- */
  const rs = v => `₹${num(v)}`;
  const pw = (b, e) => (e === 1 ? `${b}` : `${b}${sup(e)}`);
  const ratio = (a, b) => { const g = gcd(a, b); return `${a / g} : ${b / g}`; };
  const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  const nCr = (n, r) => { if (r < 0 || r > n) return 0; let v = 1; for (let i = 1; i <= r; i++) v = (v * (n - r + i)) / i; return Math.round(v); };
  const digitSum = n => String(n).split('').reduce((s, c) => s + +c, 0);
  const fracValue = s => { const [a, b] = String(s).split('/').map(Number); return b ? a / b : a; };
  const signed = v => (v < 0 ? `(${MINUS}${-v})` : `${v}`);
  const ord = n => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
  const powers = (p, a) => Array.from({ length: a + 1 }, (_, i) => p ** i).join(' + ');
  // Distinct wrong options, never the answer.
  const distinct = (ans, list) => { const out = []; for (const v of list) if (v != null && v !== '' && v !== ans && !out.includes(v)) out.push(v); return out; };
  const digitW = (d, h, slips = []) => distinct(String(d), [...slips.map(v => String(((v % 10) + 10) % 10)), ...h.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).map(String)]);
  // Wrong probabilities: the given slips first, then near misses, all between 0 and 1.
  function probW(n, d, h, slips = []) {
    const near = [[n + 1, d], [n - 1, d], [n, d + 1], [n, d - 1], [n + 1, d + 1], [d - n, d], [n, 2 * d], [2 * n, d]];
    const cand = [...slips, ...h.shuffle(near).filter(([a, b]) => a > 0 && b > 0 && a <= b).map(([a, b]) => frac(a, b))];
    return distinct(frac(n, d), cand.filter(s => { const v = fracValue(s); return v > 0 && v <= 1; }));
  }
  // A ratio's wrong options: the given slips, then nearby ratios.
  function ratioW(ans, h, slips = []) {
    const [a, b] = ans.split(' : ').map(Number);
    const near = [[b, a], [a + 1, b], [a, b + 1], [a + 1, b + 1], [a * 2, b + 1], [a + 2, b]].map(([x, y]) => ratio(x, y));
    return distinct(ans, [...slips, ...h.shuffle(near)]);
  }
  const change = v => (v > 0 ? `${num(v)}% increase` : v < 0 ? `${num(-v)}% decrease` : 'No change');
  const clock = m => { const hh = Math.floor(m / 60) % 24, mm = m % 60; return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`; };
  // Pairs whose answers come out whole, found once.
  const WORK = []; // A alone a days, B alone b days, together t days
  for (let a = 4; a <= 40; a++) for (let b = a + 2; b <= 90; b++) if ((a * b) % (a + b) === 0) WORK.push([a, b, (a * b) / (a + b)]);
  const PIPES = []; // fills in a hours, empties in b hours, both open: fills in t hours
  for (let a = 2; a <= 20; a++) for (let b = a + 1; b <= 60; b++) { const t = (a * b) / (b - a); if (Number.isInteger(t) && t <= 60) PIPES.push([a, b, t]); }
  const AVG_SPEED = []; // equal distances at u and v km/h: average 2uv/(u + v)
  for (let u = 10; u <= 80; u += 5) for (let v = u + 5; v <= 120; v += 5) { const s = (2 * u * v) / (u + v); if (Number.isInteger(s)) AVG_SPEED.push([u, v, s]); }
  const ROD = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [2, 5, 14, 15], [1, 12, 12, 17], [8, 9, 12, 17], [4, 8, 19, 21]];

  /* ---------- 1. Number System ---------- */
  const DIV_RULE = {
    3: n => `its digit sum, ${digitSum(n)}, is divisible by 3`,
    4: n => `its last two digits, ${String(n).slice(-2)}, make a number divisible by 4`,
    9: n => `its digit sum, ${digitSum(n)}, is divisible by 9`,
    11: n => {
      let odd = 0, even = 0;
      String(n).split('').reverse().forEach((c, i) => { if (i % 2) even += +c; else odd += +c; });
      return `the difference of its alternate digit sums, ${odd} and ${even}, is ${Math.abs(odd - even)}, a multiple of 11`;
    },
  };
  const NUMBER = {
    easy: [
      h => {
        const a = h.int(13, 99), b = h.int(13, 99), d = ((a % 10) * (b % 10)) % 10;
        return { t: 'Unit digit', q: `What is the unit digit of ${a} × ${b}?`, a: String(d), w: digitW(d, h, [(a % 10) + (b % 10), d + 1]), st: v => `The unit digit of ${a} × ${b} is ${v}`, ex: `Only the unit digits matter: ${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)}, so the unit digit is ${d}.` };
      },
      h => {
        const k = h.pick([3, 4, 9, 11]), lo = Math.ceil(1000 / k), hi = Math.floor(99999 / k);
        const right = k * h.int(lo, hi), wrong = [];
        while (wrong.length < 3) { const v = k * h.int(lo, hi) + h.int(1, k - 1); if (!wrong.includes(v)) wrong.push(v); }
        return { t: 'Divisibility rules', q: `Which of these numbers is divisible by ${k}?`, a: String(right), w: wrong.map(String), mono: true, ex: `${right} is divisible by ${k}: ${DIV_RULE[k](right)}.` };
      },
      h => {
        const k = h.pick([7, 9, 11, 12, 13, 15, 17]);
        let n; do n = h.int(200, 9999); while (n % k === 0);
        const r = n % k, ans = k - r;
        return { t: 'Remainders', q: `What is the smallest number that must be added to ${n} to make it exactly divisible by ${k}?`, a: ans, x: [r, k, ans + 1], ex: `${n} ÷ ${k} leaves a remainder of ${r}, so add ${k} ${MINUS} ${r} = ${ans}.` };
      },
    ],
    medium: [
      h => {
        const a = h.pick([2, 3, 7, 8, 4, 9, 12, 13, 17, 18, 22, 23, 27, 28, 33, 37]), base = a % 10, n = h.int(21, 199);
        const cycle = []; let v = base;
        do { cycle.push(v); v = (v * base) % 10; } while (v !== cycle[0]);
        const c = cycle.length, rem = n % c, d = cycle[(rem === 0 ? c : rem) - 1];
        return { t: 'Unit digit of powers', q: `What is the unit digit of ${a}${sup(n)}?`, a: String(d), w: digitW(d, h, cycle), ex: `Unit digits of powers of ${base} repeat every ${c}: ${cycle.join(', ')}. ${n} ÷ ${c} leaves ${rem}, so take the ${ord(rem || c)} one: ${d}.` };
      },
      h => {
        const k = h.int(13, 47), qq = h.int(40, 400), r = h.int(1, k - 1), n = k * qq + r;
        return { t: 'Remainders', q: `What is the remainder when ${n} is divided by ${k}?`, a: r, x: [k - r, r + 1, qq % k], ex: `${k} × ${qq} = ${k * qq}, and ${n} ${MINUS} ${k * qq} = ${r}.` };
      },
      h => {
        const [p, q] = h.pick([[2, 3], [2, 5], [3, 5], [2, 7]]), a = h.int(1, p === 2 ? 5 : 3), b = h.int(1, 3), N = p ** a * q ** b, ans = (a + 1) * (b + 1);
        return { t: 'Number of factors', q: `How many factors (divisors) does ${N} have?`, a: ans, x: [a * b, a + b, ans + 2], ex: `${N} = ${pw(p, a)} × ${pw(q, b)}. Number of factors = (${a} + 1)(${b} + 1) = ${ans}.` };
      },
    ],
    hard: [
      h => {
        const n = h.int(30, 260), f5 = Math.floor(n / 5), f25 = Math.floor(n / 25), f125 = Math.floor(n / 125), z = f5 + f25 + f125;
        return { t: 'Trailing zeros', q: `How many zeros are there at the end of ${n}! (${n} factorial)?`, a: z, x: [f5, Math.floor(n / 10), z + 1], ex: `Count the factors of 5: ${n} ÷ 5 → ${f5}, ${n} ÷ 25 → ${f25}${f125 ? `, ${n} ÷ 125 → ${f125}` : ''}. Total ${z}.` };
      },
      h => {
        const [a, m] = h.pick([[2, 7], [3, 7], [2, 9], [5, 7], [3, 11], [2, 5], [3, 5], [4, 7], [5, 9], [2, 13]]), n = h.int(25, 150);
        const rems = []; let v = a % m;
        do { rems.push(v); v = (v * a) % m; } while (v !== a % m);
        const c = rems.length, rem = n % c, ans = rems[(rem === 0 ? c : rem) - 1];
        return { t: 'Remainder of a power', q: `What is the remainder when ${a}${sup(n)} is divided by ${m}?`, a: ans, x: [m - ans, ans + 1, rems[0]], ex: `Remainders of powers of ${a} ÷ ${m} repeat every ${c}: ${rems.join(', ')}. ${n} ÷ ${c} leaves ${rem}, so take the ${ord(rem || c)} one: ${ans}.` };
      },
      h => {
        const k = h.pick([6, 7, 8, 9, 11, 12, 13, 15]), A = h.int(100, 400), B = h.int(700, 2000), hiC = Math.floor(B / k), loC = Math.floor((A - 1) / k), ans = hiC - loC;
        return { t: 'Counting multiples', q: `How many numbers from ${A} to ${B} (both included) are divisible by ${k}?`, a: ans, x: [Math.floor((B - A) / k), ans + 1, ans - 1], ex: `Multiples of ${k} up to ${B}: ${hiC}; up to ${A - 1}: ${loC}. ${hiC} ${MINUS} ${loC} = ${ans}.` };
      },
      h => {
        const [p, q] = h.pick([[2, 3], [2, 5], [2, 7], [3, 5]]), a = h.int(1, 3), b = h.int(1, 2), N = p ** a * q ** b;
        const sp = (p ** (a + 1) - 1) / (p - 1), sq = (q ** (b + 1) - 1) / (q - 1), ans = sp * sq;
        return { t: 'Sum of factors', q: `What is the sum of all the factors of ${N}?`, a: ans, x: [ans - N, (a + 1) * (b + 1), ans + p], ex: `${N} = ${pw(p, a)} × ${pw(q, b)}. Sum = (${powers(p, a)}) × (${powers(q, b)}) = ${sp} × ${sq} = ${ans}.` };
      },
    ],
  };

  /* ---------- 2. HCF & LCM ---------- */
  const HCF = {
    easy: [
      h => {
        const g = h.int(2, 15); let m, n;
        do { m = h.int(2, 12); n = h.int(2, 12); } while (m === n || gcd(m, n) !== 1);
        const A = g * m, B = g * n;
        return { t: 'HCF', q: `What is the HCF (highest common factor) of ${A} and ${B}?`, a: g, x: [g * m * n, g * 2, Math.abs(A - B) === g ? g + 1 : Math.abs(A - B)], ex: `${A} = ${g} × ${m} and ${B} = ${g} × ${n}; ${m} and ${n} share no factor, so the HCF is ${g}.` };
      },
      h => {
        let a, b; do { a = h.int(4, 30); b = h.int(4, 30); } while (a === b || a % b === 0 || b % a === 0);
        const g = gcd(a, b), L = (a * b) / g;
        return { t: 'LCM', q: `What is the LCM (lowest common multiple) of ${a} and ${b}?`, a: L, x: [a * b, L * 2, g], ex: `LCM = ${a} × ${b} ÷ HCF = ${a * b} ÷ ${g} = ${L}.` };
      },
    ],
    medium: [
      h => {
        const H = h.int(2, 12); let m, n;
        do { m = h.int(2, 15); n = h.int(2, 15); } while (m === n || gcd(m, n) !== 1);
        const x = H * m, y = H * n, L = H * m * n;
        return { t: 'HCF × LCM = product', q: `The HCF of two numbers is ${H} and their LCM is ${L}. If one number is ${x}, what is the other?`, a: y, x: [m * n, L / H, y + H], ex: `HCF × LCM = product of the numbers: ${H} × ${L} = ${x} × y, so y = ${H * L} ÷ ${x} = ${y}.` };
      },
      h => {
        const [a, b, c] = h.shuffle([4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24]).slice(0, 3), L = lcm(lcm(a, b), c);
        return { t: 'LCM of three numbers', q: `What is the least number that is exactly divisible by ${a}, ${b} and ${c}?`, a: L, x: [a * b * c, L * 2, L / 2], ex: `It is the LCM of ${a}, ${b} and ${c}, which is ${L}.` };
      },
      h => {
        let a, b, c, L;
        do { [a, b, c] = h.shuffle([6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45]).slice(0, 3); L = lcm(lcm(a, b), c); } while (L > 360 || L < 60);
        const start = h.pick([7, 8, 9, 10]) * 60;
        const w = [start + L + 30, start + L - 15, start + a + b + c, start + 2 * L];
        if (L % 2 === 0) w.unshift(start + L / 2);
        return { t: 'LCM in daily life', q: `Three bells ring every ${a}, ${b} and ${c} minutes. They ring together at ${clock(start)}. When will they next ring together?`, a: clock(start + L), w: w.map(clock), ex: `They ring together every LCM(${a}, ${b}, ${c}) = ${L} minutes: ${clock(start)} + ${L} min = ${clock(start + L)}.` };
      },
    ],
    hard: [
      h => {
        const [a, b, c] = h.shuffle([6, 8, 9, 10, 12, 15, 16, 18, 20, 24]).slice(0, 3), L = lcm(lcm(a, b), c), r = h.int(1, Math.min(a, b, c) - 1);
        return { t: 'LCM with a remainder', q: `What is the least number greater than ${r} which, when divided by ${a}, ${b} and ${c}, leaves a remainder of ${r} in each case?`, a: L + r, x: [L, L - r, L + 2 * r], ex: `LCM(${a}, ${b}, ${c}) = ${L}; add the remainder: ${L} + ${r} = ${L + r}.` };
      },
      h => {
        const G = h.int(7, 40); let k1, k2, k3;
        do { k1 = h.int(5, 40); k2 = h.int(5, 40); k3 = h.int(5, 40); } while (gcd(gcd(k1, k2), k3) !== 1 || new Set([k1, k2, k3]).size < 3);
        const r1 = h.int(1, G - 1), r2 = h.int(1, G - 1), r3 = h.int(1, G - 1), A = G * k1 + r1, B = G * k2 + r2, C = G * k3 + r3;
        return { t: 'HCF with remainders', q: `What is the greatest number that divides ${A}, ${B} and ${C}, leaving remainders ${r1}, ${r2} and ${r3} respectively?`, a: G, x: [G * 2, G - 1, gcd(A, B)], ex: `Subtract the remainders: ${A - r1}, ${B - r2} and ${C - r3}. Their HCF is ${G}.` };
      },
      h => {
        const G = h.int(6, 40), r = h.int(1, G - 1); let k1, k2, k3;
        do { k1 = h.int(5, 60); k2 = h.int(5, 60); k3 = h.int(5, 60); } while (!(k1 < k2 && k2 < k3) || gcd(k2 - k1, k3 - k2) !== 1);
        const A = G * k1 + r, B = G * k2 + r, C = G * k3 + r;
        return { t: 'Same remainder', q: `What is the greatest number that divides ${A}, ${B} and ${C}, leaving the same remainder in each case?`, a: G, x: [G * 2, r, G + 1], ex: `Use the differences: ${B} ${MINUS} ${A} = ${B - A} and ${C} ${MINUS} ${B} = ${C - B}. Their HCF is ${G} (each number leaves remainder ${r}).` };
      },
    ],
  };

  /* ---------- 3. Simplification & Approximation ---------- */
  const ROOT_ENDS = { 0: '0', 1: '1 or 9', 4: '2 or 8', 5: '5', 6: '4 or 6', 9: '3 or 7' };
  const SIMPLIFY = {
    easy: [
      h => {
        const a = h.int(10, 60), b = h.int(3, 15), c = h.int(2, 9), e = h.int(2, 9), k = h.int(2, 12), d = e * k, ans = a + b * c - k;
        return { t: 'BODMAS', q: `Simplify: ${a} + ${b} × ${c} ${MINUS} ${d} ÷ ${e}`, a: ans, x: [(a + b) * c - k, a + b * c - d + e, ((a + b) * c - d) / e], st: v => `${a} + ${b} × ${c} ${MINUS} ${d} ÷ ${e} = ${v}`, ex: `Division and multiplication first: ${d} ÷ ${e} = ${k} and ${b} × ${c} = ${b * c}. Then ${a} + ${b * c} ${MINUS} ${k} = ${ans}.` };
      },
      h => {
        const a = h.int(25, 99), b = h.int(11, a - 5);
        return { t: 'Algebraic identities', q: `Simplify: (${a}² ${MINUS} ${b}²) ÷ (${a} ${MINUS} ${b})`, a: a + b, x: [a - b, a + b + 1, 2 * (a + b)], ex: `a² ${MINUS} b² = (a + b)(a ${MINUS} b), so the answer is ${a} + ${b} = ${a + b}.` };
      },
      h => {
        const a = h.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 1.2, 1.5, 2.5]), b = h.pick([0.02, 0.04, 0.05, 0.3, 0.4, 0.6, 1.2, 0.08]), ans = Math.round(a * b * 1e4) / 1e4;
        return { t: 'Decimals', q: `What is ${num(a)} × ${num(b)}?`, a: ans, x: [ans * 10, ans / 10, Math.round((a + b) * 1e4) / 1e4], ex: `${num(a * 100)} × ${num(b * 100)} = ${num(a * b * 1e4)}; move the decimal point 4 places left: ${num(ans)}.` };
      },
    ],
    medium: [
      h => {
        const k = h.int(23, 97), m = h.pick([99, 999, 101, 1001, 98]), near = m > 500 ? 1000 : 100, ans = k * m;
        const ex = m < near ? `${k} × ${m} = ${k} × ${near} ${MINUS} ${k} × ${near - m} = ${k * near} ${MINUS} ${k * (near - m)} = ${ans}.`
          : `${k} × ${m} = ${k} × ${near} + ${k} × ${m - near} = ${k * near} + ${k * (m - near)} = ${ans}.`;
        return { t: 'Quick multiplication', q: `What is ${k} × ${m}?`, a: ans, x: [ans + k, ans - k, k * near], ex };
      },
      h => {
        const a = h.int(21, 79), b = h.int(11, a - 3), ans = 4 * a * b;
        return { t: 'Algebraic identities', q: `Simplify: (${a} + ${b})² ${MINUS} (${a} ${MINUS} ${b})²`, a: ans, x: [2 * a * b, a * a + b * b, 4 * (a + b)], ex: `(a + b)² ${MINUS} (a ${MINUS} b)² = 4ab = 4 × ${a} × ${b} = ${ans}.` };
      },
      h => {
        const [p, q] = h.pick([[1, 2], [2, 3], [3, 4], [3, 5], [2, 5], [4, 5], [5, 6], [3, 8]]), [r, s] = h.pick([[1, 2], [2, 3], [3, 4], [1, 3], [1, 4], [2, 5], [5, 7]]);
        const N = q * s * h.int(2, 9), ans = (N * p * r) / (q * s);
        return { t: 'Fractions of a number', q: `What is ${p}/${q} of ${r}/${s} of ${N}?`, a: ans, x: [(N * p) / q, (N * r) / s, ans * 2], ex: `${r}/${s} of ${N} = ${(N * r) / s}; ${p}/${q} of that = ${ans}.` };
      },
      h => {
        const k = h.int(21, 99), sq = k * k, lo = Math.floor(k / 10);
        return { t: 'Square roots', q: `What is √${sq}?`, a: k, x: [k + 2, k - 2, (lo + 1) * 10 - (k % 10)], ex: `${lo}0² = ${lo * lo * 100} and ${lo + 1}0² = ${(lo + 1) * (lo + 1) * 100}, and a square ending in ${sq % 10} has a root ending in ${ROOT_ENDS[sq % 10]}. So √${sq} = ${k}.` };
      },
    ],
    hard: [
      h => {
        const n = h.int(8, 40);
        return { t: 'Telescoping series', q: `What is 1/(1×2) + 1/(2×3) + 1/(3×4) + … + 1/(${n}×${n + 1})?`, a: frac(n, n + 1), w: [frac(n - 1, n), frac(1, n + 1), frac(n + 1, n + 2), frac(n, n + 2)], ex: `Each term 1/(k(k + 1)) = 1/k ${MINUS} 1/(k + 1), so the sum collapses to 1 ${MINUS} 1/${n + 1} = ${frac(n, n + 1)}.` };
      },
      h => {
        let p, q, m, n;
        do { p = h.int(2, 9); q = h.int(2, 9); m = h.int(1, 5); n = h.int(1, 5); } while (p === q || gcd(p, q) !== 1 || m * p === n * q);
        const top = m * p + n * q, bot = m * p - n * q, ans = frac(top, bot), fr = (x, y) => (y ? frac(x, y) : null);
        return { t: 'Ratio substitution', q: `If a : b = ${p} : ${q}, what is (${m === 1 ? '' : m}a + ${n === 1 ? '' : n}b) ÷ (${m === 1 ? '' : m}a ${MINUS} ${n === 1 ? '' : n}b)?`, a: ans,
          w: distinct(ans, [fr(p + q, p - q), fr(bot, top), fr(m * q + n * p, m * q - n * p), fr(top, bot + 1), fr(top + 1, bot), fr(top, bot - 1)]),
          ex: `Put a = ${p}k and b = ${q}k: (${m * p}k + ${n * q}k) ÷ (${m * p}k ${MINUS} ${n * q}k) = ${top} ÷ ${signed(bot)} = ${ans}.` };
      },
      h => {
        const p = h.pick([20, 25, 30, 40, 60, 75]), unit = 100 / gcd(p, 100), base = unit * h.int(Math.ceil(200 / unit), Math.floor(900 / unit)), a = h.int(12, 29), b = h.int(3, 9);
        const exact = (p * base) / 100 + a * b, nudge = v => num(Math.round((v + (h.chance(0.5) ? 1 : -1) * h.int(1, 15) / 100) * 100) / 100);
        return { t: 'Approximation', q: `What is the approximate value of ${nudge(p)}% of ${nudge(base)} + ${nudge(a)} × ${nudge(b)}?`, a: exact, x: [Math.round(exact * 1.15), Math.round(exact * 0.85), Math.round(exact * 1.3)], ex: `Round each number: ${p}% of ${base} + ${a} × ${b} = ${(p * base) / 100} + ${a * b} ≈ ${exact}.` };
      },
    ],
  };

  /* ---------- 4. Number Series ---------- */
  const series = terms => `What comes next in the series ${terms.join(', ')}, …?`;
  const SERIES = {
    easy: [
      h => {
        const s = h.int(2, 60), d = h.int(3, 17), t = Array.from({ length: 5 }, (_, i) => s + i * d), ans = s + 5 * d;
        return { t: 'Arithmetic series', q: series(t), a: ans, x: [ans + d, ans - 1, ans + 1], ex: `Each term goes up by ${d}: ${t[4]} + ${d} = ${ans}.` };
      },
      h => {
        const s = h.int(1, 9), r = h.pick([2, 3]), t = Array.from({ length: 5 }, (_, i) => s * r ** i), ans = s * r ** 5;
        return { t: 'Geometric series', q: series(t), a: ans, x: [t[4] + (t[4] - t[3]), ans + r, t[4] * (r + 1)], ex: `Each term is multiplied by ${r}: ${t[4]} × ${r} = ${ans}.` };
      },
      h => {
        const s = h.int(90, 200), d = h.int(4, 15), t = Array.from({ length: 5 }, (_, i) => s - i * d), ans = s - 5 * d;
        return { t: 'Arithmetic series', q: series(t), a: ans, x: [ans - d, ans + 1, ans - 1], ex: `Each term goes down by ${d}: ${t[4]} ${MINUS} ${d} = ${ans}.` };
      },
    ],
    medium: [
      h => {
        const s = h.int(2, 12), c = h.pick([-2, -1, 1, 2, 3]), t = Array.from({ length: 5 }, (_, i) => (s + i) ** 2 + c), ans = (s + 5) ** 2 + c;
        return { t: 'Squares', q: series(t), a: ans, x: [(s + 5) ** 2, ans + 2 * (s + 5), ans - 1], ex: `The terms are n² ${c > 0 ? '+' : MINUS} ${Math.abs(c)} for n = ${s} to ${s + 4}; next is ${s + 5}² ${c > 0 ? '+' : MINUS} ${Math.abs(c)} = ${ans}.` };
      },
      h => {
        const s = h.int(2, 30), d0 = h.int(2, 6), k = h.int(1, 4), t = [s];
        for (let i = 0; i < 4; i++) t.push(t[i] + d0 + i * k);
        const gap = d0 + 4 * k, ans = t[4] + gap;
        return { t: 'Growing differences', q: series(t), a: ans, x: [t[4] + gap - k, ans + k, t[4] + d0], ex: `The gaps are ${[0, 1, 2, 3].map(i => d0 + i * k).join(', ')}, growing by ${k}; the next gap is ${gap}, so ${t[4]} + ${gap} = ${ans}.` };
      },
      h => {
        const m = h.pick([2, 3]), c = h.int(1, 6), t = [h.int(2, 9)];
        for (let i = 0; i < 5; i++) t.push(i % 2 === 0 ? t[i] * m : t[i] + c);
        const ans = t[5] + c;
        return { t: 'Alternating rules', q: series(t), a: ans, x: [t[5] * m, ans + c, t[5] + m], ex: `The rule alternates × ${m} and + ${c}; the last step was × ${m}, so next is + ${c}: ${t[5]} + ${c} = ${ans}.` };
      },
      h => {
        const s = h.int(1, 6), t = Array.from({ length: 5 }, (_, i) => (s + i) ** 3), ans = (s + 5) ** 3;
        return { t: 'Cubes', q: series(t), a: ans, x: [(s + 5) ** 2, ans - 1, t[4] + (t[4] - t[3])], ex: `These are the cubes of ${s} to ${s + 4}; next is ${s + 5}³ = ${ans}.` };
      },
    ],
    hard: [
      h => {
        const t = [h.int(1, 5)];
        for (let i = 1; i <= 4; i++) t.push(t[i - 1] * i + i);
        const ans = t[4] * 5 + 5;
        return { t: 'Mixed operations', q: series(t), a: ans, x: [t[4] * 5, t[4] * 4 + 4, ans + 5], ex: `The rule is ×1 + 1, ×2 + 2, ×3 + 3, ×4 + 4; next is ${t[4]} × 5 + 5 = ${ans}.` };
      },
      h => {
        const k0 = h.int(1, 4), t = [h.int(1, 20)];
        for (let i = 0; i < 4; i++) t.push(t[i] + (k0 + i) ** 2);
        const ans = t[4] + (k0 + 4) ** 2;
        return { t: 'Differences are squares', q: series(t), a: ans, x: [t[4] + (k0 + 3) ** 2, ans + 1, t[4] + 2 * (k0 + 4)], ex: `The gaps are ${[0, 1, 2, 3].map(i => (k0 + i) ** 2).join(', ')} (squares); the next gap is ${(k0 + 4) ** 2}, so ${t[4]} + ${(k0 + 4) ** 2} = ${ans}.` };
      },
      h => {
        const s = h.int(2, 9), t = Array.from({ length: 5 }, (_, i) => (s + i) * (s + i + 1)), ans = (s + 5) * (s + 6);
        return { t: 'n(n + 1)', q: series(t), a: ans, x: [(s + 5) ** 2, ans + 2, t[4] + (t[4] - t[3])], ex: `The terms are ${s}×${s + 1}, ${s + 1}×${s + 2}, …; next is ${s + 5} × ${s + 6} = ${ans}.` };
      },
      h => {
        const t = [h.int(1, 9), h.int(1, 9)];
        for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
        const ans = t[5] + t[4];
        return { t: 'Sum of previous two', q: series(t), a: ans, x: [t[5] + (t[5] - t[4]), ans + 1, t[5] * 2], ex: `Each term is the sum of the two before it: ${t[4]} + ${t[5]} = ${ans}.` };
      },
      h => {
        const m = h.pick([2, 3]), c = h.int(1, 4), t = [h.int(c + 1, 9)]; // first term > c keeps the series growing
        for (let i = 0; i < 4; i++) t.push(t[i] * m - c);
        const ans = t[4] * m - c;
        return { t: 'Mixed operations', q: series(t), a: ans, x: [t[4] * m, ans - c, t[4] * m + c], ex: `Each term is × ${m} ${MINUS} ${c}: ${t[4]} × ${m} ${MINUS} ${c} = ${ans}.` };
      },
    ],
  };

  /* ---------- 5. Percentages ---------- */
  const NICE_P = [5, 10, 12, 15, 20, 25, 30, 40, 45, 60, 75, 80];
  const pMultiple = (p, lo, hi, h) => { const u = 100 / gcd(p, 100); return u * h.int(Math.ceil(lo / u), Math.max(Math.ceil(lo / u), Math.floor(hi / u))); };
  const MORE_LESS = [[25, 20], [100, 50], [150, 60], [300, 75], [20, 25], [50, 100], [60, 150], [75, 300]];
  const PERCENT = {
    easy: [
      h => {
        const p = h.pick(NICE_P), N = pMultiple(p, 40, 900, h), ans = (p * N) / 100;
        return { t: 'Percent of a number', q: `What is ${p}% of ${N}?`, a: ans, x: [ans * 10, N - ans, ans + p], st: v => `${p}% of ${N} is ${v}`, ex: `${p}% of ${N} = ${p}/100 × ${N} = ${ans}.` };
      },
      h => {
        const p = h.pick(NICE_P), B = pMultiple(p, 40, 800, h), A = (p * B) / 100;
        return { t: 'Percent of a number', q: `What percent of ${B} is ${A}?`, a: p, u: '%', x: [100 - p, p + 5, B / A], ex: `${A} ÷ ${B} × 100 = ${p}%.` };
      },
      h => {
        const p = h.pick(NICE_P), N = pMultiple(p, 40, 900, h), A = (p * N) / 100;
        return { t: 'Finding the whole', q: `${p}% of a number is ${A}. What is the number?`, a: N, x: [A * p, N + A, N - A], ex: `Number = ${A} × 100 ÷ ${p} = ${N}.` };
      },
    ],
    medium: [
      h => {
        let c1, c2;
        do { c1 = h.pick([10, 20, 25, 30, 40, 50, -10, -20, -25, -30, -40, -50]); c2 = h.pick([10, 20, 25, 30, 40, 50, -10, -20, -25, -30, -40, -50]); } while ((c1 * c2) % 100 !== 0);
        const net = c1 + c2 + (c1 * c2) / 100, thing = h.pick(['The price of a phone', 'A man’s salary', 'The population of a town', 'The price of petrol']);
        const word = c => (c > 0 ? `increased by ${c}%` : `decreased by ${-c}%`);
        return { t: 'Successive change', q: `${thing} is ${word(c1)} and then ${word(c2)}. What is the net change?`, a: change(net), w: [change(c1 + c2), change(-net), change(net + (net >= 0 ? 2 : -2)), change(net + (net >= 0 ? -1 : 1))], ex: `Net change = a + b + ab/100 = ${signed(c1)} + ${signed(c2)} + (${signed(c1)} × ${signed(c2)})/100 = ${num(net)}%: ${change(net).toLowerCase()}.` };
      },
      h => {
        const [p, q] = h.pick(MORE_LESS), more = p > q;
        if (h.chance(0.5)) {
          return { t: 'More than / less than', q: more ? `A’s income is ${p}% more than B’s. By what percent is B’s income less than A’s?` : `A’s income is ${p}% less than B’s. By what percent is B’s income more than A’s?`, a: q, u: '%', x: [p, 100 - q, q + 5], ex: more ? `Take B = 100, so A = ${100 + p}. B is ${p} less out of ${100 + p}: ${p} ÷ ${100 + p} × 100 = ${q}%.` : `Take B = 100, so A = ${100 - p}. B is ${p} more out of ${100 - p}: ${p} ÷ ${100 - p} × 100 = ${q}%.` };
        }
        if (!more) return null;
        return { t: 'Price and consumption', q: `The price of sugar rises by ${p}%. By what percent must a family cut its consumption to keep its spending the same?`, a: q, u: '%', x: [p, 100 - q, q + 5], ex: `Cut = rise ÷ (100 + rise) × 100 = ${p} ÷ ${100 + p} × 100 = ${q}%.` };
      },
      h => {
        const p = h.pick([10, 20, 25, 40, 50]), N = 20 * h.int(5, 40), M = (N * (100 + p)) / 100;
        return { t: 'Finding the original', q: `After a ${p}% increase, a price is ₹${M}. What was it before the increase?`, a: N, pre: '₹', x: [(M * (100 - p)) / 100, M - p, N + 10], ex: `Original × ${(100 + p) / 100} = ${M}, so original = ${M} × 100 ÷ ${100 + p} = ${rs(N)}. (Taking ${p}% off ${M} is the classic mistake.)` };
      },
    ],
    hard: [
      h => {
        const M = 100 * h.int(2, 10), p = h.pick([30, 33, 35, 36, 40]), pass = (p * M) / 100, f = h.int(5, Math.min(40, pass - 5)), s = pass - f;
        return { t: 'Pass marks', q: `A student needs ${p}% to pass, scores ${s} marks and fails by ${f} marks. What are the maximum marks?`, a: M, x: [(s * 100) / p, M + 100, (s + f) * 2], ex: `Pass mark = ${s} + ${f} = ${pass}, which is ${p}% of the maximum: ${pass} × 100 ÷ ${p} = ${M}.` };
      },
      h => {
        const T = 100 * h.int(20, 200), p = h.pick([52, 54, 55, 56, 58, 60, 62, 65, 70]), d = ((2 * p - 100) * T) / 100;
        return { t: 'Elections', q: `In an election between two candidates, the winner got ${p}% of the votes and won by ${d} votes. How many votes were cast in all?`, a: T, x: [(d * 100) / p, T / 2, T + d], ex: `The winner’s margin is ${p}% ${MINUS} ${100 - p}% = ${2 * p - 100}% of the votes: ${d} × 100 ÷ ${2 * p - 100} = ${T}.` };
      },
      h => {
        const r = h.pick([5, 10, 20]), down = h.chance(0.3), P = (r === 5 ? 400 : 100) * h.int(10, 50), f = down ? (100 - r) / 100 : (100 + r) / 100, ans = Math.round(P * f * f);
        return { t: 'Population growth', q: `The population of a town is ${P}. It ${down ? 'decreases' : 'grows'} by ${r}% every year. What will it be after 2 years?`, a: ans, x: [down ? P - (2 * r * P) / 100 : P + (2 * r * P) / 100, Math.round(P * f), ans + r * 10], ex: `${P} × ${num(f)} × ${num(f)} = ${ans}. (Each year’s change is on the new figure, not the original.)` };
      },
      h => {
        const a = h.pick([10, 20, 30, 40, 50]), b = h.pick([10, 20, 25, 30, 40, 50]), I = 1000 * h.int(10, 60), left = (I * (100 - a)) / 100, S = (left * (100 - b)) / 100;
        return { t: 'Income and spending', q: `Priya spends ${a}% of her income on food and ${b}% of the rest on rent, and saves ₹${num(S)}. What is her income?`, a: I, pre: '₹', x: [(S * 100) / (100 - a - b), I + 1000 * h.int(1, 5), (S * 100) / (100 - a)], ex: `She saves ${100 - a}% × ${100 - b}% = ${num(((100 - a) * (100 - b)) / 100)}% of her income, so income = ${num(S)} × 100 ÷ ${num(((100 - a) * (100 - b)) / 100)} = ${rs(I)}.` };
      },
    ],
  };

  /* ---------- 6. Profit, Loss & Discount ---------- */
  const PROFIT = {
    easy: [
      h => {
        const p = h.pick([5, 10, 12, 15, 20, 25, 30, 40, 50]), CP = pMultiple(p, 100, 2000, h), loss = h.chance(0.35), SP = (CP * (loss ? 100 - p : 100 + p)) / 100;
        return { t: loss ? 'Loss percent' : 'Profit percent', q: `An article bought for ₹${CP} is sold for ₹${SP}. What is the ${loss ? 'loss' : 'profit'} percent?`, a: p, u: '%', x: [(Math.abs(SP - CP) * 100) / SP, p + 5, p * 2], ex: `${loss ? 'Loss' : 'Profit'}% = ${Math.abs(SP - CP)} ÷ ${CP} × 100 = ${p}% (always divide by the cost price).` };
      },
      h => {
        const p = h.pick([5, 10, 12, 15, 20, 25, 30, 40]), CP = pMultiple(p, 100, 3000, h), SP = (CP * (100 + p)) / 100;
        return { t: 'Selling price', q: `A trader buys a watch for ₹${CP} and sells it at a profit of ${p}%. What is the selling price?`, a: SP, pre: '₹', x: [CP + p, (CP * (100 - p)) / 100, SP + 10], ex: `SP = CP × (100 + profit%) ÷ 100 = ${CP} × ${100 + p} ÷ 100 = ${rs(SP)}.` };
      },
      h => {
        const d = h.pick([5, 10, 15, 20, 25, 30, 40]), MP = pMultiple(d, 200, 5000, h), SP = (MP * (100 - d)) / 100;
        return { t: 'Discount', q: `A shirt is marked at ₹${MP} and sold at a discount of ${d}%. What is the selling price?`, a: SP, pre: '₹', x: [(MP * d) / 100, MP - d, (MP * (100 + d)) / 100], ex: `SP = ${MP} × (100 ${MINUS} ${d}) ÷ 100 = ${rs(SP)}.` };
      },
    ],
    medium: [
      h => {
        const [a, b] = h.pick([[10, 10], [20, 10], [20, 20], [25, 20], [30, 10], [40, 10], [30, 20], [50, 20], [40, 25], [20, 5]]), ans = a + b - (a * b) / 100;
        return { t: 'Successive discounts', q: `Two successive discounts of ${a}% and ${b}% are equal to a single discount of:`, a: ans, u: '%', x: [a + b, ans - 2, ans + 2], ex: `Single discount = a + b ${MINUS} ab/100 = ${a} + ${b} ${MINUS} ${(a * b) / 100} = ${num(ans)}%.` };
      },
      h => {
        const [x, y, p] = h.pick([[20, 25, 25], [10, 12, 20], [15, 18, 20], [12, 15, 25], [16, 20, 25], [20, 24, 20], [25, 30, 20], [8, 10, 25], [10, 15, 50]]);
        const loss = ((y - x) * 100) % y === 0 && h.chance(0.4); // only when the loss % is a whole number
        if (loss) {
          const l = ((y - x) * 100) / y;
          return { t: 'Articles bought and sold', q: `The selling price of ${y} articles equals the cost price of ${x} articles. What is the loss percent?`, a: l, u: '%', x: [p, (y - x) * 10, l + 5], ex: `Loss on ${y} articles = cost of ${y - x}: ${y - x} ÷ ${y} × 100 = ${num(l)}%.` };
        }
        return { t: 'Articles bought and sold', q: `The selling price of ${x} articles equals the cost price of ${y} articles. What is the profit percent?`, a: p, u: '%', x: [((y - x) * 100) / y, (y - x) * 10, p + 5], ex: `Profit on ${x} articles = cost of ${y - x}: ${y - x} ÷ ${x} × 100 = ${p}%.` };
      },
      h => {
        const p = h.pick([10, 20, 25, 40, 50]), CP = 20 * h.int(10, 100), SP = (CP * (100 + p)) / 100;
        return { t: 'Cost price', q: `By selling a bag for ₹${SP}, a shopkeeper gains ${p}%. What did the bag cost him?`, a: CP, pre: '₹', x: [(SP * (100 - p)) / 100, SP - p, CP + 20], ex: `CP = SP × 100 ÷ (100 + gain%) = ${SP} × 100 ÷ ${100 + p} = ${rs(CP)}.` };
      },
    ],
    hard: [
      h => {
        const l = h.pick([5, 10, 15, 20, 25]), g = h.pick([5, 10, 15, 20, 25]), CP = 100 * h.int(5, 60), S = (CP * (100 - l)) / 100, ans = (CP * (100 + g)) / 100;
        return { t: 'From loss to gain', q: `By selling a radio for ₹${S}, a man loses ${l}%. At what price should he sell it to gain ${g}%?`, a: ans, pre: '₹', x: [(S * (100 + g)) / 100, S + (S * (l + g)) / 100, ans + 50], ex: `CP = ${S} × 100 ÷ ${100 - l} = ${CP}. For a ${g}% gain: ${CP} × ${100 + g} ÷ 100 = ${rs(ans)}.` };
      },
      h => {
        const [m, d] = h.pick([[40, 25], [50, 20], [30, 10], [20, 10], [60, 25], [50, 10], [40, 10], [25, 12], [80, 25], [50, 30]]), sp = ((100 + m) * (100 - d)) / 100, ans = sp - 100;
        return { t: 'Mark-up and discount', q: `A shopkeeper marks his goods ${m}% above cost and allows a discount of ${d}%. What is his profit percent?`, a: ans, u: '%', x: [m - d, ans + 2, m], ex: `Take CP = 100: marked price ${100 + m}, selling price ${100 + m} × ${100 - d}/100 = ${num(sp)}, so profit = ${num(ans)}%.` };
      },
      h => {
        const [w, g] = h.pick([[800, 25], [625, 60], [500, 100], [400, 150], [640, 56.25]]);
        return { t: 'False weights', q: `A dishonest dealer claims to sell at cost price but uses a weight of ${w} g instead of 1 kg. What is his gain percent?`, a: g, u: '%', x: [(1000 - w) / 10, 100 - g, g + 5], ex: `He gains ${1000 - w} g on every ${w} g: ${1000 - w} ÷ ${w} × 100 = ${g}%.` };
      },
      h => {
        const [d, p, m] = h.pick([[20, 20, 50], [10, 8, 20], [25, 20, 60], [20, 4, 30], [10, 17, 30], [25, 5, 40], [40, 20, 100], [25, 50, 100], [20, 10, 37.5]]);
        return { t: 'Marking above cost', q: `After a discount of ${d}%, a trader still makes a profit of ${p}%. By what percent is the marked price above the cost price?`, a: m, u: '%', x: [d + p, m + 5, m - 5], ex: `Take CP = 100, so SP = ${100 + p}. Marked price = ${100 + p} × 100 ÷ ${100 - d} = ${num(100 + m)}, which is ${num(m)}% above cost.` };
      },
    ],
  };

  /* ---------- 7. Simple & Compound Interest ---------- */
  const INTEREST = {
    easy: [
      h => {
        const P = 100 * h.int(5, 200), R = h.int(2, 15), T = h.int(2, 6), SI = (P * R * T) / 100;
        return { t: 'Simple interest', q: `What is the simple interest on ₹${P} at ${R}% per annum for ${T} years?`, a: SI, pre: '₹', x: [(P * R) / 100, P + SI, SI * 2], ex: `SI = P × R × T ÷ 100 = ${P} × ${R} × ${T} ÷ 100 = ${rs(SI)}.` };
      },
      h => {
        const P = 100 * h.int(5, 200), R = h.int(2, 15), T = h.int(2, 6), A = P + (P * R * T) / 100;
        return { t: 'Amount', q: `What amount will ₹${P} become after ${T} years at ${R}% per annum simple interest?`, a: A, pre: '₹', x: [A - P, P + (P * R) / 100, A + 100], ex: `Interest = ${P} × ${R} × ${T} ÷ 100 = ${A - P}, so amount = ${P} + ${A - P} = ${rs(A)}.` };
      },
      h => {
        const P = 100 * h.int(5, 200), R = h.int(2, 15), T = h.int(2, 6), I = (P * R * T) / 100;
        return { t: 'Rate of interest', q: `At what rate of simple interest will ₹${P} earn ₹${I} in ${T} years?`, a: R, u: '%', x: [R * T, R + 1, (I * 100) / P], ex: `R = SI × 100 ÷ (P × T) = ${I} × 100 ÷ (${P} × ${T}) = ${R}%.` };
      },
    ],
    medium: [
      h => {
        const r = h.pick([4, 5, 8, 10, 12.5, 20, 25]), k = h.pick([2, 3, 4]), years = ((k - 1) * 100) / r;
        return { t: 'Doubling and tripling', q: `In how many years will a sum of money become ${k === 2 ? 'double' : k === 3 ? 'three times' : 'four times'} itself at ${num(r)}% per annum simple interest?`, a: years, u: ' years', x: [(k * 100) / r, 100 / r, years + 2], ex: `The interest must be ${k - 1} × the sum = ${(k - 1) * 100}% of it: ${(k - 1) * 100} ÷ ${num(r)} = ${num(years)} years.` };
      },
      h => {
        const r = h.pick([5, 10, 20]), P = (r === 5 ? 400 : 100) * h.int(5, 50), f = (100 + r) / 100, CI = Math.round(P * f * f - P);
        return { t: 'Compound interest', q: `What is the compound interest on ₹${P} at ${r}% per annum for 2 years, compounded yearly?`, a: CI, pre: '₹', x: [(2 * P * r) / 100, P + CI, CI + r], ex: `Amount = ${P} × ${num(f)}² = ${num(P * f * f)}, so CI = ${num(P * f * f)} ${MINUS} ${P} = ${rs(CI)}.` };
      },
      h => {
        const P = 1000 * h.int(1, 20), A = Math.round(P * 1.331);
        return { t: 'Compound interest', q: `What will ₹${P} amount to in 3 years at 10% per annum compound interest?`, a: A, pre: '₹', x: [P + (P * 30) / 100, Math.round(P * 1.21), A + 100], ex: `${P} × 1.1 × 1.1 × 1.1 = ${P} × 1.331 = ${rs(A)}.` };
      },
    ],
    hard: [
      h => {
        const r = h.pick([4, 5, 10, 20]), d = h.int(2, 40), P = (d * 10000) / (r * r);
        return { t: 'CI − SI difference', q: `The difference between compound and simple interest on a sum for 2 years at ${r}% per annum is ₹${d}. What is the sum?`, a: P, pre: '₹', x: [(d * 100) / r, P / 2, P + 1000], ex: `For 2 years, CI ${MINUS} SI = P × (R/100)²: P = ${d} × (100/${r})² = ${d} × ${(100 / r) ** 2} = ${rs(P)}.` };
      },
      h => {
        const P = 100 * h.int(10, 100), r = h.int(3, 15), t1 = h.int(2, 5), t2 = t1 + h.int(1, 5), A1 = P + (P * r * t1) / 100, A2 = P + (P * r * t2) / 100;
        return { t: 'Finding the rate', q: `A sum of money at simple interest amounts to ₹${A1} in ${t1} years and to ₹${A2} in ${t2} years. What is the rate of interest?`, a: r, u: '%', x: [r + 1, ((A2 - A1) * 100) / A1, r * 2], ex: `${t2 - t1 > 1 ? `Interest for ${t2 - t1} years = ${A2 - A1}, so ${(A2 - A1) / (t2 - t1)} a year` : `Interest for 1 year = ${A2 - A1}`}. Sum = ${A1} ${MINUS} ${t1} × ${(A2 - A1) / (t2 - t1)} = ${P}. Rate = ${(A2 - A1) / (t2 - t1)} × 100 ÷ ${P} = ${r}%.` };
      },
      h => {
        const r = h.pick([10, 20]), P = (r === 10 ? 400 : 100) * h.int(5, 50), f = 1 + r / 200, CI = Math.round(P * f * f - P);
        return { t: 'Half-yearly compounding', q: `What is the compound interest on ₹${P} for 1 year at ${r}% per annum, compounded half-yearly?`, a: CI, pre: '₹', x: [(P * r) / 100, Math.round(P * (1 + r / 100) ** 2 - P), CI + 10], ex: `Half-yearly: rate ${r / 2}% for 2 periods. ${P} × ${num(f)}² = ${num(P * f * f)}, so CI = ${rs(CI)}.` };
      },
      h => {
        const n = h.int(2, 9), k = h.pick([4, 8]), ans = n * Math.log2(k);
        return { t: 'Compound growth', q: `A sum of money doubles itself in ${n} years at compound interest. In how many years will it become ${k} times itself?`, a: ans, u: ' years', x: [n * k, n * (k - 1), n * k / 2 + 1], ex: `${k} = 2${sup(Math.log2(k))}, so it doubles ${Math.log2(k)} times: ${Math.log2(k)} × ${n} = ${ans} years.` };
      },
    ],
  };

  /* ---------- 8. Ratio, Proportion & Partnership ---------- */
  const RATIO = {
    easy: [
      h => {
        let a, b; do { a = h.int(1, 9); b = h.int(1, 9); } while (a === b || gcd(a, b) !== 1);
        const k = 10 * h.int(2, 60), N = (a + b) * k, big = Math.max(a, b);
        return { t: 'Dividing in a ratio', q: `₹${N} is divided between A and B in the ratio ${a} : ${b}. What is the larger share?`, a: big * k, pre: '₹', x: [Math.min(a, b) * k, N / 2, (N * big) / (a + b + 1)], ex: `Total parts = ${a + b}; one part = ${N} ÷ ${a + b} = ${k}. Larger share = ${big} × ${k} = ${rs(big * k)}.` };
      },
      h => {
        const a = h.int(2, 12), b = h.int(2, 15), k = h.int(2, 9), c = a * k, x = b * k;
        return { t: 'Fourth proportional', q: `What is the fourth proportional to ${a}, ${b} and ${c}?`, a: x, x: [(a * c) / b, b + c - a, x + b], ex: `${a} : ${b} = ${c} : x, so x = ${b} × ${c} ÷ ${a} = ${x}.` };
      },
    ],
    medium: [
      h => {
        let a, b, c, d;
        do { a = h.int(1, 9); b = h.int(1, 9); c = h.int(1, 9); d = h.int(1, 9); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a === b || c === d);
        const ans = ratio(a * c, b * d);
        return { t: 'Combining ratios', q: `If A : B = ${a} : ${b} and B : C = ${c} : ${d}, what is A : C?`, a: ans, w: ratioW(ans, h, [ratio(a, d), ratio(a * d, b * c), ratio(b * d, a * c)]), ex: `A : C = (A/B) × (B/C) = ${a}/${b} × ${c}/${d} = ${a * c}/${b * d}, i.e. ${ans}.` };
      },
      h => {
        let p, q; do { p = h.int(1, 9); q = h.int(1, 9); } while (p === q);
        const s = h.int(1, 6), x = s * p * p, y = s * q * q, ans = s * p * q;
        return { t: 'Mean proportional', q: `What is the mean proportional between ${x} and ${y}?`, a: ans, x: [(x + y) / 2, ans + s, Math.abs(x - y)], ex: `Mean proportional = √(${x} × ${y}) = √${x * y} = ${ans}.` };
      },
      h => {
        let a, b; do { a = h.int(1, 9); b = h.int(1, 9); } while (a === b || gcd(a, b) !== 1);
        const unit = 1000 * h.int(1, 8), x = a * unit, y = b * unit, k = 100 * h.int(2, 40), P = (a + b) * k;
        return { t: 'Partnership', q: `A invests ₹${x} and B invests ₹${y} in a business for the same time. Out of a profit of ₹${P}, what is A’s share?`, a: a * k, pre: '₹', x: [b * k, P / 2, a * k + k], ex: `Shares go by investment: ${x} : ${y} = ${a} : ${b}. A gets ${a}/${a + b} × ${P} = ${rs(a * k)}.` };
      },
      h => {
        const [a, b, c] = h.pick([[1, 2, 4], [2, 3, 4], [3, 4, 8], [1, 3, 4], [2, 5, 8], [3, 2, 4]]), k = 4 * h.int(5, 40), V = a * k + (b * k) / 2 + (c * k) / 4;
        return { t: 'Coins in a ratio', q: `A bag has ₹1, 50-paise and 25-paise coins in the ratio ${a} : ${b} : ${c}. The total value is ₹${num(V)}. How many 50-paise coins are there?`, a: b * k, x: [a * k, c * k, b * k / 2], ex: `Value per set of ${a} : ${b} : ${c} coins = ${a} + ${num(b / 2)} + ${num(c / 4)} = ₹${num(a + b / 2 + c / 4)}. Sets = ${num(V)} ÷ ${num(a + b / 2 + c / 4)} = ${k}, so 50-paise coins = ${b} × ${k} = ${b * k}.` };
      },
    ],
    hard: [
      h => {
        const x = 1000 * h.int(2, 12), y = 1000 * h.int(2, 12), t1 = h.int(4, 12), t2 = h.int(3, 12), A = x * t1, B = y * t2, g = gcd(A, B), a = A / g, b = B / g;
        if (a + b > 60) return null;
        const k = 100 * h.int(2, 30), P = (a + b) * k;
        return { t: 'Partnership over time', q: `A invests ₹${x} for ${t1} months and B invests ₹${y} for ${t2} months. Out of a profit of ₹${P}, what is B’s share?`, a: b * k, pre: '₹', x: [a * k, Math.round((P * y) / (x + y)), b * k + k], ex: `Capital × months: A ${x} × ${t1} = ${A}, B ${y} × ${t2} = ${B}, ratio ${a} : ${b}. B gets ${b}/${a + b} × ${P} = ${rs(b * k)}.` };
      },
      h => {
        let a, b; do { a = h.int(2, 7); b = h.int(a + 1, 11); } while (gcd(a, b) !== 1);
        const m = h.int(3, 12), k = h.int(2, 15), c = a * m + k, d = b * m + k, r = ratio(c, d);
        return { t: 'Ratio after a change', q: `Two numbers are in the ratio ${a} : ${b}. If ${k} is added to each, the ratio becomes ${r}. What is the larger number?`, a: b * m, x: [a * m, b * m + k, d], ex: `Let them be ${a}x and ${b}x: (${a}x + ${k}) ÷ (${b}x + ${k}) = ${r.replace(' : ', '/')} gives x = ${m}, so the larger is ${b} × ${m} = ${b * m}.` };
      },
      h => {
        const [p, q, r] = h.pick([[2, 3, 4], [2, 3, 6], [3, 4, 6], [2, 4, 5], [3, 5, 6], [4, 5, 10]]), L = lcm(lcm(p, q), r), x = L / p, y = L / q, z = L / r, k = 10 * h.int(5, 60), N = (x + y + z) * k;
        return { t: 'Inverse ratios', q: `₹${N} is shared among A, B and C in the ratio 1/${p} : 1/${q} : 1/${r}. What is A’s share?`, a: x * k, pre: '₹', x: [z * k, (N * p) / (p + q + r), y * k], ex: `Multiply by ${L}: 1/${p} : 1/${q} : 1/${r} = ${x} : ${y} : ${z}. A gets ${x}/${x + y + z} × ${N} = ${rs(x * k)}.` };
      },
    ],
  };

  /* ---------- 9. Averages ---------- */
  const AVERAGE = {
    easy: [
      h => {
        const n = h.int(5, 7), A = h.int(20, 80), xs = Array.from({ length: n - 1 }, () => A + h.int(-15, 15)), last = n * A - xs.reduce((s, v) => s + v, 0);
        if (last <= 0) return null;
        const list = h.shuffle([...xs, last]);
        return { t: 'Average of numbers', q: `What is the average of ${list.join(', ')}?`, a: A, x: [A + 1, A - 1, Math.round((n * A) / (n - 1))], ex: `Sum = ${n * A}; ${n * A} ÷ ${n} = ${A}.` };
      },
      h => {
        const kind = h.pick(['natural', 'even', 'odd']), n = kind === 'natural' ? 2 * h.int(5, 50) + 1 : h.int(10, 99);
        const ans = kind === 'natural' ? (n + 1) / 2 : kind === 'even' ? n + 1 : n;
        return { t: 'Average of a sequence', q: `What is the average of the first ${n} ${kind === 'natural' ? 'natural numbers' : `${kind} numbers`}?`, a: ans, x: [ans + 1, ans * 2, ans - 1], ex: kind === 'natural' ? `Average of 1 to n = (n + 1)/2 = ${ans}.` : kind === 'even' ? `Average of the first n even numbers = n + 1 = ${ans}.` : `Average of the first n odd numbers = n = ${ans}.` };
      },
      h => {
        const A = h.int(20, 90), k = h.int(2, 15), times = h.chance(0.5);
        return { t: 'Changing every number', q: times ? `The average of some numbers is ${A}. If every number is multiplied by ${k}, what is the new average?` : `The average of some numbers is ${A}. If ${k} is added to every number, what is the new average?`, a: times ? A * k : A + k, x: times ? [A + k, A, A * k + k] : [A, A * k, A + 2 * k], ex: times ? `Multiplying every number by ${k} multiplies the average by ${k}: ${A * k}.` : `Adding ${k} to every number adds ${k} to the average: ${A + k}.` };
      },
    ],
    medium: [
      h => {
        const n = h.int(5, 12), A = h.int(20, 60), B = A + h.int(-6, 6), x = n * A - (n - 1) * B;
        if (x <= 0 || B === A) return null;
        return { t: 'Removing a number', q: `The average of ${n} numbers is ${A}. When one number is removed, the average of the rest is ${B}. What number was removed?`, a: x, x: [A - B, x + n, n * A - n * B], ex: `Removed = ${n} × ${A} ${MINUS} ${n - 1} × ${B} = ${n * A} ${MINUS} ${(n - 1) * B} = ${x}.` };
      },
      h => {
        const n = h.int(8, 20), A = h.int(25, 45), d = h.int(1, 4), s = A + (n + 1) * d;
        return { t: 'Batting average', q: `A batsman has an average of ${A} after ${n} innings. After scoring ${s} in the next innings, what is his new average?`, a: A + d, x: [A + s / (n + 1), A + d + 1, (A + s) / 2], ex: `New total = ${n} × ${A} + ${s} = ${n * A + s}; ${n * A + s} ÷ ${n + 1} = ${A + d}.` };
      },
      h => {
        const n = h.int(5, 12), w = h.int(45, 70), d = h.pick([1, 1.5, 2, 2.5, 3]), ans = w + n * d;
        return { t: 'Replacing a person', q: `The average weight of ${n} people goes up by ${num(d)} kg when one of them, weighing ${w} kg, is replaced by a new person. What does the new person weigh?`, a: ans, u: ' kg', x: [w + d, w - n * d, ans + n], ex: `The new person adds ${n} × ${num(d)} = ${num(n * d)} kg in total: ${w} + ${num(n * d)} = ${num(ans)} kg.` };
      },
    ],
    hard: [
      h => {
        const n = h.int(20, 40), A = h.int(12, 16), d = h.pick([1, 2]), T = A + (n + 1) * d;
        return { t: 'Including a new member', q: `The average age of ${n} students is ${A} years. When the teacher’s age is included, the average rises by ${d}. How old is the teacher?`, a: T, u: ' years', x: [A + n * d, T + d, A + d], ex: `New total = ${n + 1} × ${A + d} = ${(n + 1) * (A + d)}; old total = ${n * A}. Teacher = ${T} years.` };
      },
      h => {
        let a, b, c;
        do { a = h.int(10, 60); b = h.int(10, 60); c = h.int(10, 60); } while ((a + b) % 2 || (b + c) % 2 || (a + b + c) % 3);
        const X = (a + b) / 2, Y = (b + c) / 2, Z = (a + b + c) / 3;
        return { t: 'Overlapping averages', q: `The average of three numbers is ${Z}. The average of the first two is ${X} and of the last two is ${Y}. What is the middle number?`, a: b, x: [a, c, Math.round((X + Y) / 2)], ex: `First two sum ${2 * X}, last two sum ${2 * Y}, all three ${3 * Z}. Middle = ${2 * X} + ${2 * Y} ${MINUS} ${3 * Z} = ${b}.` };
      },
      h => {
        let B, C, sixth, A;
        do { B = h.int(30, 70); C = h.int(30, 70); sixth = h.int(30, 90); A = (6 * B + 6 * C - sixth) / 11; } while (!Number.isInteger(A));
        return { t: 'Overlapping averages', q: `The average of 11 results is ${A}. The average of the first 6 is ${B} and of the last 6 is ${C}. What is the 6th result?`, a: sixth, x: [Math.abs(B - C), (B + C) / 2, sixth + 6], ex: `The 6th result is counted twice: 6 × ${B} + 6 × ${C} ${MINUS} 11 × ${A} = ${6 * B} + ${6 * C} ${MINUS} ${11 * A} = ${sixth}.` };
      },
    ],
  };

  /* ---------- 10. Problems on Ages ---------- */
  const AGES = {
    easy: [
      h => {
        const b = h.int(8, 40), k = h.int(2, 15), a = b + k, S = a + b;
        return { t: 'Sum and difference', q: `A is ${k} years older than B. The sum of their ages is ${S}. How old is A?`, a, u: ' years', x: [b, S / 2, a + k], ex: `A = (sum + difference) ÷ 2 = (${S} + ${k}) ÷ 2 = ${a} years.` };
      },
      h => {
        let p, q; do { p = h.int(1, 7); q = h.int(1, 7); } while (p === q || gcd(p, q) !== 1);
        const k = h.int(3, 12), S = (p + q) * k;
        return { t: 'Ages in a ratio', q: `The ages of two sisters are in the ratio ${p} : ${q}, and together they are ${S} years old. How old is the elder sister?`, a: Math.max(p, q) * k, u: ' years', x: [Math.min(p, q) * k, S / 2, Math.max(p, q) * k + k], ex: `One part = ${S} ÷ ${p + q} = ${k}; elder = ${Math.max(p, q)} × ${k} = ${Math.max(p, q) * k} years.` };
      },
      h => {
        const x = h.int(8, 40), n = h.int(2, 10), m = h.int(2, 10);
        return { t: 'Past and future ages', q: `${n} years ago, Ravi was ${x} years old. How old will he be ${m} years from now?`, a: x + n + m, u: ' years', x: [x + m, x + n, x + n + m + 1], ex: `Now he is ${x} + ${n} = ${x + n}; in ${m} years, ${x + n + m}.` };
      },
    ],
    medium: [
      h => {
        const s = h.int(8, 20), n = h.int(2, Math.min(7, s - 2)), m = h.int(3, 6), f = m * (s - n) + n;
        return { t: 'Ages in the past', q: `${n} years ago, a father was ${m} times as old as his son. The father is ${f} now. How old is the son now?`, a: s, u: ' years', x: [f / m, s - n, s + n], ex: `${f} ${MINUS} ${n} = ${m} × (s ${MINUS} ${n}), so s ${MINUS} ${n} = ${(f - n) / m} and s = ${s} years.` };
      },
      h => {
        let a, b; do { a = h.int(2, 6); b = h.int(a + 1, 9); } while (gcd(a, b) !== 1);
        const x = h.int(3, 9), n = h.int(2, 12), r = ratio(a * x + n, b * x + n);
        return { t: 'Ratios now and later', q: `The present ages of A and B are in the ratio ${a} : ${b}. After ${n} years the ratio will be ${r}. What is B’s present age?`, a: b * x, u: ' years', x: [a * x, b * x + n, b * n], ex: `Let them be ${a}x and ${b}x: (${a}x + ${n}) ÷ (${b}x + ${n}) = ${r.replace(' : ', '/')} gives x = ${x}, so B is ${b * x} years.` };
      },
    ],
    hard: [
      h => {
        const s = h.int(10, 25), k = h.int(3, Math.min(8, s - 3)), m = h.int(3, 5), f = m * (s - k) + k, S = s + f;
        return { t: 'Sum of ages', q: `The sum of the ages of a father and his son is ${S} years. ${k} years ago, the father was ${m} times as old as his son. How old is the son now?`, a: s, u: ' years', x: [S / (m + 1), s - k, f - S + 2 * s + 1], ex: `${k} years ago their sum was ${S - 2 * k} and the father was ${m} times the son: son then = ${S - 2 * k} ÷ ${m + 1} = ${s - k}, so now ${s} years.` };
      },
      h => {
        let s, m, p, n;
        do { s = h.int(5, 15); p = h.int(2, 3); n = h.int(3, 20); m = (p * (s + n) - n) / s; } while (!Number.isInteger(m) || m <= p || m > 7);
        return { t: 'Multiples of age', q: `A father is ${m} times as old as his son. After ${n} years, he will be ${p} times as old as his son. How old is the son now?`, a: s, u: ' years', x: [s + n, n, s * (m - p)], ex: `${m}s + ${n} = ${p}(s + ${n}) gives ${m - p}s = ${p * n - n}, so s = ${s} years.` };
      },
      h => {
        const B = h.int(6, 30), k = h.int(2, 12), P = B * (B + k);
        return { t: 'Product of ages', q: `The product of the ages of two brothers is ${P}, and the elder is ${k} years older. How old is the younger brother?`, a: B, u: ' years', x: [B + k, Math.round(Math.sqrt(P)), B - 1], ex: `y × (y + ${k}) = ${P}; try y = ${B}: ${B} × ${B + k} = ${P}. The younger is ${B} years.` };
      },
    ],
  };

  /* ---------- 11. Mixtures & Alligation ---------- */
  const MIXTURE = {
    easy: [
      h => {
        let a, b, p, q, m;
        do { a = h.int(20, 60); b = a + h.int(5, 40); p = h.int(1, 5); q = h.int(1, 5); m = (a * p + b * q) / (p + q); } while (!Number.isInteger(m) || p === q);
        return { t: 'Price of a mixture', q: `Rice at ₹${a}/kg is mixed with rice at ₹${b}/kg in the ratio ${p} : ${q}. What is the price of the mixture per kg?`, a: m, pre: '₹', x: [(a + b) / 2, m + 2, (a * q + b * p) / (p + q)], ex: `(${a} × ${p} + ${b} × ${q}) ÷ ${p + q} = ${a * p + b * q} ÷ ${p + q} = ${rs(m)} per kg.` };
      },
      h => {
        let a, b; do { a = h.int(1, 9); b = h.int(1, 9); } while (a === b || gcd(a, b) !== 1);
        const L = (a + b) * h.int(2, 12);
        return { t: 'Parts of a mixture', q: `A ${L}-litre mixture has milk and water in the ratio ${a} : ${b}. How much water is in it?`, a: (L * b) / (a + b), u: ' litres', x: [(L * a) / (a + b), L / 2, (L * b) / (a + b) + 1], ex: `Water = ${b}/${a + b} × ${L} = ${(L * b) / (a + b)} litres.` };
      },
    ],
    medium: [
      h => {
        let a, b, m;
        do { a = h.int(20, 60); b = a + h.int(10, 50); m = h.int(a + 1, b - 1); } while (b - m === m - a);
        const ans = ratio(b - m, m - a);
        return { t: 'Alligation', q: `In what ratio must tea at ₹${a}/kg be mixed with tea at ₹${b}/kg so that the mixture is worth ₹${m}/kg?`, a: ans, w: ratioW(ans, h, [ratio(m - a, b - m), ratio(a, b), ratio(b - a, m - a)]), ex: `Alligation: (dearer ${MINUS} mean) : (mean ${MINUS} cheaper) = (${b} ${MINUS} ${m}) : (${m} ${MINUS} ${a}) = ${ans}.` };
      },
      h => {
        let a, b, c, d, L, milk, water, add;
        do {
          a = h.int(2, 9); b = h.int(1, 5); c = h.int(1, 5); d = h.int(1, 6); L = (a + b) * h.int(2, 10);
          milk = (L * a) / (a + b); water = (L * b) / (a + b); add = (milk * d) / c - water;
        } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || !Number.isInteger(add) || add <= 0 || add > 60);
        return { t: 'Adding water', q: `A ${L}-litre mixture has milk and water in the ratio ${a} : ${b}. How much water must be added to make the ratio ${c} : ${d}?`, a: add, u: ' litres', x: [add + water, add / 2, add + 2], ex: `Milk = ${milk} L, water = ${water} L. For ${c} : ${d}, water must be ${milk} × ${d}/${c} = ${(milk * d) / c} L, so add ${add} litres.` };
      },
      h => {
        const p = h.pick([10, 20, 25, 50]), ans = ratio(p, 100);
        return { t: 'Watering milk for profit', q: `A milkman sells milk at its cost price but mixes water to make a ${p}% profit. In what ratio are water and milk mixed?`, a: ans, w: ratioW(ans, h, [ratio(100, p), ratio(p, 100 + p), ratio(p, 100 - p)]), ex: `For a ${p}% profit, the water must be ${p}% of the milk: water : milk = ${p} : 100 = ${ans}.` };
      },
    ],
    hard: [
      h => {
        const [V, k] = h.pick([[40, 4], [100, 10], [80, 8], [50, 5], [20, 4], [60, 12], [90, 9]]), n = h.pick([2, 3]), left = Math.round(V * (1 - k / V) ** n * 1000) / 1000;
        return { t: 'Repeated replacement', q: `A container has ${V} litres of milk. ${k} litres are taken out and replaced with water, and this is done ${n === 2 ? 'twice' : 'three times'} in all. How much milk is left?`, a: left, u: ' litres', x: [V - n * k, Math.round(V * (1 - k / V) * 1000) / 1000, left + k], ex: `Milk left = ${V} × (1 ${MINUS} ${k}/${V})${sup(n)} = ${V} × ${num((1 - k / V) ** n)} = ${num(left)} litres.` };
      },
      h => {
        // Two milk–water mixtures (milk fractions f1 < f2) mixed to reach a target milk fraction: ratio (f2 − t) : (t − f1).
        let a, b, c, d, e, f, n1, n2;
        do {
          [a, b] = [h.int(1, 5), h.int(1, 5)]; [c, d] = [h.int(1, 7), h.int(1, 3)]; [e, f] = [h.int(1, 7), h.int(1, 5)];
          const s1 = a + b, s2 = c + d, s3 = e + f;
          n1 = c * s1 * s3 - e * s1 * s2; n2 = e * s1 * s2 - a * s2 * s3; // (f2 − t) and (t − f1) over a common denominator
        } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || gcd(e, f) !== 1 || n1 <= 0 || n2 <= 0 || ratio(n1, n2).split(' : ').some(v => +v > 12));
        const ans = ratio(n1, n2);
        return { t: 'Alligation of mixtures', q: `Vessel A has milk and water in the ratio ${a} : ${b}, and vessel B in the ratio ${c} : ${d}. In what ratio should A and B be mixed to get milk and water in the ratio ${e} : ${f}?`, a: ans, w: ratioW(ans, h, [ratio(n2, n1)]), ex: `Milk fractions: A ${a}/${a + b}, B ${c}/${c + d}, target ${e}/${e + f}. Alligation: A : B = (${c}/${c + d} ${MINUS} ${e}/${e + f}) : (${e}/${e + f} ${MINUS} ${a}/${a + b}) = ${ans}.` };
      },
    ],
  };

  /* ---------- 12. Time & Work (and pipes) ---------- */
  const WORK_T = {
    easy: [
      h => {
        const [a, b, t] = h.pick(WORK);
        return { t: 'Working together', q: `A can finish a job in ${a} days and B in ${b} days. How many days will they take working together?`, a: t, u: ' days', x: [(a + b) / 2, b - a, t + 1], ex: `In a day they do 1/${a} + 1/${b} = 1/${t} of the job, so together ${t} days.` };
      },
      h => {
        let n, d, m; do { n = h.int(4, 30); d = h.int(4, 30); m = h.int(3, 40); } while ((n * d) % m || m === n);
        return { t: 'Men and days', q: `${n} men can build a wall in ${d} days. How many days will ${m} men take?`, a: (n * d) / m, u: ' days', x: [(m * d) / n, d + n - m, (n * d) / m + 1], ex: `Total work = ${n} × ${d} = ${n * d} man-days; ${n * d} ÷ ${m} = ${(n * d) / m} days.` };
      },
    ],
    medium: [
      h => {
        const [a, b, t] = h.pick(WORK);
        return { t: 'One worker’s time', q: `A and B together can do a job in ${t} days. A alone can do it in ${a} days. How long will B alone take?`, a: b, u: ' days', x: [a - t, a + t, b + 2], ex: `B’s daily share = 1/${t} ${MINUS} 1/${a} = 1/${b}, so B takes ${b} days.` };
      },
      h => {
        const [a, b, t] = h.pick(PIPES);
        return { t: 'Pipes and cisterns', q: `Pipe A fills a tank in ${a} hours and pipe B empties it in ${b} hours. If both are opened together, how long will the tank take to fill?`, a: t, u: ' hours', x: [b - a, (a * b) / (a + b), t + 2], ex: `Net filling per hour = 1/${a} ${MINUS} 1/${b} = 1/${t}, so ${t} hours.` };
      },
      h => {
        const k = h.pick([2, 3, 4]), t = k * h.int(2, 8), A = (t * (k + 1)) / k;
        return { t: 'Efficiency', q: `A is ${k === 2 ? 'twice' : k === 3 ? 'three times' : 'four times'} as efficient as B. Together they finish a job in ${t} days. How long would A alone take?`, a: A, u: ' days', x: [t * (k + 1), t * k, A + 1], ex: `A does ${k} units a day and B 1, so the job is ${t} × ${k + 1} = ${t * (k + 1)} units. A alone: ${t * (k + 1)} ÷ ${k} = ${A} days.` };
      },
    ],
    hard: [
      h => {
        let a, b, t, rem, W;
        do { [a, b] = h.pick(WORK); t = h.int(1, 6); W = lcm(a, b); rem = (W - t * (W / a + W / b)) / (W / b); } while (rem <= 0 || !Number.isInteger(rem));
        return { t: 'Leaving midway', q: `A can do a job in ${a} days and B in ${b} days. They work together for ${t} day${t > 1 ? 's' : ''}, then A leaves. In how many more days will B finish the job?`, a: rem, u: ' days', x: [b - t, rem + t, rem + 1], ex: `Take the job as ${W} units: A does ${W / a} and B ${W / b} a day. In ${t} day${t > 1 ? 's' : ''} they do ${t * (W / a + W / b)}, leaving ${W - t * (W / a + W / b)} for B: ${rem} days.` };
      },
      h => {
        let m1, d1, h1, w1, m2, h2, w2, d2;
        do { m1 = h.int(4, 20); d1 = h.int(5, 24); h1 = h.int(5, 10); w1 = h.int(1, 4); m2 = h.int(4, 30); h2 = h.int(5, 10); w2 = h.int(1, 6); d2 = (m1 * d1 * h1 * w2) / (m2 * h2 * w1); }
        while (!Number.isInteger(d2) || d2 < 2 || d2 > 90 || (m1 === m2 && h1 === h2));
        return { t: 'Chain rule', q: `${m1} men working ${h1} hours a day make ${w1} km of road in ${d1} days. How many days will ${m2} men working ${h2} hours a day take to make ${w2} km?`, a: d2, u: ' days', x: [Math.round((m1 * d1 * h1) / (m2 * h2)), d2 + 2, Math.round((m2 * d1 * w2) / (m1 * w1))], ex: `M₁D₁H₁/W₁ = M₂D₂H₂/W₂: D₂ = ${m1} × ${d1} × ${h1} × ${w2} ÷ (${m2} × ${h2} × ${w1}) = ${d2} days.` };
      },
      h => {
        let a, b, c, T;
        do { a = h.int(3, 20); b = h.int(3, 20); c = h.int(4, 40); T = 1 / (1 / a + 1 / b - 1 / c); } while (a === b || c === a || c === b || !(T > 0) || Math.abs(T - Math.round(T)) > 1e-9 || T > 30);
        return { t: 'Pipes and cisterns', q: `Two pipes fill a tank in ${a} and ${b} hours, and a third pipe empties it in ${c} hours. If all three are opened, how long will the tank take to fill?`, a: Math.round(T), u: ' hours', x: [Math.round((a * b) / (a + b)), Math.round(T) + 2, c - Math.min(a, b)], ex: `Net per hour = 1/${a} + 1/${b} ${MINUS} 1/${c} = 1/${Math.round(T)}, so ${Math.round(T)} hours.` };
      },
    ],
  };

  /* ---------- 13. Time, Speed & Distance (trains, boats) ---------- */
  const SPEED = {
    easy: [
      h => {
        if (h.chance(0.5)) { const v = 18 * h.int(1, 8); return { t: 'Unit conversion', q: `What is ${v} km/h in metres per second?`, a: (v * 5) / 18, u: ' m/s', x: [(v * 18) / 5, v / 3.6 + 2, v / 2], ex: `Multiply by 5/18: ${v} × 5/18 = ${(v * 5) / 18} m/s.` }; }
        const v = 5 * h.int(2, 10);
        return { t: 'Unit conversion', q: `What is ${v} m/s in km/h?`, a: (v * 18) / 5, u: ' km/h', x: [(v * 5) / 18, v * 3, (v * 18) / 5 + 6], ex: `Multiply by 18/5: ${v} × 18/5 = ${(v * 18) / 5} km/h.` };
      },
      h => {
        const s = 5 * h.int(6, 24), t = h.int(2, 8), d = s * t;
        if (h.chance(0.5)) return { t: 'Speed, distance, time', q: `A car travels ${d} km in ${t} hours. What is its speed?`, a: s, u: ' km/h', x: [d - t, s + 5, d / (t + 1)], ex: `Speed = distance ÷ time = ${d} ÷ ${t} = ${s} km/h.` };
        return { t: 'Speed, distance, time', q: `How long does a bus take to cover ${d} km at ${s} km/h?`, a: t, u: ' hours', x: [t + 1, s / t, t * 2], ex: `Time = distance ÷ speed = ${d} ÷ ${s} = ${t} hours.` };
      },
    ],
    medium: [
      h => {
        const [u, v, s] = h.pick(AVG_SPEED);
        return { t: 'Average speed', q: `A man goes to a place at ${u} km/h and returns along the same road at ${v} km/h. What is his average speed for the whole journey?`, a: s, u: ' km/h', x: [(u + v) / 2, s + 2, v - u], ex: `For equal distances, average speed = 2uv/(u + v) = 2 × ${u} × ${v} ÷ ${u + v} = ${s} km/h (not the simple average ${num((u + v) / 2)}).` };
      },
      h => {
        const s = 18 * h.int(2, 6), ms = (s * 5) / 18, t = h.int(6, 30), L = ms * t;
        return { t: 'Trains: crossing a pole', q: `A train ${L} m long passes a signal pole in ${t} seconds. What is its speed in km/h?`, a: s, u: ' km/h', x: [ms, s + 18, Math.round(L / t * 3)], ex: `Speed = ${L} ÷ ${t} = ${ms} m/s = ${ms} × 18/5 = ${s} km/h.` };
      },
      h => {
        const s = 18 * h.int(2, 6), ms = (s * 5) / 18, t = h.int(12, 40), total = ms * t, L = 10 * h.int(5, Math.max(5, Math.floor(total / 20))), P = total - L;
        if (P <= 0) return null;
        return { t: 'Trains: crossing a platform', q: `A train ${L} m long, running at ${s} km/h, crosses a platform in ${t} seconds. How long is the platform?`, a: P, u: ' m', x: [total, L, P + ms], ex: `In ${t} s it covers ${ms} × ${t} = ${total} m = train + platform, so the platform is ${total} ${MINUS} ${L} = ${P} m.` };
      },
      h => {
        const u = h.int(8, 20), v = h.int(1, 5), d = (u + v) * h.int(2, 6);
        return { t: 'Boats and streams', q: `A boat’s speed in still water is ${u} km/h and the stream flows at ${v} km/h. How long will it take to go ${d} km downstream?`, a: d / (u + v), u: ' hours', x: [Math.round((d / (u - v)) * 100) / 100, d / u, d / (u + v) + 1], ex: `Downstream speed = ${u} + ${v} = ${u + v} km/h; ${d} ÷ ${u + v} = ${d / (u + v)} hours.` };
      },
    ],
    hard: [
      h => {
        const opposite = h.chance(0.6);
        let s1, s2, rel;
        do { s1 = 6 * h.int(5, 15); s2 = 6 * h.int(5, 15); rel = opposite ? s1 + s2 : s1 - s2; } while (rel <= 0 || rel % 18);
        const ms = (rel * 5) / 18, t = h.int(8, 30), total = ms * t, L1 = 10 * h.int(5, Math.max(5, Math.floor(total / 20))), L2 = total - L1;
        if (L2 <= 0) return null;
        const other = (Math.abs(opposite ? s1 - s2 : s1 + s2) * 5) / 18; // the wrong relative speed
        return { t: opposite ? 'Trains: opposite directions' : 'Trains: same direction', q: `Two trains, ${L1} m and ${L2} m long, run on parallel tracks ${opposite ? 'towards each other' : 'in the same direction'} at ${s1} km/h and ${s2} km/h. How long will they take to cross each other completely?`, a: t, u: ' seconds', x: [other ? Math.round(total / other) : t * 2, t + 3, Math.round(L1 / ms)], ex: `Relative speed = ${s1} ${opposite ? '+' : MINUS} ${s2} = ${rel} km/h = ${ms} m/s. Distance = ${L1} + ${L2} = ${total} m, so ${total} ÷ ${ms} = ${t} s.` };
      },
      h => {
        const u = h.int(6, 20), v = h.int(1, Math.min(5, u - 2)), t1 = h.int(2, 6), t2 = h.int(2, 6), d1 = (u + v) * t1, d2 = (u - v) * t2, askStream = h.chance(0.5);
        return { t: 'Boats and streams', q: `A boat goes ${d1} km downstream in ${t1} hours and ${d2} km upstream in ${t2} hours. What is the speed of ${askStream ? 'the stream' : 'the boat in still water'}?`, a: askStream ? v : u, u: ' km/h', x: askStream ? [u, v + 1, (u + v) / 2] : [v, u + v, u + 1], ex: `Downstream ${d1} ÷ ${t1} = ${u + v} km/h, upstream ${d2} ÷ ${t2} = ${u - v} km/h. Boat = (${u + v} + ${u - v}) ÷ 2 = ${u}; stream = (${u + v} ${MINUS} ${u - v}) ÷ 2 = ${v}.` };
      },
      h => {
        let s1, s2, late, early, d;
        do { s1 = h.int(3, 10); s2 = s1 + h.int(1, 4); late = h.pick([5, 6, 10, 12, 15]); early = h.pick([5, 6, 10, 12, 15]); d = (s1 * s2 * (late + early)) / (60 * (s2 - s1)); } while (!Number.isInteger(d) || d > 40);
        return { t: 'Late and early', q: `Walking at ${s1} km/h a boy reaches school ${late} minutes late; at ${s2} km/h he is ${early} minutes early. How far is the school?`, a: d, u: ' km', x: [d + 1, (s1 + s2) * (late + early) / 60, d * 2], ex: `The time difference is ${late + early} min = ${frac(late + early, 60)} h. d/${s1} ${MINUS} d/${s2} = ${frac(late + early, 60)} gives d = ${d} km.` };
      },
      h => {
        let x, s1, s2, run;
        do { x = 100 * h.int(1, 6); s1 = h.int(6, 12); s2 = s1 + h.int(1, 4); run = (x * s1) / (s2 - s1); } while (!Number.isInteger(run) || run > 3000);
        return { t: 'Chasing', q: `A thief is ${x} m ahead of a policeman. The thief runs at ${s1} km/h and the policeman at ${s2} km/h. How far will the thief have run when he is caught?`, a: run, u: ' m', x: [run + x, x * s2 / (s2 - s1) - x + 100, run / 2], ex: `The policeman gains ${s2 - s1} km/h. Time to close ${x} m: the thief runs ${s1}/${s2 - s1} × ${x} = ${run} m.` };
      },
    ],
  };

  /* ---------- 14. Mensuration ---------- */
  const PI = '(Use π = 22/7.)';
  const MENSURATION = {
    easy: [
      h => {
        const l = h.int(5, 40), b = h.int(3, l), area = h.chance(0.5);
        return area ? { t: 'Rectangles', q: `What is the area of a rectangle ${l} m long and ${b} m wide?`, a: l * b, u: ' m²', x: [2 * (l + b), l * b + l, (l + b) * 2 + 10], ex: `Area = length × breadth = ${l} × ${b} = ${l * b} m².` }
          : { t: 'Rectangles', q: `What is the perimeter of a rectangle ${l} m long and ${b} m wide?`, a: 2 * (l + b), u: ' m', x: [l * b, l + b, 2 * (l + b) + 2], ex: `Perimeter = 2(l + b) = 2 × (${l} + ${b}) = ${2 * (l + b)} m.` };
      },
      h => {
        const d = 2 * h.int(3, 20);
        return { t: 'Squares', q: `The diagonal of a square is ${d} cm. What is its area?`, a: (d * d) / 2, u: ' cm²', x: [d * d, (d * d) / 4, d * 4], ex: `Area of a square = diagonal² ÷ 2 = ${d}² ÷ 2 = ${(d * d) / 2} cm².` };
      },
      h => {
        const a = h.int(2, 15), vol = h.chance(0.5);
        return vol ? { t: 'Cubes', q: `What is the volume of a cube with edge ${a} cm?`, a: a ** 3, u: ' cm³', x: [6 * a * a, a * a, a ** 3 + a], ex: `Volume = a³ = ${a}³ = ${a ** 3} cm³.` }
          : { t: 'Cubes', q: `What is the total surface area of a cube with edge ${a} cm?`, a: 6 * a * a, u: ' cm²', x: [a ** 3, 4 * a * a, 6 * a], ex: `Surface area = 6a² = 6 × ${a * a} = ${6 * a * a} cm².` };
      },
    ],
    medium: [
      h => {
        const r = 7 * h.int(1, 6), area = h.chance(0.5);
        return area ? { t: 'Circles', q: `What is the area of a circle of radius ${r} cm? ${PI}`, a: (22 * r * r) / 7, u: ' cm²', x: [(44 * r) / 7, (22 * r * r * 4) / 7, (22 * r * r) / 7 + 22], ex: `Area = πr² = 22/7 × ${r} × ${r} = ${(22 * r * r) / 7} cm².` }
          : { t: 'Circles', q: `The circumference of a circle is ${(44 * r) / 7} cm. What is its radius? ${PI}`, a: r, u: ' cm', x: [2 * r, r + 7, r / 2 + 1], ex: `2πr = ${(44 * r) / 7}, so r = ${(44 * r) / 7} × 7 ÷ 44 = ${r} cm.` };
      },
      h => {
        const r = 7 * h.int(1, 3), H = h.int(3, 20);
        return { t: 'Cylinders', q: `What is the volume of a cylinder with radius ${r} cm and height ${H} cm? ${PI}`, a: (22 * r * r * H) / 7, u: ' cm³', x: [(44 * r * H) / 7, (22 * r * r * H) / 21, (22 * r * r * H) / 7 + 22], ex: `Volume = πr²h = 22/7 × ${r * r} × ${H} = ${(22 * r * r * H) / 7} cm³.` };
      },
      h => {
        const l = h.int(20, 90), b = h.int(10, l), rate = h.pick([5, 8, 10, 12, 15, 20, 25]), P = 2 * (l + b);
        return { t: 'Cost problems', q: `What is the cost of fencing a rectangular field ${l} m by ${b} m at ₹${rate} per metre?`, a: P * rate, pre: '₹', x: [l * b * rate, (l + b) * rate, P * rate + rate * 10], ex: `Perimeter = 2(${l} + ${b}) = ${P} m; cost = ${P} × ${rate} = ${rs(P * rate)}.` };
      },
    ],
    hard: [
      h => {
        const r = 7 * h.int(1, 3), H = 3 * h.int(2, 8), V = (22 * r * r * H) / 21;
        return { t: 'Cones', q: `What is the volume of a cone with base radius ${r} cm and height ${H} cm? ${PI}`, a: V, u: ' cm³', x: [V * 3, (22 * r * H) / 7, V + 22], ex: `Volume = ⅓πr²h = ⅓ × 22/7 × ${r * r} × ${H} = ${V} cm³.` };
      },
      h => {
        const r = 7 * h.int(1, 4), S = (88 * r * r) / 7;
        return { t: 'Spheres', q: `What is the surface area of a sphere of radius ${r} cm? ${PI}`, a: S, u: ' cm²', x: [(22 * r * r) / 7, (88 * r * r * r) / 21, S / 2], ex: `Surface area = 4πr² = 4 × 22/7 × ${r * r} = ${S} cm².` };
      },
      h => {
        const [p, inc] = h.pick([[10, 21], [20, 44], [30, 69], [50, 125], [40, 96]]);
        return { t: 'Percentage change in area', q: `If the radius of a circle increases by ${p}%, by what percent does its area increase?`, a: inc, u: '%', x: [2 * p, p, inc + 4], ex: `Area goes with r², so it becomes ${num(1 + p / 100)}² = ${num((1 + p / 100) ** 2)} times: an increase of ${inc}%.` };
      },
      h => {
        const [x, y, z, d] = h.pick(ROD), [c, b, a] = [x, y, z].sort((p, q) => p - q), k = h.int(1, 4);
        return { t: 'Longest rod in a room', q: `A room is ${a * k} m long, ${b * k} m wide and ${c * k} m high. What is the length of the longest rod that fits in it?`, a: d * k, u: ' m', x: [(a + b + c) * k, Math.round(Math.sqrt(a * a + b * b) * k), (d + 1) * k], ex: `Longest rod = √(l² + b² + h²) = √(${(a * k) ** 2} + ${(b * k) ** 2} + ${(c * k) ** 2}) = √${(d * k) ** 2} = ${d * k} m.` };
      },
      h => {
        const [p, q] = h.pick([[20, 20], [10, 10], [25, 20], [50, 20], [20, 10], [30, 10], [40, 25], [10, 20]]), net = p - q - (p * q) / 100;
        return { t: 'Percentage change in area', q: `The length of a rectangle is increased by ${p}% and its breadth decreased by ${q}%. What is the change in its area?`, a: change(net), w: [change(p - q), change(-net), change(net + (net >= 0 ? 2 : -2)), change(net === 0 ? 1 : 0)], ex: `Change = ${p} ${MINUS} ${q} ${MINUS} (${p} × ${q})/100 = ${num(net)}%: ${change(net).toLowerCase()}.` };
      },
    ],
  };

  /* ---------- 15. Permutations & Combinations ---------- */
  const WORDS_DISTINCT = ['TIGER', 'MANGO', 'PLANET', 'FRIEND', 'BLACK', 'QUIZ', 'CHAIR', 'FLOWER', 'MOTHER', 'NUMBER', 'CANDY'];
  const WORDS_REPEAT = ['BANANA', 'APPLE', 'LETTER', 'SCHOOL', 'COFFEE', 'BALLOON', 'PEPPER', 'ALLAHABAD', 'SUCCESS', 'COMMITTEE'];
  const WORDS_VOWEL = ['LEADING', 'ORANGE', 'MOBILE', 'SOFTWARE', 'DAUGHTER', 'PENCIL', 'EQUATION', 'CORPORATION', 'ARTICLE', 'DETAIL'];
  const counts = s => s.split('').reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
  const arrangements = s => Object.values(counts(s)).reduce((v, k) => v / fact(k), fact(s.length));
  const repeatsText = s => Object.entries(counts(s)).filter(([, k]) => k > 1).map(([c, k]) => `${c} ×${k}`).join(', ');
  const PNC = {
    easy: [
      h => {
        const n = h.int(3, 7);
        return { t: 'Arrangements', q: `In how many ways can ${n} different books be arranged on a shelf?`, a: fact(n), x: [n * n, fact(n - 1), fact(n) / 2], ex: `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${fact(n)}.` };
      },
      h => {
        const n = h.int(5, 12), r = h.int(2, 4);
        return { t: 'Selections', q: `In how many ways can ${r} students be chosen from ${n} for a team?`, a: nCr(n, r), x: [nCr(n, r) * fact(r), n * r, nCr(n, r - 1)], ex: `Order doesn’t matter: ${n}C${r} = ${nCr(n, r)}.` };
      },
      h => {
        const w = h.pick(WORDS_DISTINCT);
        return { t: 'Arranging letters', q: `How many different arrangements can be made from the letters of the word ${w}?`, a: arrangements(w), x: [fact(w.length - 1), w.length ** 2, fact(w.length) / 2], ex: `${w.length} different letters: ${w.length}! = ${arrangements(w)}.` };
      },
    ],
    medium: [
      h => {
        const w = h.pick(WORDS_REPEAT), ans = arrangements(w);
        return { t: 'Letters with repeats', q: `How many different arrangements can be made from the letters of the word ${w}?`, a: ans, x: [fact(w.length), ans * 2, ans / 2], ex: `${w.length} letters with repeats (${repeatsText(w)}): ${w.length}! ÷ (${Object.values(counts(w)).filter(k => k > 1).map(k => `${k}!`).join(' × ')}) = ${ans}.` };
      },
      h => {
        const M = h.int(5, 9), W = h.int(4, 7), a = h.int(2, 3), b = h.int(1, 3), ans = nCr(M, a) * nCr(W, b);
        return { t: 'Committees', q: `A committee of ${a} men and ${b} ${b === 1 ? 'woman' : 'women'} is to be formed from ${M} men and ${W} women. In how many ways can this be done?`, a: ans, x: [nCr(M, a) + nCr(W, b), nCr(M + W, a + b), ans * 2], ex: `${M}C${a} × ${W}C${b} = ${nCr(M, a)} × ${nCr(W, b)} = ${ans}.` };
      },
      h => {
        const zero = h.chance(0.5), k = h.int(5, 7), digits = zero ? Array.from({ length: k }, (_, i) => i) : Array.from({ length: k }, (_, i) => i + 1), ans = zero ? (k - 1) * (k - 1) * (k - 2) : k * (k - 1) * (k - 2);
        return { t: 'Forming numbers', q: `How many 3-digit numbers can be formed from the digits ${digits.join(', ')} if no digit is repeated?`, a: ans, x: [k * (k - 1) * (k - 2) === ans ? ans + k : k * (k - 1) * (k - 2), k ** 3, nCr(k, 3)], ex: zero ? `The first digit can’t be 0: ${k - 1} choices, then ${k - 1}, then ${k - 2}: ${k - 1} × ${k - 1} × ${k - 2} = ${ans}.` : `${k} × ${k - 1} × ${k - 2} = ${ans}.` };
      },
      h => {
        const n = h.int(6, 25);
        return { t: 'Handshakes', q: `At a party, each of ${n} people shakes hands with everyone else once. How many handshakes are there?`, a: nCr(n, 2), x: [n * (n - 1), n * 2, nCr(n, 2) + n], ex: `Every pair shakes once: ${n}C2 = ${n} × ${n - 1} ÷ 2 = ${nCr(n, 2)}.` };
      },
    ],
    hard: [
      h => {
        const w = h.pick(WORDS_VOWEL), vow = w.split('').filter(c => 'AEIOU'.includes(c)).join(''), con = w.split('').filter(c => !'AEIOU'.includes(c)).join('');
        const units = arrangements(con + '#'), inside = arrangements(vow), ans = units * inside;
        return { t: 'Letters kept together', q: `In how many ways can the letters of the word ${w} be arranged so that the vowels always come together?`, a: ans, x: [arrangements(w), units, inside * fact(con.length)], ex: `Treat the vowels ${vow.split('').join(', ')} as one block: ${con.length + 1} units → ${units} ways; the vowels among themselves → ${inside} ways. ${units} × ${inside} = ${ans}.` };
      },
      h => {
        const n = h.int(4, 8);
        return { t: 'Circular arrangements', q: `In how many ways can ${n} people sit around a round table?`, a: fact(n - 1), x: [fact(n), fact(n - 1) / 2, fact(n - 2)], ex: `Fix one person; arrange the rest: (${n} ${MINUS} 1)! = ${fact(n - 1)}.` };
      },
      h => {
        const n = h.int(6, 20);
        return { t: 'Geometry counting', q: `How many diagonals does a polygon with ${n} sides have?`, a: (n * (n - 3)) / 2, x: [nCr(n, 2), n * (n - 3), (n * (n - 3)) / 2 + n], ex: `Diagonals = n(n ${MINUS} 3)/2 = ${n} × ${n - 3} ÷ 2 = ${(n * (n - 3)) / 2}.` };
      },
      h => {
        const n = h.int(8, 15), k = h.int(3, 5), ans = nCr(n, 3) - nCr(k, 3);
        return { t: 'Geometry counting', q: `There are ${n} points in a plane, of which exactly ${k} are in a straight line (no other three are). How many triangles can be formed?`, a: ans, x: [nCr(n, 3), ans - 1, nCr(n - k, 3)], ex: `${n}C3 ${MINUS} ${k}C3 = ${nCr(n, 3)} ${MINUS} ${nCr(k, 3)} = ${ans} (three points on the line make no triangle).` };
      },
    ],
  };

  /* ---------- 16. Probability ---------- */
  const DIE_EVENTS = [['an even number', 3], ['a prime number', 3], ['a multiple of 3', 2], ['a number greater than 4', 2], ['a number less than 3', 2], ['a number greater than 1', 5], ['a 6', 1]];
  const CARD_EVENTS = [['a king', 4, 'There are 4 kings'], ['a heart', 13, 'There are 13 hearts'], ['a face card (J, Q or K)', 12, 'There are 12 face cards'], ['a red card', 26, 'There are 26 red cards'], ['a king or a heart', 16, '13 hearts + 3 other kings = 16'], ['a red ace', 2, 'There are 2 red aces'], ['a black face card', 6, 'There are 6 black face cards'], ['a spade or an ace', 16, '13 spades + 3 other aces = 16']];
  const sumWays = s => 6 - Math.abs(s - 7);
  const PROB = {
    easy: [
      h => {
        const [ev, k] = h.pick(DIE_EVENTS);
        return { t: 'Dice', q: `A fair die is rolled once. What is the probability of getting ${ev}?`, a: frac(k, 6), w: probW(k, 6, h, [frac(6 - k, 6), frac(k, 12)]), ex: `${k} of the 6 outcomes ${k === 1 ? 'works' : 'work'}, so the probability is ${frac(k, 6)}.` };
      },
      h => {
        const r = h.int(2, 9), b = h.int(2, 9), g = h.int(1, 6), n = r + b + g, not = h.chance(0.4);
        return not ? { t: 'Drawing balls', q: `A bag has ${r} red, ${b} blue and ${g} green balls. One ball is drawn at random. What is the probability that it is not blue?`, a: frac(r + g, n), w: probW(r + g, n, h, [frac(b, n), frac(r, n)]), ex: `${r + g} of the ${n} balls are not blue: ${frac(r + g, n)}.` }
          : { t: 'Drawing balls', q: `A bag has ${r} red, ${b} blue and ${g} green balls. One ball is drawn at random. What is the probability that it is red?`, a: frac(r, n), w: probW(r, n, h, [frac(r, b + g), frac(b, n)]), ex: `${r} of the ${n} balls are red: ${frac(r, n)}.` };
      },
      h => {
        const [q, n, d, why] = h.pick([['two coins are tossed. What is the probability of exactly one head', 2, 4, 'HT and TH: 2 of 4 outcomes'], ['two coins are tossed. What is the probability of at least one head', 3, 4, 'HH, HT, TH: 3 of 4 outcomes'], ['three coins are tossed. What is the probability of exactly two heads', 3, 8, 'HHT, HTH, THH: 3 of 8 outcomes'], ['three coins are tossed. What is the probability of at least one head', 7, 8, 'all but TTT: 7 of 8 outcomes'], ['three coins are tossed. What is the probability that all show the same face', 2, 8, 'HHH and TTT: 2 of 8 outcomes']]);
        return { t: 'Coins', q: `${q[0].toUpperCase() + q.slice(1)}?`, a: frac(n, d), w: probW(n, d, h, [frac(d - n, d), frac(1, d)]), ex: `${why[0].toUpperCase() + why.slice(1)} = ${frac(n, d)}.` };
      },
      h => {
        const N = h.pick([20, 25, 30, 40, 50, 60]), k = h.pick([3, 4, 5, 6, 7]), mult = Math.floor(N / k);
        return { t: 'Picking a number', q: `A number is picked at random from 1 to ${N}. What is the probability that it is a multiple of ${k}?`, a: frac(mult, N), w: probW(mult, N, h, [frac(1, k), frac(mult - 1, N), frac(mult + 1, N)]), ex: `Multiples of ${k} up to ${N}: ${N} ÷ ${k} → ${mult}. Probability = ${mult}/${N} = ${frac(mult, N)}.` };
      },
    ],
    medium: [
      h => {
        const s = h.int(3, 11), k = sumWays(s);
        return { t: 'Two dice', q: `Two fair dice are thrown. What is the probability that the total is ${s}?`, a: frac(k, 36), w: probW(k, 36, h, [frac(1, 11), frac(k, 12), frac(k + 1, 36)]), ex: `${k} of the 36 outcomes give ${s} (${Array.from({ length: 6 }, (_, i) => i + 1).filter(a => s - a >= 1 && s - a <= 6).map(a => `${a}+${s - a}`).join(', ')}): ${frac(k, 36)}.` };
      },
      h => {
        const [ev, k, why] = h.pick(CARD_EVENTS);
        return { t: 'Cards', q: `A card is drawn at random from a pack of 52. What is the probability that it is ${ev}?`, a: frac(k, 52), w: probW(k, 52, h, [frac(k + 1, 52), frac(k, 13)]), ex: `${why}: ${k}/52 = ${frac(k, 52)}.` };
      },
      h => {
        const r = h.int(3, 8), b = h.int(2, 8), n = r + b, num2 = nCr(r, 2), den = nCr(n, 2);
        return { t: 'Drawing two at once', q: `A bag has ${r} red and ${b} blue balls. Two balls are drawn at random. What is the probability that both are red?`, a: frac(num2, den), w: probW(num2, den, h, [frac(r * r, n * n), frac(r, n), frac(nCr(b, 2), den)]), ex: `${r}C2 ÷ ${n}C2 = ${num2} ÷ ${den} = ${frac(num2, den)}.` };
      },
    ],
    hard: [
      h => {
        const [ev, k, why] = h.pick([['a doublet (both dice the same)', 6, '6 doublets'], ['a total of at least 10', 6, '4+6, 5+5, 6+4, 5+6, 6+5, 6+6'], ['an even product', 27, '36 − 9 outcomes where both are odd'], ['a prime total', 15, 'totals 2, 3, 5, 7, 11: 1 + 2 + 4 + 6 + 2'], ['a total of at most 5', 10, 'totals 2 to 5: 1 + 2 + 3 + 4']]);
        return { t: 'Two dice', q: `Two fair dice are thrown. What is the probability of getting ${ev}?`, a: frac(k, 36), w: probW(k, 36, h, [frac(36 - k, 36), frac(k, 12)]), ex: `${why[0].toUpperCase() + why.slice(1)}: ${k} of 36 outcomes = ${frac(k, 36)}.` };
      },
      h => {
        const r = h.int(3, 8), b = h.int(2, 8), n = r + b, den = nCr(n, 2);
        return { t: 'Drawing two at once', q: `A bag has ${r} red and ${b} blue balls. Two balls are drawn at random. What is the probability that one is red and one is blue?`, a: frac(r * b, den), w: probW(r * b, den, h, [frac(2 * r * b, n * n), frac(r, n), frac(nCr(r, 2), den)]), ex: `${r} × ${b} = ${r * b} mixed pairs out of ${n}C2 = ${den}: ${frac(r * b, den)}.` };
      },
      h => {
        const [ev, k, why] = h.pick([['both aces', nCr(4, 2), '4C2 = 6'], ['both hearts', nCr(13, 2), '13C2 = 78'], ['both red', nCr(26, 2), '26C2 = 325'], ['one king and one queen', 16, '4 × 4 = 16'], ['both face cards', nCr(12, 2), '12C2 = 66']]);
        return { t: 'Cards', q: `Two cards are drawn at random from a pack of 52. What is the probability that they are ${ev}?`, a: frac(k, 1326), w: probW(k, 1326, h, [frac(k, 2652), frac(k * 2, 1326)]), ex: `Favourable ${why}; all pairs 52C2 = 1326. ${k}/1326 = ${frac(k, 1326)}.` };
      },
      h => {
        const [pa, pb] = h.shuffle([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5]]).slice(0, 2);
        const d = pa[1] * pb[1], fail = (pa[1] - pa[0]) * (pb[1] - pb[0]), ans = frac(d - fail, d);
        return { t: 'Independent events', q: `A can solve a problem with probability ${pa[0]}/${pa[1]} and B with probability ${pb[0]}/${pb[1]}, independently. What is the probability that the problem gets solved?`, a: ans, w: probW(d - fail, d, h, [frac(pa[0] * pb[0], d), frac(fail, d), frac(pa[0] * pb[1] + pb[0] * pa[1], 2 * d)]), ex: `P(neither solves) = ${frac(pa[1] - pa[0], pa[1])} × ${frac(pb[1] - pb[0], pb[1])} = ${frac(fail, d)}, so P(solved) = 1 ${MINUS} ${frac(fail, d)} = ${ans}.` };
      },
    ],
  };

  /* ---------- Registration (learning order) ---------- */
  // Aptitude problems need working out, so they get more time than plain maths.
  const TX = { easy: 1.6, medium: 2.2, hard: 2.8 };
  const TOPICS = [
    ['apt-number', 'Number System', NUMBER], ['apt-hcf', 'HCF & LCM', HCF], ['apt-simplify', 'Simplification', SIMPLIFY],
    ['apt-series', 'Number Series', SERIES], ['apt-percent', 'Percentages', PERCENT], ['apt-profit', 'Profit & Loss', PROFIT],
    ['apt-interest', 'Interest', INTEREST], ['apt-ratio', 'Ratio & Partnership', RATIO], ['apt-average', 'Averages', AVERAGE],
    ['apt-ages', 'Ages', AGES], ['apt-mixture', 'Mixtures & Alligation', MIXTURE], ['apt-work', 'Time & Work', WORK_T],
    ['apt-speed', 'Speed & Distance', SPEED], ['apt-mensuration', 'Mensuration', MENSURATION], ['apt-pnc', 'Permutations & Combinations', PNC],
    ['apt-probability', 'Probability', PROB],
  ];
  // Quantities here are positive, so a slip that comes out negative (100 − 300 = −200%) is never offered.
  const positive = make => h => {
    const s = make(h);
    if (s && typeof s.a === 'number' && s.a > 0 && s.x) s.x = s.x.filter(v => v > 0);
    return s;
  };
  for (const [kind, topic, makers] of TOPICS) {
    const safe = Object.fromEntries(Object.entries(makers).map(([lv, list]) => [lv, list.map(positive)]));
    QM.register(kind, safe, { topic, tx: TX, group: 'apt-mix' });
  }
})();
