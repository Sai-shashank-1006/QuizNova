# QuizNova — AI Quiz Battles

<p align="center"><img src="assets/quiznova-logo.webp" alt="QuizNova logo" width="520"></p>

QuizNova is a quiz game built with **HTML5, CSS3 and JavaScript**. It runs in any modern browser, on phones as well as PCs. Its code is kept in **Git and GitHub**, and a **Jenkins** pipeline checks and packages it.

- **AI questions:** Google's **Gemini** writes brand-new questions every game, on any subject or any topic you type. It's free: each player adds their own Gemini API key from Google AI Studio.
- **Exact difficulty:** pick Easy, Medium or Hard and every question in the game is at that level. QuizNova throws away any question the AI rates differently.
- **20 questions a game** by default (5 and 10 are still there for quick games).
- **No repeats:** QuizNova remembers the questions you've had and their answers, and throws away any the AI repeats, even reworded.
- **Mystery boxes:** in battles and online rooms, boxes drop on random questions. The fastest right answer wins a power-up: 50:50, +10 s or Skip.
- **Real maths:** the Maths subjects are solvable problems (arithmetic, algebra, geometry, calculus) that QuizNova makes and checks itself, with no AI needed (or pick AI if you prefer).
- **Aptitude:** quantitative aptitude for SSC, banking, railway and placement tests, in 16 topics you learn in order, each with easy, medium and hard problems, plus a full mixed Aptitude Test.
- **DSA & coding interviews:** endless code-tracing questions (predict what a short function returns) across 10 topics, plus interview concept questions; every snippet is run by the tests to check its answer.
- **GATE and CAT:** GATE General Aptitude, Engineering Maths and the CS/IT syllabus (15 topics), and CAT Quant, Data Interpretation and Logical Reasoning (7 topics), with mock tests, data tables, matrices, puzzles and type-in answers like the real exams.
- **Built-in questions:** 231 questions work fully offline when AI is off. AI rounds never mix them in.
- **Phones and PCs:** the layout adapts from a wide desktop down to a small phone, with a bottom navigation bar and a score bar on small screens. Slow devices automatically get a lighter version with fewer looping animations.
- **Look:** a neumorphic (soft, raised) design in light grey, near-black and red, with light and dark modes and lots of motion (see [Animations](#animations)).
- **Logo:** a One Piece-style logo: the straw-hat Jolly Roger sits inside the Q, Luffy stands in for the "i", and a rope runs along the bottom.

## AI questions

> **Why do questions repeat?** With AI off, you play each subject's small set of built-in questions (10 to 45), so they come back once you've had them all. Turn on AI and every game gets new ones. QuizNova offers to turn it on the first time you log in.

### Shared AI: no key for players
The owner can turn on AI for everyone, so players never paste a key. QuizNova then sends AI requests through **[Firebase AI Logic](https://firebase.google.com/docs/ai-logic)** on the owner's Firebase project (Gemini Developer API, free Spark plan, no billing). The Gemini key stays inside Firebase and never ships in the app, and **App Check** (reCAPTCHA) makes sure requests come from this website. All players share the project's free daily limit; when it's used up, QuizNova says so and players can add their own key to keep going.

To set it up, fill in `js/config.js` with:
- `firebase`: the web app config from **Firebase console → Project settings → Your apps → Web app**.
- `appCheck.siteKey`: the reCAPTCHA site key registered in **Firebase console → Security → App Check** (`provider`: `recaptcha-v3`, or `recaptcha-enterprise` for an Enterprise key).

These values are public by design: they identify the project; they aren't passwords. Never put a Gemini API key or the reCAPTCHA **secret** key in the file. With `firebase: null`, each player adds their own key instead.

### Your own key (optional with shared AI)
1. Open [Google AI Studio → API keys](https://aistudio.google.com/apikey) and sign in with a Google account.
2. Press **Create API key** and copy it.
3. In QuizNova, open **AI settings** (the ✨ button), paste the key, press **Test key**, then press **Save**.

A player's own key is used first, so they get their own free limit. The key is saved **only in their browser**, and it's sent only to Google. It's never part of the repo or the zip. Don't save a key on a shared or public computer.

Gemini's free tier has usage limits (requests per minute and per day). A game uses one request, so this is plenty for normal play. Google may use free-tier requests to improve its products; the requests only contain quiz topics and recent questions.

### Models
You choose the model in AI settings:

| Model | Best for |
|---|---|
| Gemini 3.6 Flash (default) | Most precise: best for hard questions |
| Gemini 3.5 Flash-Lite | Fastest |

If the chosen model is busy or out of free quota, or is slow to start (no question within 10 seconds, 15 for maths) or stalls for 25 seconds, QuizNova switches to the other one, keeps the questions already written, and tries the slow model last for the next 10 minutes. Gemini 3.6 Flash is used rather than the newest Flash because, on the free tier, the newest one often keeps players waiting.

### What the AI does
- **Streams questions in one by one.** The game starts as soon as the first question is written, and the clock pauses if you answer faster than the AI writes. Gemini thinks only briefly before writing, so the first question arrives in a few seconds.
- **Keeps your difficulty.** Hard is the default. Easy, Medium and Hard are each defined for the AI (Hard means deep cuts only dedicated fans or experts know), and the AI rates every question it writes: QuizNova throws away any that don't match, so a Hard game never slips in an easy one. Mixed gives roughly a third of each.
- **Never repeats itself.** QuizNova saves every AI question and its answer the moment it arrives (so quitting a game still counts), keeps the last 200 for each topic, and sends the most recent ones to the AI as "don't ask these again". It throws away any new question that shares almost all its key words with one you've had, or has the same answer and asks about the same person, place or thing in other words. If the AI comes up short, it's asked again; after that the round is just a little shorter. Each round asks for a random style ("numbers and records", "quotes"…), and some subjects also get a random focus (a season, a hero, a director) to keep things unpredictable.
- **Never wrong on TFI.** AI often gets Telugu cinema facts wrong, so for TFI QuizNova picks every question, answer and wrong option from checked data on about 50 films of the tier-1 heroes (directors, music directors, heroines, characters, supporting cast, production houses, years and remakes, all from each film's Wikipedia page). The AI only rewrites the wording, and a rewrite that changes the meaning is thrown away. Hard rounds ask the deep cuts.
- **Stays on topic.** Game of Thrones and House of the Dragon are separate subjects: each asks only about its own show, and AI questions that name the other show's characters or dragons are thrown away.
- **Writes a mix of formats:** multiple-choice, true/false and short written answers. Hard questions are worth ×1.5 and medium ×1.2.
- **Lets you quiz on anything:** type a topic on the home screen, like "Attack on Titan", "IPL 2024" or "Ancient Egypt".

### When something goes wrong
- **No key, a rejected key, no internet, Gemini busy or out of free quota:** QuizNova says why. Pick **Built-in** in the game setup to play without AI. (TFI rounds still work: QuizNova words the checked questions itself.)
- **Custom topics** have no built-in questions, so you get a clear message instead.

AI can occasionally get a fact wrong. QuizNova guards against it in three ways:

- **Accuracy-first instructions.** Gemini is told to use only well-documented facts, to avoid rumours and facts that change over time, and to write a different question when it isn't sure.
- **Self-checks, no extra AI calls.** The AI writes the fact first, then a question that fact answers, and names the correct option by its text as well as its position. A question is thrown away if those disagree, or if the explanation backs a different option. For maths, the working must contain the marked answer.
- **Report it.** On the results screen, press **Wrong answer? Report it** next to any AI question. It stops counting towards your score and accuracy, it's left out of challenge codes, and it won't be asked again.

For the most accurate AI questions, use Gemini 3.6 Flash. For guaranteed-correct answers, use the built-in questions or, for maths, **Generated**.

## Categories

| Category | Built-in and AI | AI only |
|---|---|---|
| Educational | HTML & CSS, JavaScript, Git & DevOps, Science; DSA & Coding Interviews (endless generated questions) | Geography, History |
| Maths | Mathematics (a mix), Arithmetic, Basic Algebra, Algebra, Geometry & Trig, Calculus: endless generated problems, no AI needed | — |
| Aptitude | Aptitude Test (all topics mixed) and 16 topics from Number System to Probability: endless generated problems, no AI needed | — |
| GATE | GATE CS Mock, GATE Aptitude & Maths and 15 topics (General Aptitude, Engineering Maths, CS/IT): endless generated problems | Verbal Aptitude |
| CAT | CAT Mock and 7 topics (Quant, Data Interpretation, Logical Reasoning): endless generated problems | VARC |
| Comics | Marvel, DC | — |
| Movies | Hollywood, MCU (Marvel Cinematic Universe), Indian Cinema, TFI (Telugu cinema: the tier-1 heroes and star directors; AI rounds use checked film data), Dune (Part One and Part Two) | Harry Potter, Star Wars |
| Series | Game of Thrones, House of the Dragon | Series Mix, Stranger Things, Breaking Bad, Money Heist, Squid Game, Friends, The Office, Indian Web Series, K-Dramas, Cartoons |
| Anime | One Piece, Naruto | Dragon Ball, Demon Slayer, Attack on Titan, Jujutsu Kaisen |
| Gaming | — | Video Games, Minecraft, Grand Theft Auto, Fortnite, Pokémon, Super Mario, BGMI & PUBG, Free Fire, Valorant, Call of Duty, Clash of Clans & Royale, The Legend of Zelda |
| Sports | Cricket, Football | Formula 1, Basketball |
| Party | Surprise Me (mixes all built-in questions) | Surprise Me, General Knowledge, Music |

On top of these, **Any topic** accepts whatever you type (AI only).

With the built-in questions, ones you haven't seen come first, then the ones you saw longest ago, so a question only comes back after you've had the rest of that subject's questions.

## Maths

Maths questions are real problems to solve, not trivia about famous mathematicians. QuizNova generates them from random numbers (in `js/maths.js`) and works out each answer itself. So they're always correct, never run out, work offline and don't use AI (small AI models often get arithmetic wrong).

You can still choose **AI** for a Maths subject in the Solo or Battle setup (**Generated** is the default). AI gets a maths-only prompt that asks for problems to work out, with no history or famous-mathematician trivia, and its typed answers are checked by value too. It can still get an answer wrong. Typing a maths topic such as "calculus" into **Quiz me on anything** uses the same maths prompt.

| Subject | Easy | Medium | Hard |
|---|---|---|---|
| Arithmetic | Sums, differences, times tables, division | Bigger products, percentages, order of operations, squares and roots, fractions | Multi-step sums, adding and multiplying fractions, percentage change, negatives, LCM/HCF, decimals |
| Basic Algebra | Solve x + a = b, ax = b, x/a = b; substitute | Two-step and both-sides equations, simplify, expand, substitute into x² | Brackets on both sides, inequalities, word problems, factorising, simultaneous equations |
| Algebra | Index laws, powers, x² = k | Solve and factorise quadratics, expand brackets, simultaneous equations, gradient | Discriminant, sum and product of roots, exponential equations, logs, quadratics with a ≠ 1 |
| Geometry & Trig | Rectangle area and perimeter, triangle angles and area, angles on a line | Pythagoras, circles (in π), polygon angle sums, cuboid volume | Exact trig values, regular polygon angles, cylinder volume, distance between points, trapezium area |
| Calculus | Power rule, derivatives of constants and lines, standard derivatives, simple integrals | Differentiate polynomials, f′(a), integrate axⁿ, limits by substitution | Definite integrals, chain rule, turning points, 0/0 limits, product rule, second derivatives |

- **Mathematics** mixes all five, easy to hard.
- **Wrong options** come from common slips: a sign error, forgetting to divide, adding the denominators, differentiating instead of integrating.
- **Every question** comes with a one-line worked solution.
- **Typed answers** are checked by value, so `-3`, `−3`, `3/4` and `0.75` all work, and `25` is never taken for `2.5`.
- **Harder problems get more time:** up to twice the normal limit.
- **Difficulty** is picked in the Solo, Battle and Online setups. **Challenge codes** carry the exact problems, so a friend gets the same ones.

## Aptitude

Quantitative aptitude in the style of competitive exams (SSC, banking, railways, campus placements). Like Maths, the problems are generated from random numbers (in `js/aptitude.js`) with the answer worked out first, so every answer is right and the questions never run out.

The **Aptitude** tab lists 16 topics, numbered in the order to learn them. Play each one on Easy, then Medium, then Hard. Every question shows the sub-topic it practises (for example *Percentages · Successive change*), and every answer comes with its worked method. The **Aptitude Test** mixes all 16 topics, like a real paper.

| # | Topic | Easy | Medium | Hard |
|---|---|---|---|---|
| 1 | Number System | Unit digit of a product, divisibility rules, number to add for divisibility | Unit digit of powers (cyclicity), remainders, number of factors | Trailing zeros of n!, remainder of a power, counting multiples, sum of factors |
| 2 | HCF & LCM | HCF, LCM | HCF × LCM = product, LCM of three, bells ringing together | LCM with a remainder, HCF with remainders, same remainder |
| 3 | Simplification | BODMAS, a² − b², decimals | × 99 / 101 / 1001, (a + b)² − (a − b)², fractions of a number, square roots | Telescoping sums, ratio substitution, approximation |
| 4 | Number Series | Arithmetic and geometric series | Squares ± c, growing differences, alternating rules, cubes | ×n + n, differences that are squares, n(n + 1), sum of previous two |
| 5 | Percentages | Percent of, what percent, finding the whole | Successive change, more than / less than, price and consumption, original price | Pass marks, elections, population growth, income and savings |
| 6 | Profit & Loss | Profit/loss %, selling price, discount | Successive discounts, articles bought and sold, cost price | Loss to gain, mark-up with discount, false weights, marking above cost |
| 7 | Simple & Compound Interest | SI, amount, rate | Doubling time, CI for 2 and 3 years | CI − SI, finding the rate, half-yearly compounding, compound growth |
| 8 | Ratio & Partnership | Dividing in a ratio, fourth proportional | Combining ratios, mean proportional, partnership, coins | Partnership over time, ratio after a change, inverse ratios |
| 9 | Averages | Average of numbers and sequences, changing every number | Removing a number, batting average, replacing a person | Including a new member, overlapping averages |
| 10 | Problems on Ages | Sum and difference, ratios, past and future | Ages in the past, ratios now and later | Sum of ages, multiples of age, product of ages |
| 11 | Mixtures & Alligation | Price of a mixture, parts of a mixture | Alligation rule, adding water, watering milk for profit | Repeated replacement, mixing two vessels |
| 12 | Time & Work | Working together, men and days | One worker's time, pipes and cisterns, efficiency | Leaving midway, chain rule, three pipes |
| 13 | Speed, Distance & Time | km/h ↔ m/s, speed = distance ÷ time | Average speed, trains passing a pole or platform, boats | Two trains, boats and streams, late and early, chasing |
| 14 | Mensuration | Rectangle, square from its diagonal, cube | Circle, cylinder, cost of fencing (π = 22/7) | Cone, sphere, % change in area, longest rod in a room |
| 15 | Permutations & Combinations | n!, nCr, arranging letters | Words with repeated letters, committees, forming numbers, handshakes | Vowels together, circular seating, diagonals, triangles from points |
| 16 | Probability | Dice, balls, coins, picking a number | Two dice, cards, drawing two balls | Two-dice events, mixed pairs, two cards, independent events |

- **Wrong options** are the classic exam traps: adding percentages instead of compounding them, dividing by the selling price, taking the simple average of two speeds, forgetting the remainder.
- **Answers** with money, units or percentages (₹450, 45 km/h, 450 cm², 25%) can be typed with or without the ₹ or the unit.
- **More time:** aptitude problems get 1.6× (easy) to 2.8× (hard) the normal limit, since they need working out.
- Choosing **AI** for an aptitude subject (or typing a topic like "profit and loss") asks for competitive-exam style problems with ₹ and π = 22/7.

## DSA & coding interviews

The DSA subject is generated by `js/dsa.js`. Most questions show a short JavaScript function and a call with fresh random input, and ask what it returns. That's the code-tracing skill interviews test, and the same patterns you'll write yourself.

| Topic | Code you trace |
|---|---|
| Arrays & Strings | Loops with early return, palindrome check, prefix sums, sliding window, Kadane, move zeros, dedupe, pair counting, longest unique substring, product except self, rotation, Dutch flag |
| Hashing | Distinct count, most frequent, Two Sum, first unique character, anagrams, subarray sum = k, longest consecutive run, grouping anagrams |
| Stacks & Queues | Push/pop traces, valid brackets, next greater element, removing adjacent duplicates, postfix evaluation, daily temperatures, decode "3[a2[c]]", asteroid collision |
| Linked Lists | Traversal, reversal, middle node, remove nth from end, merging sorted lists, Floyd’s cycle detection, dedupe |
| Recursion & DP | Digit sum, recursion order, fast power, counting recursive calls, climbing stairs, Pascal’s rule, coin change (ways and fewest coins), LCS, house robber |
| Searching & Sorting | Binary search (and its steps), lower bound, bubble/insertion/selection sort passes, merge step, Lomuto partition, rotated array search, integer square root |
| Trees & Graphs | Height, leaves, traversals, kth smallest, LCA in a BST, BFS and DFS order, connected components, topological sort, shortest path |
| Bit Manipulation | AND/OR/XOR, shifts, counting bits, single number, power of two, lowest set bit, bits to flip, XOR swap |
| Complexity | Big-O of loops, recursion, memoization and sorting |
| Interview Concepts | 50 questions on choosing data structures, algorithms and complexities (LRU cache, heaps for top-k, tries, union–find, Dijkstra vs BFS…) |

- **Checked by running the code:** the test suite runs every displayed snippet exactly as shown and compares the result with the answer marked correct.
- **Typed answers** sometimes: type the number the call returns.
- Picking **AI** for this subject asks for interview-style questions instead of maths problems.

## GATE and CAT

Two more exam tabs work like Aptitude: numbered topics in learning order, each on Easy, Medium and Hard, plus mixed mock tests. The problems come from `js/gate.js` and `js/cat.js`, and every answer is computed by code. Schedules, page faults, hash tables, heaps, minimal DFAs, K-map covers, normal forms and seating puzzles are actually simulated or solved, not looked up.

**GATE** (topics 1–7 are common to every branch; 8–15 are the CS/IT paper):

| # | Topic | What it covers |
|---|---|---|
| 1 | Numerical Ability | General Aptitude quant, a level above the Aptitude tab |
| 2 | Analytical Reasoning | Clock angles and coinciding hands, calendars (odd days), directions, coding–decoding, counting squares and rectangles, painted cubes |
| 3 | Linear Algebra | Determinants, rank, nullity, eigenvalues (and of A², A⁻¹, A + kI), inverses, systems with no solution, Cayley–Hamilton |
| 4 | Calculus | Standard limits, maxima and minima, definite integrals, Wallis and Gamma integrals, Taylor coefficients, gradient, double integrals |
| 5 | Probability & Statistics | Mean, median, mode, variance, Bayes, binomial, Poisson, exponential, uniform, geometric |
| 6 | Differential Equations | Order and degree, first- and second-order linear ODEs, initial values, Cauchy–Euler, particular integrals (ME, EE, EC, CE) |
| 7 | Numerical Methods | Bisection, Newton–Raphson, trapezoidal and Simpson rules (with tables), Euler, Gauss–Seidel, error orders (ME, EE, EC, CE) |
| 8 | Discrete Mathematics | Counting relations and functions, onto functions, pigeonhole, inclusion–exclusion, graphs, colouring, trees, Bell and Stirling numbers, groups, truth tables |
| 9 | Digital Logic | Number systems, two’s complement and overflow, Gray code, minterms, K-map prime and essential implicants, counters, multiplexers, IEEE 754 |
| 10 | Computer Organization | Address lines, cache tag/index bits and tag directories, AMAT, pipelines, CPI, disks, expanding opcodes |
| 11 | Data Structures & Algorithms | Array addressing, heaps, BST traversals, hashing with linear probing, postfix, infix → postfix, master theorem, loop complexity, Dijkstra, MST |
| 12 | Operating Systems | fork(), paging and multi-level paging, TLB, FCFS/SJF/SRTF/Round Robin (with process tables), FIFO/LRU/OPT page faults, disk scheduling, deadlock |
| 13 | Databases | Closures, candidate and super keys, highest normal form, B+ tree order, conflict serializability (with a schedule table) |
| 14 | Computer Networks | Subnetting, delays, stop-and-wait and sliding-window utilisation, sequence bits, Shannon and Nyquist, Hamming distance, CRC, token bucket, TCP slow start, fragmentation |
| 15 | Theory of Computation | Minimal DFA sizes (computed by minimising), counting strings, regular expressions, language classes, closure and decidability facts |

**CAT**:

| # | Topic | What it covers |
|---|---|---|
| 1 | Arithmetic | Mark-up with discount and false weights, meeting trains, races, wages, circular tracks, instalments, leaks, alternate-day work |
| 2 | Number System | Legendre, factors, last two digits, remainders (CRT, Fermat, Wilson), bases, trailing zeros in other bases, repunits, totient |
| 3 | Algebra | Progressions, roots of quadratics, inequalities, functions, logs, identities, minimum values, modulus equations, series |
| 4 | Geometry & Mensuration | Polygons, Heron, similar triangles, chords, tangents, angle bisectors, coordinates, solids |
| 5 | Modern Maths | Stars and bars, distributions, committees, arrangements, dice, cards, three-set Venn surveys, counting numbers |
| 6 | Data Interpretation | Sales and marks tables: totals, growth, shares, ratios, projections |
| 7 | Logical Reasoning | Seating arrangements (every puzzle checked to have exactly one solution), tournaments, set puzzles |

- **Typed answers** come up often (GATE’s numerical-answer questions, CAT’s TITA), and may be decimals such as 2.25.
- **Mocks:** GATE CS Mock (aptitude, maths and core CS), GATE Aptitude & Maths (the part common to every branch) and CAT Mock (Quant, DI and LR).
- **Verbal sections** (GATE Verbal Aptitude, CAT VARC) can’t be generated from formulas, so the AI writes them.
- **More time:** these problems get 1.8× to 3× the normal limit, and seating puzzles up to 5×.
- **Tables, matrices and clues** travel in challenge codes and online rooms, so friends see the same data.

## Game modes

Every mode plays **20 questions** by default; you can pick 5 or 10 instead. With built-in questions, a subject with fewer than 20 plays all of them. AI and generated maths games can be **Mixed**, **Easy**, **Medium** or **Hard**, and a chosen level is kept for every question.

### Solo: fastest finger first
- Every question has its own timer:
  - **Blitz:** 8 s
  - **Classic:** 15 s
  - **Relaxed:** 25 s

  Written answers get double time.
- A correct answer scores **100 points** plus up to **100** for speed, times the difficulty. Consecutive correct answers add a streak bonus of up to **+100**.
- **Power-ups**, one of each per game:
  - **50:50** removes two wrong answers. On a written question, it gives a hint instead.
  - **+10 s** adds ten seconds to the clock.
  - **Skip** moves on and keeps your streak.
- **Surprise rounds:**
  - **Double points** (×2)
  - **Lightning** (half the time, ×3)
  - **Mystery box** (a secret ×1–×4)
- **Extras:** sounds (with a mute button), confetti for streaks and wins, and a **Surprise me** button that picks a random subject and speed.

### Battle: 2–4 players on one device
- Every player logs in with **their own ID** and gets a buzzer key: `Q`, `P`, `Z` or `M`. On touch screens, tap your player card instead.
- Buzzing before **BUZZ!** is a **false start**, and it locks that player out of the question.
- The first player to buzz answers with `1`–`4` (or a tap):
  - **Right:** +100 points plus a speed bonus (×2 in a Double points round).
  - **Wrong:** −50 points, and the others can buzz.
- Battles can use AI or built-in questions.
- **Mystery boxes** drop on random rounds (see [below](#mystery-boxes-battles-and-online-rooms)). In a battle, you use a power-up after you buzz in.

### Mystery boxes: battles and online rooms
- About one question in seven gets a **mystery box** (never the first or the last). The banner shows it when the question appears.
- The **fastest right answer** wins the box. Inside is one random power-up:
  - **50:50** removes two wrong answers.
  - **+10 s** adds ten seconds to your clock.
  - **Skip** passes the question and still gives you half the base points (50, times the difficulty online, ×2 in a Double points round), with no speed bonus. In a battle, the others can still buzz.
- Power-ups are kept for later questions. Tap one, or press `F` (50:50), `T` (+10 s) or `S` (Skip). Each can be used once per question, before you answer.
- Online, the host's device checks every power-up, so nobody can use one they didn't win. Everyone sees how many power-ups each player holds on the scoreboard.

### Online room: friends on their own devices
1. The host presses **Online** (the Wi-Fi button in the sidebar), picks a subject and presses **Create room**. They get a 5-character code like `K7Q2M`.
2. Friends open QuizNova on their own phone or PC, press **Online**, type the code and press **Join**. Up to 8 players can join, each logged in with their own ID.
3. The host presses **Start game**. Everyone gets the same question at the same moment:
   - A right answer scores **100** plus up to **100** for speed, times the difficulty (and ×2 in a Double points round).
   - A wrong answer or no answer scores 0.
   - After each question, everyone sees who picked what, the worked answer, who won a mystery box and the live scoreboard.
4. At the end, everyone sees the same podium, and the result is saved to each player's stats. The room stays open, so the host can press **New game, same room** for a rematch.

How it works:
- **Connection.** The host's browser runs the game. Friends connect straight to it with WebRTC, and PeerJS's free public server is only used to find each other, so there's no server of our own. Everyone needs internet. The first online game downloads the PeerJS library (about 30 KB) from jsDelivr.
- **Questions.** The host's device picks them: built-in, generated maths, or the host's own AI. Friends don't need AI or an API key. Online games use multiple-choice and true/false questions.
- **Fairness.** Answers never leave the host's device until the reveal, and the host checks everything, including power-ups.
- **Same version.** Everyone in a room needs the same version of QuizNova. A friend on an older copy is told to update.
- **Keep the host open.** If the host closes QuizNova, the room closes for everyone. A friend who leaves mid-game drops out, and the others keep playing.
- **If a friend can't connect:** check the code, then try again. Some school, office or mobile networks block this kind of connection. A home Wi-Fi or a phone hotspot usually works.

### Challenge codes: compete with anyone
1. After a solo game, press **Challenge a friend** and send the message.
2. Your friend pastes it into **Enter code** on their own copy of QuizNova.
3. They play **the exact same questions**, including the bonus rounds, and see a head-to-head comparison.

The code carries the questions themselves, so your friend **doesn't need an API key** to play your AI quiz. Their reply code shows you who won without replaying. Codes are compressed and include a checksum, so a mistyped or incomplete code is rejected.

## Animations

QuizNova uses CSS transitions and keyframe animations, plus a little JavaScript for effects that follow the pointer or count numbers. All of it is decoration: if your system is set to **reduce motion**, it switches off and every screen still works.

| Where | What moves |
|---|---|
| Logo | On the login screen the logo swings in like a ship's sign, then gently sways, with a gloss sweeping across it every few seconds. Hover the logo in the top bar and it wobbles and shines; hover the skull in the sidebar and it spins. (The gloss needs the app served over http(s), such as GitHub Pages or `python -m http.server`. Opened straight from disk, everything else still animates.) |
| Everywhere | Screens slide in piece by piece. Buttons ripple where you press, red and black buttons flash a shine on hover, and icons nudge (arrows slide, the dice rolls, the ✕ spins). Dialogs pop in and fade out. |
| Theme | Switching light/dark grows the new theme out of the toggle button as a circle. |
| Home | Subject cards tilt toward your cursor with a soft glare. Stat numbers count up and chart bars grow as they scroll into view. The straw hat on the promo card floats. |
| Solo game | A ring pulses out of each countdown number, options pop in one by one and the score counts up. Right answers flash green and draw a tick, wrong ones shake and flash red. In the last 3 seconds the card beats red. Streak flames flicker and bonus banners shine. |
| Battle | The phase banner springs in each round, buzzers glow when it's time to buzz, and a buzz sends out a shockwave. |
| Results | The score counts up, the tiles and answers cascade in, a win shimmers, and the battle crown drops onto the podium. |

## Player IDs, offline
- Create an ID and a password. Passwords are stored as a salted SHA-256 hash rather than in plain text.
- IDs, scores and the API key are saved in the browser's `localStorage`.
- **Hall of Fame** ranks every ID on the device.
- **Your stats** shows accuracy, best score, battle wins, a chart and your history.

> This login is for a local game. It isn't a real security system.

## Run it

No build step or install is needed.

- **Quickest:** double-click `index.html`.
- **Or** serve the folder:

  ```bash
  python -m http.server 8000
  ```

  Then open <http://localhost:8000>.

Online rooms and AI questions need an internet connection. Everything else works offline.

### On a phone
Open the GitHub Pages address (see [Deploy](#deploy-to-github-pages)) in your phone's browser. To get an app icon, use **Add to Home screen** (Chrome on Android) or **Share → Add to Home Screen** (Safari on iPhone). QuizNova then opens full screen like an app.

## Keyboard shortcuts

On phones and tablets, everything works with taps instead.

| Where | Keys |
|---|---|
| Solo | `1`–`4` or `A`–`D` answer · `Enter` next question |
| Battle | `Q` `P` `Z` `M` buzz · `1`–`4` or `A`–`D` answer · `F` `T` `S` power-ups |
| Online | `1`–`4` or `A`–`D` answer · `F` `T` `S` power-ups |

## Project structure

```
Quiz Application/
├── index.html      # App shell: sidebar, top bar, dialogs (incl. AI settings)
├── assets/
│   ├── quiznova-logo.webp      # The logo (transparent background)
│   ├── quiznova-mark.webp      # Round skull-in-Q emblem for the sidebar and the home-screen icon
│   ├── favicon.png             # Browser-tab icon
│   └── manifest.webmanifest    # Lets phones add QuizNova to the home screen
├── css/
│   └── style.css   # Neumorphic theme (light/dark), layouts for PCs, tablets and phones, motion & micro-interactions
├── js/
│   ├── config.js   # Owner settings: the shared AI (Firebase project and App Check key)
│   ├── data.js     # Categories, subjects (with AI topics) and the 231 built-in questions
│   ├── maths.js    # Maths problem generator: arithmetic → calculus, answers worked out by QuizNova
│   ├── aptitude.js # Aptitude problem generator: 16 quantitative-aptitude topics, easy → hard
│   ├── gate.js     # GATE generator: General Aptitude, Engineering Maths and the CS/IT syllabus
│   ├── cat.js      # CAT generator: Quant, Data Interpretation (tables) and Logical Reasoning (puzzles)
│   ├── dsa.js      # DSA generator: code-tracing questions and interview concepts
│   └── app.js      # Accounts, AI question streaming (Gemini), solo, battle and online engines, mystery boxes, challenge codes, stats, motion helpers
├── Jenkinsfile     # CI pipeline: checkout → validate → package
└── README.md
```

### How the AI call works (`js/app.js` → `aiGenerate`)
- **Own key:** it calls the [Gemini API](https://ai.google.dev/gemini-api/docs) straight from the browser with `fetch` (`streamGenerateContent?alt=sse`), sending the player's key in the `x-goog-api-key` header. Nothing extra is downloaded.
- **Shared AI:** it loads the Firebase JS SDK (`firebase-app`, `firebase-app-check`, `firebase-ai`, version 13.0.0, about 195 KB) from Google's CDN on the first AI game, sets up App Check with reCAPTCHA, and streams with `generateContentStream` through Firebase AI Logic. The same JSON schema, prompts and thinking levels are used.
- **Structured output:** it asks for JSON (`responseMimeType` with a `responseJsonSchema`), so every response has the same shape. The schema puts the fact (`explain`) first, so the model writes the fact before the question.
- **Streaming:** it reads the server-sent events and pulls out each question the moment its JSON object closes.
- **Speed:** it sets the lowest useful thinking level (`thinkingConfig.thinkingLevel`: `low` on 3.6 Flash, `minimal` on Flash-Lite; one step more for maths), so the first question arrives fast.
- **Fallback:** if the chosen model returns "busy", "out of quota" or "not found" before any question arrives, it retries once with the other model.

## Git and GitHub

```bash
git init
git add .
git commit -m "QuizNova: AI quiz game"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

No API key is ever committed. `js/config.js` only holds the shared AI's public Firebase settings; a player's own key stays in their browser.

### Versions

Each release is a git tag, so you can always go back (`git checkout <tag>`):

| Tag | What changed |
|---|---|
| `v1.0-beta` | The first playable version |
| `v2.1` | Gemini AI with a shared key, phone layout, strict difficulty, mystery boxes, 20-question games, Aptitude (16 topics), GATE (15 topics) and CAT (7 topics) |
| `v2.2` | DSA & Coding Interviews: endless code-tracing questions and interview concepts |

## CI with Jenkins

The `Jenkinsfile` runs three stages:

1. **Checkout:** pulls the code.
2. **Validate:** checks that the app files and assets exist and runs `node --check` on the JavaScript.
3. **Package:** copies the site into `dist/` and archives it.

It works on Linux and Windows build machines.

## Deploy to GitHub Pages

Go to **Settings → Pages → Deploy from a branch** and choose `main` and `/ (root)`. AI questions work there too: with the shared AI set up, visitors need no key; otherwise each visitor adds their own free Gemini key.
