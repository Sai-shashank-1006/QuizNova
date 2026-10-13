/* QuizNova — DSA & coding-interview problem generator.
 *
 * Builds code-tracing questions in the style of coding interviews: a short JavaScript function (two pointers,
 * sliding window, hash maps, stacks, linked lists, recursion, DP, binary search, trees, graphs, bits) and a call with
 * fresh random input; you predict what it returns. Each answer is worked out by running the same logic here, and the
 * test suite also runs the code exactly as shown to make sure the two agree. Interview concept questions (which data
 * structure, which algorithm, what complexity) fill out every level.
 *
 * Code makers return { q, code, lang, a, w/x, ex, t } — see js/maths.js. The last line of `code` is the call to trace.
 */
(() => {
  'use strict';
  const QM = window.QUIZ_MATHS;
  if (!QM || !QM.register) return;
  const { distinct, ord } = QM.helpers;

  /* ---------- Helpers ---------- */
  const show = v => (Array.isArray(v) ? `[${v.map(show).join(', ')}]` : typeof v === 'string' ? `"${v}"` : String(v));
  const arr = (h, n, lo, hi) => Array.from({ length: n }, () => h.int(lo, hi));
  const uniq = (h, n, lo, hi) => h.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, n);
  const sum = a => a.reduce((s, v) => s + v, 0);
  const call = (fn, ...args) => `${fn}(${args.map(show).join(', ')}); // → ?`;
  const LIST = '// Helpers: list([1, 2]) builds 1 → 2; arr(head) reads it back.\nconst list = a => a.reduceRight((next, val) => ({ val, next }), null);\nconst arr = h => { const out = []; for (; h; h = h.next) out.push(h.val); return out; };';
  const BST = 'function insert(n, v) {\n  if (!n) return { val: v, left: null, right: null };\n  if (v < n.val) n.left = insert(n.left, v);\n  else n.right = insert(n.right, v);\n  return n;\n}';
  // Wrong arrays: the given slips, then small changes to the answer (a swap, one value off by one, one dropped).
  function arrW(ans, h, slips = []) {
    const out = slips.map(show), a = ans;
    for (let t = 0; t < 12 && a.length; t++) {
      const b = a.slice(), i = h.int(0, b.length - 1), k = h.int(0, 2);
      if (k === 0 && b.length > 1) { const j = i === b.length - 1 ? i - 1 : i + 1; [b[i], b[j]] = [b[j], b[i]]; }
      else if (k === 1 && typeof b[i] === 'number') b[i] += h.chance(0.5) ? 1 : -1;
      else if (b.length > 1) b.splice(i, 1);
      out.push(show(b));
    }
    return distinct(show(ans), out);
  }
  const strW = (ans, slips) => distinct(show(ans), slips.map(show));
  // A true/false question about what the call returns.
  const claim = (h, base, result) => { const c = h.chance(0.5) ? result : !result; return { ...base, q: `The call at the bottom returns ${c}.`, tf: c === result }; };

  /* ---------- 1. Arrays & Strings ---------- */
  const ARRAYS = {
    easy: [
      h => {
        const a = arr(h, h.int(6, 9), 1, 30), k = h.pick([2, 3, 4, 5]), c = a.filter(x => x % k === 0).length;
        return { t: 'Loops', q: 'What does this call return?', code: `function countDivisible(arr, k) {\n  let count = 0;\n  for (const x of arr) {\n    if (x % k === 0) count++;\n  }\n  return count;\n}\n\n${call('countDivisible', a, k)}`,
          a: c, x: [a.length - c, c + 1, c - 1], ex: `Multiples of ${k}: ${a.filter(x => x % k === 0).join(', ') || 'none'} → ${c}.` };
      },
      h => {
        const a = arr(h, h.int(5, 8), 1, 20), limit = h.int(10, Math.max(11, sum(a) + 5)); let s = 0, idx = -1; const run = [];
        for (let i = 0; i < a.length; i++) { s += a[i]; run.push(s); if (s > limit) { idx = i; break; } }
        return { t: 'Loops', q: 'What does this call return?', code: `function firstOver(arr, limit) {\n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n    if (sum > limit) return i;\n  }\n  return -1;\n}\n\n${call('firstOver', a, limit)}`,
          a: idx, x: [idx + 1, idx - 1, run.length, -1].filter(v => v !== idx), ex: `Running sums: ${run.join(', ')}${idx < 0 ? ` — never above ${limit}, so −1` : ` — first above ${limit} at index ${idx}`}.` };
      },
      h => {
        const base = h.pick(['level', 'racecar', 'madam', 'refer', 'noon', 'rotor', 'stats', 'civic', 'kayak']), pal = h.chance(0.5);
        const s = pal ? base : base.slice(0, -1) + (base.slice(-1) === 'a' ? 'b' : 'a'), res = s === s.split('').reverse().join('');
        const spec = { t: 'Two pointers', q: 'Look at this call', code: `function isPalindrome(s) {\n  let i = 0, j = s.length - 1;\n  while (i < j) {\n    if (s[i] !== s[j]) return false;\n    i++;\n    j--;\n  }\n  return true;\n}\n\n${call('isPalindrome', s)}`,
          ex: res ? `Every pair from both ends matches, so it returns true.` : `"${s[0]}" vs "${s[s.length - 1]}" at the ends${s[0] === s[s.length - 1] ? ' match, but an inner pair differs' : ' differ'}, so it returns false.` };
        return claim(h, spec, res);
      },
      h => {
        const a = arr(h, h.int(6, 9), -5, 20), l = h.int(0, a.length - 3), r = h.int(l + 1, a.length - 1), p = [0];
        for (const x of a) p.push(p[p.length - 1] + x);
        const v = p[r + 1] - p[l];
        return { t: 'Prefix sums', q: 'What does this call return?', code: `function rangeSum(arr, l, r) {\n  const pre = [0];\n  for (const x of arr) pre.push(pre[pre.length - 1] + x);\n  return pre[r + 1] - pre[l];\n}\n\n${call('rangeSum', a, l, r)}`,
          a: v, x: [p[r] - p[l], p[r + 1] - p[l + 1], v + a[r]], ex: `pre = ${show(p)}; pre[${r + 1}] − pre[${l}] = ${p[r + 1]} − ${p[l]} = ${v} (the sum of indices ${l} to ${r}).` };
      },
    ],
    medium: [
      h => {
        const a = arr(h, h.int(6, 9), 1, 12), k = h.int(2, 4), sums = [];
        for (let i = 0; i + k <= a.length; i++) sums.push(sum(a.slice(i, i + k)));
        const best = Math.max(...sums);
        return { t: 'Sliding window', q: 'What does this call return?', code: `function maxWindow(arr, k) {\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += arr[i];\n  let best = sum;\n  for (let i = k; i < arr.length; i++) {\n    sum += arr[i] - arr[i - k];\n    best = Math.max(best, sum);\n  }\n  return best;\n}\n\n${call('maxWindow', a, k)}`,
          a: best, x: [sums[0], Math.max(...a) * k, best - 1, sum(a)], ex: `Window sums of size ${k}: ${sums.join(', ')} → best ${best}.` };
      },
      h => {
        const a = arr(h, h.int(6, 9), -8, 9); let cur = a[0], best = a[0]; const trace = [cur];
        for (let i = 1; i < a.length; i++) { cur = Math.max(a[i], cur + a[i]); best = Math.max(best, cur); trace.push(cur); }
        return { t: 'Kadane’s algorithm', q: 'What does this call return?', code: `function maxSubarray(nums) {\n  let cur = nums[0], best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  return best;\n}\n\n${call('maxSubarray', a)}`,
          a: best, x: [sum(a), Math.max(...a), best + 1, sum(a.filter(v => v > 0))].filter(v => v !== best), ex: `Best sum ending at each index: ${trace.join(', ')}; the largest is ${best}.` };
      },
      h => {
        const a = arr(h, h.int(6, 8), 0, 9).map(v => (v < 4 ? 0 : v)), b = a.slice(); let w = 0;
        for (let r = 0; r < b.length; r++) if (b[r] !== 0) { [b[w], b[r]] = [b[r], b[w]]; w++; }
        return { t: 'Two pointers', q: 'What does this call return?', code: `function moveZeros(a) {\n  let w = 0;\n  for (let r = 0; r < a.length; r++) {\n    if (a[r] !== 0) {\n      [a[w], a[r]] = [a[r], a[w]];\n      w++;\n    }\n  }\n  return a;\n}\n\n${call('moveZeros', a)}`,
          a: show(b), mono: true, w: arrW(b, h, [a, [...a.filter(v => v === 0), ...a.filter(v => v)], a.slice().sort((x, y) => x - y)]), ex: `w marks where the next non-zero goes; non-zeros keep their order (${a.filter(v => v).join(', ')}) and the zeros end up at the back: ${show(b)}.` };
      },
      h => {
        const a = arr(h, h.int(7, 10), 1, 6).sort((x, y) => x - y), b = a.slice(); let k = 1;
        for (let i = 1; i < b.length; i++) if (b[i] !== b[k - 1]) b[k++] = b[i];
        return { t: 'Two pointers', q: 'What does this call return?', code: `function dedupe(a) {\n  let k = 1;\n  for (let i = 1; i < a.length; i++) {\n    if (a[i] !== a[k - 1]) a[k++] = a[i];\n  }\n  return k;\n}\n\n${call('dedupe', a)}`,
          a: k, x: [a.length, k - 1, k + 1], ex: `k counts the distinct values of the sorted array: ${[...new Set(a)].join(', ')} → ${k}.` };
      },
      h => {
        const p = arr(h, h.int(6, 9), 1, 20); let mn = Infinity, best = 0;
        for (const x of p) { mn = Math.min(mn, x); best = Math.max(best, x - mn); }
        return { t: 'Greedy', q: 'What does this call return?', code: `function maxProfit(prices) {\n  let minPrice = Infinity, best = 0;\n  for (const p of prices) {\n    minPrice = Math.min(minPrice, p);\n    best = Math.max(best, p - minPrice);\n  }\n  return best;\n}\n\n${call('maxProfit', p)}`,
          a: best, x: [Math.max(...p) - Math.min(...p), best + 1, p[p.length - 1] - p[0]].filter(v => v !== best && v >= 0), ex: `Buy at the lowest price seen so far and sell later: the best gap is ${best}.` };
      },
      h => {
        const a = uniq(h, h.int(6, 9), 1, 25).sort((x, y) => x - y), t = a[h.int(0, a.length - 1)] + a[h.int(0, a.length - 1)]; let i = 0, j = a.length - 1, c = 0; const pairs = [];
        while (i < j) { const s = a[i] + a[j]; if (s === t) { c++; pairs.push(`${a[i]}+${a[j]}`); i++; j--; } else if (s < t) i++; else j--; }
        return { t: 'Two pointers', q: 'What does this call return?', code: `function countPairs(a, target) {\n  let i = 0, j = a.length - 1, count = 0;\n  while (i < j) {\n    const s = a[i] + a[j];\n    if (s === target) { count++; i++; j--; }\n    else if (s < target) i++;\n    else j--;\n  }\n  return count;\n}\n\n${call('countPairs', a, t)}`,
          a: c, x: [c + 1, c - 1, c * 2].filter(v => v >= 0), ex: `Pairs found: ${pairs.join(', ') || 'none'} → ${c}.` };
      },
    ],
    hard: [
      h => {
        const s = Array.from({ length: h.int(7, 11) }, () => h.pick(['a', 'b', 'c', 'd', 'e'])).join(''), last = new Map(); let start = 0, best = 0, bs = 0;
        for (let i = 0; i < s.length; i++) { if (last.has(s[i]) && last.get(s[i]) >= start) start = last.get(s[i]) + 1; last.set(s[i], i); if (i - start + 1 > best) { best = i - start + 1; bs = start; } }
        return { t: 'Sliding window', q: 'What does this call return?', code: `function longestUnique(s) {\n  const last = new Map();\n  let start = 0, best = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (last.has(s[i]) && last.get(s[i]) >= start) {\n      start = last.get(s[i]) + 1;\n    }\n    last.set(s[i], i);\n    best = Math.max(best, i - start + 1);\n  }\n  return best;\n}\n\n${call('longestUnique', s)}`,
          a: best, x: [new Set(s).size, best + 1, best - 1].filter(v => v !== best && v > 0), ex: `The longest stretch with no repeated letter is "${s.slice(bs, bs + best)}", length ${best}.` };
      },
      h => {
        const a = arr(h, h.int(4, 5), 1, 6), out = a.map((_, i) => a.reduce((p, v, j) => (j === i ? p : p * v), 1));
        return { t: 'Prefix products', q: 'What does this call return?', code: `function productExceptSelf(nums) {\n  const out = Array(nums.length).fill(1);\n  let left = 1;\n  for (let i = 0; i < nums.length; i++) {\n    out[i] = left;\n    left *= nums[i];\n  }\n  let right = 1;\n  for (let i = nums.length - 1; i >= 0; i--) {\n    out[i] *= right;\n    right *= nums[i];\n  }\n  return out;\n}\n\n${call('productExceptSelf', a)}`,
          a: show(out), mono: true, w: arrW(out, h, [a.map((_, i) => a.slice(0, i).reduce((p, v) => p * v, 1))]), ex: `Each entry is (product to its left) × (product to its right), i.e. everything except itself: ${show(out)}.` };
      },
      h => {
        const a = uniq(h, h.int(5, 7), 1, 9), k = h.int(1, 8), n = a.length, r = k % n, out = [...a.slice(n - r), ...a.slice(0, n - r)];
        return { t: 'Array tricks', q: 'What does this call return?', code: `function rotate(a, k) {\n  k %= a.length;\n  const rev = (i, j) => {\n    while (i < j) { [a[i], a[j]] = [a[j], a[i]]; i++; j--; }\n  };\n  rev(0, a.length - 1);\n  rev(0, k - 1);\n  rev(k, a.length - 1);\n  return a;\n}\n\n${call('rotate', a, k)}`,
          a: show(out), mono: true, w: arrW(out, h, [[...a.slice(r), ...a.slice(0, r)], a.slice().reverse(), a]), ex: `Reverse all, then the first k and the rest: a right rotation by ${k} mod ${n} = ${r}: ${show(out)}.` };
      },
      h => {
        const a = arr(h, h.int(6, 9), 0, 2), b = a.slice(); let lo = 0, mid = 0, hi = b.length - 1, sw = 0;
        while (mid <= hi) { if (b[mid] === 0) { [b[lo], b[mid]] = [b[mid], b[lo]]; lo++; mid++; sw++; } else if (b[mid] === 2) { [b[mid], b[hi]] = [b[hi], b[mid]]; hi--; sw++; } else mid++; }
        return { t: 'Dutch national flag', q: 'How many swaps does this call make (the value it returns)?', code: `function sortColors(a) {\n  let lo = 0, mid = 0, hi = a.length - 1, swaps = 0;\n  while (mid <= hi) {\n    if (a[mid] === 0) {\n      [a[lo], a[mid]] = [a[mid], a[lo]];\n      lo++; mid++; swaps++;\n    } else if (a[mid] === 2) {\n      [a[mid], a[hi]] = [a[hi], a[mid]];\n      hi--; swaps++;\n    } else mid++;\n  }\n  return swaps;\n}\n\n${call('sortColors', a)}`,
          a: sw, x: [a.filter(v => v !== 1).length, sw + 1, sw - 1].filter(v => v !== sw && v >= 0), ex: `Every 0 seen at mid and every 2 seen at mid costs one swap; tracing ${show(a)} gives ${sw} swaps and sorts it to ${show(b)}.` };
      },
    ],
  };

  /* ---------- 2. Hashing ---------- */
  const HASHING = {
    easy: [
      h => {
        const a = arr(h, h.int(7, 10), 1, 6), d = new Set(a).size;
        return { t: 'Sets', q: 'What does this call return?', code: `function countDistinct(arr) {\n  return new Set(arr).size;\n}\n\n${call('countDistinct', a)}`, a: d, x: [a.length, d + 1, d - 1], ex: `A Set keeps one copy of each value: ${[...new Set(a)].join(', ')} → ${d}.` };
      },
      h => {
        const a = arr(h, h.int(7, 10), 1, 5), freq = new Map(); for (const x of a) freq.set(x, (freq.get(x) || 0) + 1);
        let best = a[0]; for (const [x, c] of freq) if (c > freq.get(best)) best = x;
        return { t: 'Frequency counting', q: 'What does this call return?', code: `function mostFrequent(a) {\n  const freq = new Map();\n  for (const x of a) freq.set(x, (freq.get(x) || 0) + 1);\n  let best = a[0];\n  for (const [x, c] of freq) {\n    if (c > freq.get(best)) best = x;\n  }\n  return best;\n}\n\n${call('mostFrequent', a)}`,
          a: best, x: [...freq.keys()].filter(v => v !== best).slice(0, 3), ex: `Counts: ${[...freq].map(([x, c]) => `${x}×${c}`).join(', ')}. It starts at ${a[0]} and only moves on a strictly higher count: ${best}.` };
      },
    ],
    medium: [
      h => {
        const n = uniq(h, h.int(5, 8), 1, 20); const i = h.int(0, n.length - 2), j = h.int(i + 1, n.length - 1), t = n[i] + n[j], seen = new Map(); let res = [];
        for (let k = 0; k < n.length; k++) { const need = t - n[k]; if (seen.has(need)) { res = [seen.get(need), k]; break; } seen.set(n[k], k); }
        return { t: 'Two Sum', q: 'What does this call return?', code: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n\n${call('twoSum', n, t)}`,
          a: show(res), mono: true, w: strW(res, [[res[1], res[0]], [n[res[0]], n[res[1]]], [res[0], res[1] + 1], [res[0] + 1, res[1]], []]), ex: `At index ${res[1]} (value ${n[res[1]]}) it needs ${t - n[res[1]]}, already seen at index ${res[0]}: ${show(res)}.` };
      },
      h => {
        const s = Array.from({ length: h.int(6, 10) }, () => h.pick(['a', 'b', 'c', 'd', 'e', 'f'])).join(''), cnt = {}; for (const c of s) cnt[c] = (cnt[c] || 0) + 1;
        let idx = -1; for (let i = 0; i < s.length; i++) if (cnt[s[i]] === 1) { idx = i; break; }
        return { t: 'Frequency counting', q: 'What does this call return?', code: `function firstUnique(s) {\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (let i = 0; i < s.length; i++) {\n    if (count[s[i]] === 1) return i;\n  }\n  return -1;\n}\n\n${call('firstUnique', s)}`,
          a: idx, x: [idx + 1, -1, s.length - 1, 0].filter(v => v !== idx), ex: idx < 0 ? `Every letter of "${s}" appears more than once, so −1.` : `Counts: ${Object.entries(cnt).map(([c, v]) => `${c}×${v}`).join(', ')}. The first letter with count 1 is "${s[idx]}" at index ${idx}.` };
      },
      h => {
        const w = h.pick(['listen', 'binary', 'secure', 'stream', 'cinema', 'rescue', 'earth', 'night']), ana = h.chance(0.5);
        const v = ana ? h.shuffle(w.split('')).join('') : w.slice(0, -1) + (w.slice(-1) === 'z' ? 'y' : 'z'), res = w.split('').sort().join('') === v.split('').sort().join('');
        const spec = { t: 'Frequency counting', q: 'Look at this call', code: `function isAnagram(a, b) {\n  if (a.length !== b.length) return false;\n  const count = {};\n  for (const c of a) count[c] = (count[c] || 0) + 1;\n  for (const c of b) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}\n\n${call('isAnagram', w, v)}`,
          ex: res ? `Both use exactly the same letters, so it returns true.` : `"${v}" has a "${v.slice(-1)}" that "${w}" lacks, so it returns false.` };
        return claim(h, spec, res);
      },
    ],
    hard: [
      h => {
        const a = arr(h, h.int(6, 9), -3, 6), k = h.int(1, 8), seen = new Map([[0, 1]]); let s = 0, c = 0;
        for (const x of a) { s += x; c += seen.get(s - k) || 0; seen.set(s, (seen.get(s) || 0) + 1); }
        let brute = 0; for (let i = 0; i < a.length; i++) for (let j = i; j < a.length; j++) if (sum(a.slice(i, j + 1)) === k) brute++;
        if (brute !== c) return null;
        return { t: 'Prefix sums + hash map', q: 'What does this call return?', code: `function subarraySum(nums, k) {\n  const seen = new Map([[0, 1]]);\n  let sum = 0, count = 0;\n  for (const x of nums) {\n    sum += x;\n    count += seen.get(sum - k) || 0;\n    seen.set(sum, (seen.get(sum) || 0) + 1);\n  }\n  return count;\n}\n\n${call('subarraySum', a, k)}`,
          a: c, x: [c + 1, c - 1, a.filter(v => v === k).length].filter(v => v !== c && v >= 0), ex: `Each time an earlier prefix sum equals (current sum − ${k}), the part in between sums to ${k}. There are ${c} such subarrays.` };
      },
      h => {
        const a = uniq(h, h.int(6, 9), 1, 20), set = new Set(a); let best = 0;
        for (const x of set) if (!set.has(x - 1)) { let y = x; while (set.has(y + 1)) y++; best = Math.max(best, y - x + 1); }
        return { t: 'Hash sets', q: 'What does this call return?', code: `function longestRun(nums) {\n  const set = new Set(nums);\n  let best = 0;\n  for (const x of set) {\n    if (set.has(x - 1)) continue;\n    let y = x;\n    while (set.has(y + 1)) y++;\n    best = Math.max(best, y - x + 1);\n  }\n  return best;\n}\n\n${call('longestRun', a)}`,
          a: best, x: [best + 1, best - 1, a.length].filter(v => v !== best && v > 0), ex: `Sorted, the values are ${a.slice().sort((x, y) => x - y).join(', ')}; the longest run of consecutive numbers has length ${best}.` };
      },
      h => {
        const pool = h.shuffle(['eat', 'tea', 'ate', 'tan', 'nat', 'bat', 'tab', 'cat', 'act', 'dog', 'god', 'pot', 'top', 'opt']).slice(0, h.int(5, 7)), g = new Set(pool.map(w => w.split('').sort().join('')));
        return { t: 'Grouping with keys', q: 'What does this call return?', code: `function countGroups(words) {\n  const groups = new Map();\n  for (const w of words) {\n    const key = w.split('').sort().join('');\n    groups.set(key, (groups.get(key) || 0) + 1);\n  }\n  return groups.size;\n}\n\n${call('countGroups', pool)}`,
          a: g.size, x: [pool.length, g.size + 1, g.size - 1].filter(v => v !== g.size && v > 0), ex: `Words with the same sorted letters share a key: ${[...g].join(', ')} → ${g.size} groups.` };
      },
    ],
  };

  /* ---------- 3. Stacks & Queues ---------- */
  const STACKS = {
    easy: [
      h => {
        const ops = [], st = [];
        for (let i = 0; i < h.int(5, 8); i++) { if (st.length && h.chance(0.35)) { ops.push('s.pop();'); st.pop(); } else { const v = h.int(1, 9); ops.push(`s.push(${v});`); st.push(v); } }
        return { t: 'Stacks', q: 'What is s after these operations?', code: `const s = [];\n${ops.join('\n')}\ns; // → ?`, a: show(st), mono: true, w: arrW(st, h, [st.slice().reverse()]), ex: `push adds to the end and pop removes the last item: ${show(st)}.` };
      },
      h => {
        const ops = [], q = [];
        for (let i = 0; i < h.int(5, 8); i++) { if (q.length && h.chance(0.35)) { ops.push('q.shift();'); q.shift(); } else { const v = h.int(1, 9); ops.push(`q.push(${v});`); q.push(v); } }
        if (!q.length) return null;
        return { t: 'Queues', q: 'What is q after these operations?', code: `const q = [];\n${ops.join('\n')}\nq; // → ?`, a: show(q), mono: true, w: arrW(q, h, [q.slice().reverse()]), ex: `push adds at the back and shift removes from the front (first in, first out): ${show(q)}.` };
      },
    ],
    medium: [
      h => {
        const pairs = { ')': '(', ']': '[', '}': '{' }, gen = d => (d <= 0 || h.chance(0.3) ? '' : h.pick(['()', '[]', '{}']).replace(/^(.)/, `$1${gen(d - 1)}`) + gen(d - 1));
        let s = gen(3) || '()';
        const bad = h.chance(0.5);
        if (bad) { const i = h.int(0, s.length - 1), sw = { '(': ']', ')': '}', '[': ')', ']': '(', '{': ']', '}': ')' }; s = s.slice(0, i) + sw[s[i]] + s.slice(i + 1); }
        const st = []; let ok = true; for (const c of s) { if ('([{'.includes(c)) st.push(c); else if (st.pop() !== pairs[c]) { ok = false; break; } }
        ok = ok && !st.length;
        const spec = { t: 'Stacks', q: 'Look at this call', code: `function isValid(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const c of s) {\n    if ('([{'.includes(c)) stack.push(c);\n    else if (stack.pop() !== pairs[c]) return false;\n  }\n  return stack.length === 0;\n}\n\n${call('isValid', s)}`,
          ex: ok ? 'Every closing bracket matches the most recent open one, and nothing is left open: true.' : 'Some closing bracket doesn’t match the most recent open one (or something stays open): false.' };
        return claim(h, spec, ok);
      },
      h => {
        const a = arr(h, h.int(5, 7), 1, 9), res = Array(a.length).fill(-1), st = [];
        for (let i = 0; i < a.length; i++) { while (st.length && a[st[st.length - 1]] < a[i]) res[st.pop()] = a[i]; st.push(i); }
        return { t: 'Monotonic stack', q: 'What does this call return?', code: `function nextGreater(a) {\n  const res = Array(a.length).fill(-1);\n  const stack = []; // indices\n  for (let i = 0; i < a.length; i++) {\n    while (stack.length && a[stack[stack.length - 1]] < a[i]) {\n      res[stack.pop()] = a[i];\n    }\n    stack.push(i);\n  }\n  return res;\n}\n\n${call('nextGreater', a)}`,
          a: show(res), mono: true, w: arrW(res, h, [a.map((v, i) => (i + 1 < a.length ? a[i + 1] : -1))]), ex: `For each value, the first larger value to its right (−1 if none): ${show(res)}.` };
      },
      h => {
        let s; do s = Array.from({ length: h.int(6, 10) }, () => h.pick(['a', 'b', 'c'])).join(''); while (!/(.)\1/.test(s));
        const st = []; for (const c of s) { if (st.length && st[st.length - 1] === c) st.pop(); else st.push(c); }
        const ans = st.join('');
        return { t: 'Stacks', q: 'What does this call return?', code: `function removeAdjacent(s) {\n  const stack = [];\n  for (const c of s) {\n    if (stack.length && stack[stack.length - 1] === c) stack.pop();\n    else stack.push(c);\n  }\n  return stack.join('');\n}\n\n${call('removeAdjacent', s)}`,
          a: show(ans), mono: true, w: strW(ans, [s.replace(/(.)\1/g, ''), s, ans.split('').reverse().join(''), ans + s.slice(-1), s.replace(/(.)\1+/g, '$1')]), ex: `Equal neighbours cancel, and cancelling can bring new pairs together: "${s}" → ${ans ? `"${ans}"` : 'the empty string ""'}.` };
      },
      h => {
        const toks = [String(h.int(2, 9)), String(h.int(2, 9))], st = [];
        for (let i = 0; i < h.int(2, 3); i++) { toks.push(String(h.int(1, 9))); toks.push(h.pick(['+', '-', '*'])); }
        toks.push(h.pick(['+', '-', '*']));
        for (const t of toks) { if ('+-*'.includes(t)) { const b = st.pop(), a = st.pop(); if (a === undefined) return null; st.push(t === '+' ? a + b : t === '-' ? a - b : a * b); } else st.push(+t); }
        if (st.length !== 1) return null;
        const v = st[0];
        return { t: 'Stacks', q: 'What does this call return?', code: `function evalRPN(tokens) {\n  const st = [];\n  for (const t of tokens) {\n    if ('+-*'.includes(t)) {\n      const b = st.pop(), a = st.pop();\n      st.push(t === '+' ? a + b : t === '-' ? a - b : a * b);\n    } else st.push(Number(t));\n  }\n  return st[0];\n}\n\n${call('evalRPN', toks)}`,
          a: v, x: [v + 1, -v, v * 2].filter(x => x !== v), ex: `Numbers are pushed; each operator pops b, then a, and pushes a op b. The last value left is ${v}.` };
      },
    ],
    hard: [
      h => {
        const t = arr(h, h.int(5, 8), 20, 30), res = Array(t.length).fill(0), st = [];
        for (let i = 0; i < t.length; i++) { while (st.length && t[st[st.length - 1]] < t[i]) { const j = st.pop(); res[j] = i - j; } st.push(i); }
        return { t: 'Monotonic stack', q: 'What does this call return?', code: `function dailyTemperatures(t) {\n  const res = Array(t.length).fill(0), stack = [];\n  for (let i = 0; i < t.length; i++) {\n    while (stack.length && t[stack[stack.length - 1]] < t[i]) {\n      const j = stack.pop();\n      res[j] = i - j;\n    }\n    stack.push(i);\n  }\n  return res;\n}\n\n${call('dailyTemperatures', t)}`,
          a: show(res), mono: true, w: arrW(res, h, [res.map(v => (v ? v - 1 : 0))]), ex: `For each day, how many days until a warmer one (0 if never): ${show(res)}.` };
      },
      h => {
        const leaf = () => h.pick(['a', 'b', 'c', 'x', 'y']).repeat(h.int(1, 2)), k1 = h.int(2, 3), k2 = h.int(2, 3), inner = `${leaf()}${k2}[${leaf()}]`, s = h.chance(0.6) ? `${k1}[${inner}]` : `${k1}[${leaf()}]${leaf()}`;
        const dec = str => { let res = '', num = 0; const st = []; for (const c of str) { if (/\d/.test(c)) num = num * 10 + +c; else if (c === '[') { st.push([res, num]); res = ''; num = 0; } else if (c === ']') { const [prev, k] = st.pop(); res = prev + res.repeat(k); } else res += c; } return res; };
        const ans = dec(s);
        return { t: 'Stacks', q: 'What does this call return?', code: `function decode(s) {\n  const stack = [];\n  let res = '', num = 0;\n  for (const c of s) {\n    if (c >= '0' && c <= '9') num = num * 10 + Number(c);\n    else if (c === '[') { stack.push([res, num]); res = ''; num = 0; }\n    else if (c === ']') {\n      const [prev, k] = stack.pop();\n      res = prev + res.repeat(k);\n    } else res += c;\n  }\n  return res;\n}\n\n${call('decode', s)}`,
          a: show(ans), mono: true, w: strW(ans, [s.replace(/[\d[\]]/g, ''), ans + ans.slice(0, 1), ans.slice(0, -1), dec(s.replace(/\d/, d => String(+d + 1)))]), ex: `Each k[...] repeats its inside k times, innermost first: "${s}" → "${ans}".` };
      },
      h => {
        const a = Array.from({ length: h.int(4, 6) }, () => h.nz(-9, 9)), st = [];
        for (const x of a) { let alive = true; while (alive && x < 0 && st.length && st[st.length - 1] > 0) { if (st[st.length - 1] < -x) { st.pop(); continue; } if (st[st.length - 1] === -x) st.pop(); alive = false; } if (alive) st.push(x); }
        return { t: 'Stacks', q: 'What does this call return?', code: `function asteroids(a) {\n  const st = [];\n  for (const x of a) {\n    let alive = true;\n    while (alive && x < 0 && st.length && st[st.length - 1] > 0) {\n      if (st[st.length - 1] < -x) { st.pop(); continue; }\n      if (st[st.length - 1] === -x) st.pop();\n      alive = false;\n    }\n    if (alive) st.push(x);\n  }\n  return st;\n}\n\n${call('asteroids', a)}`,
          a: show(st), mono: true, w: arrW(st, h, [a, a.filter(v => v > 0), a.filter(v => v < 0)]), ex: `A left-moving (negative) value destroys smaller right-moving ones on the stack, equal sizes both explode: ${show(st)}.` };
      },
    ],
  };

  /* ---------- 4. Linked Lists ---------- */
  const LINKED = {
    easy: [
      h => {
        const a = arr(h, h.int(5, 8), 1, 20), x = h.int(5, 15), c = a.filter(v => v > x).length;
        return { t: 'Traversal', q: 'What does this call return?', code: `${LIST}\n\nfunction countAbove(head, x) {\n  let count = 0;\n  for (let n = head; n; n = n.next) {\n    if (n.val > x) count++;\n  }\n  return count;\n}\n\ncountAbove(list(${show(a)}), ${x}); // → ?`,
          a: c, x: [a.length - c, c + 1, c - 1].filter(v => v >= 0), ex: `Values above ${x}: ${a.filter(v => v > x).join(', ') || 'none'} → ${c}.` };
      },
      h => {
        const a = arr(h, h.int(5, 8), 1, 30), k = h.int(0, a.length + 1), v = k < a.length ? a[k] : -1;
        return { t: 'Traversal', q: 'What does this call return?', code: `${LIST}\n\nfunction getAt(head, k) {\n  let n = head;\n  while (n && k > 0) {\n    n = n.next;\n    k--;\n  }\n  return n ? n.val : -1;\n}\n\ngetAt(list(${show(a)}), ${k}); // → ?`, a: v, x: [a[k - 1] ?? a[0], a[k + 1] ?? -1, a[a.length - 1]].filter(z => z !== v), ex: k < a.length ? `Start at index 0 and step ${k} times: ${v}.` : `The list has only ${a.length} nodes, so it falls off the end: −1.` };
      },
    ],
    medium: [
      h => {
        const a = uniq(h, h.int(4, 7), 1, 9), r = a.slice().reverse();
        return { t: 'Reversal', q: 'What does this call return?', code: `${LIST}\n\nfunction reverse(head) {\n  let prev = null, cur = head;\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  return prev;\n}\n\narr(reverse(list(${show(a)}))); // → ?`, a: show(r), mono: true, w: arrW(r, h, [a, [a[0]], r.slice(1)]), ex: `Each node’s next is pointed back at the previous node: ${show(r)}.` };
      },
      h => {
        const a = uniq(h, h.int(4, 8), 1, 20), v = a[Math.floor(a.length / 2)];
        return { t: 'Fast and slow pointers', q: 'What does this call return?', code: `${LIST}\n\nfunction middle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow.val;\n}\n\nmiddle(list(${show(a)})); // → ?`, a: v, x: [a[Math.floor((a.length - 1) / 2)], a[a.length - 1], a[0]].filter(z => z !== v), ex: `fast moves two steps for slow’s one; with ${a.length} nodes slow stops at index ${Math.floor(a.length / 2)}: ${v}.` };
      },
      h => {
        const a = uniq(h, h.int(4, 7), 1, 20), n = h.int(1, a.length), out = a.filter((_, i) => i !== a.length - n);
        return { t: 'Two pointers', q: 'What does this call return?', code: `${LIST}\n\nfunction removeNthFromEnd(head, n) {\n  const dummy = { val: 0, next: head };\n  let fast = dummy, slow = dummy;\n  for (let i = 0; i <= n; i++) fast = fast.next;\n  while (fast) {\n    fast = fast.next;\n    slow = slow.next;\n  }\n  slow.next = slow.next.next;\n  return dummy.next;\n}\n\narr(removeNthFromEnd(list(${show(a)}), ${n})); // → ?`,
          a: show(out), mono: true, w: arrW(out, h, [a.filter((_, i) => i !== n - 1), a.filter((_, i) => i !== a.length - n - 1), a]), ex: `fast starts n + 1 ahead of slow, so slow stops just before the ${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} node from the end, which is unlinked: ${show(out)}.` };
      },
    ],
    hard: [
      h => {
        const a = arr(h, h.int(3, 5), 1, 15).sort((x, y) => x - y), b = arr(h, h.int(3, 5), 1, 15).sort((x, y) => x - y), m = [...a, ...b].sort((x, y) => x - y);
        return { t: 'Merging', q: 'What does this call return?', code: `${LIST}\n\nfunction merge(a, b) {\n  const dummy = { val: 0, next: null };\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) { tail.next = a; a = a.next; }\n    else { tail.next = b; b = b.next; }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n\narr(merge(list(${show(a)}), list(${show(b)}))); // → ?`,
          a: show(m), mono: true, w: arrW(m, h, [[...a, ...b], [...new Set(m)]]), ex: `Repeatedly take the smaller head; when one list runs out, attach the rest: ${show(m)}.` };
      },
      h => {
        const n = h.int(5, 9), pos = h.int(0, n - 2), a = uniq(h, n, 1, 30);
        // Simulate Floyd: index of each pointer, the next of the tail goes back to pos.
        const next = i => (i === n - 1 ? pos : i + 1); let s = 0, f = 0, steps = 0;
        do { s = next(s); f = next(next(f)); steps++; } while (s !== f);
        return { t: 'Cycle detection', q: 'The last node links back to the node at index ' + pos + '. What does this call return?', code: `${LIST}\n\nfunction meetSteps(head) {\n  let slow = head, fast = head, steps = 0;\n  do {\n    slow = slow.next;\n    fast = fast.next.next;\n    steps++;\n  } while (slow !== fast);\n  return steps;\n}\n\nconst head = list(${show(a)});\nlet tail = head;\nwhile (tail.next) tail = tail.next;\nlet target = head;\nfor (let i = 0; i < ${pos}; i++) target = target.next;\ntail.next = target;\nmeetSteps(head); // → ?`,
          a: steps, x: [steps + 1, steps - 1, n, n - pos].filter(v => v !== steps && v > 0), ex: `Floyd’s tortoise and hare: slow moves 1, fast moves 2 around the cycle of length ${n - pos}; they first land on the same node after ${steps} steps.` };
      },
      h => {
        const a = arr(h, h.int(6, 9), 1, 5).sort((x, y) => x - y), out = [...new Set(a)];
        return { t: 'In-place edits', q: 'What does this call return?', code: `${LIST}\n\nfunction dedupe(head) {\n  let cur = head;\n  while (cur && cur.next) {\n    if (cur.val === cur.next.val) cur.next = cur.next.next;\n    else cur = cur.next;\n  }\n  return head;\n}\n\narr(dedupe(list(${show(a)}))); // → ?`, a: show(out), mono: true, w: arrW(out, h, [a, a.filter((v, i) => a.indexOf(v) === a.lastIndexOf(v))]), ex: `On a match it skips the next node and stays put, so runs of equal values collapse: ${show(out)}.` };
      },
    ],
  };

  /* ---------- 5. Recursion & Dynamic Programming ---------- */
  const fibs = [0, 1]; for (let i = 2; i < 40; i++) fibs[i] = fibs[i - 1] + fibs[i - 2];
  const RECURSION = {
    easy: [
      h => {
        const n = h.int(100, 99999), v = String(n).split('').reduce((s, c) => s + +c, 0);
        return { t: 'Recursion', q: 'What does this call return?', code: `function digitSum(n) {\n  if (n < 10) return n;\n  return (n % 10) + digitSum(Math.floor(n / 10));\n}\n\n${call('digitSum', n)}`, a: v, x: [v + 1, String(n).length, n % 10].filter(x => x !== v), ex: `It adds the last digit and recurses on the rest: ${String(n).split('').join(' + ')} = ${v}.` };
      },
      h => {
        const n = h.int(2, 4), out = []; const f = k => { if (k === 0) return; out.push(k); f(k - 1); out.push(k); }; f(n);
        return { t: 'Recursion', q: 'What does this call return?', code: `function trace(n, out) {\n  if (n === 0) return out;\n  out.push(n);\n  trace(n - 1, out);\n  out.push(n);\n  return out;\n}\n\n${call('trace', n, [])}`, a: show(out), mono: true,
          w: arrW(out, h, [[...Array(n).keys()].map(i => n - i).concat([...Array(n).keys()].map(i => n - i)), [...Array(n).keys()].map(i => i + 1).concat([...Array(n).keys()].map(i => n - i)), out.slice(0, n)]), ex: `Each call pushes n before recursing and again after returning, so the second half comes back up: ${show(out)}.` };
      },
      h => {
        const x = h.int(2, 5), n = h.int(2, 9), v = x ** n;
        return { t: 'Recursion', q: 'What does this call return?', code: `function power(x, n) {\n  if (n === 0) return 1;\n  const half = power(x, Math.floor(n / 2));\n  return n % 2 === 0 ? half * half : half * half * x;\n}\n\n${call('power', x, n)}`, a: v, x: [x * n, x ** (n - 1), x ** (n + 1)], ex: `Fast exponentiation: square the half power, times x once more for odd n. ${x}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]} = ${v}.` };
      },
    ],
    medium: [
      h => {
        const n = h.int(4, 12), calls = 2 * fibs[n + 1] - 1;
        return { t: 'Recursion trees', q: 'What is calls after this code runs?', code: `let calls = 0;\nfunction fib(n) {\n  calls++;\n  return n < 2 ? n : fib(n - 1) + fib(n - 2);\n}\nfib(${n});\ncalls; // → ?`, a: calls, x: [fibs[n], 2 ** n, n + 1, calls + 2], ex: `Calls C(n) = 1 + C(n − 1) + C(n − 2) with C(0) = C(1) = 1, which is 2·F(n + 1) − 1 = ${calls}. That exponential blow-up is why memoization matters.` };
      },
      h => {
        const n = h.int(4, 15), three = h.chance(0.35), w = [1, 1, 2]; for (let i = 3; i <= n; i++) w[i] = w[i - 1] + w[i - 2] + (three ? w[i - 3] : 0);
        if (!three) { w[2] = 2; for (let i = 3; i <= n; i++) w[i] = w[i - 1] + w[i - 2]; }
        const v = w[n];
        return { t: 'Dynamic programming', q: 'What does this call return?', code: `function climb(n) {\n  const ways = [1, 1${three ? ', 2' : ''}];\n  for (let i = ${three ? 3 : 2}; i <= n; i++) {\n    ways[i] = ways[i - 1] + ways[i - 2]${three ? ' + ways[i - 3]' : ''};\n  }\n  return ways[n];\n}\n\n${call('climb', n)}`,
          a: v, x: [w[n - 1], n, 2 ** (n - 1), v + w[n - 2]], ex: `Ways to climb ${n} steps taking ${three ? '1, 2 or 3' : '1 or 2'} at a time: each count is the sum of the previous ${three ? 'three' : 'two'} → ${v}.` };
      },
      h => {
        const n = h.int(3, 8), k = h.int(1, n - 1), C = (a, b) => (b === 0 || b === a ? 1 : C(a - 1, b - 1) + C(a - 1, b)), v = C(n, k);
        return { t: 'Recursion', q: 'What does this call return?', code: `function choose(n, k) {\n  if (k === 0 || k === n) return 1;\n  return choose(n - 1, k - 1) + choose(n - 1, k);\n}\n\n${call('choose', n, k)}`, a: v, x: [n * k, v + 1, C(n, k - 1) === v ? v + n : C(n, k - 1)].filter(x => x !== v), ex: `Pascal’s rule: choose the item or not. It computes ${n}C${k} = ${v}.` };
      },
    ],
    hard: [
      h => {
        const coins = h.pick([[1, 2, 5], [2, 3, 5], [1, 3, 4], [2, 5, 10], [1, 5, 10]]), amt = h.int(6, 15), dp = Array(amt + 1).fill(0); dp[0] = 1;
        for (const c of coins) for (let a = c; a <= amt; a++) dp[a] += dp[a - c];
        return { t: 'Dynamic programming', q: 'What does this call return?', code: `function countWays(coins, amount) {\n  const dp = Array(amount + 1).fill(0);\n  dp[0] = 1;\n  for (const c of coins) {\n    for (let a = c; a <= amount; a++) dp[a] += dp[a - c];\n  }\n  return dp[amount];\n}\n\n${call('countWays', coins, amt)}`,
          a: dp[amt], x: [dp[amt] + 1, dp[amt - 1], amt].filter(v => v !== dp[amt] && v >= 0), ex: `Coin-by-coin DP counts combinations (order doesn’t matter): dp = ${show(dp)}; dp[${amt}] = ${dp[amt]}.` };
      },
      h => {
        const coins = h.pick([[1, 3, 4], [2, 5], [1, 5, 6, 9], [3, 7], [2, 3, 7], [1, 4, 5]]), amt = h.int(5, 20), dp = Array(amt + 1).fill(Infinity); dp[0] = 0;
        for (let a = 1; a <= amt; a++) for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        const v = dp[amt] === Infinity ? -1 : dp[amt];
        let g = 0, r = amt; for (const c of coins.slice().sort((x, y) => y - x)) { g += Math.floor(r / c); r %= c; }
        return { t: 'Dynamic programming', q: 'What does this call return?', code: `function minCoins(coins, amount) {\n  const dp = Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let a = 1; a <= amount; a++) {\n    for (const c of coins) {\n      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n\n${call('minCoins', coins, amt)}`,
          a: v, x: [r ? -1 : g, v + 1, -1].filter(x => x !== v), ex: `dp[a] = fewest coins for a.${v < 0 ? ` ${amt} can’t be made, so −1.` : ` dp[${amt}] = ${v}${!r && g !== v ? ` — greedy (largest coin first) would use ${g}, so greedy fails here` : ''}.`}` };
      },
      h => {
        const words = h.shuffle(['abcde', 'ace', 'abc', 'bdf', 'axbyc', 'acbd', 'banana', 'atana', 'stone', 'notes', 'kitten', 'sitting']), [a, b] = [words[0], words[1]];
        const L = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
        for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
        const v = L[a.length][b.length];
        return { t: 'Dynamic programming', q: 'What does this call return?', code: `function lcs(a, b) {\n  const dp = Array.from({ length: a.length + 1 },\n    () => Array(b.length + 1).fill(0));\n  for (let i = 1; i <= a.length; i++) {\n    for (let j = 1; j <= b.length; j++) {\n      dp[i][j] = a[i - 1] === b[j - 1]\n        ? dp[i - 1][j - 1] + 1\n        : Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[a.length][b.length];\n}\n\n${call('lcs', a, b)}`,
          a: v, x: [v + 1, v - 1, Math.min(a.length, b.length)].filter(x => x !== v && x >= 0), ex: `It is the length of the longest common subsequence of "${a}" and "${b}": ${v}.` };
      },
      h => {
        const a = arr(h, h.int(5, 7), 1, 12), dp = [];
        for (let i = 0; i < a.length; i++) dp[i] = Math.max(i >= 1 ? dp[i - 1] : 0, (i >= 2 ? dp[i - 2] : 0) + a[i]);
        const v = dp[a.length - 1];
        return { t: 'Dynamic programming', q: 'What does this call return?', code: `function rob(houses) {\n  let take = 0, skip = 0;\n  for (const h of houses) {\n    const newTake = skip + h;\n    skip = Math.max(skip, take);\n    take = newTake;\n  }\n  return Math.max(take, skip);\n}\n\n${call('rob', a)}`,
          a: v, x: [sum(a.filter((_, i) => i % 2 === 0)), sum(a.filter((_, i) => i % 2 === 1)), Math.max(...a), v + 1].filter(x => x !== v), ex: `House robber: never take two neighbours. Best totals so far: ${dp.join(', ')} → ${v}.` };
      },
    ],
  };

  /* ---------- 6. Searching & Sorting ---------- */
  const SORTING = {
    easy: [
      h => {
        const a = uniq(h, h.int(7, 11), 1, 40).sort((x, y) => x - y), present = h.chance(0.75), t = present ? h.pick(a) : h.int(1, 40); const idx = a.indexOf(t);
        if (!present && idx >= 0) return null;
        let lo = 0, hi = a.length - 1, it = 0; const mids = [];
        while (lo <= hi) { it++; const mid = Math.floor((lo + hi) / 2); mids.push(a[mid]); if (a[mid] === t) break; if (a[mid] < t) lo = mid + 1; else hi = mid - 1; }
        return { t: 'Binary search', q: 'What does this call return?', code: `function search(a, target) {\n  let lo = 0, hi = a.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (a[mid] === target) return mid;\n    if (a[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}\n\n${call('search', a, t)}`,
          a: idx, x: [idx + 1, idx - 1, -1, it].filter(v => v !== idx), ex: `Middles checked: ${mids.join(', ')}${idx >= 0 ? ` — found at index ${idx}` : ' — not found, so −1'}.` };
      },
      h => {
        const a = uniq(h, h.int(8, 15), 1, 60).sort((x, y) => x - y), t = h.pick(a); let lo = 0, hi = a.length - 1, it = 0;
        while (lo <= hi) { it++; const mid = Math.floor((lo + hi) / 2); if (a[mid] === t) break; if (a[mid] < t) lo = mid + 1; else hi = mid - 1; }
        return { t: 'Binary search', q: 'What is steps after this code runs?', code: `const a = ${show(a)};\nlet lo = 0, hi = a.length - 1, steps = 0;\nwhile (lo <= hi) {\n  steps++;\n  const mid = Math.floor((lo + hi) / 2);\n  if (a[mid] === ${t}) break;\n  if (a[mid] < ${t}) lo = mid + 1;\n  else hi = mid - 1;\n}\nsteps; // → ?`,
          a: it, x: [it + 1, it - 1, a.indexOf(t) + 1, Math.ceil(Math.log2(a.length + 1))].filter(v => v !== it && v > 0), ex: `Each step halves the range; ${t} is reached at step ${it}.` };
      },
    ],
    medium: [
      h => {
        const a = arr(h, h.int(7, 11), 1, 9).sort((x, y) => x - y), t = h.int(0, 10); let lo = 0, hi = a.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < t) lo = mid + 1; else hi = mid; }
        return { t: 'Binary search', q: 'What does this call return?', code: `function lowerBound(a, target) {\n  let lo = 0, hi = a.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (a[mid] < target) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}\n\n${call('lowerBound', a, t)}`,
          a: lo, x: [a.lastIndexOf(t) + 1 === lo ? lo + 1 : a.lastIndexOf(t) + 1, lo - 1, a.indexOf(t)].filter(v => v !== lo && v >= 0), ex: `The first index whose value is ≥ ${t}: ${lo}${lo === a.length ? ' (past the end — everything is smaller)' : ''}.` };
      },
      h => {
        const a = uniq(h, h.int(5, 7), 1, 30), b = a.slice(), passes = h.int(1, 2);
        for (let p = 0; p < passes; p++) for (let j = 0; j < b.length - 1 - p; j++) if (b[j] > b[j + 1]) [b[j], b[j + 1]] = [b[j + 1], b[j]];
        return { t: 'Sorting', q: 'What does this call return?', code: `function bubblePasses(a, passes) {\n  for (let p = 0; p < passes; p++) {\n    for (let j = 0; j < a.length - 1 - p; j++) {\n      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];\n    }\n  }\n  return a;\n}\n\n${call('bubblePasses', a, passes)}`,
          a: show(b), mono: true, w: arrW(b, h, [a.slice().sort((x, y) => x - y), a]), ex: `Each pass bubbles the largest remaining value to the end; after ${passes} pass${passes > 1 ? 'es' : ''}: ${show(b)}.` };
      },
      h => {
        const a = uniq(h, h.int(5, 7), 1, 30), b = a.slice(), k = h.int(2, a.length - 2);
        for (let i = 1; i <= k; i++) { const key = b[i]; let j = i - 1; while (j >= 0 && b[j] > key) { b[j + 1] = b[j]; j--; } b[j + 1] = key; }
        return { t: 'Sorting', q: 'What does this call return?', code: `function insertionSteps(a, k) {\n  for (let i = 1; i <= k; i++) {\n    const key = a[i];\n    let j = i - 1;\n    while (j >= 0 && a[j] > key) {\n      a[j + 1] = a[j];\n      j--;\n    }\n    a[j + 1] = key;\n  }\n  return a;\n}\n\n${call('insertionSteps', a, k)}`,
          a: show(b), mono: true, w: arrW(b, h, [a.slice().sort((x, y) => x - y), a]), ex: `After ${k} steps the first ${k + 1} values are sorted and the rest untouched: ${show(b)}.` };
      },
      h => {
        const a = arr(h, h.int(3, 4), 1, 20).sort((x, y) => x - y), b = arr(h, h.int(3, 4), 1, 20).sort((x, y) => x - y), m = [...a, ...b].sort((x, y) => x - y);
        return { t: 'Sorting', q: 'What does this call return?', code: `function mergeSorted(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    out.push(a[i] <= b[j] ? a[i++] : b[j++]);\n  }\n  return out.concat(a.slice(i), b.slice(j));\n}\n\n${call('mergeSorted', a, b)}`,
          a: show(m), mono: true, w: arrW(m, h, [[...a, ...b]]), ex: `The merge step of merge sort: take the smaller front value each time, then append the leftovers: ${show(m)}.` };
      },
    ],
    hard: [
      h => {
        const a = uniq(h, h.int(6, 8), 1, 30), b = a.slice(), pivot = b[b.length - 1]; let i = 0;
        for (let j = 0; j < b.length - 1; j++) if (b[j] < pivot) { [b[i], b[j]] = [b[j], b[i]]; i++; }
        [b[i], b[b.length - 1]] = [b[b.length - 1], b[i]];
        const askIdx = h.chance(0.4);
        if (askIdx) return { t: 'Quicksort', q: 'What does this call return?', code: `function partition(a) {\n  const pivot = a[a.length - 1];\n  let i = 0;\n  for (let j = 0; j < a.length - 1; j++) {\n    if (a[j] < pivot) {\n      [a[i], a[j]] = [a[j], a[i]];\n      i++;\n    }\n  }\n  [a[i], a[a.length - 1]] = [a[a.length - 1], a[i]];\n  return i;\n}\n\n${call('partition', a)}`, a: i, x: [i + 1, i - 1, a.length - 1].filter(v => v !== i && v >= 0), ex: `Lomuto partition: the pivot ${pivot} lands after the ${i} smaller values, at index ${i}.` };
        return { t: 'Quicksort', q: 'What is a after this code runs?', code: `const a = ${show(a)};\nconst pivot = a[a.length - 1];\nlet i = 0;\nfor (let j = 0; j < a.length - 1; j++) {\n  if (a[j] < pivot) {\n    [a[i], a[j]] = [a[j], a[i]];\n    i++;\n  }\n}\n[a[i], a[a.length - 1]] = [a[a.length - 1], a[i]];\na; // → ?`,
          a: show(b), mono: true, w: arrW(b, h, [a.slice().sort((x, y) => x - y), [...a.filter(v => v < pivot), pivot, ...a.filter(v => v > pivot)]]), ex: `Values below ${pivot} are swapped to the front in order of discovery, then the pivot is placed at index ${i}: ${show(b)}.` };
      },
      h => {
        const s = uniq(h, h.int(6, 9), 1, 40).sort((x, y) => x - y), r = h.int(1, s.length - 1), a = [...s.slice(r), ...s.slice(0, r)], present = h.chance(0.8), t = present ? h.pick(a) : h.int(1, 40);
        if (!present && a.includes(t)) return null;
        const idx = a.indexOf(t);
        return { t: 'Binary search', q: 'What does this call return?', code: `function searchRotated(a, t) {\n  let lo = 0, hi = a.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (a[mid] === t) return mid;\n    if (a[lo] <= a[mid]) {\n      if (a[lo] <= t && t < a[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      if (a[mid] < t && t <= a[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return -1;\n}\n\n${call('searchRotated', a, t)}`,
          a: idx, x: [s.indexOf(t), idx + 1, -1, idx - 1].filter(v => v !== idx), ex: `One half is always sorted; check whether ${t} lies in it and discard the other half. ${idx >= 0 ? `${t} is at index ${idx}.` : `${t} isn’t there: −1.`}` };
      },
      h => {
        const x = h.int(10, 500), v = Math.floor(Math.sqrt(x));
        return { t: 'Binary search on the answer', q: 'What does this call return?', code: `function intSqrt(x) {\n  let lo = 0, hi = x, ans = 0;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (mid * mid <= x) { ans = mid; lo = mid + 1; }\n    else hi = mid - 1;\n  }\n  return ans;\n}\n\n${call('intSqrt', x)}`, a: v, x: [v + 1, v - 1, Math.round(x / 2)].filter(z => z !== v), ex: `It finds the largest mid with mid² ≤ ${x}: ${v} (${v}² = ${v * v}, ${v + 1}² = ${(v + 1) ** 2}).` };
      },
      h => {
        const a = uniq(h, h.int(5, 7), 1, 30), b = a.slice(), k = h.int(1, 3);
        for (let i = 0; i < k; i++) { let m = i; for (let j = i + 1; j < b.length; j++) if (b[j] < b[m]) m = j; [b[i], b[m]] = [b[m], b[i]]; }
        return { t: 'Sorting', q: 'What does this call return?', code: `function selectionSteps(a, k) {\n  for (let i = 0; i < k; i++) {\n    let min = i;\n    for (let j = i + 1; j < a.length; j++) {\n      if (a[j] < a[min]) min = j;\n    }\n    [a[i], a[min]] = [a[min], a[i]];\n  }\n  return a;\n}\n\n${call('selectionSteps', a, k)}`,
          a: show(b), mono: true, w: arrW(b, h, [a.slice().sort((x, y) => x - y), a]), ex: `Each step swaps the smallest remaining value into place; after ${k}: ${show(b)}.` };
      },
    ],
  };

  /* ---------- 7. Trees & Graphs ---------- */
  function bst(keys) {
    const ins = (n, v) => (!n ? { val: v, left: null, right: null } : (v < n.val ? (n.left = ins(n.left, v)) : (n.right = ins(n.right, v)), n));
    return keys.reduce(ins, null);
  }
  const walk = (n, order, out = []) => { if (!n) return out; if (order === 'pre') out.push(n.val); walk(n.left, order, out); if (order === 'in') out.push(n.val); walk(n.right, order, out); if (order === 'post') out.push(n.val); return out; };
  const height = n => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);
  function graph(h, n, directed) {
    const V = 'ABCDEFG'.slice(0, n).split(''), adj = Object.fromEntries(V.map(v => [v, []])), add = (a, b) => { if (a === b || adj[a].includes(b)) return; adj[a].push(b); if (!directed) adj[b].push(a); };
    if (directed) { for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (h.chance(0.35)) add(V[i], V[j]); }
    else { for (let i = 1; i < n; i++) if (h.chance(0.85)) add(V[i], V[h.int(0, i - 1)]); for (let t = 0; t < h.int(1, 3); t++) add(h.pick(V), h.pick(V)); }
    for (const v of V) adj[v].sort();
    return { V, adj };
  }
  const adjCode = adj => `const g = {\n${Object.entries(adj).map(([v, ns]) => `  ${v}: [${ns.map(x => `'${x}'`).join(', ')}],`).join('\n')}\n};`;
  const TREES = {
    easy: [
      h => {
        const keys = uniq(h, h.int(5, 8), 10, 90), root = bst(keys), ht = height(root);
        return { t: 'Binary trees', q: `The BST is built by inserting ${keys.join(', ')} in that order. What does height(root) return?`, code: `${BST}\nconst root = ${show(keys)}.reduce(insert, null);\n\nfunction height(n) {\n  if (!n) return 0;\n  return 1 + Math.max(height(n.left), height(n.right));\n}\n\nheight(root); // → ?`,
          a: ht, x: [ht - 1, ht + 1, Math.ceil(Math.log2(keys.length + 1))].filter(v => v !== ht && v > 0), ex: `Here height counts nodes on the longest root-to-leaf path (an empty tree is 0): ${ht}.` };
      },
      h => {
        const keys = uniq(h, h.int(5, 8), 10, 90), root = bst(keys); let leaves = 0; const f = n => { if (!n) return; if (!n.left && !n.right) leaves++; f(n.left); f(n.right); }; f(root);
        return { t: 'Binary trees', q: `The BST is built by inserting ${keys.join(', ')} in that order. What does countLeaves(root) return?`, code: `${BST}\nconst root = ${show(keys)}.reduce(insert, null);\n\nfunction countLeaves(n) {\n  if (!n) return 0;\n  if (!n.left && !n.right) return 1;\n  return countLeaves(n.left) + countLeaves(n.right);\n}\n\ncountLeaves(root); // → ?`,
          a: leaves, x: [leaves + 1, leaves - 1, keys.length - leaves].filter(v => v !== leaves && v > 0), ex: `Leaves are nodes with no children; this tree has ${leaves}.` };
      },
    ],
    medium: [
      h => {
        const keys = uniq(h, h.int(5, 8), 10, 90), root = bst(keys), order = h.pick(['pre', 'in', 'post']), res = walk(root, order);
        const body = { pre: '  out.push(n.val);\n  walk(n.left, out);\n  walk(n.right, out);', in: '  walk(n.left, out);\n  out.push(n.val);\n  walk(n.right, out);', post: '  walk(n.left, out);\n  walk(n.right, out);\n  out.push(n.val);' }[order];
        return { t: 'Tree traversals', q: `The BST is built by inserting ${keys.join(', ')} in that order. What does walk(root, []) return?`, code: `${BST}\nconst root = ${show(keys)}.reduce(insert, null);\n\nfunction walk(n, out) {\n  if (!n) return out;\n${body}\n  return out;\n}\n\nwalk(root, []); // → ?`,
          a: show(res), mono: true, w: strW(res, ['pre', 'in', 'post'].filter(o => o !== order).map(o => walk(root, o)).concat([keys, res.slice().reverse()])), ex: `This is ${order === 'in' ? 'an' : 'a'} ${{ pre: 'preorder (node, left, right)', in: 'inorder (left, node, right — sorted for a BST)', post: 'postorder (left, right, node)' }[order]} traversal: ${show(res)}.` };
      },
      h => {
        const { V, adj } = graph(h, h.int(5, 6), false), bfs = h.chance(0.5), out = [], seen = new Set([V[0]]);
        if (bfs) { const q = [V[0]]; while (q.length) { const v = q.shift(); out.push(v); for (const w of adj[v]) if (!seen.has(w)) { seen.add(w); q.push(w); } } }
        else { const dfs = v => { out.push(v); for (const w of adj[v]) if (!seen.has(w)) { seen.add(w); dfs(w); } }; dfs(V[0]); }
        const other = []; { const s2 = new Set([V[0]]); if (bfs) { const dfs = v => { other.push(v); for (const w of adj[v]) if (!s2.has(w)) { s2.add(w); dfs(w); } }; dfs(V[0]); } else { const q = [V[0]]; while (q.length) { const v = q.shift(); other.push(v); for (const w of adj[v]) if (!s2.has(w)) { s2.add(w); q.push(w); } } } }
        const code = bfs ? `${adjCode(adj)}\n\nfunction bfs(start) {\n  const seen = new Set([start]), q = [start], out = [];\n  while (q.length) {\n    const v = q.shift();\n    out.push(v);\n    for (const w of g[v]) {\n      if (!seen.has(w)) { seen.add(w); q.push(w); }\n    }\n  }\n  return out.join('');\n}\n\nbfs('A'); // → ?`
          : `${adjCode(adj)}\n\nfunction dfs(start) {\n  const seen = new Set([start]), out = [];\n  const visit = v => {\n    out.push(v);\n    for (const w of g[v]) {\n      if (!seen.has(w)) { seen.add(w); visit(w); }\n    }\n  };\n  visit(start);\n  return out.join('');\n}\n\ndfs('A'); // → ?`;
        return { t: 'Graph traversal', q: 'What does this call return?', code, a: show(out.join('')), mono: true, w: strW(out.join(''), [other.join(''), out.slice().sort().join(''), [out[0], ...out.slice(1).reverse()].join(''), out.slice(0, -1).join('')]), ex: `${bfs ? 'BFS uses a queue and visits level by level' : 'DFS goes as deep as it can before backtracking'}, taking neighbours in the listed order: ${out.join('')}.` };
      },
      h => {
        const keys = uniq(h, h.int(6, 8), 10, 90), root = bst(keys), k = h.int(1, keys.length), v = walk(root, 'in')[k - 1];
        return { t: 'Binary search trees', q: `The BST is built by inserting ${keys.join(', ')} in that order. What does kthSmallest(root, ${k}) return?`, code: `${BST}\nconst root = ${show(keys)}.reduce(insert, null);\n\nfunction kthSmallest(root, k) {\n  const stack = [];\n  let n = root;\n  while (n || stack.length) {\n    while (n) { stack.push(n); n = n.left; }\n    n = stack.pop();\n    if (--k === 0) return n.val;\n    n = n.right;\n  }\n}\n\nkthSmallest(root, ${k}); // → ?`,
          a: v, x: [keys[k - 1], walk(root, 'in')[k] ?? keys[0], walk(root, 'in')[k - 2] ?? keys[1]].filter(z => z !== v), ex: `An iterative inorder walk visits values in sorted order: the ${ord(k)} is ${v}.` };
      },
    ],
    hard: [
      h => {
        const { V, adj } = graph(h, h.int(5, 7), false); let comp = 0; const seen = new Set();
        for (const v of V) if (!seen.has(v)) { comp++; const st = [v]; seen.add(v); while (st.length) { const x = st.pop(); for (const w of adj[x]) if (!seen.has(w)) { seen.add(w); st.push(w); } } }
        return { t: 'Graph traversal', q: 'What does this call return?', code: `${adjCode(adj)}\n\nfunction components() {\n  const seen = new Set();\n  let count = 0;\n  for (const v in g) {\n    if (seen.has(v)) continue;\n    count++;\n    const stack = [v];\n    seen.add(v);\n    while (stack.length) {\n      for (const w of g[stack.pop()]) {\n        if (!seen.has(w)) { seen.add(w); stack.push(w); }\n      }\n    }\n  }\n  return count;\n}\n\ncomponents(); // → ?`,
          a: comp, x: [comp + 1, comp - 1, V.length - comp].filter(v => v !== comp && v > 0), ex: `Each new unvisited start explores one whole connected piece: ${comp} component${comp > 1 ? 's' : ''}.` };
      },
      h => {
        const { V, adj } = graph(h, h.int(5, 6), true), indeg = Object.fromEntries(V.map(v => [v, 0]));
        for (const v of V) for (const w of adj[v]) indeg[w]++;
        const q = V.filter(v => !indeg[v]), out = [];
        while (q.length) { const v = q.shift(); out.push(v); for (const w of adj[v]) if (--indeg[w] === 0) q.push(w); }
        return { t: 'Topological sort', q: 'What does this call return?', code: `${adjCode(adj)}\n\nfunction topo() {\n  const indeg = {};\n  for (const v in g) indeg[v] = 0;\n  for (const v in g) for (const w of g[v]) indeg[w]++;\n  const q = Object.keys(g).filter(v => indeg[v] === 0);\n  const out = [];\n  while (q.length) {\n    const v = q.shift();\n    out.push(v);\n    for (const w of g[v]) if (--indeg[w] === 0) q.push(w);\n  }\n  return out.join('');\n}\n\ntopo(); // → ?`,
          a: show(out.join('')), mono: true, w: strW(out.join(''), [V.join(''), out.slice().reverse().join(''), [out[1], out[0], ...out.slice(2)].join(''), V.slice().reverse().join('')]), ex: `Kahn’s algorithm: repeatedly take a node with no remaining incoming edges, in queue order: ${out.join('')}.` };
      },
      h => {
        const { V, adj } = graph(h, h.int(5, 7), false), dist = { A: 0 }, q = ['A'];
        while (q.length) { const v = q.shift(); for (const w of adj[v]) if (!(w in dist)) { dist[w] = dist[v] + 1; q.push(w); } }
        const reach = V.filter(v => v in dist && v !== 'A'); if (!reach.length) return null;
        const t = h.pick(reach), d = dist[t];
        return { t: 'Shortest paths', q: 'What does this call return?', code: `${adjCode(adj)}\n\nfunction distance(from, to) {\n  const dist = { [from]: 0 }, q = [from];\n  while (q.length) {\n    const v = q.shift();\n    if (v === to) return dist[v];\n    for (const w of g[v]) {\n      if (!(w in dist)) { dist[w] = dist[v] + 1; q.push(w); }\n    }\n  }\n  return -1;\n}\n\ndistance('A', '${t}'); // → ?`,
          a: d, x: [d + 1, d - 1, V.indexOf(t)].filter(v => v !== d && v > 0), ex: `BFS finds the fewest edges in an unweighted graph: A to ${t} is ${d} edge${d > 1 ? 's' : ''}.` };
      },
      h => {
        const keys = uniq(h, h.int(6, 8), 10, 90), root = bst(keys), [p, q] = h.shuffle(keys).slice(0, 2); let n = root;
        while (n) { if (p < n.val && q < n.val) n = n.left; else if (p > n.val && q > n.val) n = n.right; else break; }
        return { t: 'Binary search trees', q: `The BST is built by inserting ${keys.join(', ')} in that order. What does lca(root, ${p}, ${q}) return?`, code: `${BST}\nconst root = ${show(keys)}.reduce(insert, null);\n\nfunction lca(n, p, q) {\n  while (n) {\n    if (p < n.val && q < n.val) n = n.left;\n    else if (p > n.val && q > n.val) n = n.right;\n    else return n.val;\n  }\n}\n\nlca(root, ${p}, ${q}); // → ?`,
          a: n.val, x: [keys[0], p, q, Math.min(p, q)].filter(v => v !== n.val), ex: `Walk down from the root while both values are on the same side; the split point is the lowest common ancestor: ${n.val}.` };
      },
    ],
  };

  /* ---------- 8. Bit Manipulation ---------- */
  const b8 = v => (v >>> 0).toString(2);
  const BITS = {
    easy: [
      h => {
        const x = h.int(5, 63), y = h.int(5, 63), op = h.pick(['&', '|', '^']), v = op === '&' ? x & y : op === '|' ? x | y : x ^ y;
        return { t: 'Bitwise operators', q: 'What is the value of this expression?', code: `${x} ${op} ${y}; // → ?`, a: v, x: [x & y, x | y, x ^ y, x + y].filter(z => z !== v), ex: `${x} = ${b8(x)}, ${y} = ${b8(y)} in binary; ${{ '&': 'AND keeps bits set in both', '|': 'OR keeps bits set in either', '^': 'XOR keeps bits set in exactly one' }[op]}: ${b8(v)} = ${v}.` };
      },
      h => {
        const x = h.int(3, 100), k = h.int(1, 3), left = h.chance(0.5), v = left ? x << k : x >> k;
        return { t: 'Shifts', q: 'What is the value of this expression?', code: `${x} ${left ? '<<' : '>>'} ${k}; // → ?`, a: v, x: [left ? x >> k : x << k, left ? x * k : Math.round(x / k), v + 1], ex: left ? `Shifting left by ${k} multiplies by 2${'⁰¹²³'[k]}: ${x} × ${2 ** k} = ${v}.` : `Shifting right by ${k} divides by 2${'⁰¹²³'[k]} and drops the remainder: ⌊${x}/${2 ** k}⌋ = ${v}.` };
      },
    ],
    medium: [
      h => {
        const x = h.int(1, 255); let n = x, c = 0; while (n) { n &= n - 1; c++; }
        return { t: 'Counting bits', q: 'What does this call return?', code: `function countBits(n) {\n  let count = 0;\n  while (n) {\n    n &= n - 1; // drops the lowest set bit\n    count++;\n  }\n  return count;\n}\n\n${call('countBits', x)}`, a: c, x: [b8(x).length, c + 1, b8(x).length - c].filter(v => v !== c && v >= 0), ex: `${x} = ${b8(x)} has ${c} one-bit${c > 1 ? 's' : ''}; each loop clears one (Brian Kernighan’s trick).` };
      },
      h => {
        const pool = uniq(h, h.int(3, 4), 1, 30), single = pool[0], a = h.shuffle([...pool.slice(1), ...pool.slice(1), single]), v = a.reduce((s, x) => s ^ x, 0);
        return { t: 'XOR tricks', q: 'What does this call return?', code: `function single(nums) {\n  let x = 0;\n  for (const n of nums) x ^= n;\n  return x;\n}\n\n${call('single', a)}`, a: v, x: pool.slice(1, 4).concat([sum(a)]).filter(z => z !== v), ex: `x ^ x = 0 and x ^ 0 = x, so the pairs cancel and the value that appears once remains: ${v}.` };
      },
      h => {
        const x = h.chance(0.5) ? 2 ** h.int(1, 10) : h.int(3, 1000), res = x > 0 && (x & (x - 1)) === 0;
        return claim(h, { t: 'Powers of two', q: 'Look at this call', code: `function isPowerOfTwo(n) {\n  return n > 0 && (n & (n - 1)) === 0;\n}\n\n${call('isPowerOfTwo', x)}`, ex: `n & (n − 1) clears the lowest set bit, leaving 0 only when n has a single one-bit. ${x} = ${b8(x)}: ${res}.` }, res);
      },
    ],
    hard: [
      h => {
        const x = h.int(2, 200), v = x & -x;
        return { t: 'Bit tricks', q: 'What is the value of this expression?', code: `${x} & -${x}; // → ?`, a: v, x: [x & (x - 1), 1, v * 2].filter(z => z !== v), ex: `In two’s complement, x & −x keeps only the lowest set bit: ${x} = ${b8(x)} → ${v}.` };
      },
      h => {
        const a = h.int(1, 255), b = h.int(1, 255); let n = a ^ b, c = 0; while (n) { c += n & 1; n >>= 1; }
        return { t: 'Bit tricks', q: 'What does this call return?', code: `function bitsToFlip(a, b) {\n  let x = a ^ b, count = 0;\n  while (x) {\n    count += x & 1;\n    x >>= 1;\n  }\n  return count;\n}\n\n${call('bitsToFlip', a, b)}`, a: c, x: [c + 1, c - 1, b8(a ^ b).length].filter(v => v !== c && v >= 0), ex: `a ^ b marks the differing bits: ${b8(a)} ^ ${b8(b)} = ${b8(a ^ b)}, which has ${c} one-bit${c === 1 ? '' : 's'}.` };
      },
      h => {
        let x = h.int(1, 50), y = h.int(51, 99); const x0 = x, y0 = y; x ^= y; y ^= x; x ^= y;
        return { t: 'XOR tricks', q: 'What is [x, y] after this code runs?', code: `let x = ${x0}, y = ${y0};\nx ^= y;\ny ^= x;\nx ^= y;\n[x, y]; // → ?`, a: show([x, y]), mono: true, w: strW([x, y], [[x0, y0], [x0 ^ y0, y0], [y0, x0 ^ y0], [x0 ^ y0, x0 ^ y0]]), ex: `Three XORs swap two variables without a temporary: [${y0}, ${x0}].` };
      },
    ],
  };

  /* ---------- 9. Complexity ---------- */
  const COMPLEX = [
    ['function f(n) {\n  let s = 0;\n  for (let i = 0; i < n; i++)\n    for (let j = 0; j < n; j++) s++;\n  return s;\n}', 'O(n²)', 'Two nested loops of n each'],
    ['function f(n) {\n  let s = 0;\n  for (let i = 1; i < n; i *= 2) s++;\n  return s;\n}', 'O(log n)', 'i doubles each time'],
    ['function f(a) {\n  let i = 0, j = a.length - 1;\n  while (i < j) {\n    if (a[i] + a[j] > 10) j--;\n    else i++;\n  }\n}', 'O(n)', 'Each step moves one pointer, and they meet after at most n steps'],
    ['function f(n) {\n  if (n <= 1) return n;\n  return f(n - 1) + f(n - 2);\n}', 'O(2ⁿ)', 'Each call branches into two, so the call tree grows exponentially'],
    ['function f(a) {\n  const seen = new Set();\n  for (const x of a) {\n    if (seen.has(x)) return true;\n    seen.add(x);\n  }\n  return false;\n}', 'O(n)', 'One pass, with O(1) average set operations'],
    ['function f(n) {\n  let s = 0;\n  for (let i = 0; i < n; i++)\n    for (let j = i; j < n; j++) s++;\n  return s;\n}', 'O(n²)', 'The inner loop runs n + (n − 1) + … + 1 = n(n + 1)/2 times'],
    ['function f(a, lo = 0, hi = a.length) {\n  if (hi - lo <= 1) return;\n  const mid = (lo + hi) >> 1;\n  f(a, lo, mid);\n  f(a, mid, hi);\n  // merge the halves in O(hi - lo)\n}', 'O(n log n)', 'log n levels of halving, with O(n) merging work per level'],
    ['function f(n) {\n  let s = 0;\n  for (let i = 0; i < n; i++)\n    for (let j = 1; j < n; j *= 2) s++;\n  return s;\n}', 'O(n log n)', 'n outer passes, each with log n inner steps'],
    ['function f(n) {\n  let s = 0;\n  for (let i = 1; i * i <= n; i++) s++;\n  return s;\n}', 'O(√n)', 'It stops once i passes √n'],
    ['function f(a) {\n  a.sort((x, y) => x - y);\n  for (let i = 1; i < a.length; i++)\n    if (a[i] === a[i - 1]) return true;\n  return false;\n}', 'O(n log n)', 'Sorting costs O(n log n) and dominates the O(n) scan'],
    ['function f(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = f(n - 1, memo) + f(n - 2, memo);\n}', 'O(n)', 'Memoization computes each value from 2 to n once'],
    ['function f(m) { // m is an n × n grid\n  let s = 0;\n  for (const row of m)\n    for (const x of row) s += x;\n  return s;\n}', 'O(n²)', 'It visits all n × n cells once'],
  ];
  const BIGO = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(√n)', 'O(n³)'];
  const COMPLEXITY = {
    easy: [h => { const [code, a, why] = h.pick(COMPLEX.slice(0, 5)); return { t: 'Time complexity', q: 'What is the time complexity of f?', code, lang: 'js', a, w: distinct(a, h.shuffle(BIGO)), ex: `${why}: ${a}.` }; }],
    medium: [h => { const [code, a, why] = h.pick(COMPLEX.slice(3, 9)); return { t: 'Time complexity', q: 'What is the time complexity of f?', code, lang: 'js', a, w: distinct(a, h.shuffle(BIGO)), ex: `${why}: ${a}.` }; }],
    hard: [h => { const [code, a, why] = h.pick(COMPLEX.slice(6)); return { t: 'Time complexity', q: 'What is the time complexity of f?', code, lang: 'js', a, w: distinct(a, h.shuffle(BIGO)), ex: `${why}: ${a}.` }; }],
  };

  /* ---------- 10. Interview concepts ---------- */
  // [level, question, answer, wrong options, why]
  const CONCEPTS = [
    ['easy', 'Which data structure works Last-In, First-Out?', 'Stack', ['Queue', 'Heap', 'Hash map'], 'The last item pushed is the first popped — think of a stack of plates.'],
    ['easy', 'Which data structure does breadth-first search (BFS) use?', 'Queue', ['Stack', 'Heap', 'Trie'], 'A FIFO queue makes BFS visit nodes level by level.'],
    ['easy', 'What is the time complexity of reading arr[i] from an array?', 'O(1)', ['O(log n)', 'O(n)', 'O(i)'], 'Arrays compute the element’s address directly from the index.'],
    ['easy', 'What is the average time to look up a key in a hash map?', 'O(1)', ['O(log n)', 'O(n)', 'O(n log n)'], 'Hashing jumps straight to a bucket; only heavy collisions make it slower.'],
    ['easy', 'Binary search needs the data to be:', 'Sorted', ['Unique', 'Stored in a linked list', 'Of even length'], 'It throws away half the range by comparing with the middle, which only works on sorted (monotonic) data.'],
    ['easy', 'What does an inorder traversal of a binary search tree give?', 'The keys in sorted order', ['The keys level by level', 'The root first', 'The keys in insertion order'], 'Left subtree, node, right subtree — exactly ascending order in a BST.'],
    ['easy', 'Which structure is best for checking that brackets like "{[()]}" are balanced?', 'Stack', ['Queue', 'Hash set', 'Binary tree'], 'Push each opening bracket and pop when its matching closer arrives.'],
    ['easy', 'What is the time complexity of inserting at the front of an array of n items?', 'O(n)', ['O(1)', 'O(log n)', 'O(n²)'], 'Every existing element has to shift one place right.'],
    ['easy', 'What is the time complexity of inserting at the head of a linked list?', 'O(1)', ['O(n)', 'O(log n)', 'O(n²)'], 'Just point the new node at the old head.'],
    ['easy', 'How many edges does a tree with n nodes have?', 'n − 1', ['n', 'n + 1', '2n'], 'Each node except the root has exactly one edge to its parent.'],
    ['easy', 'What happens when a recursive function has no base case?', 'Stack overflow', ['It returns undefined', 'It runs once', 'It becomes a loop automatically'], 'Every call adds a stack frame until the call stack runs out.'],
    ['easy', 'A priority queue is usually implemented with a:', 'Binary heap', ['Stack', 'Linked list', 'Trie'], 'A heap gives O(log n) insert and remove-top and O(1) peek.'],
    ['medium', 'Which two structures give an LRU cache O(1) get and put?', 'Hash map + doubly linked list', ['Hash map + array', 'Binary heap + stack', 'Two queues'], 'The map finds the node instantly; the doubly linked list moves it to the front or evicts the tail in O(1).'],
    ['medium', 'How do you detect a cycle in a linked list using O(1) extra space?', 'Slow and fast pointers (Floyd)', ['A hash set of visited nodes', 'Sort the nodes first', 'Reverse the list twice'], 'If there is a cycle, the fast pointer laps the slow one and they meet; a hash set would need O(n) space.'],
    ['medium', 'Best way to keep the k largest items seen in a stream:', 'A min-heap of size k', ['A max-heap of everything', 'Sort after every item', 'A stack of size k'], 'The heap’s top is the smallest of the k kept; replace it when a bigger item arrives — O(log k) each.'],
    ['medium', 'Which structure suits autocomplete and prefix search?', 'Trie', ['Hash map', 'Binary heap', 'Queue'], 'A trie shares common prefixes, so all words starting with a prefix sit under one node.'],
    ['medium', 'Shortest path in an unweighted graph:', 'BFS', ['DFS', 'Dijkstra with a max-heap', 'Topological sort'], 'BFS reaches nodes in order of distance (edge count).'],
    ['medium', 'Shortest paths with non-negative edge weights:', 'Dijkstra’s algorithm', ['BFS', 'Kruskal’s algorithm', 'DFS'], 'Dijkstra greedily settles the closest unsettled node using a priority queue.'],
    ['medium', 'Shortest paths when some edges are negative (no negative cycle):', 'Bellman–Ford', ['Dijkstra', 'BFS', 'Prim’s algorithm'], 'Dijkstra’s greedy choice breaks with negative edges; Bellman–Ford relaxes all edges V − 1 times.'],
    ['medium', 'Two Sum on an unsorted array in O(n) uses:', 'A hash map of value → index', ['Sorting and binary search', 'Two nested loops', 'A stack'], 'For each value, check whether target − value is already in the map.'],
    ['medium', 'What is the amortized cost of push() on a dynamic array that doubles when full?', 'O(1)', ['O(n)', 'O(log n)', 'O(n²)'], 'Copies happen rarely; spread over all pushes the total is O(n), so O(1) each.'],
    ['medium', 'What is quicksort’s worst-case time complexity?', 'O(n²)', ['O(n log n)', 'O(n)', 'O(log n)'], 'Bad pivots (e.g. always the smallest) split off just one element per level.'],
    ['medium', 'Which of these sorting algorithms is stable?', 'Merge sort', ['Quicksort', 'Heapsort', 'Selection sort'], 'Stable means equal keys keep their order; merge sort keeps it by taking from the left half on ties.'],
    ['medium', 'How long does building a binary heap from n items (bottom-up) take?', 'O(n)', ['O(n log n)', 'O(log n)', 'O(n²)'], 'Most nodes sit near the bottom and sift down only a little; the sum is linear.'],
    ['medium', 'Searching in an unbalanced BST can take, in the worst case:', 'O(n)', ['O(log n)', 'O(1)', 'O(n log n)'], 'Inserting sorted keys makes the tree a straight line.'],
    ['medium', 'Topological sort works only on:', 'Directed acyclic graphs', ['Undirected graphs', 'Trees with weights', 'Complete graphs'], 'A cycle means no node can come first.'],
    ['medium', 'Which technique fits “longest substring without repeating characters”?', 'Sliding window', ['Binary search', 'Backtracking', 'Topological sort'], 'Grow the window on the right and shrink it from the left when a repeat appears — O(n).'],
    ['medium', 'Kadane’s algorithm solves:', 'Maximum subarray sum', ['Shortest path', 'Longest common subsequence', 'Matrix multiplication'], 'Keep the best sum ending at each index: max(x, previous + x).'],
    ['medium', 'Which structure finds the next greater element for every item in O(n)?', 'Monotonic stack', ['Min-heap', 'Hash set', 'Queue'], 'Keep a decreasing stack; each new value pops (and answers) the smaller ones.'],
    ['medium', 'Which algorithm quickly tells whether two nodes are connected as edges are added?', 'Union–Find (disjoint set union)', ['DFS from scratch each time', 'Dijkstra', 'Topological sort'], 'With path compression and union by rank, each operation is nearly O(1).'],
    ['medium', 'A problem with optimal substructure and overlapping subproblems calls for:', 'Dynamic programming', ['Greedy', 'Binary search', 'Two pointers'], 'Solve each subproblem once and reuse it (memoization or a table).'],
    ['medium', 'Space used by an adjacency list for V vertices and E edges:', 'O(V + E)', ['O(V²)', 'O(E²)', 'O(V × E)'], 'One list per vertex plus one entry per edge; a matrix would need O(V²).'],
    ['medium', 'Naive recursive Fibonacci runs in exponential time. With memoization it becomes:', 'O(n)', ['O(log n)', 'O(n²)', 'O(2ⁿ)'], 'Each value from 0 to n is computed once.'],
    ['medium', 'Level-order traversal of a binary tree uses a:', 'Queue', ['Stack', 'Heap', 'Hash map'], 'It is BFS on a tree.'],
    ['medium', 'Space complexity of recursive DFS on a tree of height h:', 'O(h)', ['O(1)', 'O(n²)', 'O(2ʰ)'], 'The call stack holds one frame per level of the current path.'],
    ['hard', 'Find the median of a stream of numbers efficiently using:', 'A max-heap and a min-heap', ['One sorted array', 'A stack and a queue', 'A trie'], 'Keep the lower half in a max-heap and the upper half in a min-heap; the median is at the tops.'],
    ['hard', 'Merging k sorted lists with N items in total is fastest with:', 'A min-heap of the k heads — O(N log k)', ['Merging them one by one — O(N)', 'Concatenating and sorting — O(N)', 'A stack — O(k)'], 'The heap always yields the smallest current head in O(log k).'],
    ['hard', 'Greedy coin change (largest coin first) fails for coins {1, 3, 4} and amount 6 because:', 'Greedy uses 4 + 1 + 1, but 3 + 3 needs only 2 coins', ['6 cannot be made', 'Greedy uses 2 coins, the best needs 3', 'Both need 3 coins'], 'Greedy is only safe for special coin systems; DP is correct in general.'],
    ['hard', 'An array of n + 1 numbers holds values 1..n with one repeated. Without changing the array and with O(1) space, find it using:', 'Floyd’s cycle detection on the indices', ['Sorting', 'A hash set', 'Binary search on the array itself'], 'Treat i → a[i] as a linked list; the duplicate is where the cycle starts.'],
    ['hard', 'Which algorithm finds the kth smallest element in O(n) average time?', 'Quickselect', ['Heapsort', 'Binary search', 'Counting sort'], 'Partition like quicksort but recurse into only one side.'],
    ['hard', 'In a matrix whose rows and columns are sorted, search for a value fastest by:', 'Starting at the top-right corner — O(m + n)', ['Binary search on each row — O(1)', 'Scanning every cell — O(log n)', 'Sorting the matrix first — O(m + n)'], 'Each comparison removes a whole row or column.'],
    ['hard', 'A queue built from two stacks has an amortized cost per operation of:', 'O(1)', ['O(n)', 'O(log n)', 'O(n²)'], 'Each item moves from the input stack to the output stack at most once.'],
    ['hard', 'To delete a BST node with two children you usually:', 'Replace it with its inorder successor (or predecessor)', ['Delete the whole subtree', 'Swap it with the root', 'Rebuild the tree from scratch'], 'The successor is the smallest key in the right subtree, so the BST order stays valid.'],
    ['hard', 'Which of these is NOT divide and conquer?', 'Dijkstra’s algorithm', ['Merge sort', 'Quicksort', 'Binary search'], 'Dijkstra is greedy; the others split the problem and solve the parts.'],
    ['hard', 'N-Queens, generating permutations and subsets are classic examples of:', 'Backtracking', ['Greedy algorithms', 'Divide and conquer', 'Sliding window'], 'Build a candidate step by step and undo the last choice when it can’t lead to a solution.'],
    ['hard', 'Extra space used by merge sort on an array:', 'O(n)', ['O(1)', 'O(log n)', 'O(n²)'], 'Merging needs a temporary array as large as the input.'],
    ['hard', 'Kruskal’s and Prim’s algorithms both find a:', 'Minimum spanning tree', ['Shortest path', 'Topological order', 'Maximum flow'], 'Both grow a spanning tree by picking the lightest safe edge.'],
    ['hard', 'Detect a cycle in a directed graph using:', 'DFS that tracks the nodes on the current path', ['BFS distances', 'Union–Find on the edges', 'Sorting the edges by weight'], 'A back edge to a node still on the recursion stack means a cycle.'],
    ['hard', 'What is the worst-case lookup time of a hash table?', 'O(n)', ['O(1)', 'O(log n)', 'O(n log n)'], 'If every key collides into one bucket, a lookup scans them all.'],
    ['hard', 'The sliding window maximum of an array is found in O(n) using a:', 'Deque (double-ended queue)', ['Min-heap', 'Stack', 'Trie'], 'Keep indices of decreasing values; drop ones that leave the window from the front.'],
  ];
  // The sub-topic of each concept question above, in the same order (d: data structure, a: algorithm, c: complexity).
  const AREAS = 'ddccaadccaad' + 'dadda' + 'aadccaccaaaddaccdc' + 'ddaaaacaaacaacd';
  const AREA_NAME = { d: 'Choosing a data structure', a: 'Algorithms & techniques', c: 'Complexity' };
  CONCEPTS.forEach((c, i) => c.push(AREA_NAME[AREAS[i]]));
  const conceptMaker = lv => h => { const [, q, a, w, why, t] = h.pick(CONCEPTS.filter(c => c[0] === lv)); return { t, q, a, w, ex: why }; };
  const CONCEPT = { easy: [conceptMaker('easy')], medium: [conceptMaker('medium')], hard: [conceptMaker('hard')] };

  /* ---------- Registration ---------- */
  const CODE_TX = { easy: 2, medium: 2.6, hard: 3.2 };
  const TOPICS = [
    ['dsa-arrays', 'Arrays & Strings', ARRAYS], ['dsa-hashing', 'Hashing', HASHING], ['dsa-stacks', 'Stacks & Queues', STACKS], ['dsa-linked', 'Linked Lists', LINKED],
    ['dsa-recursion', 'Recursion & DP', RECURSION], ['dsa-sorting', 'Searching & Sorting', SORTING], ['dsa-trees', 'Trees & Graphs', TREES], ['dsa-bits', 'Bit Manipulation', BITS],
  ];
  // Code makers show JavaScript; every code question gets lang 'js'.
  const withLang = makers => Object.fromEntries(Object.entries(makers).map(([lv, list]) => [lv, list.map(m => h => { const s = m(h); if (s && s.code && !s.lang) s.lang = 'js'; return s; })]));
  for (const [kind, topic, makers] of TOPICS) QM.register(kind, withLang(makers), { topic, tx: CODE_TX, group: 'dsa-mix', written: 0.25 });
  QM.register('dsa-complexity', COMPLEXITY, { topic: 'Complexity', tx: { easy: 1.6, medium: 1.9, hard: 2.2 }, group: 'dsa-mix', written: 0 });
  QM.register('dsa-concepts', CONCEPT, { topic: 'Interview Concepts', tx: { easy: 1.2, medium: 1.4, hard: 1.6 }, group: ['dsa-mix', 'dsa-mix'], written: 0 });
})();
