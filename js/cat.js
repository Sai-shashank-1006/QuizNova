/* QuizNova — CAT problem generator (Quantitative Ability, Data Interpretation and Logical Reasoning).
 *
 * Adds CAT topics to QUIZ_MATHS (js/maths.js), in learning order. Problems are built from random numbers with the
 * answer worked out first; data-interpretation sets come with a table, and every seating puzzle is checked by trying
 * all arrangements, so its clues have exactly one solution. Typed answers (CAT's TITA questions) come up often.
 * VARC (verbal ability) can't be generated this way, so the app asks the AI for it instead.
 */
(() => {
  'use strict';
  const QM = window.QUIZ_MATHS;
  if (!QM || !QM.register) return;
  const { num, frac, gcd, lcm, sup, MINUS, fact, nCr, signed, distinct, probW, ratio, ratioW } = QM.helpers;

  /* ---------- Helpers ---------- */
  const sum = a => a.reduce((s, v) => s + v, 0);
  const round = (v, p) => Math.round(v * 10 ** p) / 10 ** p;
  const rs = v => `₹${num(v)}`;
  const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const sub = v => String(v).replace(/\d/g, c => SUB[c]);
  const terms = list => {
    let s = '';
    for (const [c, v] of list) {
      if (!c) continue;
      const t = (Math.abs(c) === 1 && v ? '' : num(Math.abs(c))) + v;
      s += s ? (c < 0 ? ` ${MINUS} ` : ' + ') + t : (c < 0 ? MINUS : '') + t;
    }
    return s || '0';
  };
  const modPow = (b, e, m) => { let r = 1 % m; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; };
  const legendre = (n, p) => { let s = 0; for (let q = p; q <= n; q *= p) s += Math.floor(n / q); return s; };
  const factorize = n => { const f = {}; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f[p] = (f[p] || 0) + 1; n /= p; } if (n > 1) f[n] = (f[n] || 0) + 1; return f; };
  const divisors = n => { let c = 0; for (let d = 1; d <= n; d++) if (n % d === 0) c++; return c; };
  const pct = v => `${num(v)}%`;
  const NAMES = ['Arun', 'Bina', 'Chetan', 'Deepa', 'Esha', 'Farhan', 'Gita'];
  const fromApt = (kinds, lv) => kinds.flatMap(k => (QM.makersOf(k) || {})[lv] || []);
  // Combos whose answers come out whole, found once.
  const MARKUP = []; // mark-up m%, discount d%, w grams given per kg → profit p%
  for (const m of [20, 25, 40, 50, 60]) for (const d of [10, 20, 25]) for (const w of [600, 750, 800, 900, 960]) { const p = ((100 + m) * (100 - d) * 10) / w - 100; if (Number.isInteger(p) && p > 0) MARKUP.push([m, d, w, p]); }
  const RACES = []; // A beats B by x m and B beats C by y m in 100 m → A beats C by z m
  for (let x = 4; x <= 30; x++) for (let y = 4; y <= 30; y++) if (((100 - x) * (100 - y)) % 100 === 0) RACES.push([x, y, 100 - ((100 - x) * (100 - y)) / 100]);
  const AVG3 = []; // equal distances at u, v, w km/h → average speed s
  for (let u = 10; u <= 60; u += 5) for (let v = u + 5; v <= 90; v += 5) for (let w = v + 5; w <= 120; w += 5) { const s = 3 / (1 / u + 1 / v + 1 / w); if (Math.abs(s - Math.round(s)) < 1e-9) AVG3.push([u, v, w, Math.round(s)]); }
  const LEAKS = []; // fills in a hours, with a leak in b hours → leak empties a full tank in c hours
  for (let a = 2; a <= 15; a++) for (let b = a + 1; b <= 30; b++) { const c = (a * b) / (b - a); if (Number.isInteger(c) && c <= 120) LEAKS.push([a, b, c]); }

  /* ---------- 1. Arithmetic ---------- */
  const ARITH = {
    easy: fromApt(['apt-percent', 'apt-profit', 'apt-interest', 'apt-ratio', 'apt-mixture', 'apt-work', 'apt-speed', 'apt-average'], 'hard'),
    medium: [
      h => {
        const [m, d, w, p] = h.pick(MARKUP);
        return { t: 'Profit and discount', q: `A shopkeeper marks rice ${m}% above cost, gives a ${d}% discount, and also gives only ${w} g for every kilogram he charges for. What is his profit percent?`, a: p, u: '%', x: [m - d, round(((100 + m) * (100 - d)) / 100 - 100, 6), round(((100 + m) * (100 - d)) / 100 - 100 + (1000 - w) / 10, 6)],
          ex: `Take cost ₹100 per kg. He charges ${100 + m} × ${(100 - d) / 100} = ₹${num(((100 + m) * (100 - d)) / 100)} for goods that cost him ₹${w / 10}: profit = ${num(((100 + m) * (100 - d)) / 100)}/${w / 10} ${MINUS} 1 = ${p}%.` };
      },
      h => {
        const [t1, t2] = h.pick([[4, 9], [1, 4], [9, 16], [4, 25], [16, 25], [1, 9], [9, 25], [4, 16], [2, 8], [3, 12]]), t = Math.sqrt(t1 * t2);
        if (h.chance(0.5)) return { t: 'Relative speed', q: `Two trains start at the same time from P and Q towards each other. After they meet, they take ${t1} h and ${t2} h to reach Q and P respectively. After how many hours did they meet?`, a: t, u: ' hours', x: [(t1 + t2) / 2, t1 + t2, Math.abs(t2 - t1)],
          ex: `If they meet after t hours, t² = ${t1} × ${t2}, so t = √${t1 * t2} = ${t} hours.` };
        const ans = ratio(Math.sqrt(t2) * 10, Math.sqrt(t1) * 10);
        return { t: 'Relative speed', q: `Two trains start at the same time from P and Q towards each other. After they meet, they take ${t1} h and ${t2} h to reach Q and P respectively. What is the ratio of their speeds (P’s train : Q’s train)?`, a: ans, w: ratioW(ans, h, [ratio(t2, t1), ratio(t1, t2), ratio(Math.sqrt(t1) * 10, Math.sqrt(t2) * 10)]),
          ex: `Speed ratio = √(time of the second ÷ time of the first) = √(${t2}/${t1}) = ${ans}.` };
      },
      h => {
        const [x, y, z] = h.pick(RACES);
        return { t: 'Races', q: `In a 100 m race, A beats B by ${x} m and B beats C by ${y} m. By how many metres does A beat C?`, a: z, u: ' m', x: [x + y, z + 1, Math.abs(x - y) || z - 2],
          ex: `When A runs 100, B runs ${100 - x}; when B runs 100, C runs ${100 - y}, so C runs ${100 - x} × ${(100 - y) / 100} = ${100 - z}. A wins by ${z} m.` };
      },
      h => {
        let a, b; do { a = h.int(6, 30); b = h.int(6, 30); } while (a === b);
        const g = gcd(a, b), parts = (a + b) / g, W = parts * 100 * h.int(2, 20), A = (W * (b / g)) / parts;
        return { t: 'Work and wages', q: `A can finish a job in ${a} days and B in ${b} days. They do it together and are paid ${rs(W)}. What is A’s share?`, a: A, pre: '₹', x: [W - A, W / 2, (W * a) / (a + b)],
          ex: `They earn in proportion to work done per day: 1/${a} : 1/${b} = ${b / g} : ${a / g}. A gets ${b / g}/${parts} × ${W} = ${rs(A)}.` };
      },
      h => {
        const cs = [h.pick([10, 20, -10, -20]), h.pick([10, 20, 25, -10, -20]), h.pick([10, 20, -10, -20, 50])], P = 1000 * h.int(10, 99);
        const f = cs.reduce((v, c) => v * (100 + c), 1), final = (P * f) / 1e6;
        if (!Number.isInteger(final)) return null;
        const word = c => (c > 0 ? `grows ${c}%` : `falls ${-c}%`);
        return { t: 'Successive change', q: `A town of ${P} people ${word(cs[0])} in the first year, ${word(cs[1])} in the second and ${word(cs[2])} in the third. What is its population after three years?`, a: final, x: [P + (P * sum(cs)) / 100, (P * cs.reduce((v, c) => v * (100 + c), 1)) / 1e6 + 100, Math.round(final * 1.01)],
          ex: `${P} × ${cs.map(c => num((100 + c) / 100)).join(' × ')} = ${final}.` };
      },
    ],
    hard: [
      h => {
        let L, a, b; do { a = h.int(2, 9); b = h.int(2, 9); L = 10 * h.int(10, 60); } while (a === b || L % a || L % b);
        const kind = h.pick(['same', 'opposite', 'start']), [ta, tb] = [L / a, L / b];
        if (kind === 'start') { const T = lcm(ta, tb); return { t: 'Circular tracks', q: `A and B run around a ${L} m circular track at ${a} m/s and ${b} m/s, starting together from the same point. After how many seconds do they first meet again at the starting point?`, a: T, u: ' s', x: [L / Math.abs(a - b), L / (a + b), ta * tb], ex: `One lap takes ${ta} s for A and ${tb} s for B; they are both at the start every LCM(${ta}, ${tb}) = ${T} s.` }; }
        const v = kind === 'same' ? Math.abs(a - b) : a + b, T = L / v;
        return { t: 'Circular tracks', q: `A and B start together from the same point of a ${L} m circular track at ${a} m/s and ${b} m/s, running in ${kind === 'same' ? 'the same direction' : 'opposite directions'}. After how many seconds do they first meet?`, a: T, u: ' s', noType: !Number.isInteger(round(T * 100, 6)), x: [L / (kind === 'same' ? a + b : Math.abs(a - b)), lcm(ta, tb), T * 2],
          ex: `${kind === 'same' ? 'The faster one must gain a full lap' : 'Together they must cover one lap'}: ${L} ÷ (${a} ${kind === 'same' ? MINUS : '+'} ${b}) = ${num(T)} s.` };
      },
      h => {
        const r = h.pick([10, 20]), k = h.int(1, 20), [P, x] = r === 10 ? [210 * 100 * k, 121 * 100 * k] : [220 * 100 * k, 144 * 100 * k];
        return { t: 'Instalments', q: `A loan of ${rs(P)} at ${r}% compound interest per year is repaid in two equal yearly instalments. How much is each instalment?`, a: x, pre: '₹', x: [P / 2, (P * (1 + r / 100)) / 2, ((P * (1 + r / 100) ** 2) / 2)],
          ex: `${P} = x/${num(1 + r / 100)} + x/${num((1 + r / 100) ** 2)}, so x = ${P} × ${num((1 + r / 100) ** 2)}/${num(2 + r / 100)} = ${rs(x)}.` };
      },
      h => {
        const [a, b, c] = h.pick(LEAKS);
        return { t: 'Pipes and leaks', q: `A pipe fills a tank in ${a} hours, but because of a leak it takes ${b} hours. How long would the leak take to empty a full tank?`, a: c, u: ' hours', x: [b - a, a + b, (a * b) / (a + b)], ex: `Leak rate = 1/${a} ${MINUS} 1/${b} = 1/${c} of the tank per hour, so ${c} hours.` };
      },
      h => {
        for (;;) {
          const a = h.int(4, 20), b = h.int(4, 20); if (a === b) continue;
          const W = lcm(a, b), ra = W / a, rb = W / b; let done = 0, day = 0;
          while (done < W) { done += day % 2 === 0 ? ra : rb; day++; }
          if (done !== W) continue;
          return { t: 'Alternate days', q: `A can do a job in ${a} days and B in ${b} days. They work on alternate days, A starting. In how many days is the job done?`, a: day, u: ' days', x: [(a * b) / (a + b), Math.round((2 * a * b) / (a + b)), day + 1].map(v => round(v, 2)),
            ex: `Take the job as ${W} units: A does ${ra} and B ${rb} a day, ${ra + rb} per two days. Day by day the job is finished at the end of day ${day}.` };
        }
      },
      h => {
        const [u, v, w, s] = h.pick(AVG3);
        return { t: 'Average speed', q: `A man covers three equal distances at ${u}, ${v} and ${w} km/h. What is his average speed for the whole journey?`, a: s, u: ' km/h', x: [round((u + v + w) / 3, 2), s + 2, v], ex: `For equal distances, average = 3/(1/${u} + 1/${v} + 1/${w}) = ${s} km/h.` };
      },
    ],
  };

  /* ---------- 2. Number System ---------- */
  const BASES = { 6: { 2: 1, 3: 1 }, 10: { 2: 1, 5: 1 }, 12: { 2: 2, 3: 1 }, 15: { 3: 1, 5: 1 }, 18: { 2: 1, 3: 2 }, 20: { 2: 2, 5: 1 }, 24: { 2: 3, 3: 1 }, 36: { 2: 2, 3: 2 } };
  const NUMSYS = {
    easy: [
      h => {
        const p = h.pick([2, 3, 5, 7]), n = h.int(20, 200), v = legendre(n, p), parts = [];
        for (let q = p; q <= n; q *= p) parts.push(Math.floor(n / q));
        return { t: 'Factorials', q: `What is the highest power of ${p} that divides ${n}!?`, a: v, x: [Math.floor(n / p), v + 1, Math.floor(n / p) + Math.floor(n / (p * p))].filter(x => x !== v),
          ex: `Legendre: ${parts.map((v2, i) => `⌊${n}/${p}${i ? sup(i + 1) : ''}⌋ = ${v2}`).join(', ')}; total ${v}.` };
      },
      h => {
        const a = h.int(1, 5), b = h.int(1, 4), c = h.int(0, 3), N = 2 ** a * 3 ** b * 5 ** c, kind = h.pick(['all', 'even', 'odd', 'square']);
        const v = { all: (a + 1) * (b + 1) * (c + 1), even: a * (b + 1) * (c + 1), odd: (b + 1) * (c + 1), square: (Math.floor(a / 2) + 1) * (Math.floor(b / 2) + 1) * (Math.floor(c / 2) + 1) }[kind];
        const why = { all: `(${a} + 1)(${b} + 1)(${c} + 1)`, even: `at least one 2: ${a} × (${b} + 1)(${c} + 1)`, odd: `no 2: (${b} + 1)(${c} + 1)`, square: `even exponents only: (${Math.floor(a / 2)} + 1)(${Math.floor(b / 2)} + 1)(${Math.floor(c / 2)} + 1)` }[kind];
        return { t: 'Factors', q: `How many ${{ all: '', even: 'even ', odd: 'odd ', square: 'perfect-square ' }[kind]}factors does ${N} have?`, a: v, x: [(a + 1) * (b + 1) * (c + 1), a * b * (c || 1), (b + 1) * (c + 1), v + 1].filter(x => x !== v),
          ex: `${N} = 2${sup(a)} × 3${sup(b)}${c ? ` × 5${sup(c)}` : ''}; ${why} = ${v}.` };
      },
      h => {
        const a = h.pick([2, 3, 7, 8, 9]), b = h.pick([3, 7, 9]), m = h.int(20, 99), n = h.int(20, 99), ua = modPow(a, m, 10), ub = modPow(b, n, 10), u = (ua + ub) % 10;
        return { t: 'Unit digits', q: `What is the unit digit of ${a}${sup(m)} + ${b}${sup(n)}?`, a: u, x: [ua, ub, (ua * ub) % 10, (u + 1) % 10].filter(x => x !== u), ex: `${a}${sup(m)} ends in ${ua} and ${b}${sup(n)} ends in ${ub} (unit digits repeat every 4), so the sum ends in ${u}.` };
      },
    ],
    medium: [
      h => {
        const a = h.pick([3, 7, 9, 11, 13, 17, 19, 21, 23, 27, 29, 31, 33, 37, 39, 41, 43, 47]), n = h.int(21, 999), r = n % 20, v = modPow(a, n, 100);
        return { t: 'Last two digits', q: `What are the last two digits of ${a}${sup(n)}?`, a: String(v).padStart(2, '0'), mono: true, w: distinct(String(v).padStart(2, '0'), [String(modPow(a, n % 10, 100)).padStart(2, '0'), String(modPow(a, n + 1, 100)).padStart(2, '0'), String((v + 50) % 100).padStart(2, '0'), String(modPow(a, n, 10)).padStart(2, '0')]),
          ex: `${a} is coprime to 100, so ${a}${sup(20)} ends in 01 and ${a}${sup(n)} ends like ${a}${sup(r || 20)} (${n} mod 20 = ${r}): ${String(v).padStart(2, '0')}.` };
      },
      h => {
        let m1, m2; do { m1 = h.int(4, 13); m2 = h.int(4, 13); } while (m1 >= m2 || gcd(m1, m2) !== 1);
        const r1 = h.int(1, m1 - 1), r2 = h.int(1, m2 - 1), three = h.chance(0.5); let N = three ? 100 : 1;
        while (N % m1 !== r1 || N % m2 !== r2) N++;
        return { t: 'Remainders', q: `What is the smallest ${three ? 'three-digit ' : ''}number that leaves remainder ${r1} when divided by ${m1} and ${r2} when divided by ${m2}?`, a: N, x: [N + m1 * m2, N - m1 * m2 > 0 ? N - m1 * m2 : N + m1, m1 * m2 + r1],
          ex: `Numbers ≡ ${r1} (mod ${m1}) are ${r1}, ${r1 + m1}, ${r1 + 2 * m1}, …; they repeat the remainder mod ${m2} every ${m1 * m2}. The first ${three ? 'three-digit ' : ''}one that is ≡ ${r2} (mod ${m2}) is ${N}.` };
      },
      h => {
        const b = h.int(2, 9), toDec = h.chance(0.5);
        if (toDec) { const v = h.int(b * b, b ** 4 - 1), s = v.toString(b); return { t: 'Number bases', q: `What is (${s})${sub(b)} in base 10?`, a: v, x: [parseInt(s, 10), v + b, parseInt(s, b + 1)].filter(x => x !== v), ex: `${s.split('').map((c, i) => `${c}×${b}${sup(s.length - 1 - i)}`).join(' + ')} = ${v}.` }; }
        const v = h.int(b * b, 400), ans = v.toString(b);
        return { t: 'Number bases', q: `What is ${v} written in base ${b}?`, a: ans, mono: true, w: distinct(ans, [(v + 1).toString(b), v.toString(b === 9 ? 8 : b + 1), ans.split('').reverse().join('').replace(/^0+(?=.)/, ''), (v - 1).toString(b), (v + b).toString(b)]), ex: `Divide ${v} by ${b} repeatedly and read the remainders upwards: ${ans}${sub(b)}.` };
      },
      h => {
        const b = +h.pick(Object.keys(BASES)), n = h.int(20, 120), f = BASES[b], parts = Object.entries(f).map(([p, e]) => [+p, e, Math.floor(legendre(n, +p) / e)]), v = Math.min(...parts.map(x => x[2]));
        return { t: 'Factorials', q: `How many zeros does ${n}! end with when written in base ${b}?`, a: v, x: [legendre(n, 5), ...parts.map(x => legendre(n, x[0]))].filter(x => x !== v),
          ex: `${b} = ${Object.entries(f).map(([p, e]) => `${p}${e > 1 ? sup(e) : ''}`).join(' × ')}. ${parts.map(([p, e, k]) => `${p}s in ${n}!: ${legendre(n, p)}${e > 1 ? `, ÷ ${e} → ${k}` : ''}`).join('; ')}. The smaller is ${v}.` };
      },
      h => {
        const p = h.pick([7, 11, 13, 17, 19]); let a; do a = h.int(2, 30); while (a % p === 0);
        const e = h.int(50, 999), r = e % (p - 1), v = modPow(a, e, p);
        return { t: 'Remainders', q: `What is the remainder when ${a}${sup(e)} is divided by ${p}?`, a: v, x: [modPow(a, r + 1, p), (v + 1) % p, p - v].filter(x => x !== v),
          ex: `Fermat: ${a}${sup(p - 1)} ≡ 1 (mod ${p}), and ${e} mod ${p - 1} = ${r}, so the remainder is that of ${a}${sup(r)}: ${v}.` };
      },
    ],
    hard: [
      h => {
        const p = h.pick([7, 11, 13, 17, 19, 23]), k = h.int(1, 3); let f = 1;
        for (let i = 2; i <= p - k; i++) f = (f * i) % p;
        const why = { 1: `Wilson’s theorem: (p ${MINUS} 1)! ≡ ${MINUS}1 ≡ ${p - 1}`, 2: `(p ${MINUS} 1)! = (p ${MINUS} 1)(p ${MINUS} 2)! ≡ ${MINUS}(p ${MINUS} 2)! ≡ ${MINUS}1, so (p ${MINUS} 2)! ≡ 1`, 3: `(p ${MINUS} 1)(p ${MINUS} 2)(p ${MINUS} 3)! ≡ 2(p ${MINUS} 3)! ≡ ${MINUS}1, so (p ${MINUS} 3)! ≡ (p ${MINUS} 1)/2 = ${(p - 1) / 2}` }[k];
        return { t: 'Remainders', q: `What is the remainder when ${p - k}! is divided by ${p}?`, a: f, x: [0, 1, p - 1, (p - 1) / 2].filter(x => x !== f), ex: `${why} (mod ${p}).` };
      },
      h => {
        const ps = h.shuffle([2, 3, 5, 7, 11]).slice(0, h.int(2, 4)), es = ps.map(() => h.int(1, 3)), N = ps.reduce((v, p, i) => v * p ** es[i], 1);
        if (N > 50000) return null;
        const k = ps.length, d = es.reduce((v, e) => v * (e + 1), 1), coprime = h.chance(0.5);
        const sq = Number.isInteger(Math.sqrt(N)), v = coprime ? 2 ** (k - 1) : sq ? (d + 1) / 2 : d / 2;
        return { t: 'Factors', q: `In how many ways can ${N} be written as a product of two ${coprime ? 'co-prime ' : ''}natural numbers (order not counted)?`, a: v, x: [d, 2 ** k, d / 2 + 1].filter(x => x !== v && Number.isInteger(x)),
          ex: coprime ? `${N} has ${k} distinct primes; each prime power goes wholly to one factor: 2${sup(k)}/2 = ${v}.` : `${N} has ${d} factors, which pair up${sq ? ' (the square root pairs with itself)' : ''}: ${v}.` };
      },
      h => {
        const m = h.pick([7, 13, 27, 37, 41, 11, 3, 9]), n = h.int(20, 120), reps = []; let r = 0;
        for (let i = 1; i <= 120; i++) { r = (r * 10 + 1) % m; reps.push(r); }
        let c = 1; while (reps[c - 1] !== 0) c++;
        const v = reps[n - 1];
        return { t: 'Remainders', q: `What is the remainder when 111…1 (${n} ones) is divided by ${m}?`, a: v, x: [reps[n % c] ?? 1, (v + 1) % m, n % m].filter(x => x !== v),
          ex: `111…1 with ${c} ones is divisible by ${m}, so the remainders repeat every ${c}. ${n} = ${c} × ${Math.floor(n / c)} + ${n % c}, so it leaves what ${n % c || c} ones leave: ${v}.` };
      },
      h => {
        const ps = h.shuffle([2, 3, 5, 7]).slice(0, h.int(2, 3)), N = ps.reduce((v, p) => v * p ** h.int(1, 3), 1);
        if (N > 20000) return null;
        let phi = N; ps.forEach(p => { phi = (phi / p) * (p - 1); });
        return { t: 'Euler’s totient', q: `How many numbers from 1 to ${N} are co-prime to ${N}?`, a: phi, x: [N / 2, N - ps.length, phi + ps[0]].filter(x => x !== phi && Number.isInteger(x)),
          ex: `φ(${N}) = ${N}${ps.map(p => ` × (1 ${MINUS} 1/${p})`).join('')} = ${phi}.` };
      },
    ],
  };

  /* ---------- 3. Algebra ---------- */
  const ALGEBRA = {
    easy: [
      h => {
        const a = h.int(-10, 20), d = h.nz(-6, 9), n = h.int(10, 40);
        if (h.chance(0.5)) return { t: 'Progressions', q: `What is the ${n}th term of the arithmetic progression ${a}, ${a + d}, ${a + 2 * d}, …?`, a: a + (n - 1) * d, x: [a + n * d, a + (n - 2) * d, n * d], ex: `aₙ = a + (n ${MINUS} 1)d = ${num(a)} + ${n - 1} × ${signed(d)} = ${num(a + (n - 1) * d)}.` };
        const S = (n * (2 * a + (n - 1) * d)) / 2;
        return { t: 'Progressions', q: `What is the sum of the first ${n} terms of ${a}, ${a + d}, ${a + 2 * d}, …?`, a: S, x: [n * (a + (n - 1) * d), S + d, (n * (2 * a + n * d)) / 2], ex: `Sₙ = n/2 [2a + (n ${MINUS} 1)d] = ${n}/2 × [${2 * a} + ${(n - 1) * d}] = ${num(S)}.` };
      },
      h => {
        const a = h.int(1, 4), r1 = h.int(-6, 6), r2 = h.int(-6, 6), b = -a * (r1 + r2), c = a * r1 * r2, prod = h.chance(0.5);
        return { t: 'Quadratic equations', q: `What is the ${prod ? 'product' : 'sum'} of the roots of ${terms([[a, 'x²'], [b, 'x'], [c, '']])} = 0?`, a: prod ? r1 * r2 : r1 + r2, x: prod ? [-r1 * r2, r1 + r2, c] : [-(r1 + r2), r1 * r2, b],
          ex: prod ? `Product = c/a = ${num(c)}/${a} = ${num(r1 * r2)}.` : `Sum = ${MINUS}b/a = ${num(-b)}/${a} = ${num(r1 + r2)}.` };
      },
      h => {
        const p = h.int(5, 40), q = h.int(2, 15), [a1, b1, a2, b2] = [h.int(2, 6), h.int(2, 6), h.int(2, 6), h.int(2, 6)];
        if (a1 * b2 === a2 * b1) return null;
        return { t: 'Linear equations', q: `${a1} pens and ${b1} pencils cost ${rs(a1 * p + b1 * q)}; ${a2} pens and ${b2} pencils cost ${rs(a2 * p + b2 * q)}. What does one pen cost?`, a: p, pre: '₹', x: [q, p + q, Math.round((a1 * p + b1 * q) / (a1 + b1))],
          ex: `Eliminate pencils: (${a1}p + ${b1}q) × ${b2} ${MINUS} (${a2}p + ${b2}q) × ${b1} gives ${terms([[a1 * b2 - a2 * b1, 'p']])} = ${num((a1 * p + b1 * q) * b2 - (a2 * p + b2 * q) * b1)}, so p = ${rs(p)}.` };
      },
    ],
    medium: [
      h => {
        let r1, r2; do { r1 = h.nz(-6, 6); r2 = h.nz(-6, 6); } while (r1 === -r2);
        const s = r1 + r2, p = r1 * r2, kind = h.pick(['sq', 'cube', 'recip', 'ratio']), eq = `${terms([[1, 'x²'], [-s, 'x'], [p, '']])} = 0`;
        const v = { sq: num(s * s - 2 * p), cube: num(s ** 3 - 3 * p * s), recip: frac(s, p), ratio: frac(s * s - 2 * p, p) }[kind];
        const name = { sq: 'α² + β²', cube: 'α³ + β³', recip: '1/α + 1/β', ratio: 'α/β + β/α' }[kind];
        const why = { sq: `(α + β)² ${MINUS} 2αβ = ${s * s} ${MINUS} ${signed(2 * p)}`, cube: `(α + β)³ ${MINUS} 3αβ(α + β) = ${s ** 3} ${MINUS} 3 × ${signed(p)} × ${signed(s)}`, recip: `(α + β)/αβ = ${num(s)}/${num(p)}`, ratio: `(α² + β²)/αβ = ${s * s - 2 * p}/${num(p)}` }[kind];
        return { t: 'Quadratic equations', q: `α and β are the roots of ${eq}. What is ${name}?`, a: v, w: distinct(v, [num(s * s), num(s * s + 2 * p), frac(p, s || 1), num(s ** 3), frac(s * s, p), frac(-s, p)]),
          ex: `α + β = ${num(s)}, αβ = ${num(p)}; ${name} = ${why} = ${v}.` };
      },
      h => {
        const [rn, rd] = h.pick([[1, 2], [1, 3], [2, 3], [-1, 2], [1, 4], [3, 4], [-1, 3]]), a = rd * h.int(1, 12), ans = frac(a * rd, rd - rn);
        return { t: 'Progressions', q: `What is the sum to infinity of ${a}, ${frac(a * rn, rd)}, ${frac(a * rn * rn, rd * rd)}, …?`, a: ans, w: distinct(ans, [frac(a * rd, rd + rn), frac(a, rd - rn), frac(a * rn, rd - rn), String(2 * a)]),
          ex: `A geometric series with r = ${frac(rn, rd)}: S = a/(1 ${MINUS} r) = ${a}/(1 ${MINUS} ${rn < 0 ? `(${frac(rn, rd)})` : frac(rn, rd)}) = ${ans}.` };
      },
      h => {
        let r1, r2; do { r1 = h.int(-8, 8); r2 = h.int(-8, 8); } while (r2 - r1 < 2);
        const strict = h.chance(0.6), v = strict ? r2 - r1 - 1 : r2 - r1 + 1;
        return { t: 'Inequalities', q: `How many integers x satisfy ${terms([[1, 'x²'], [-(r1 + r2), 'x'], [r1 * r2, '']])} ${strict ? '<' : '≤'} 0?`, a: v, x: [r2 - r1, strict ? r2 - r1 + 1 : r2 - r1 - 1, v + 2],
          ex: `The roots are ${num(r1)} and ${num(r2)}; the expression is ${strict ? 'negative strictly between' : 'at most 0 from'} them: ${strict ? `${num(r1 + 1)} to ${num(r2 - 1)}` : `${num(r1)} to ${num(r2)}`}, ${v} integers.` };
      },
      h => {
        const a = h.nz(-4, 5), b = h.int(-9, 9), k = h.int(-5, 6);
        if (h.chance(0.6)) { const v = a * (a * k + b) + b; return { t: 'Functions', q: `If f(x) = ${terms([[a, 'x'], [b, '']])}, what is f(f(${num(k)}))?`, a: v, x: [a * k + b, a * a * k + b, v + b], ex: `f(${num(k)}) = ${num(a * k + b)}, and f(${num(a * k + b)}) = ${num(v)}.` }; }
        const y = a * k + b;
        return { t: 'Functions', q: `If f(x) = ${terms([[a, 'x'], [b, '']])}, what is f⁻¹(${num(y)})?`, a: k, x: [a * y + b, y, -k], ex: `Solve ${terms([[a, 'x'], [b, '']])} = ${num(y)}: x = (${num(y)} ${MINUS} ${signed(b)})/${signed(a)} = ${num(k)}.` };
      },
      h => {
        const p = h.pick([2, 3, 5]), i = h.int(1, 4), j = h.int(1, 6); if (i === j) return null;
        const ans = frac(j, i);
        return { t: 'Logarithms', q: `What is log${sub(p ** i)} ${p ** j}?`, a: ans, w: distinct(ans, [frac(i, j), num(j - i), frac(j, i + 1), frac(j + 1, i), frac(j * i, 1)].filter(w => Math.abs(QM.helpers.fracValue(w) - j / i) > 1e-9)), ex: `${p ** i} = ${p}${sup(i)} and ${p ** j} = ${p}${sup(j)}, so the log is ${j}/${i}${ans === `${j}/${i}` ? '' : ` = ${ans}`}.` };
      },
    ],
    hard: [
      h => {
        const k = h.int(3, 9), kind = h.pick(['2', '3', '4']), v = { 2: k * k - 2, 3: k ** 3 - 3 * k, 4: (k * k - 2) ** 2 - 2 }[kind];
        return { t: 'Identities', q: `If x + 1/x = ${k}, what is x${sup(kind)} + 1/x${sup(kind)}?`, a: v, x: { 2: [k * k, k * k + 2, 2 * k], 3: [k ** 3, k ** 3 - k, k ** 3 + 3 * k], 4: [k ** 4 - 2, (k * k - 2) ** 2, k ** 4] }[kind].filter(x => x !== v),
          ex: { 2: `Square: x² + 2 + 1/x² = ${k * k}, so ${v}.`, 3: `Cube: x³ + 1/x³ = k³ ${MINUS} 3k = ${k ** 3} ${MINUS} ${3 * k} = ${v}.`, 4: `x² + 1/x² = ${k * k - 2}; square again: ${(k * k - 2) ** 2} ${MINUS} 2 = ${v}.` }[kind] };
      },
      h => {
        const a = h.int(1, 4), b = h.nz(-12, 12), c = h.int(-10, 15), ans = frac(4 * a * c - b * b, 4 * a);
        return { t: 'Maxima and minima', q: `What is the minimum value of ${terms([[a, 'x²'], [b, 'x'], [c, '']])}?`, a: ans, w: distinct(ans, [frac(4 * a * c + b * b, 4 * a), frac(-b, 2 * a), num(c), frac(4 * a * c - b * b, 2 * a)]),
          ex: `At x = ${MINUS}b/2a = ${frac(-b, 2 * a)} the value is c ${MINUS} b²/4a = ${num(c)} ${MINUS} ${b * b}/${4 * a} = ${ans}.` };
      },
      h => {
        const p = h.int(1, 4), q = h.int(0, p - 1), a = h.int(-5, 8), x = a + 2 ** p, b = x - 2 ** q, c = p + q;
        return { t: 'Logarithms', q: `What value of x satisfies log₂(x ${a < 0 ? '+' : MINUS} ${Math.abs(a)}) + log₂(x ${b < 0 ? '+' : MINUS} ${Math.abs(b)}) = ${c}?`.replace(/ [−+] 0\)/g, ')'), a: x, x: [b + 2 ** p, x + 1, 2 ** c],
          ex: `(x ${MINUS} ${signed(a)})(x ${MINUS} ${signed(b)}) = 2${sup(c)} = ${2 ** c}; x = ${x} works (${2 ** p} × ${2 ** q}); the other root, ${num(b - 2 ** p)}, would make x ${MINUS} ${signed(b)} negative.` };
      },
      h => {
        const c = h.pick([4, 5, 6, 9, 10, 12, 16, 20, 25]), lim = Math.sqrt(4 * c); let n = 0;
        for (let k = -20; k <= 20; k++) if (k * k < 4 * c) n++;
        return { t: 'Quadratic equations', q: `For how many integer values of k does x² + kx + ${c} = 0 have no real roots?`, a: n, x: [n + 2, n - 1, Math.floor(lim)].filter(x => x !== n),
          ex: `No real roots needs k² ${MINUS} ${4 * c} < 0, i.e. |k| < ${num(round(lim, 3))}, so k = ${MINUS}${(n - 1) / 2} … ${(n - 1) / 2}: ${n} values.` };
      },
      h => {
        const n = h.int(5, 30), v = (n * (n + 1) * (n + 2)) / 3;
        return { t: 'Series', q: `What is 1·2 + 2·3 + 3·4 + … + ${n}·${n + 1}?`, a: v, x: [(n * (n + 1) * (2 * n + 1)) / 6, (n * (n + 1)) / 2, v + n], ex: `Σ k(k + 1) = n(n + 1)(n + 2)/3 = ${n}·${n + 1}·${n + 2}/3 = ${v}.` };
      },
      h => {
        let a, b; do { a = h.int(-10, 10); b = h.int(-10, 10); } while (a === b);
        const c = Math.abs(a - b) + 2 * h.int(1, 6);
        return { t: 'Modulus equations', q: `What is the sum of all real solutions of |x ${a < 0 ? '+' : MINUS} ${Math.abs(a)}| + |x ${b < 0 ? '+' : MINUS} ${Math.abs(b)}| = ${c}?`.replace(/ [−+] 0\|/g, '|'), a: a + b, x: [c, a + b + c, (a + b) / 2].filter(x => x !== a + b),
          ex: `Since ${c} > |${num(a)} ${MINUS} ${signed(b)}| = ${Math.abs(a - b)}, there are two solutions, x = (${num(a + b)} ± ${c})/2 = ${num((a + b - c) / 2)} and ${num((a + b + c) / 2)}; their sum is ${num(a + b)}.` };
      },
    ],
  };

  /* ---------- 4. Geometry & Mensuration ---------- */
  const heron = (a, b, c) => { const s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); };
  const HERONIAN = [[13, 14, 15], [5, 12, 13], [9, 10, 17], [10, 13, 13], [6, 25, 29], [7, 15, 20], [13, 20, 21], [11, 13, 20], [17, 25, 28], [12, 17, 25], [8, 15, 17], [10, 17, 21], [15, 34, 35], [25, 29, 36], [20, 21, 29], [5, 5, 6], [5, 5, 8], [13, 13, 24]].filter(([a, b, c]) => Number.isInteger(heron(a, b, c)));
  const PYTH = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20], [9, 40, 41]];
  const GEOMETRY = {
    easy: [
      h => {
        const n = h.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), ang = (180 * (n - 2)) / n;
        if (h.chance(0.5)) return { t: 'Polygons', q: `What is each interior angle of a regular polygon with ${n} sides?`, a: ang, u: '°', x: [360 / n, 180 * (n - 2), 180 - ang + 10], ex: `Each exterior angle is 360°/${n} = ${num(360 / n)}°, so each interior angle is 180° ${MINUS} ${num(360 / n)}° = ${num(ang)}°.` };
        return { t: 'Polygons', q: `Each interior angle of a regular polygon is ${num(ang)}°. How many sides does it have?`, a: n, x: [n + 2, Math.round(ang / 10), n - 1], ex: `Exterior angle = 180° ${MINUS} ${num(ang)}° = ${num(360 / n)}°, and 360/${num(360 / n)} = ${n} sides.` };
      },
      h => {
        const [a, b, c] = h.pick(HERONIAN), A = heron(a, b, c), s = (a + b + c) / 2;
        return { t: 'Triangles', q: `What is the area of a triangle with sides ${a}, ${b} and ${c} cm?`, a: A, u: ' cm²', x: [(a * b) / 2, s * 2, A + s], ex: `Heron: s = ${num(s)}; area = √(${num(s)} × ${num(s - a)} × ${num(s - b)} × ${num(s - c)}) = ${A} cm².` };
      },
      h => {
        const [p, q, r] = h.pick(PYTH), x1 = h.int(-6, 6), y1 = h.int(-6, 6), sx = h.chance(0.5) ? 1 : -1, sy = h.chance(0.5) ? 1 : -1, x2 = x1 + sx * p, y2 = y1 + sy * q;
        return { t: 'Coordinate geometry', q: `What is the distance between (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)})?`, a: r, x: [p + q, Math.abs(x1 + x2) + Math.abs(y1 + y2) || r + 2, r * r], ex: `√((${num(x2)} ${MINUS} ${signed(x1)})² + (${num(y2)} ${MINUS} ${signed(y1)})²) = √(${p * p} + ${q * q}) = ${r}.` };
      },
    ],
    medium: [
      h => {
        let p, q; do { p = h.int(1, 5); q = h.int(1, 5); } while (gcd(p, q) !== 1);
        const k = (p + q) ** 2 * h.int(1, 6), A = k, small = (A * p * p) / (p + q) ** 2, trap = h.chance(0.5);
        return { t: 'Similar triangles', q: `In triangle ABC, DE ∥ BC with D on AB and E on AC, and AD : DB = ${p} : ${q}. The area of ABC is ${A} cm². What is the area of ${trap ? 'trapezium DBCE' : 'triangle ADE'}?`, a: trap ? A - small : small, u: ' cm²', x: [trap ? small : A - small, (A * p) / (p + q), (A * q) / (p + q)],
          ex: `ADE ~ ABC with ratio AD : AB = ${p} : ${p + q}, so areas are ${p * p} : ${(p + q) ** 2}: ADE = ${num(small)}${trap ? `, and DBCE = ${A} ${MINUS} ${num(small)} = ${num(A - small)}` : ''} cm².` };
      },
      h => {
        const [p, q, r] = h.pick(PYTH), k = h.int(1, 3), chord = h.chance(0.5);
        if (chord) return { t: 'Circles', q: `A chord of a circle of radius ${r * k} cm is ${p * k} cm from the centre. How long is the chord?`, a: 2 * q * k, u: ' cm', x: [q * k, 2 * r * k, (r + p) * k], ex: `Half the chord = √(${r * k}² ${MINUS} ${p * k}²) = ${q * k}, so the chord is ${2 * q * k} cm.` };
        return { t: 'Circles', q: `A point is ${r * k} cm from the centre of a circle of radius ${p * k} cm. How long is the tangent from the point to the circle?`, a: q * k, u: ' cm', x: [(r - p) * k, 2 * q * k, (r + p) * k], ex: `The tangent is perpendicular to the radius: √(${r * k}² ${MINUS} ${p * k}²) = ${q * k} cm.` };
      },
      h => {
        const P = [0, 1, 2].map(() => [h.int(-6, 8), h.int(-6, 8)]), D = P[0][0] * (P[1][1] - P[2][1]) + P[1][0] * (P[2][1] - P[0][1]) + P[2][0] * (P[0][1] - P[1][1]);
        if (!D) return null;
        const A = Math.abs(D) / 2;
        return { t: 'Coordinate geometry', q: `What is the area of the triangle with vertices ${P.map(([x, y]) => `(${num(x)}, ${num(y)})`).join(', ')}?`, a: A, x: [Math.abs(D), A + 1, A / 2], ex: `Area = ½|x₁(y₂ ${MINUS} y₃) + x₂(y₃ ${MINUS} y₁) + x₃(y₁ ${MINUS} y₂)| = ½ × ${Math.abs(D)} = ${num(A)}.` };
      },
      h => {
        const [a, b, c] = h.pick(PYTH), k = h.int(1, 3), inr = h.chance(0.5);
        return { t: 'Triangles', q: `What is the ${inr ? 'inradius' : 'circumradius'} of a right triangle with sides ${a * k}, ${b * k} and ${c * k}?`, a: inr ? ((a + b - c) * k) / 2 : (c * k) / 2, x: inr ? [(c * k) / 2, (a * b * k) / (a + b + c), ((a + b) * k) / 2] : [((a + b - c) * k) / 2, c * k, (a * k) / 2],
          ex: inr ? `For a right triangle r = (a + b ${MINUS} c)/2 = (${a * k} + ${b * k} ${MINUS} ${c * k})/2 = ${num(((a + b - c) * k) / 2)}.` : `The hypotenuse is a diameter: R = ${c * k}/2 = ${num((c * k) / 2)}.` };
      },
    ],
    hard: [
      h => {
        let b, c, a, opts; do { b = h.int(4, 15); c = h.int(4, 15); opts = []; for (let x = Math.abs(b - c) + 1; x < b + c; x++) if ((x * c) % (b + c) === 0) opts.push(x); } while (b === c || !opts.length);
        a = h.pick(opts);
        const BD = (a * c) / (b + c);
        return { t: 'Triangles', q: `In triangle ABC, AB = ${c}, AC = ${b} and BC = ${a}. The bisector of angle A meets BC at D. What is BD?`, a: BD, x: [(a * b) / (b + c), a / 2, BD + 1], ex: `Angle bisector theorem: BD : DC = AB : AC = ${c} : ${b}, so BD = ${a} × ${c}/${b + c} = ${num(BD)}.` };
      },
      h => {
        const kind = h.pick(['chords', 'secant']);
        if (kind === 'chords') { let x, y, z; do { x = h.int(2, 12); y = h.int(2, 12); z = h.int(2, 12); } while ((x * y) % z || z === x || z === y); return { t: 'Circles', q: `Chords AB and CD of a circle cross at P. AP = ${x}, PB = ${y} and CP = ${z}. What is PD?`, a: (x * y) / z, x: [x + y - z, (x * z) / y, y], ex: `Intersecting chords: AP × PB = CP × PD, so PD = ${x} × ${y}/${z} = ${(x * y) / z}.` }; }
        const t = h.int(3, 15); let a; do a = h.int(1, t - 1); while ((t * t) % a);
        const b = (t * t) / a;
        return { t: 'Circles', q: `From a point P outside a circle, a secant meets the circle at A and B (PA = ${a}, PB = ${b}). How long is the tangent from P?`, a: t, x: [(a + b) / 2, b - a, Math.round(Math.sqrt(a * a + b * b))].filter(x => x !== t), ex: `Tangent–secant: PT² = PA × PB = ${a} × ${b} = ${t * t}, so PT = ${t}.` };
      },
      h => {
        const r = h.int(1, 3), k = h.int(2, 5), R = r * k, n = k ** 3;
        if (h.chance(0.5)) return { t: 'Solids', q: `A metal sphere of radius ${R} cm is melted and recast into spheres of radius ${r} cm. How many are made?`, a: n, x: [k, k * k, n * 2], ex: `Volumes scale as r³: (${R}/${r})³ = ${k}³ = ${n}.` };
        const H = 3 * h.int(1, 6), cones = (3 * R * R * H) / (r * r * H);
        return { t: 'Solids', q: `A cylinder of radius ${R} cm and height ${H} cm is melted and recast into cones of radius ${r} cm and height ${H} cm. How many cones are made?`, a: cones, x: [k * k, cones / 3, k ** 3], ex: `πR²H ÷ (⅓πr²H) = 3 × (${R}/${r})² = 3 × ${k * k} = ${cones}.` };
      },
      h => {
        const [p, q, r] = h.pick(PYTH.filter(t => t[2] <= 17)), x0 = h.int(-5, 5), y0 = h.int(-5, 5), c = h.int(-30, 30), d = Math.abs(p * x0 + q * y0 + c);
        return { t: 'Coordinate geometry', q: `What is the distance of the point (${num(x0)}, ${num(y0)}) from the line ${terms([[p, 'x'], [q, 'y'], [c, '']])} = 0?`, a: frac(d, r), w: distinct(frac(d, r), [String(d), frac(d, p + q), frac(Math.abs(p * x0 + q * y0), r), frac(d + r, r)]),
          ex: `|${p}·${signed(x0)} + ${q}·${signed(y0)} + ${signed(c)}|/√(${p}² + ${q}²) = ${d}/${r}${frac(d, r) === `${d}/${r}` ? '' : ` = ${frac(d, r)}`}.` };
      },
      h => {
        const p = h.int(1, 6), q = h.int(1, 6), r = p * q * h.int(1, 4), A = frac(r * r, 2 * p * q);
        return { t: 'Coordinate geometry', q: `What is the area of the triangle formed by the line ${p === 1 ? '' : p}x + ${q === 1 ? '' : q}y = ${r} and the two axes?`, a: A, w: distinct(A, [frac(r * r, p * q), frac(r, 2), frac(r * r, 2 * (p + q)), frac(r * r, 4 * p * q)]), ex: `Intercepts ${r}/${p} = ${num(r / p)} and ${r}/${q} = ${num(r / q)}; area = ½ × ${num(r / p)} × ${num(r / q)} = ${A}.` };
      },
    ],
  };

  /* ---------- 5. Modern Maths (P&C, probability, sets) ---------- */
  const countNums = (lo, hi, f) => { let c = 0; for (let v = lo; v <= hi; v++) if (f(String(v))) c++; return c; };
  const MODERN = {
    easy: [
      h => {
        const n = h.int(5, 25), pos = h.chance(0.5), k = 3, v = pos ? nCr(n - 1, k - 1) : nCr(n + k - 1, k - 1);
        return { t: 'Distributions', q: `How many ${pos ? 'positive' : 'non-negative'} integer solutions does x + y + z = ${n} have?`, a: v, x: [pos ? nCr(n + 2, 2) : nCr(n - 1, 2), nCr(n, 2), n * n].filter(x => x !== v), ex: pos ? `Stars and bars: (${n} ${MINUS} 1)C2 = ${v}.` : `Stars and bars: (${n} + 2)C2 = ${v}.` };
      },
      h => {
        const t = h.int(2, 4), ans = frac(6 ** t - 5 ** t, 6 ** t);
        return { t: 'Probability', q: `A fair die is thrown ${t} times. What is the probability of at least one six?`, a: ans, w: probW(6 ** t - 5 ** t, 6 ** t, h, [frac(t, 6), frac(5 ** t, 6 ** t), frac(1, 6 ** t)]), ex: `1 ${MINUS} P(no six) = 1 ${MINUS} (5/6)${sup(t)} = ${ans}.` };
      },
      h => {
        const M = h.int(5, 9), W = h.int(4, 7), k = h.int(3, 5), atLeast = Math.min(h.int(1, 2), W), all = nCr(M + W, k);
        let none = nCr(M, k); if (atLeast === 2) none += W * nCr(M, k - 1);
        const v = all - none;
        return { t: 'Selections', q: `In how many ways can a committee of ${k} be chosen from ${M} men and ${W} women with at least ${atLeast === 1 ? 'one woman' : 'two women'}?`, a: v, x: [all, W * nCr(M + W - 1, k - 1), v - nCr(W, k)].filter(x => x !== v),
          ex: `All committees ${M + W}C${k} = ${all}, minus those with ${atLeast === 1 ? 'no women' : 'fewer than 2 women'} (${none}): ${v}.` };
      },
    ],
    medium: [
      h => {
        const B = h.int(2, 5), G = B + h.int(0, 1), v = (B === G ? 2 : 1) * fact(B) * fact(G);
        return { t: 'Arrangements', q: `In how many ways can ${B} boys and ${G} girls stand in a row so that boys and girls alternate?`, a: v, x: [fact(B + G), fact(B) * fact(G), 2 * v].filter(x => x !== v),
          ex: B === G ? `Start with a boy or a girl (2 ways), then ${B}! × ${G}! orders: ${v}.` : `The ${G} girls must take the odd places: ${G}! × ${B}! = ${v}.` };
      },
      h => {
        const s = h.int(4, 17); let c = 0;
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let d = 1; d <= 6; d++) if (a + b + d === s) c++;
        return { t: 'Probability', q: `Three fair dice are thrown. What is the probability that the total is ${s}?`, a: frac(c, 216), w: probW(c, 216, h, [frac(c, 36), frac(1, 16), frac(c + 3, 216)]), ex: `${c} of the 216 outcomes total ${s}: ${frac(c, 216)}.` };
      },
      h => {
        const n = h.int(5, 15), k = h.int(2, 4);
        if (n < k) return null;
        return { t: 'Distributions', q: `In how many ways can ${n} identical sweets be shared among ${k} children so that each gets at least one?`, a: nCr(n - 1, k - 1), x: [nCr(n + k - 1, k - 1), k ** n, nCr(n, k)].filter(x => x !== nCr(n - 1, k - 1)), ex: `Stars and bars with each ≥ 1: (${n} ${MINUS} 1)C(${k} ${MINUS} 1) = ${nCr(n - 1, k - 1)}.` };
      },
      h => {
        // Three-set Venn survey built from region counts.
        const r = { a: h.int(5, 30), b: h.int(5, 30), c: h.int(5, 30), ab: h.int(2, 12), bc: h.int(2, 12), ac: h.int(2, 12), abc: h.int(1, 8), none: h.int(0, 25) };
        const A = r.a + r.ab + r.ac + r.abc, B = r.b + r.ab + r.bc + r.abc, C = r.c + r.bc + r.ac + r.abc, AB = r.ab + r.abc, BC = r.bc + r.abc, AC = r.ac + r.abc, N = sum(Object.values(r));
        const kind = h.pick(['none', 'one', 'two', 'onlyA']), v = { none: r.none, one: r.a + r.b + r.c, two: r.ab + r.bc + r.ac, onlyA: r.a }[kind];
        const lines = [`${N} students were surveyed.`, `${A} like tea, ${B} like coffee and ${C} like juice.`, `${AB} like tea and coffee, ${BC} coffee and juice, ${AC} tea and juice.`, `${r.abc} like all three.`];
        const why = { none: `At least one: ${A} + ${B} + ${C} ${MINUS} ${AB} ${MINUS} ${BC} ${MINUS} ${AC} + ${r.abc} = ${N - r.none}; none = ${N} ${MINUS} ${N - r.none}`, one: `Exactly one = sum of singles ${MINUS} 2(sum of pairs) + 3(all three) = ${A + B + C} ${MINUS} ${2 * (AB + BC + AC)} + ${3 * r.abc}`, two: `Exactly two = sum of pairs ${MINUS} 3(all three) = ${AB + BC + AC} ${MINUS} ${3 * r.abc}`, onlyA: `Only tea = ${A} ${MINUS} ${AB} ${MINUS} ${AC} + ${r.abc}` }[kind];
        return { t: 'Sets', q: `From the survey below, how many students like ${{ none: 'none of the three', one: 'exactly one drink', two: 'exactly two drinks', onlyA: 'only tea' }[kind]}?`, lines, a: v, x: [r.none + r.abc, r.a + r.b + r.c + r.abc, AB + BC + AC, A - AB - AC].filter(x => x !== v && x >= 0), ex: `${why} = ${v}.` };
      },
    ],
    hard: [
      h => {
        const kind = h.pick(['div5', 'inc', 'sum', 'even']), n = kind === 'sum' ? 3 : h.int(3, 4), lo = 10 ** (n - 1), hi = 10 ** n - 1, P = (a, b) => fact(a) / fact(a - b);
        if (kind === 'div5') { const v = countNums(lo, hi, s => new Set(s).size === n && /[05]$/.test(s)), e0 = P(9, n - 1), e5 = 8 * P(8, n - 2); return { t: 'Counting numbers', q: `How many ${n}-digit numbers with all digits different are divisible by 5?`, a: v, x: [e0, e5, 2 * e0].filter(x => x !== v), ex: `Ending in 0: ${e0}; ending in 5 (first digit not 0 or 5): ${e5}. Total ${v}.` }; }
        if (kind === 'inc') { const v = countNums(lo, hi, s => s.split('').every((c, i) => !i || c > s[i - 1])); return { t: 'Counting numbers', q: `How many ${n}-digit numbers have digits in strictly increasing order (left to right)?`, a: v, x: [nCr(10, n), fact(9) / fact(9 - n), v * 2].filter(x => x !== v), ex: `Any ${n} different digits from 1–9 can be written in increasing order (0 can’t lead): 9C${n} = ${v}.` }; }
        if (kind === 'even') { const v = countNums(lo, hi, s => new Set(s).size === n && +s % 2 === 0); return { t: 'Counting numbers', q: `How many ${n}-digit even numbers have all digits different?`, a: v, x: [hi - lo + 1 >> 1, P(9, n - 1) * 5, v + 8].filter(x => x !== v), ex: `Ending in 0: ${P(9, n - 1)}; ending in 2, 4, 6 or 8 (first digit not 0): 4 × 8 × ${P(8, n - 2)} = ${32 * P(8, n - 2)}. Total ${v}.` }; }
        const s = h.int(4, 20), v = countNums(100, 999, t => sum(t.split('').map(Number)) === s);
        return { t: 'Counting numbers', q: `How many three-digit numbers have digits that add up to ${s}?`, a: v, x: [nCr(s + 2, 2), nCr(s + 1, 2), v + 3].filter(x => x !== v), ex: `Count a + b + c = ${s} with 1 ≤ a ≤ 9 and 0 ≤ b, c ≤ 9 (stars and bars, removing digits above 9): ${v}.` };
      },
      h => {
        const n = h.int(5, 9), together = h.chance(0.5), t = 2 * fact(n - 2), v = together ? t : fact(n - 1) - t;
        return { t: 'Circular arrangements', q: `In how many ways can ${n} people sit around a round table if two particular people ${together ? 'must' : 'must not'} sit together?`, a: v, x: [together ? fact(n - 1) - t : t, fact(n - 1), fact(n - 2)].filter(x => x !== v),
          ex: together ? `Glue the pair: (${n} ${MINUS} 1 ${MINUS} 1)! = ${fact(n - 2)} arrangements × 2 orders = ${t}.` : `All arrangements (${n} ${MINUS} 1)! = ${fact(n - 1)}, minus those with the pair together (${t}): ${v}.` };
      },
      h => {
        const kind = h.pick(['suit', 'ace', 'pair']), all = 1326, top = { suit: 4 * nCr(13, 2), ace: all - nCr(48, 2), pair: 13 * nCr(4, 2) }[kind];
        return { t: 'Probability', q: `Two cards are drawn from a pack of 52. What is the probability that ${{ suit: 'they are of the same suit', ace: 'at least one is an ace', pair: 'they are of the same rank' }[kind]}?`, a: frac(top, all), w: probW(top, all, h, [frac(1, 4), frac(1, 13), frac(2, 13)]),
          ex: `${{ suit: `4 × 13C2 = ${top}`, ace: `1326 ${MINUS} 48C2 = ${top}`, pair: `13 × 4C2 = ${top}` }[kind]} favourable out of 52C2 = 1326: ${frac(top, all)}.` };
      },
      h => {
        const n = h.int(4, 6), k = h.int(2, Math.min(4, n - 1)); let s = 0;
        for (let j = 0; j <= k; j++) s += (-1) ** j * nCr(k, j) * (k - j) ** n;
        return { t: 'Distributions', q: `In how many ways can ${n} different gifts be given to ${k} children so that every child gets at least one?`, a: s, x: [k ** n, nCr(n - 1, k - 1), s / fact(k)].filter(x => x !== s && Number.isInteger(x)), ex: `All ${k}${sup(n)} ways minus those leaving someone out (inclusion–exclusion): ${s}.` };
      },
    ],
  };

  /* ---------- 6. Data Interpretation ---------- */
  const GROWTH = [-20, -10, 10, 20, 25, 30, 40, 50];
  function salesTable(h) {
    const names = h.shuffle(['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma']).slice(0, 4), years = [2021, 2022, 2023];
    const rows = names.map(n => { for (;;) { const v0 = 10 * h.int(5, 40), g1 = h.pick(GROWTH), g2 = h.pick(GROWTH), v1 = (v0 * (100 + g1)) / 100, v2 = (v1 * (100 + g2)) / 100; if (Number.isInteger(v1) && Number.isInteger(v2)) return { n, v: [v0, v1, v2], g: [g1, g2] }; } });
    return { names, years, rows, table: { caption: 'Sales (₹ crore)', head: ['Company', ...years.map(String)], rows: rows.map(r => [r.n, ...r.v.map(String)]) } };
  }
  function marksTable(h) {
    const people = h.shuffle(NAMES).slice(0, 5), subj = ['Maths', 'Physics', 'English', 'History'];
    const rows = people.map(n => ({ n, v: subj.map(() => h.int(35, 99)) }));
    return { people, subj, rows, table: { caption: 'Marks out of 100', head: ['Student', ...subj], rows: rows.map(r => [r.n, ...r.v.map(String)]) } };
  }
  const uniqueMax = (xs, f) => { const vals = xs.map(f), m = Math.max(...vals); return vals.filter(v => v === m).length === 1 ? xs[vals.indexOf(m)] : null; };
  const DI = {
    easy: [
      h => {
        const T = salesTable(h), r = h.pick(T.rows), tot = sum(r.v);
        return { t: 'Tables', q: `What were ${r.n}’s total sales over the three years?`, table: T.table, a: tot, x: [tot - r.v[0], tot + 10, sum(T.rows.map(x => x.v[2]))], ex: `${r.v.join(' + ')} = ${tot} crore.` };
      },
      h => {
        const T = salesTable(h), y = h.int(0, 2), best = uniqueMax(T.rows, r => r.v[y]);
        if (!best) return null;
        return { t: 'Tables', q: `Which company had the highest sales in ${T.years[y]}?`, table: T.table, a: best.n, w: T.names.filter(n => n !== best.n), ex: `${T.years[y]}: ${T.rows.map(r => `${r.n} ${r.v[y]}`).join(', ')} — ${best.n} is highest.` };
      },
      h => {
        const M = marksTable(h), s = h.int(0, 3), avg = round(sum(M.rows.map(r => r.v[s])) / 5, 6);
        return { t: 'Tables', q: `What is the average ${M.subj[s]} mark of the five students?`, table: M.table, a: avg, x: [round(avg + 1, 6), round(sum(M.rows.map(r => r.v[s])) / 4, 6), Math.max(...M.rows.map(r => r.v[s]))], ex: `(${M.rows.map(r => r.v[s]).join(' + ')}) ÷ 5 = ${num(avg)}.` };
      },
    ],
    medium: [
      h => {
        const T = salesTable(h), r = h.pick(T.rows), y = h.int(0, 1);
        return { t: 'Growth rates', q: `By what percent did ${r.n}’s sales change from ${T.years[y]} to ${T.years[y + 1]}?`, table: T.table, a: r.g[y], u: '%', x: [round(((r.v[y + 1] - r.v[y]) * 100) / r.v[y + 1], 2), r.g[1 - y], -r.g[y]],
          ex: `(${r.v[y + 1]} ${MINUS} ${r.v[y]}) ÷ ${r.v[y]} × 100 = ${num(r.g[y])}%.` };
      },
      h => {
        const T = salesTable(h), best = uniqueMax(T.rows, r => r.g[0]);
        if (!best) return null;
        return { t: 'Growth rates', q: `Which company’s sales grew the most, in percentage terms, from 2021 to 2022?`, table: T.table, a: best.n, w: T.names.filter(n => n !== best.n), ex: `Growth: ${T.rows.map(r => `${r.n} ${num(r.g[0])}%`).join(', ')} — ${best.n} is highest.` };
      },
      h => {
        const T = salesTable(h), [a, b] = h.shuffle(T.rows).slice(0, 2), y = h.int(0, 2), ans = ratio(a.v[y], b.v[y]);
        return { t: 'Ratios', q: `What is the ratio of ${a.n}’s sales to ${b.n}’s in ${T.years[y]}?`, table: T.table, a: ans, w: ratioW(ans, h, [ratio(b.v[y], a.v[y]), ratio(a.v[(y + 1) % 3], b.v[(y + 1) % 3])]), ex: `${a.v[y]} : ${b.v[y]} = ${ans}.` };
      },
      h => {
        const M = marksTable(h), best = uniqueMax(M.rows, r => sum(r.v));
        if (!best) return null;
        return { t: 'Tables', q: 'Which student has the highest total across the four subjects?', table: M.table, a: best.n, w: M.people.filter(n => n !== best.n), ex: `Totals: ${M.rows.map(r => `${r.n} ${sum(r.v)}`).join(', ')}.` };
      },
      h => {
        const M = marksTable(h), s = h.int(0, 3), cut = h.pick([50, 60, 70, 75, 80]), c = M.rows.filter(r => r.v[s] > cut).length;
        return { t: 'Tables', q: `How many students scored more than ${cut} in ${M.subj[s]}?`, table: M.table, a: c, x: [c + 1, 5 - c, M.rows.filter(r => r.v[s] >= cut - 5).length].filter(x => x !== c && x >= 0), ex: `${M.subj[s]}: ${M.rows.map(r => r.v[s]).join(', ')} → ${c} above ${cut}.` };
      },
    ],
    hard: [
      h => {
        const T = salesTable(h), y = h.int(0, 2), tot = sum(T.rows.map(r => r.v[y])), r = h.pick(T.rows), share = round((r.v[y] * 100) / tot, 1);
        const others = T.rows.filter(x => x !== r).map(x => round((x.v[y] * 100) / tot, 1));
        if (others.some(o => Math.abs(o - share) < 1)) return null;
        return { t: 'Percentages', q: `Roughly what percentage of all four companies’ ${T.years[y]} sales came from ${r.n}?`, table: T.table, a: share, u: '%', noType: true, x: others, ex: `${r.v[y]} ÷ ${tot} × 100 ≈ ${num(share)}%.` };
      },
      h => {
        const T = salesTable(h), r = h.pick(T.rows), next = (r.v[2] * (100 + r.g[1])) / 100;
        return { t: 'Projections', q: `If ${r.n}’s sales grow from 2023 to 2024 at the same rate as from 2022 to 2023, what will they be in 2024?`, table: T.table, a: round(next, 2), noType: !Number.isInteger(next * 100), x: [r.v[2] + (r.v[2] - r.v[1]), round((r.v[2] * (100 + r.g[0])) / 100, 2), r.v[2]],
          ex: `2022→2023 change: ${num(r.g[1])}%. ${r.v[2]} × ${num((100 + r.g[1]) / 100)} = ${num(round(next, 2))} crore.` };
      },
      h => {
        const T = salesTable(h), c = T.rows.filter(r => r.g[0] > 0 && r.g[1] > 0).length;
        return { t: 'Tables', q: 'In how many of the four companies did sales rise in both years?', table: T.table, a: c, x: [0, 1, 2, 3, 4].filter(x => x !== c), ex: `Rose both years: ${T.rows.filter(r => r.g[0] > 0 && r.g[1] > 0).map(r => r.n).join(', ') || 'none'} → ${c}.` };
      },
      h => {
        const T = salesTable(h), t0 = sum(T.rows.map(r => r.v[0])), t2 = sum(T.rows.map(r => r.v[2])), g = round(((t2 - t0) * 100) / t0, 1);
        return { t: 'Growth rates', q: 'Roughly by what percent did the four companies’ combined sales change from 2021 to 2023?', table: T.table, a: g, u: '%', noType: true, x: [round(((t2 - t0) * 100) / t2, 1), round(g + 5, 1), round(g * 2, 1), round(-g, 1)].filter(x => Math.abs(x - g) > 1),
          ex: `Totals ${t0} (2021) and ${t2} (2023): (${t2} ${MINUS} ${t0}) ÷ ${t0} × 100 ≈ ${num(g)}%.` };
      },
      h => {
        const M = marksTable(h), r = h.pick(M.rows), p = round(sum(r.v) / 4, 2);
        return { t: 'Percentages', q: `What percentage of the 400 total marks did ${r.n} score?`, table: M.table, a: p, u: '%', x: [round(p + 2, 2), Math.max(...r.v), round(sum(r.v) / 5, 2)], ex: `${r.v.join(' + ')} = ${sum(r.v)} out of 400 = ${num(p)}%.` };
      },
    ],
  };

  /* ---------- 7. Logical Reasoning ---------- */
  function perms(xs) { if (xs.length < 2) return [xs.slice()]; const out = []; xs.forEach((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).forEach(p => out.push([x, ...p]))); return out; }
  const PERM_CACHE = {};
  const permsOf = n => (PERM_CACHE[n] = PERM_CACHE[n] || perms([...Array(n).keys()]));
  // A seating puzzle: people in seats 1..n from left to right, clues true of the hidden arrangement, exactly one solution.
  function seating(h, n, allowSeat) {
    const who = h.shuffle(NAMES.slice(0, n)), pos = who.map((_, i) => i); // who[i] sits in seat pos[i] (0-based)
    const cands = [];
    for (let i = 0; i < n; i++) {
      const x = who[i], p = pos[i];
      if (p === 0 || p === n - 1) cands.push({ s: `${x} sits at one of the ends.`, f: q => q[i] === 0 || q[i] === n - 1 });
      else cands.push({ s: `${x} does not sit at either end.`, f: q => q[i] !== 0 && q[i] !== n - 1 });
      if (allowSeat) cands.push({ s: `${x} sits in seat ${p + 1}.`, f: q => q[i] === p });
      for (let j = i + 1; j < n; j++) {
        const y = who[j], d = pos[j] - pos[i], [l, r, li, ri] = d > 0 ? [x, y, i, j] : [y, x, j, i];
        if (Math.abs(d) === 1) {
          cands.push({ s: `${x} and ${y} sit next to each other.`, f: q => Math.abs(q[i] - q[j]) === 1 });
          cands.push({ s: `${l} sits immediately to the left of ${r}.`, f: q => q[ri] - q[li] === 1 });
        } else {
          cands.push({ s: `${x} and ${y} do not sit next to each other.`, f: q => Math.abs(q[i] - q[j]) !== 1 });
          cands.push({ s: `Exactly ${Math.abs(d) - 1} ${Math.abs(d) === 2 ? 'person sits' : 'people sit'} between ${x} and ${y}.`, f: q => Math.abs(q[i] - q[j]) === Math.abs(d) });
        }
        cands.push({ s: `${l} sits somewhere to the left of ${r}.`, f: q => q[li] < q[ri] });
      }
    }
    const all = permsOf(n), clues = [];
    let left = all;
    for (const c of h.shuffle(cands)) { if (left.length === 1) break; const next = left.filter(c.f); if (next.length < left.length) { clues.push(c); left = next; } }
    if (left.length !== 1) return null;
    // Drop clues that aren't needed. Each arrangement gets a bitmask of the clues it breaks; a clue can go if no
    // arrangement breaks only that one among those kept.
    const masks = all.map(q => clues.reduce((m, c, k) => (c.f(q) ? m : m | (1 << k)), 0));
    let keep = (1 << clues.length) - 1;
    for (let k = clues.length - 1; k >= 0; k--) { const bit = 1 << k; if (!masks.some(m => (m & keep) === bit)) keep &= ~bit; }
    const kept = clues.filter((_, k) => keep & (1 << k));
    if (kept.length > 9) return null;
    const order = who.slice().sort((a, b) => pos[who.indexOf(a)] - pos[who.indexOf(b)]), at = Object.fromEntries(who.map((x, i) => [x, pos[i]]));
    return { who, pos: at, order, clues: kept };
  }
  const LR = {
    easy: [
      h => {
        const P = seating(h, 5, true); if (!P) return null;
        const k = h.int(1, 5), ans = P.order[k - 1];
        if (P.clues.some(c => c.s === `${ans} sits in seat ${k}.`)) return null;
        return { t: 'Seating arrangements', tx: 3.5, q: `Five people sit in a row in seats 1 to 5 (left to right). Who sits in seat ${k}?`, lines: P.clues.map(c => c.s), a: ans, w: P.order.filter(x => x !== ans), ex: `The only arrangement that fits every clue (seats 1–5): ${P.order.join(', ')}.` };
      },
      h => {
        const n = h.int(4, 16), kind = h.pick(['ko', 'rr', 'pts']);
        if (kind === 'ko') return { t: 'Tournaments', q: `${n} players enter a knockout tournament (byes allowed). How many matches are played in all?`, a: n - 1, x: [n / 2, n, Math.ceil(Math.log2(n))].filter(x => Number.isInteger(x) && x !== n - 1), ex: `Every match knocks out exactly one player, and ${n - 1} must go: ${n - 1} matches.` };
        if (kind === 'rr') return { t: 'Tournaments', q: `In a round-robin event, each of ${n} teams plays every other team once. How many matches are played?`, a: nCr(n, 2), x: [n * (n - 1), n - 1, nCr(n, 2) + n], ex: `${n}C2 = ${nCr(n, 2)} matches.` };
        const m = nCr(n, 2), d = h.int(0, m);
        return { t: 'Tournaments', q: `${n} teams play a round robin (3 points for a win, 1 each for a draw). ${d} matches are drawn. How many points are given out in all?`, a: 3 * m - d, x: [3 * m, 2 * m + d, 3 * m - 2 * d].filter(x => x !== 3 * m - d), ex: `${m} matches; a decided match gives 3 points and a draw 2: 3 × ${m} ${MINUS} ${d} = ${3 * m - d}.` };
      },
    ],
    medium: [
      h => {
        const n = h.int(5, 6), P = seating(h, n, h.chance(0.4)); if (!P) return null;
        const kind = h.pick(['right', 'between', 'end']);
        if (kind === 'right') {
          const x = h.pick(P.order.slice(0, -1)), ans = P.order[P.pos[x] + 1];
          return { t: 'Seating arrangements', tx: 4, q: `${n} people sit in a row, seats 1 to ${n} from left to right. Who sits immediately to the right of ${x}?`, lines: P.clues.map(c => c.s), a: ans, w: P.order.filter(y => y !== ans && y !== x), ex: `The only arrangement that fits every clue (left to right): ${P.order.join(', ')}.` };
        }
        if (kind === 'end') { const ans = P.order[n - 1]; return { t: 'Seating arrangements', tx: 4, q: `${n} people sit in a row, seats 1 to ${n} from left to right. Who sits at the right end?`, lines: P.clues.map(c => c.s), a: ans, w: P.order.filter(y => y !== ans), ex: `The only arrangement that fits every clue (left to right): ${P.order.join(', ')}.` }; }
        const [x, y] = h.shuffle(P.order).slice(0, 2), b = Math.abs(P.pos[x] - P.pos[y]) - 1;
        return { t: 'Seating arrangements', tx: 4, q: `${n} people sit in a row, seats 1 to ${n} from left to right. How many people sit between ${x} and ${y}?`, lines: P.clues.map(c => c.s), a: b, x: [0, 1, 2, 3, 4].filter(v => v !== b && v <= n - 2), ex: `The only arrangement that fits every clue (left to right): ${P.order.join(', ')}. Between ${x} and ${y}: ${b}.` };
      },
      h => {
        const g = h.int(2, 4), s = h.int(3, 6), top = 2, ko = g * top - 1, total = g * nCr(s, 2) + ko;
        return { t: 'Tournaments', q: `${g * s} teams are split into ${g} groups of ${s}. Each group plays a round robin, and the top ${top} of each group go into a knockout. How many matches are played in all?`, a: total, x: [g * nCr(s, 2), nCr(g * s, 2), total + 1], ex: `Groups: ${g} × ${s}C2 = ${g * nCr(s, 2)}; knockout of ${g * top} teams: ${ko}. Total ${total}.` };
      },
    ],
    hard: [
      h => {
        const n = h.int(6, 7), P = seating(h, n, false); if (!P) return null;
        const k = h.int(1, n), ans = P.order[k - 1];
        return { t: 'Seating arrangements', tx: 5, q: `${n} people sit in a row, seats 1 to ${n} from left to right. Who sits in seat ${k}?`, lines: P.clues.map(c => c.s), a: ans, w: h.shuffle(P.order.filter(x => x !== ans)), ex: `The only arrangement that fits every clue (left to right): ${P.order.join(', ')}.` };
      },
      h => {
        const r = { a: h.int(5, 40), b: h.int(5, 40), c: h.int(5, 40), ab: h.int(2, 15), bc: h.int(2, 15), ac: h.int(2, 15), abc: h.int(1, 10), none: h.int(0, 30) };
        const A = r.a + r.ab + r.ac + r.abc, B = r.b + r.ab + r.bc + r.abc, C = r.c + r.bc + r.ac + r.abc, N = sum(Object.values(r)), atLeastTwo = r.ab + r.bc + r.ac + r.abc;
        const lines = [`${N} people were asked about three apps, X, Y and Z.`, `${A} use X, ${B} use Y and ${C} use Z.`, `${r.none} use none of them and ${r.abc} use all three.`, `${atLeastTwo} use at least two of the apps.`];
        const v = r.a + r.b + r.c;
        return { t: 'Sets', q: 'From the facts below, how many people use exactly one app?', lines, a: v, x: [N - r.none - r.abc, A + B + C - N, v + r.abc].filter(x => x !== v && x > 0),
          ex: `Users of at least one app: ${N} ${MINUS} ${r.none} = ${N - r.none}. Take away the ${atLeastTwo} who use at least two: exactly one = ${v}.` };
      },
    ],
  };

  /* ---------- Registration (learning order) ---------- */
  const TX = { easy: 2, medium: 2.5, hard: 3 };
  const TOPICS = [
    ['cat-arith', 'Arithmetic', ARITH, true], ['cat-number', 'Number System', NUMSYS, true], ['cat-algebra', 'Algebra', ALGEBRA, false],
    ['cat-geometry', 'Geometry & Mensuration', GEOMETRY, true], ['cat-modern', 'Modern Maths', MODERN, true], ['cat-di', 'Data Interpretation', DI, false],
    ['cat-lr', 'Logical Reasoning', LR, true],
  ];
  for (const [kind, topic, makers, positive] of TOPICS) {
    if (!makers.easy.length || !makers.medium.length || !makers.hard.length) continue; // Arithmetic's easy set needs js/aptitude.js
    QM.register(kind, makers, { topic, tx: TX, group: 'cat-mix', written: 0.35, decimals: true, positive });
  }
})();
