/* QuizNova — maths problem generator.
 *
 * Makes fresh, solvable maths questions (arithmetic up to calculus) from random numbers and works out
 * every answer itself, so the answers are always right, the questions never run out and no AI is needed.
 * Wrong options come from common slips (sign errors, forgetting to divide, adding denominators…), and
 * every question carries a one-line worked explanation.
 *
 * Used by the Maths subjects in js/app.js:  QUIZ_MATHS.build(kind, n, random, { mcqOnly, difficulty })
 *   kind: 'mix' | 'arith' | 'algebra1' | 'algebra' | 'geometry' | 'calculus'
 *   random: a () => [0, 1) function (seeded by the app)
 */
(() => {
  'use strict';

  /* ---------- Formatting ---------- */
  const MINUS = '−';
  const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  const SUBS = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '-': '₋' };
  const sup = v => String(v).replace(/[0-9-]/g, c => SUPS[c]);
  const sub = v => String(v).replace(/[0-9-]/g, c => SUBS[c]);
  const rnd = (v, places = 6) => Math.round(v * 10 ** places) / 10 ** places;
  const num = v => { const r = rnd(v); return r < 0 ? MINUS + String(-r) : String(r); };
  const paren = v => (v < 0 ? `(${num(v)})` : num(v));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const frac = (n, d) => {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    n /= g; d /= g;
    return d === 1 ? num(n) : `${n < 0 ? MINUS : ''}${Math.abs(n)}/${d}`;
  };
  const xp = p => (p === 0 ? '' : p === 1 ? 'x' : `x${sup(p)}`);
  const termStr = (c, p) => {
    const a = Math.abs(c);
    return p === 0 ? String(a) : (a === 1 ? '' : String(a)) + xp(p);
  };
  // Polynomial from [[coefficient, power], …]: [[3, 2], [-5, 1], [2, 0]] → "3x² − 5x + 2"
  const poly = terms => {
    let s = '';
    for (const [c, p] of terms) {
      if (!c) continue;
      const t = termStr(c, p);
      s += s ? (c < 0 ? ` ${MINUS} ` : ' + ') + t : (c < 0 ? MINUS : '') + t;
    }
    return s || '0';
  };
  const lin = (a, b) => poly([[a, 1], [b, 0]]);
  const factor = r => `(${lin(1, -r)})`; // the factor for root r: (x − r)
  const roots = (a, b) => (a <= b ? `x = ${num(a)} or x = ${num(b)}` : `x = ${num(b)} or x = ${num(a)}`);
  const coefX = c => (c === 1 ? 'x' : c === -1 ? `${MINUS}x` : `${num(c)}x`); // 1x → x, −1x → −x
  const an = w => (/^[aeiou]/.test(w) ? `an ${w}` : `a ${w}`);
  const POLYGON = { 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };

  /* ---------- Randomness ---------- */
  function tools(r) {
    const int = (a, b) => a + Math.floor(r() * (b - a + 1));
    const t = {
      r, int,
      pick: arr => arr[Math.floor(r() * arr.length)],
      chance: p => r() < p,
      nz: (a, b) => { let v = 0; while (v === 0) v = int(a, b); return v; },
      shuffle(arr) {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
        return out;
      },
    };
    return t;
  }

  // Wrong numeric answers: likely slips first (x), then nearby values. Keeps to positives when the answer is positive.
  function nearNums(ans, h, slips = []) {
    const out = [];
    const fresh = v => typeof v === 'number' && Number.isFinite(v) && Math.abs(v - ans) > 1e-9 && !out.some(o => Math.abs(o - v) < 1e-9);
    for (const v of h.shuffle(slips)) if (out.length < 3 && fresh(v) && (!Number.isInteger(ans) || Number.isInteger(v))) out.push(rnd(v));
    const nearby = Number.isInteger(ans)
      ? [1, -1, 2, -2, 3, -3, 10, -10, Math.max(4, Math.round(Math.abs(ans) / 10))].map(d => ans + d)
      : [ans * 10, ans / 10, ans + 0.1, ans - 0.1, ans * 2, ans + 1].map(v => rnd(v));
    for (const v of h.shuffle(nearby)) if (out.length < 3 && fresh(v) && (ans < 0 || v >= 0)) out.push(v);
    for (let k = 4; out.length < 3; k++) if (fresh(ans + k)) out.push(ans + k);
    return out;
  }

  /* ---------- Problem makers ----------
     Each returns { q, a, ex } plus optional:
       x   — numeric slips used as wrong options (when a is a number)
       w   — explicit wrong options (strings; first 3 distinct ones are used)
       u   — unit appended to numeric options ('°', '%')
       st  — v => statement, enabling "True or false" versions
       mono — show options in the monospace font (expressions)
       tx  — extra time factor */
  const ARITH = {
    easy: [
      h => { const a = h.int(12, 89), b = h.int(11, 89); return { q: `What is ${a} + ${b}?`, a: a + b, x: [a + b + 10, a + b - 10, a + b + 1], st: v => `${a} + ${b} = ${v}`, ex: `${a} + ${b} = ${a + b}.` }; },
      h => { const a = h.int(40, 99), b = h.int(12, a - 8), d = a - b; return { q: `What is ${a} ${MINUS} ${b}?`, a: d, x: [d > 10 ? d - 10 : d + 11, d + 10, a + b], st: v => `${a} ${MINUS} ${b} = ${v}`, ex: `${a} ${MINUS} ${b} = ${d}.` }; },
      h => { const a = h.int(3, 12), b = h.int(3, 12); return { q: `What is ${a} × ${b}?`, a: a * b, x: [a * (b + 1), (a - 1) * b, a * b + 2], st: v => `${a} × ${b} = ${v}`, ex: `${a} × ${b} = ${a * b}.` }; },
      h => { const b = h.int(2, 12), k = h.int(3, 12); return { q: `What is ${b * k} ÷ ${b}?`, a: k, x: [k + 1, k - 1, b * k - b], st: v => `${b * k} ÷ ${b} = ${v}`, ex: `${b} × ${k} = ${b * k}, so ${b * k} ÷ ${b} = ${k}.` }; },
      h => { const a = h.int(11, 49), m = h.pick([2, 3, 4, 5]); return { q: `What is ${a} × ${m}?`, a: a * m, x: [a * m + 10, a * m - 10, a + m], st: v => `${a} × ${m} = ${v}`, ex: `${a} × ${m} = ${a * m}.` }; },
    ],
    medium: [
      h => { const a = h.int(11, 25), b = h.int(11, 19); return { q: `What is ${a} × ${b}?`, a: a * b, x: [a * b + 10, a * b - 10, a * (b - 1)], st: v => `${a} × ${b} = ${v}`, ex: `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = ${a * b}.` }; },
      h => {
        const p = h.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), unit = 100 / gcd(p, 100);
        const base = unit * h.int(Math.ceil(20 / unit), Math.floor(600 / unit)), ans = p * base / 100;
        return { q: `What is ${p}% of ${base}?`, a: ans, x: [ans * 10, base - ans, ans + p], st: v => `${p}% of ${base} = ${v}`, ex: `${p}% of ${base} = ${p}/100 × ${base} = ${ans}.` };
      },
      h => {
        const b = h.int(2, 9), c = h.int(2, 9);
        if (h.chance(0.5)) { const a = h.int(2, 20); return { q: `What is ${a} + ${b} × ${c}?`, a: a + b * c, x: [(a + b) * c, a * b + c, a + b + c], st: v => `${a} + ${b} × ${c} = ${v}`, ex: `Multiply first: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.` }; }
        const a = b * c + h.int(3, 30);
        return { q: `What is ${a} ${MINUS} ${b} × ${c}?`, a: a - b * c, x: [(a - b) * c, a - b - c, a - b * c + 10], st: v => `${a} ${MINUS} ${b} × ${c} = ${v}`, ex: `Multiply first: ${b} × ${c} = ${b * c}, then ${a} ${MINUS} ${b * c} = ${a - b * c}.` };
      },
      h => { const k = h.int(11, 25); return { q: `What is ${k}²?`, a: k * k, x: [2 * k, k * k + 10, (k - 1) * (k + 1)], st: v => `${k}² = ${v}`, ex: `${k}² = ${k} × ${k} = ${k * k}.` }; },
      h => { const k = h.int(11, 30); return { q: `What is √${k * k}?`, a: k, x: [k + 1, k - 1, k * k / 2], st: v => `√${k * k} = ${v}`, ex: `${k} × ${k} = ${k * k}, so √${k * k} = ${k}.` }; },
      h => {
        const d = h.pick([5, 7, 8, 9, 11, 12]), a = h.int(1, d - 2), b = h.int(1, d - 1 - a);
        return { q: `What is ${a}/${d} + ${b}/${d}?`, a: frac(a + b, d), w: [frac(a + b, 2 * d), frac(a * b, d), frac(a + b + 1, d), frac(a + b, d * d)], st: v => `${a}/${d} + ${b}/${d} = ${v}`, ex: `Same denominator, so add the tops: ${a} + ${b} = ${a + b}, giving ${frac(a + b, d)}.` };
      },
    ],
    hard: [
      h => {
        const a = h.int(2, 9), b = h.int(2, 9), c = h.int(2, 6), e = h.int(2, 6), d = e * h.int(2, 9), ans = (a + b) * c - d / e;
        return { q: `What is (${a} + ${b}) × ${c} ${MINUS} ${d} ÷ ${e}?`, a: ans, x: [a + b * c - d / e, ((a + b) * c - d) / e, (a + b) * c + d / e], st: v => `(${a} + ${b}) × ${c} ${MINUS} ${d} ÷ ${e} = ${v}`, ex: `Brackets: ${a + b}. Then ${a + b} × ${c} = ${(a + b) * c} and ${d} ÷ ${e} = ${d / e}. ${(a + b) * c} ${MINUS} ${d / e} = ${num(ans)}.`, tx: 1.8 };
      },
      h => {
        const [b, d] = h.shuffle([2, 3, 4, 5, 6, 8]).slice(0, 2), a = h.int(1, b - 1), c = h.int(1, d - 1);
        const L = lcm(b, d), A = a * L / b, C = c * L / d, ans = frac(A + C, L);
        return { q: `What is ${a}/${b} + ${c}/${d}?`, a: ans, w: [frac(a + c, b + d), frac(a * c, b * d), frac(a + c, b * d), frac(A + C + 1, L)], st: v => `${a}/${b} + ${c}/${d} = ${v}`, ex: `Common denominator ${L}: ${A}/${L} + ${C}/${L} = ${A + C}/${L}${ans !== `${A + C}/${L}` ? ` = ${ans}` : ''}.`, tx: 1.8 };
      },
      h => {
        const [b, d] = h.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2), a = h.int(1, b - 1), c = h.int(1, d - 1);
        return { q: `What is ${a}/${b} × ${c}/${d}?`, a: frac(a * c, b * d), w: [frac(a * d, b * c), frac(a + c, b + d), frac(a * c, b + d), frac(a + c, b * d)], st: v => `${a}/${b} × ${c}/${d} = ${v}`, ex: `Multiply tops and bottoms: ${a * c}/${b * d}${frac(a * c, b * d) !== `${a * c}/${b * d}` ? ` = ${frac(a * c, b * d)}` : ''}.` };
      },
      h => {
        const old = 20 * h.int(2, 20), p = h.pick([10, 15, 20, 25, 30, 40, 50, 60, 75]), up = h.chance(0.5);
        const nw = old + (up ? 1 : -1) * old * p / 100, diff = Math.abs(nw - old);
        return { q: `A price ${up ? 'rises' : 'falls'} from ₹${old} to ₹${nw}. What is the percentage ${up ? 'increase' : 'decrease'}?`, a: p, u: '%', x: [Math.round(diff / nw * 100), diff, p + 5], ex: `Change = ₹${diff}. ${diff} ÷ ${old} × 100 = ${p}%.`, tx: 1.8 };
      },
      h => {
        const a = -h.int(3, 12), b = h.int(3, 9), c = h.int(5, 30), ans = a * b + c;
        return { q: `What is (${num(a)}) × ${b} + ${c}?`, a: ans, x: [-a * b + c, a * b - c, a * (b + c)], st: v => `(${num(a)}) × ${b} + ${c} = ${v}`, ex: `(${num(a)}) × ${b} = ${num(a * b)}, and ${num(a * b)} + ${c} = ${num(ans)}.` };
      },
      h => {
        const g = h.int(2, 9), [x, y] = h.pick([[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [5, 6]]), A = g * x, B = g * y;
        if (h.chance(0.5)) return { q: `What is the lowest common multiple (LCM) of ${A} and ${B}?`, a: g * x * y, x: [A * B, g, g * x * y * 2], ex: `${A} = ${g} × ${x} and ${B} = ${g} × ${y}, so the LCM is ${g} × ${x} × ${y} = ${g * x * y}.` };
        return { q: `What is the highest common factor (HCF) of ${A} and ${B}?`, a: g, x: [g * x * y, 2 * g, Math.abs(A - B) === g ? g + 1 : Math.abs(A - B)], ex: `${A} = ${g} × ${x} and ${B} = ${g} × ${y}; ${x} and ${y} share no factor, so the HCF is ${g}.` };
      },
      h => {
        const a = h.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.25, 1.5, 2.5]), b = h.pick([0.2, 0.3, 0.4, 0.6, 0.8, 1.2, 4, 5]), ans = rnd(a * b);
        return { q: `What is ${a} × ${b}?`, a: ans, x: [rnd(ans * 10), rnd(ans / 10), rnd(a + b)], st: v => `${a} × ${b} = ${v}`, ex: `${a} × ${b} = ${num(ans)}.` };
      },
    ],
  };

  const ALGEBRA1 = {
    easy: [
      h => { const x = h.int(2, 30), a = h.int(3, 40); return { q: `Solve for x: x + ${a} = ${x + a}`, a: x, x: [x + 2 * a, x + a, a], st: v => `If x + ${a} = ${x + a}, then x = ${v}`, ex: `Subtract ${a} from both sides: x = ${x + a} ${MINUS} ${a} = ${x}.` }; },
      h => { const a = h.int(2, 12), x = h.int(2, 12); return { q: `Solve for x: ${a}x = ${a * x}`, a: x, x: [a * x - a, x + 1], st: v => `If ${a}x = ${a * x}, then x = ${v}`, ex: `Divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}.` }; },
      h => { const a = h.int(2, 9), b = h.int(2, 12); return { q: `Solve for x: x/${a} = ${b}`, a: a * b, x: [a + b, a * b + a, Number.isInteger(b / a) ? b / a : a * b - a], st: v => `If x/${a} = ${b}, then x = ${v}`, ex: `Multiply both sides by ${a}: x = ${b} × ${a} = ${a * b}.` }; },
      h => { const x = h.int(2, 9), a = h.int(2, 9), b = h.int(1, 20); return { q: `If x = ${x}, what is ${lin(a, b)}?`, a: a * x + b, x: [a * (x + b), a + x + b, a * x - b], st: v => `When x = ${x}, ${lin(a, b)} = ${v}`, ex: `${a} × ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}.` }; },
    ],
    medium: [
      h => {
        const a = h.int(2, 9), x = h.nz(-6, 12), b = h.nz(-20, 20), c = a * x + b;
        return { q: `Solve for x: ${lin(a, b)} = ${num(c)}`, a: x, x: [(c + b) / a, c - b, -x], st: v => `The solution of ${lin(a, b)} = ${num(c)} is x = ${v}`, ex: `${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ${a}x = ${num(c - b)}. Divide by ${a}: x = ${num(x)}.` };
      },
      h => {
        const a = h.int(3, 9), c = h.int(1, a - 1), x = h.nz(-8, 8), b = h.int(-15, 15), d = (a - c) * x + b;
        return { q: `Solve for x: ${lin(a, b)} = ${lin(c, d)}`, a: x, x: [-x, (d - b) / (a + c), d - b], st: v => `The solution of ${lin(a, b)} = ${lin(c, d)} is x = ${v}`, ex: a - c === 1 ? `Collect the x terms on one side: x = ${num(d)} ${MINUS} ${paren(b)} = ${num(x)}.` : `Collect the x terms on one side: ${coefX(a - c)} = ${num(d - b)}, so x = ${num(x)}.`, tx: 1.3 };
      },
      h => {
        const a = h.int(2, 9), b = h.int(2, 9), p = h.int(1, 15), q = h.int(1, 15), ans = poly([[a + b, 1], [p - q, 0]]);
        return { q: `Simplify: ${a}x + ${p} + ${b}x ${MINUS} ${q}`, a: ans, w: [poly([[a + b, 1], [p + q, 0]]), poly([[a - b, 1], [p - q, 0]]), poly([[a + b, 2], [p - q, 0]]), poly([[a * b, 1], [p - q, 0]])], mono: true, st: v => `${a}x + ${p} + ${b}x ${MINUS} ${q} = ${v}`, ex: `x terms: ${a} + ${b} = ${a + b}. Numbers: ${p} ${MINUS} ${q} = ${num(p - q)}. So ${ans}.` };
      },
      h => {
        const a = h.int(2, 9), b = h.nz(-9, 9), ans = poly([[a, 1], [a * b, 0]]);
        return { q: `Expand: ${a}(${lin(1, b)})`, a: ans, w: [poly([[a, 1], [b, 0]]), poly([[a, 1], [-a * b, 0]]), poly([[1, 1], [a * b, 0]]), poly([[a, 1], [a + b, 0]])], mono: true, st: v => `${a}(${lin(1, b)}) = ${v}`, ex: `Multiply both terms by ${a}: ${a} × x = ${a}x and ${a} × ${paren(b)} = ${num(a * b)}.` };
      },
      h => {
        const x = h.nz(-6, 6), b = h.nz(-9, 9), ans = x * x + b * x;
        return { q: `If x = ${num(x)}, what is ${poly([[1, 2], [b, 1]])}?`, a: ans, x: [-(x * x) + b * x, x * x - b * x, 2 * x + b * x], st: v => `When x = ${num(x)}, ${poly([[1, 2], [b, 1]])} = ${v}`, ex: `${paren(x)}² = ${x * x} and ${num(b)} × ${paren(x)} = ${num(b * x)}, so the total is ${num(ans)}.` };
      },
    ],
    hard: [
      h => {
        const a = h.int(2, 6), c = h.pick([2, 3, 4, 5, 6, 7].filter(v => v !== a)), x = h.nz(-9, 9), b = h.int(1, 9), k = a * (x + b) - c * x;
        return { q: `Solve for x: ${a}(${lin(1, b)}) = ${lin(c, k)}`, a: x, x: [-x, (k - b) / (a - c), x + 2], st: v => `The solution of ${a}(${lin(1, b)}) = ${lin(c, k)} is x = ${v}`, ex: `Expand: ${lin(a, a * b)} = ${lin(c, k)}. Then ${coefX(a - c)} = ${num(k - a * b)}, so x = ${num(x)}.`, tx: 1.8 };
      },
      h => {
        const a = h.int(2, 7), x0 = h.int(-5, 10), b = h.int(-12, 12), neg = h.chance(0.5), s = neg ? -a : a, c = s * x0 + b;
        const [right, wrong] = neg ? ['<', '>'] : ['>', '<'];
        return {
          q: `Solve: ${lin(s, b)} > ${num(c)}`, a: `x ${right} ${num(x0)}`, mono: true,
          w: [`x ${wrong} ${num(x0)}`, `x ${right} ${num(-x0)}`, `x ${wrong} ${num(-x0)}`, `x ${right} ${num(x0 + 1)}`],
          ex: `${b ? `${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ` : ''}${num(s)}x > ${num(c - b)}. Divide by ${num(s)}${neg ? ' — dividing by a negative flips the sign' : ''}: x ${right} ${num(x0)}.`,
          tx: 1.5,
        };
      },
      h => {
        const n0 = h.int(3, 25), a = h.int(2, 9), b = h.int(3, 30), c = a * n0 + b;
        return { q: `I think of a number, multiply it by ${a} and add ${b}. The answer is ${c}. What was my number?`, a: n0, x: [(c + b) / a, c - b, Math.round(c / a)], ex: `Work backwards: ${c} ${MINUS} ${b} = ${c - b}, then ${c - b} ÷ ${a} = ${n0}.`, tx: 1.5 };
      },
      h => {
        const g = h.pick([4, 6, 8, 9, 10, 12, 15]), q = h.int(1, 11);
        const p = h.pick([1, 2, 3, 4, 5, 7].filter(v => gcd(v, q) === 1));
        const d = [2, 3, 5].find(f => g % f === 0), ans = `${g}(${lin(p, q)})`;
        return { q: `Factorise fully: ${lin(g * p, g * q)}`, a: ans, w: [`${d}(${lin(g / d * p, g / d * q)})`, `${g}(${lin(p, g * q)})`, `${g * p}(${lin(1, q)})`, `${g}x(${p} + ${q})`], mono: true, ex: `The highest common factor of ${g * p} and ${g * q} is ${g}, so ${lin(g * p, g * q)} = ${ans}.` };
      },
      h => {
        const x = h.int(-5, 12), y = h.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(v => v !== x)), s = x + y, d = x - y;
        return { q: `If x + y = ${num(s)} and x ${MINUS} y = ${num(d)}, what is x?`, a: x, x: [y, s + d, s - d], ex: `Add the two equations: 2x = ${num(s + d)}, so x = ${num(x)}.`, tx: 1.5 };
      },
    ],
  };

  const ALGEBRA = {
    easy: [
      h => {
        const a = h.int(2, 9), b = h.int(2, 9);
        if (h.chance(0.5)) return { q: `Simplify: x${sup(a)} · x${sup(b)}`, a: `x${sup(a + b)}`, w: [`x${sup(a * b)}`, `2x${sup(a + b)}`, `${a + b}x`, `x${sup(a + b + 1)}`], mono: true, st: v => `x${sup(a)} · x${sup(b)} = ${v}`, ex: `Multiplying powers of x: add the indices, ${a} + ${b} = ${a + b}.` };
        const big = a + b;
        return { q: `Simplify: x${sup(big)} ÷ x${sup(b)}`, a: `x${sup(a)}`, w: [`x${sup(big + b)}`, `x${sup(big * b)}`, `${a}x`, `x${sup(b)}`], mono: true, st: v => `x${sup(big)} ÷ x${sup(b)} = ${v}`, ex: `Dividing powers of x: subtract the indices, ${big} ${MINUS} ${b} = ${a}.` };
      },
      h => { const a = h.int(2, 6), b = h.int(2, 5); return { q: `Simplify: (x${sup(a)})${sup(b)}`, a: `x${sup(a * b)}`, w: [`x${sup(a + b)}`, `${a * b}x`, `${b}x${sup(a)}`, `x${sup(a * b + 1)}`], mono: true, st: v => `(x${sup(a)})${sup(b)} = ${v}`, ex: `A power of a power: multiply the indices, ${a} × ${b} = ${a * b}.` }; },
      h => {
        const base = h.pick([2, 3, 5]), k = base === 2 ? h.int(5, 10) : base === 3 ? h.int(3, 6) : h.int(2, 4), ans = base ** k;
        return { q: `What is ${base}${sup(k)}?`, a: ans, x: [base * k, base ** (k - 1), base ** (k + 1)], st: v => `${base}${sup(k)} = ${v}`, ex: `${Array(k).fill(base).join(' × ')} = ${ans}.` };
      },
      h => { const m = h.int(2, 15); return { q: `Solve: x² = ${m * m}`, a: `x = ±${m}`, w: [`x = ${m} only`, `x = ±${2 * m}`, `No real solution`, `x = ±${m * m}`], mono: true, ex: `Both ${m}² and (${MINUS}${m})² equal ${m * m}, so x = ±${m}.` }; },
    ],
    medium: [
      h => {
        let r1, r2;
        do { r1 = h.nz(-9, 9); r2 = h.nz(-9, 9); } while (r1 === r2);
        const lo = Math.min(r1, r2), hi = Math.max(r1, r2), eq = poly([[1, 2], [-(lo + hi), 1], [lo * hi, 0]]);
        return { q: `Solve: ${eq} = 0`, a: roots(lo, hi), w: [roots(-lo, -hi), roots(lo, -hi), roots(lo + 1, hi + 1), roots(-(lo + hi), lo * hi)], mono: true, ex: `Factorise: ${factor(lo)}${factor(hi)} = 0, so ${roots(lo, hi)}.`, tx: 1.5 };
      },
      h => {
        const a = h.nz(-9, 9), b = h.nz(-9, 9), ans = poly([[1, 2], [a + b, 1], [a * b, 0]]);
        return { q: `Expand: (${lin(1, a)})(${lin(1, b)})`, a: ans, w: [poly([[1, 2], [a * b, 0]]), poly([[1, 2], [a * b, 1], [a + b, 0]]), poly([[1, 2], [a + b, 1], [-a * b, 0]]), poly([[1, 2], [a - b, 1], [a * b, 0]])], mono: true, st: v => `(${lin(1, a)})(${lin(1, b)}) = ${v}`, ex: `x·x + ${paren(a)}x + ${paren(b)}x + ${paren(a)} × ${paren(b)} = ${ans}.`, tx: 1.3 };
      },
      h => {
        let r1, r2;
        do { r1 = h.nz(-9, 9); r2 = h.nz(-9, 9); } while (r1 === r2);
        const lo = Math.min(r1, r2), hi = Math.max(r1, r2), C = lo * hi, ans = factor(lo) + factor(hi);
        const pairs = [];
        for (let u = -Math.abs(C); u <= Math.abs(C); u++) if (u && C % u === 0 && u <= C / u && !(u === lo && C / u === hi)) pairs.push([u, C / u]);
        const other = pairs.length ? h.pick(pairs) : [lo + 1, hi];
        return { q: `Factorise: ${poly([[1, 2], [-(lo + hi), 1], [C, 0]])}`, a: ans, w: [factor(-lo) + factor(-hi), factor(lo) + factor(-hi), factor(other[0]) + factor(other[1]), factor(-lo) + factor(hi)], mono: true, ex: `Find two numbers that multiply to ${num(C)} and add to ${num(-(lo + hi))}: ${num(-lo)} and ${num(-hi)}. So ${ans}.`, tx: 1.5 };
      },
      h => {
        const x = h.int(-5, 10), y = h.int(-5, 10), A = 2 * x + y, B = x + y;
        return { q: `If 2x + y = ${num(A)} and x + y = ${num(B)}, what is x?`, a: x, x: [y, A + B, A - B + 1], ex: `Subtract the second equation from the first: x = ${num(A)} ${MINUS} ${paren(B)} = ${num(x)}.`, tx: 1.5 };
      },
      h => {
        const m = h.nz(-5, 5), x1 = h.int(-6, 6), y1 = h.int(-6, 6), dx = h.int(1, 6), x2 = x1 + dx, y2 = y1 + m * dx;
        return { q: `What is the gradient of the line through (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)})?`, a: m, x: [-m, m * dx, dx], ex: `Gradient = rise ÷ run = (${num(y2)} ${MINUS} ${paren(y1)}) ÷ (${num(x2)} ${MINUS} ${paren(x1)}) = ${num(m * dx)} ÷ ${dx} = ${num(m)}.`, tx: 1.5 };
      },
    ],
    hard: [
      h => {
        const kind = h.pick(['two', 'one', 'none']);
        let b, c;
        if (kind === 'two') { let r1, r2; do { r1 = h.int(-8, 8); r2 = h.int(-8, 8); } while (r1 === r2); b = -(r1 + r2); c = r1 * r2; }
        else if (kind === 'one') { const r = h.nz(-7, 7); b = -2 * r; c = r * r; }
        else { b = h.int(-6, 6); c = Math.floor(b * b / 4) + h.int(1, 9); }
        const D = b * b - 4 * c, ans = D > 0 ? 'Two' : D === 0 ? 'One' : 'None';
        return { q: `How many real solutions does ${poly([[1, 2], [b, 1], [c, 0]])} = 0 have?`, a: ans, w: ['Two', 'One', 'None', 'Infinitely many'].filter(v => v !== ans), ex: `Discriminant b² ${MINUS} 4ac = ${paren(b)}² ${MINUS} 4 × ${paren(c)} = ${num(D)}${D > 0 ? ' > 0, so two solutions.' : D === 0 ? ', so exactly one solution.' : ' < 0, so no real solutions.'}`, tx: 1.6 };
      },
      h => {
        let a, b, c, tries = 0;
        do { a = h.int(1, 4); b = h.nz(-12, 12); c = h.nz(-12, 12); } while (b * b - 4 * a * c < 0 && ++tries < 30);
        const eq = `${poly([[a, 2], [b, 1], [c, 0]])} = 0`;
        if (h.chance(0.5)) return { q: `What is the sum of the roots of ${eq}?`, a: frac(-b, a), w: [frac(b, a), frac(c, a), frac(-c, a), frac(-b, 1)], ex: `For ax² + bx + c = 0 the roots add up to ${MINUS}b/a = ${frac(-b, a)}.`, tx: 1.6 };
        return { q: `What is the product of the roots of ${eq}?`, a: frac(c, a), w: [frac(-c, a), frac(-b, a), frac(b, a), frac(c, 1)], ex: `For ax² + bx + c = 0 the roots multiply to c/a = ${frac(c, a)}.`, tx: 1.6 };
      },
      h => {
        const base = h.pick([2, 3, 5]), k = base === 2 ? h.int(3, 8) : base === 3 ? h.int(2, 5) : h.int(2, 4), N = base ** k;
        return { q: `Solve: ${base}ˣ = ${N}`, a: k, x: [k + 1, k - 1, N / base], st: v => `If ${base}ˣ = ${N}, then x = ${v}`, ex: `${base}${sup(k)} = ${N}, so x = ${k}.` };
      },
      h => {
        const base = h.pick([2, 3, 5, 10]), k = { 2: h.int(3, 8), 3: h.int(2, 5), 5: h.int(2, 4), 10: h.int(2, 6) }[base], N = base ** k;
        return { q: `What is log${sub(base)}(${N})?`, a: k, x: [k + 1, k - 1, N / base], st: v => `log${sub(base)}(${N}) = ${v}`, ex: `${base}${sup(k)} = ${N}, so log${sub(base)}(${N}) = ${k}.` };
      },
      h => {
        const p = h.pick([2, 3]), q = h.pick([-7, -5, -4, -2, -1, 1, 2, 4, 5, 7].filter(v => gcd(v, p) === 1)), s = h.nz(-6, 6);
        const eq = poly([[p, 2], [-(p * s + q), 1], [q * s, 0]]);
        const show = (u, us, v) => (u <= v ? `x = ${us} or x = ${num(v)}` : `x = ${num(v)} or x = ${us}`);
        return {
          q: `Solve: ${eq} = 0`, a: show(q / p, frac(q, p), s), mono: true, tx: 1.8,
          w: [show(-q / p, frac(-q, p), -s), show(q, num(q), s), show(p / q, frac(p, q), s), show(q / p, frac(q, p), -s)],
          ex: `Factorise: (${lin(p, -q)})(${lin(1, -s)}) = 0, so x = ${frac(q, p)} or x = ${num(s)}.`,
        };
      },
      h => {
        const x = h.int(-4, 8), y = h.int(-4, 8), A = 2 * x + 3 * y, B = x - y;
        return { q: `If 2x + 3y = ${num(A)} and x ${MINUS} y = ${num(B)}, what is y?`, a: y, x: [x, -y, A - 2 * B], ex: `x = y + ${paren(B)}, so 2(y + ${paren(B)}) + 3y = ${num(A)}, giving 5y = ${num(A - 2 * B)} and y = ${num(y)}.`, tx: 1.8 };
      },
    ],
  };

  const TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
  const TRIG = [['sin', 0, '0'], ['sin', 30, '1/2'], ['sin', 45, '√2/2'], ['sin', 60, '√3/2'], ['sin', 90, '1'],
    ['cos', 0, '1'], ['cos', 30, '√3/2'], ['cos', 45, '√2/2'], ['cos', 60, '1/2'], ['cos', 90, '0'],
    ['tan', 0, '0'], ['tan', 30, '√3/3'], ['tan', 45, '1'], ['tan', 60, '√3']];
  const TRIG_VALUES = ['0', '1/2', '√2/2', '√3/2', '1', '√3', '√3/3'];

  const GEOMETRY = {
    easy: [
      h => { const l = h.int(4, 25), w = h.int(2, Math.min(15, l - 1)); return { q: `A rectangle is ${l} cm long and ${w} cm wide. What is its area in cm²?`, a: l * w, x: [2 * (l + w), l + w, l * w + l], ex: `Area = length × width = ${l} × ${w} = ${l * w} cm².` }; },
      h => { const l = h.int(4, 25), w = h.int(2, Math.min(15, l - 1)); return { q: `A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter in cm?`, a: 2 * (l + w), x: [l * w, l + w, 2 * l + w], ex: `Perimeter = 2 × (${l} + ${w}) = ${2 * (l + w)} cm.` }; },
      h => { const a = h.int(25, 85), b = h.int(25, 150 - a), c = 180 - a - b; return { q: `Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`, a: c, u: '°', x: [360 - a - b, c + 10, 180 - a], st: v => `A triangle with angles ${a}° and ${b}° has a third angle of ${v}`, ex: `Angles in a triangle add up to 180°: 180 ${MINUS} ${a} ${MINUS} ${b} = ${c}°.` }; },
      h => { const b = 2 * h.int(2, 12), ht = h.int(3, 15); return { q: `A triangle has a base of ${b} cm and a height of ${ht} cm. What is its area in cm²?`, a: b * ht / 2, x: [b * ht, b + ht, b * ht / 2 + ht], ex: `Area = ½ × base × height = ½ × ${b} × ${ht} = ${b * ht / 2} cm².` }; },
      h => { const a = h.int(20, 160); return { q: `Two angles sit on a straight line. One is ${a}°. What is the other?`, a: 180 - a, u: '°', x: [360 - a, Math.abs(90 - a) || 45, 180 - a + 10], st: v => `If one angle on a straight line is ${a}°, the other is ${v}`, ex: `Angles on a straight line add up to 180°: 180 ${MINUS} ${a} = ${180 - a}°.` }; },
    ],
    medium: [
      h => {
        const [p, q, c] = h.pick(TRIPLES);
        if (h.chance(0.5)) return { q: `A right-angled triangle has shorter sides of ${p} cm and ${q} cm. How long is the hypotenuse, in cm?`, a: c, x: [p + q, c + 1, c - 1], ex: `Pythagoras: ${p}² + ${q}² = ${p * p} + ${q * q} = ${c * c}, and √${c * c} = ${c} cm.`, tx: 1.4 };
        return { q: `A right-angled triangle has a hypotenuse of ${c} cm and one side of ${p} cm. How long is the other side, in cm?`, a: q, x: [c - p, c + p, q + 1], ex: `Pythagoras: ${c}² ${MINUS} ${p}² = ${c * c} ${MINUS} ${p * p} = ${q * q}, and √${q * q} = ${q} cm.`, tx: 1.4 };
      },
      h => { const r = h.int(2, 12); return { q: `A circle has a radius of ${r} cm. What is its area, in terms of π?`, a: `${r * r}π cm²`, w: [`${2 * r}π cm²`, `${r}π cm²`, `${2 * r * r}π cm²`, `${r * r} cm²`], ex: `Area = πr² = π × ${r}² = ${r * r}π cm².` }; },
      h => { const r = h.int(2, 12); return { q: `A circle has a radius of ${r} cm. What is its circumference, in terms of π?`, a: `${2 * r}π cm`, w: [`${r * r}π cm`, `${r}π cm`, `${4 * r}π cm`, `${2 * r} cm`], ex: `Circumference = 2πr = 2 × π × ${r} = ${2 * r}π cm.` }; },
      h => { const n = h.pick([5, 6, 7, 8, 9, 10, 12]); return { q: `What do the interior angles of ${an(POLYGON[n])} add up to?`, a: (n - 2) * 180, u: '°', x: [n * 180, (n - 1) * 180, (n - 2) * 90], st: v => `The interior angles of ${an(POLYGON[n])} add up to ${v}`, ex: `Sum = (n ${MINUS} 2) × 180° = (${n} ${MINUS} 2) × 180° = ${(n - 2) * 180}°.` }; },
      h => { const l = h.int(2, 12), w = h.int(2, 10), ht = h.int(2, 9); return { q: `A cuboid measures ${l} cm × ${w} cm × ${ht} cm. What is its volume in cm³?`, a: l * w * ht, x: [2 * (l * w + w * ht + l * ht), l + w + ht, l * w + ht], ex: `Volume = ${l} × ${w} × ${ht} = ${l * w * ht} cm³.` }; },
    ],
    hard: [
      h => { const [fn, deg, v] = h.pick(TRIG); return { q: `What is the exact value of ${fn} ${deg}°?`, a: v, w: h.shuffle(TRIG_VALUES.filter(t => t !== v)), st: t => `${fn} ${deg}° = ${t}`, ex: `${fn} ${deg}° = ${v}${fn === 'tan' && deg === 30 ? ' (that is, 1/√3)' : ''}.` }; },
      h => {
        const n = h.pick([5, 6, 8, 9, 10, 12]), ans = 180 * (n - 2) / n;
        return { q: `What is each interior angle of a regular ${POLYGON[n]}?`, a: ans, u: '°', x: [360 / n, (n - 2) * 180, 180 - 180 / n], st: v => `Each interior angle of a regular ${POLYGON[n]} is ${v}`, ex: `The angles add up to (${n} ${MINUS} 2) × 180° = ${(n - 2) * 180}°, and ${(n - 2) * 180}° ÷ ${n} = ${ans}°.`, tx: 1.5 };
      },
      h => { const r = h.int(2, 8), ht = h.int(2, 12); return { q: `A cylinder has a radius of ${r} cm and a height of ${ht} cm. What is its volume, in terms of π?`, a: `${r * r * ht}π cm³`, w: [`${2 * r * ht}π cm³`, `${r * ht}π cm³`, `${2 * r * r * ht}π cm³`, `${r * r * ht} cm³`], ex: `Volume = πr²h = π × ${r * r} × ${ht} = ${r * r * ht}π cm³.`, tx: 1.5 }; },
      h => {
        const [p, q, c] = h.pick(TRIPLES.slice(0, 4)), x1 = h.int(-5, 5), y1 = h.int(-5, 5), sx = h.pick([1, -1]), sy = h.pick([1, -1]);
        return { q: `What is the distance between (${num(x1)}, ${num(y1)}) and (${num(x1 + sx * p)}, ${num(y1 + sy * q)})?`, a: c, x: [p + q, c + 1, Math.abs(p - q)], ex: `Across ${p}, up/down ${q}: √(${p}² + ${q}²) = √${c * c} = ${c}.`, tx: 1.6 };
      },
      h => { const a = h.int(3, 12), b = h.int(a + 1, 20), ht = 2 * h.int(2, 7), ans = (a + b) * ht / 2; return { q: `A trapezium has parallel sides of ${a} cm and ${b} cm and a height of ${ht} cm. What is its area in cm²?`, a: ans, x: [(a + b) * ht, a * b, a + b + ht], ex: `Area = ½ × (${a} + ${b}) × ${ht} = ${ans} cm².`, tx: 1.4 }; },
    ],
  };

  const STANDARD_D = [['sin x', 'cos x', ['−cos x', '−sin x', 'tan x']], ['cos x', '−sin x', ['sin x', '−cos x', 'cos x']],
    ['eˣ', 'eˣ', ['xeˣ⁻¹', 'ln x', '1/x']], ['ln x', '1/x', ['eˣ', 'x ln x', '1/x²']], ['1/x', '−1/x²', ['ln x', '1/x²', '−1/x']], ['√x', '1/(2√x)', ['2√x', '√x/2', '1/√x']]];
  const PRODUCT_D = [['x·eˣ', '(x + 1)eˣ', ['eˣ', 'x·eˣ', 'xeˣ⁻¹']], ['x·sin x', 'sin x + x cos x', ['cos x', 'x cos x', 'sin x − x cos x']],
    ['x²·ln x', '2x ln x + x', ['2x ln x', '2', 'x ln x + 2x']], ['x·cos x', 'cos x − x sin x', ['−sin x', 'cos x + x sin x', '−x sin x']]];

  const CALCULUS = {
    easy: [
      h => {
        const a = h.int(2, 9), n = h.int(2, 6), f = termStr(a, n), ans = poly([[a * n, n - 1]]);
        return { q: `What is d/dx (${f})?`, a: ans, w: [poly([[a, n - 1]]), poly([[a * n, n]]), poly([[a * (n - 1), n - 1]]), poly([[a, n + 1]])], mono: true, st: v => `d/dx (${f}) = ${v}`, ex: `Bring the power down and reduce it by 1: ${n} × ${a} = ${a * n}, power ${n - 1}, so ${ans}.` };
      },
      h => {
        if (h.chance(0.4)) { const k = h.int(2, 20); return { q: `What is d/dx (${k})?`, a: '0', w: [String(k), '1', `${k}x`], mono: true, st: v => `d/dx (${k}) = ${v}`, ex: `A constant doesn’t change, so its derivative is 0.` }; }
        const a = h.int(2, 9), b = h.nz(-9, 9);
        return { q: `What is d/dx (${lin(a, b)})?`, a: String(a), w: [`${a}x`, num(a + b), num(b), '0'], mono: true, st: v => `d/dx (${lin(a, b)}) = ${v}`, ex: `d/dx (${a}x) = ${a}, and the constant ${num(b)} disappears.` };
      },
      h => { const [f, d, w] = h.pick(STANDARD_D); return { q: `What is d/dx (${f})?`, a: d, w, mono: true, st: v => `d/dx (${f}) = ${v}`, ex: `A standard derivative: d/dx (${f}) = ${d}.` }; },
      h => {
        if (h.chance(0.5)) { const a = h.int(2, 9); return { q: `What is ∫ ${a} dx?`, a: `${a}x + C`, w: [`${a} + C`, `${a}x² + C`, `x + C`, '0'], mono: true, ex: `The integral of a constant ${a} is ${a}x, plus the constant C.` }; }
        const m = h.int(2, 9);
        return { q: `What is ∫ ${2 * m}x dx?`, a: `${m}x² + C`, w: [`${2 * m}x² + C`, `${2 * m} + C`, `${m}x + C`, `${4 * m}x² + C`], mono: true, ex: `Add 1 to the power and divide by it: ${2 * m}x²/2 = ${m}x², plus C.` };
      },
    ],
    medium: [
      h => {
        const a = h.nz(-5, 5), b = h.int(-9, 9), c = h.int(-9, 9), d = h.nz(-9, 9);
        const f = poly([[a, 3], [b, 2], [c, 1], [d, 0]]), ans = poly([[3 * a, 2], [2 * b, 1], [c, 0]]);
        return { q: `If f(x) = ${f}, what is f′(x)?`, a: ans, w: [poly([[3 * a, 3], [2 * b, 2], [c, 1]]), poly([[3 * a, 2], [2 * b, 1], [c + d, 0]]), poly([[a, 2], [b, 1], [c, 0]]), poly([[3 * a, 2], [b, 1], [c, 0]])], mono: true, ex: `Differentiate term by term (power × coefficient, power − 1; the constant vanishes): f′(x) = ${ans}.`, tx: 1.5 };
      },
      h => {
        const a = h.nz(-4, 5), b = h.int(-9, 9), c = h.int(-9, 9), k = h.nz(-4, 4), f = poly([[a, 2], [b, 1], [c, 0]]), ans = 2 * a * k + b;
        return { q: `If f(x) = ${f}, what is f′(${num(k)})?`, a: ans, x: [a * k * k + b * k + c, a * k + b, 2 * a * k - b], ex: `f′(x) = ${poly([[2 * a, 1], [b, 0]])}, so f′(${num(k)}) = ${num(2 * a)} × ${paren(k)}${b ? ` ${b < 0 ? MINUS : '+'} ${Math.abs(b)}` : ''} = ${num(ans)}.`, tx: 1.5 };
      },
      h => {
        const n = h.int(1, 4), m = h.nz(-5, 6), a = m * (n + 1), ans = `${poly([[m, n + 1]])} + C`;
        return { q: `What is ∫ ${poly([[a, n]])} dx?`, a: ans, w: [`${poly([[a * n, n - 1]])} + C`, `${poly([[a, n + 1]])} + C`, `${poly([[m, n]])} + C`, poly([[m, n + 1]])], mono: true, ex: `Add 1 to the power and divide by the new power: ${num(a)}x${sup(n + 1)} ÷ ${n + 1} = ${poly([[m, n + 1]])}, plus C.`, tx: 1.4 };
      },
      h => {
        const a = h.nz(-3, 4), b = h.int(-9, 9), c = h.int(-9, 9), k = h.int(-4, 4), f = poly([[a, 2], [b, 1], [c, 0]]), val = a * k * k + b * k + c;
        return { q: `What is the limit of ${f} as x → ${num(k)}?`, a: val, x: [a * k * k - b * k + c, val + a, c], ex: `A polynomial is continuous, so just substitute x = ${num(k)}: ${num(val)}.` };
      },
    ],
    hard: [
      h => {
        const c = 2 * h.nz(-3, 4), d = h.int(-6, 6), lo = h.int(0, 2), hi = h.int(lo + 1, lo + 4);
        const F = x => (c / 2) * x * x + d * x, ans = F(hi) - F(lo);
        return { q: `Evaluate ∫${sub(lo)}${sup(hi)} (${lin(c, d)}) dx`, a: ans, x: [F(hi), c * (hi - lo), F(hi) + F(lo)], ex: `Antiderivative: ${poly([[c / 2, 2], [d, 1]])}. At ${hi}: ${num(F(hi))}; at ${lo}: ${num(F(lo))}. ${num(F(hi))} ${MINUS} ${paren(F(lo))} = ${num(ans)}.`, tx: 2 };
      },
      h => {
        const a = h.int(2, 6), b = h.nz(-9, 9), n = h.int(2, 5), inner = `(${lin(a, b)})`, p = n - 1 === 1 ? '' : sup(n - 1);
        const ans = `${n * a}${inner}${p}`;
        return { q: `What is d/dx ${inner}${sup(n)}?`, a: ans, w: [`${n}${inner}${p}`, `${n * a}${inner}${sup(n)}`, `${a}${inner}${p}`, `${n * a}x${p}`], mono: true, ex: `Chain rule: ${n}${inner}${p} × ${a} (the derivative of the inside) = ${ans}.`, tx: 1.6 };
      },
      h => {
        const a = h.int(1, 3), p = h.nz(-6, 6), b = -2 * a * p, c = h.int(-9, 9), f = poly([[a, 2], [b, 1], [c, 0]]);
        return { q: `At what value of x does f(x) = ${f} have a turning point?`, a: p, x: [-p, 2 * p, c], ex: `f′(x) = ${poly([[2 * a, 1], [b, 0]])} = 0 when x = ${num(p)}.`, tx: 1.6 };
      },
      h => {
        const a = h.nz(-7, 7);
        return { q: `What is the limit of (x² ${MINUS} ${a * a}) ÷ (${lin(1, -a)}) as x → ${num(a)}?`, a: 2 * a, x: [a, 0, a * a], ex: `x² ${MINUS} ${a * a} = (${lin(1, -a)})(${lin(1, a)}), so the fraction is ${lin(1, a)} and the limit is ${num(a)} + ${paren(a)} = ${num(2 * a)}.`, tx: 1.6 };
      },
      h => { const [f, d, w] = h.pick(PRODUCT_D); return { q: `What is d/dx (${f})?`, a: d, w, mono: true, ex: `Product rule, (uv)′ = u′v + uv′: ${d}.`, tx: 1.6 }; },
      h => {
        const a = h.nz(-4, 4), b = h.nz(-6, 6), c = h.int(-9, 9), f = poly([[a, 3], [b, 2], [c, 1]]), ans = poly([[6 * a, 1], [2 * b, 0]]);
        return { q: `If f(x) = ${f}, what is f″(x)?`, a: ans, w: [poly([[3 * a, 2], [2 * b, 1], [c, 0]]), poly([[3 * a, 1], [2 * b, 0]]), poly([[6 * a, 1], [b, 0]]), poly([[6 * a, 2], [2 * b, 1]])], mono: true, ex: `f′(x) = ${poly([[3 * a, 2], [2 * b, 1], [c, 0]])}, and differentiating again gives f″(x) = ${ans}.`, tx: 1.6 };
      },
    ],
  };

  const KINDS = { arith: ARITH, algebra1: ALGEBRA1, algebra: ALGEBRA, geometry: GEOMETRY, calculus: CALCULUS };
  const TX = { easy: 1, medium: 1.3, hard: 1.6 };

  /* ---------- Turning a problem into a quiz question ---------- */
  function assemble(s, lv, h, mcqOnly) {
    const fmt = v => (typeof v === 'number' ? num(v) + (s.u || '') : v);
    const base = { q: s.q, explain: s.ex, difficulty: lv, tx: s.tx || TX[lv], gen: true };
    const numeric = typeof s.a === 'number';
    const wrongs = numeric ? nearNums(s.a, h, (s.x || []).filter(v => Number.isFinite(v))).map(fmt) : (s.w || []);
    const correct = fmt(s.a);
    const roll = h.r();
    // Typed answer: whole-number answers only, checked by value.
    if (!mcqOnly && numeric && Number.isInteger(s.a) && roll < 0.2) {
      return { ...base, type: 'written', num: s.a, accept: [String(s.a), num(s.a)], answerText: correct };
    }
    // True or false: show the right answer or a likely wrong one.
    if (s.st && roll > 0.87 && wrongs.length) {
      const truth = h.chance(0.5);
      return { ...base, type: 'mcq', tf: true, q: `True or false: ${s.st(truth ? correct : h.pick(wrongs.slice(0, 3)))}`, options: ['True', 'False'], answer: truth ? 0 : 1, tx: base.tx * 0.8 };
    }
    const opts = [correct];
    for (const w of wrongs) if (opts.length < 4 && w && !opts.includes(w)) opts.push(w);
    if (opts.length < 4) return null;
    const order = h.shuffle([0, 1, 2, 3]);
    return { ...base, type: 'mcq', options: order.map(i => opts[i]), answer: order.indexOf(0), mono: !!s.mono };
  }

  // Levels for n questions: one level, or an even easy → medium → hard spread for "mixed".
  function levelsFor(difficulty, n) {
    if (TX[difficulty]) return Array(n).fill(difficulty);
    return Array.from({ length: n }, (_, i) => ['easy', 'medium', 'hard'][Math.min(2, Math.floor(i * 3 / n))]);
  }

  function build(kind, n, random, { mcqOnly = false, difficulty = 'mixed' } = {}) {
    const h = tools(random);
    const kinds = kind === 'mix' ? h.shuffle(Object.keys(KINDS)) : [KINDS[kind] ? kind : 'arith'];
    const levels = levelsFor(difficulty, n);
    const out = [], seen = new Set(), lastMaker = {};
    for (let i = 0, guard = 0; out.length < n && guard < n * 40; guard++) {
      const k = kinds[i % kinds.length], lv = levels[out.length];
      const makers = KINDS[k][lv];
      let m = h.int(0, makers.length - 1);
      if (makers.length > 1 && m === lastMaker[k + lv]) m = (m + 1) % makers.length; // no same problem type twice in a row
      const spec = makers[m](h);
      if (seen.has(spec.q)) continue;
      const q = assemble(spec, lv, h, mcqOnly);
      if (!q) continue;
      seen.add(spec.q);
      lastMaker[k + lv] = m;
      out.push(q);
      i++;
    }
    return out;
  }

  // Reads a typed number: "12", "-3", "−3", "3/4", "0.75", "x = 5", "68°".
  function parseNumber(text) {
    const t = String(text).normalize('NFKC').replace(/[−–]/g, '-').replace(/[\s,]/g, '').replace(/^x=/i, '').replace(/[^\d./+-]+$/, '');
    const f = t.match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/);
    if (f) return +f[2] ? +f[1] / +f[2] : NaN;
    return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? +t : NaN;
  }

  window.QUIZ_MATHS = { build, parseNumber, KINDS: Object.keys(KINDS) };
})();
