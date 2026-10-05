# QuizNova — AI Quiz Battles

<p align="center"><img src="assets/quiznova-logo.webp" alt="QuizNova logo" width="520"></p>

QuizNova is a quiz game built with **HTML5, CSS3 and JavaScript**. Its code is kept in **Git and GitHub**, and a **Jenkins** pipeline checks and packages it.

- **AI questions:** an AI writes brand-new, hard questions every game, on any subject or any topic you type. Use Chrome's **free** built-in AI (no key), or **Claude**, Anthropic's AI model, for the best quality.
- **No repeats:** QuizNova remembers the questions you've had and their answers, and throws away any the AI repeats, even reworded.
- **Real maths:** the Maths subjects are solvable problems (arithmetic, algebra, geometry, calculus) that QuizNova makes and checks itself, with no AI needed (or pick AI if you prefer).
- **Built-in questions:** 206 questions work fully offline and take over automatically when AI is off or there's no internet.
- **Look:** a neumorphic (soft, raised) design in light grey, near-black and red, with light and dark modes and lots of motion (see [Animations](#animations)).
- **Logo:** a One Piece-style logo: the straw-hat Jolly Roger sits inside the Q, Luffy stands in for the "i", and a rope runs along the bottom.

## AI questions

> **Why do questions repeat?** With AI off, you play each subject's small set of built-in questions (10 to 20), so they come back once you've had them all. Turn on AI and every game gets new ones. QuizNova offers to turn it on the first time you log in.

Open **AI settings** (the ✨ button) and pick one of two options.

### Option 1: Free AI on this PC (Chrome)
- Uses **Gemini Nano**, the AI built into Google Chrome. You don't need a key, an account or money.
- Press **Download & turn on free AI**. Chrome downloads the model once (a few GB), and it works offline after that.
- It needs a recent desktop Chrome on a PC that meets [Chrome's hardware requirements](https://developer.chrome.com/docs/ai/get-started). Where it isn't available, AI settings says so. Use Claude instead.
- It's less accurate than Claude, so check the one-line explanations.

### Option 2: Claude (best quality)
1. Create an API key at [console.anthropic.com → API Keys](https://console.anthropic.com/settings/keys). You need an Anthropic account with some credit.
2. In **AI settings**, choose **Claude**.
3. Paste the key, press **Test key**, then press **Save**.

The key is saved **only in your browser**, and it's sent only to Anthropic. It's never part of the repo or the zip. **Every player uses their own key.** Don't save a key on a shared or public computer.

### Models and cost
You choose the model in AI settings:

| Model | Best for | Rough cost per 10 questions |
|---|---|---|
| Claude Opus 5 (default) | Best quality | ~4¢ |
| Claude Sonnet 5 | Faster and cheaper | ~2¢ |
| Claude Haiku 4.5 | Fastest and cheapest | ~1¢ |

Costs are billed to your own Anthropic account.

### What the AI does
- **Streams questions in one by one.** The game starts as soon as the first question is written, and the clock pauses if you answer faster than the AI writes.
- **Hard by default.** Solo games ask for "deep cuts only real experts know". You can switch to Mixed, Easy or Medium.
- **Never repeats itself.** QuizNova saves every AI question and its answer the moment it arrives (so quitting a game still counts), keeps the last 150 for each topic, and sends the most recent ones to the AI as "don't ask these again". It throws away any new question that shares almost all its key words with one you've had, or has the same answer and asks about the same person, place or thing in other words. Built-in questions added to an AI round never repeat one already in it. Each round asks for a random style ("numbers and records", "quotes"…), and some subjects also get a random focus (a season, a hero, a director) to keep things unpredictable.
- **Stays on topic.** Game of Thrones and House of the Dragon are separate subjects: each asks only about its own show, and AI questions that name the other show's characters or dragons are thrown away.
- **Writes a mix of formats:** multiple-choice, true/false and short written answers. Hard questions are worth ×1.5 and medium ×1.2.
- **Lets you quiz on anything:** type a topic on the home screen, like "Attack on Titan", "IPL 2024" or "Ancient Egypt".

### When something goes wrong
- **No key, a rejected key, no internet, Anthropic overloaded, or Chrome's AI unavailable:** QuizNova tops the game up with built-in questions and says why.
- **Custom topics** have no built-in questions, so you get a clear message instead.

AI can occasionally get a fact wrong, and Chrome's free AI does so more often than Claude. QuizNova guards against it in three ways:

- **Self-checks, no extra AI calls.** The AI writes the fact first, then a question that fact answers, and names the correct option by its text as well as its position. A question is thrown away if those disagree, or if the explanation backs a different option. For maths, the working must contain the marked answer.
- **Safer instructions for Chrome's AI.** It is told to stick to well-known facts it's sure of, and it only writes multiple-choice and true/false questions, never typed answers.
- **Report it.** On the results screen, press **Wrong answer? Report it** next to any AI question. It stops counting towards your score and accuracy, it's left out of challenge codes, and it won't be asked again.

For the most accurate AI questions, use Claude. For guaranteed-correct answers, use the built-in questions or, for maths, **Generated**.

## Categories

| Category | Built-in and AI | AI only |
|---|---|---|
| Educational | HTML & CSS, JavaScript, Git & DevOps, Data Structures, Science | Geography, History |
| Maths | Mathematics (a mix), Arithmetic, Basic Algebra, Algebra, Geometry & Trig, Calculus: endless generated problems, no AI needed | — |
| Comics | Marvel, DC | — |
| Movies | Hollywood, MCU (Marvel Cinematic Universe), Indian Cinema, TFI (Telugu cinema: the tier-1 heroes and star directors), Dune (Part One and Part Two) | Harry Potter, Star Wars |
| Series | Game of Thrones, House of the Dragon | Series Mix, Stranger Things, Breaking Bad, Money Heist, Squid Game, Friends, The Office, Indian Web Series, K-Dramas, Cartoons |
| Anime | One Piece, Naruto | Dragon Ball, Demon Slayer, Attack on Titan, Jujutsu Kaisen |
| Gaming | — | Video Games, Minecraft, Grand Theft Auto, Fortnite, Pokémon, Super Mario, BGMI & PUBG, Free Fire, Valorant, Call of Duty, Clash of Clans & Royale, The Legend of Zelda |
| Sports | Cricket, Football | Formula 1, Basketball |
| Party | Surprise Me (mixes all built-in questions) | Surprise Me, General Knowledge, Music |

On top of these, **Any topic** accepts whatever you type (AI only).

With the built-in questions, ones you haven't seen come first, then the ones you saw longest ago, so a question only comes back after you've had the rest of that subject's questions.

## Maths

Maths questions are real problems to solve, not trivia about famous mathematicians. QuizNova generates them from random numbers (in `js/maths.js`) and works out each answer itself. So they're always correct, never run out, work offline and don't use AI (small AI models often get arithmetic wrong).

You can still choose **AI** for a Maths subject in the Solo or Battle setup (**Generated** is the default). AI gets a maths-only prompt that asks for problems to work out, with no history or famous-mathematician trivia, and its typed answers are checked by value too. It can still get an answer wrong, especially Chrome's free AI. Typing a maths topic such as "calculus" into **Quiz me on anything** uses the same maths prompt.

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
- **Difficulty** is picked in the Solo setup. **Challenge codes** carry the exact problems, so a friend gets the same ones.

## Game modes

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
- The first player to buzz answers with `1`–`4`:
  - **Right:** +100 points plus a speed bonus (×2 in a Double points round).
  - **Wrong:** −50 points, and the others can buzz.
- Battles can use AI or built-in questions.

### Online room: friends on their own devices
1. The host presses **Online** (the Wi-Fi button in the sidebar), picks a subject and presses **Create room**. They get a 5-character code like `K7Q2M`.
2. Friends open QuizNova on their own phone or PC, press **Online**, type the code and press **Join**. Up to 8 players can join, each logged in with their own ID.
3. The host presses **Start game**. Everyone gets the same question at the same moment:
   - A right answer scores **100** plus up to **100** for speed, times the difficulty (and ×2 in a Double points round).
   - A wrong answer or no answer scores 0.
   - After each question, everyone sees who picked what, the worked answer and the live scoreboard.
4. At the end, everyone sees the same podium, and the result is saved to each player's stats. The room stays open, so the host can press **New game, same room** for a rematch.

How it works:
- **Connection.** The host's browser runs the game. Friends connect straight to it with WebRTC, and PeerJS's free public server is only used to find each other, so there's no server of our own. Everyone needs internet. The first online game downloads the PeerJS library (about 30 KB) from jsDelivr.
- **Questions.** The host's device picks them: built-in, generated maths, or the host's own AI. Friends don't need AI or an API key. Online games use multiple-choice and true/false questions.
- **Fairness.** Answers never leave the host's device until the reveal, and the host checks everything.
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

Online rooms need an internet connection on every device. Claude questions do too. The first Claude game also downloads the Anthropic JavaScript SDK (about 190 KB) from the jsDelivr CDN. Chrome's free AI works offline once its model is downloaded.

## Keyboard shortcuts

| Where | Keys |
|---|---|
| Solo | `1`–`4` or `A`–`D` answer · `Enter` next question |
| Battle | `Q` `P` `Z` `M` buzz · `1`–`4` or `A`–`D` answer |

## Project structure

```
Quiz Application/
├── index.html      # App shell: sidebar, top bar, dialogs (incl. AI settings)
├── assets/
│   ├── quiznova-logo.webp   # The logo (transparent background)
│   ├── quiznova-mark.webp   # Round skull-in-Q emblem for the sidebar
│   └── favicon.png          # Browser-tab icon
├── css/
│   └── style.css   # Neumorphic theme (light/dark), layouts, motion & micro-interactions
├── js/
│   ├── data.js     # Categories, subjects (with AI topics) and the 206 built-in questions
│   ├── maths.js    # Maths problem generator: arithmetic → calculus, answers worked out by QuizNova
│   └── app.js      # Accounts, AI question streaming (Chrome AI or Claude), solo and battle engines, challenge codes, stats, logo, motion helpers
├── Jenkinsfile     # CI pipeline: checkout → validate → package
└── README.md
```

### How the AI call works (`js/app.js` → `aiGenerate`)
- **Free option:** Chrome's built-in [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) (`LanguageModel`), with the same JSON schema passed as `responseConstraint`, streamed with `promptStreaming`.
- **SDK:** it uses the official Anthropic JavaScript SDK (`@anthropic-ai/sdk`) straight from the browser, with `dangerouslyAllowBrowser: true`, because every player brings their own key.
- **Structured output:** it asks for JSON with `output_config.format` (JSON schema), so every response has the same shape.
- **Streaming:** it streams the response and pulls out each question the moment its JSON object closes.
- **Speed:** it uses `effort: "low"`, which is plenty for writing questions and makes the first question arrive faster.
- **Refusal fallback:** on Claude Opus 5, it enables the server-side refusal fallback (`fallbacks: "default"`).

## Git and GitHub

```bash
git init
git add .
git commit -m "QuizNova: AI quiz game"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

No API key is ever committed. Each person adds their own key in the app.

## CI with Jenkins

The `Jenkinsfile` runs three stages:

1. **Checkout:** pulls the code.
2. **Validate:** checks that the app files and assets exist and runs `node --check` on the JavaScript.
3. **Package:** copies the site into `dist/` and archives it.

It works on Linux and Windows build machines.

## Deploy to GitHub Pages

Go to **Settings → Pages → Deploy from a branch** and choose `main` and `/ (root)`. AI questions work there too: visitors use Chrome's free AI or their own Claude key.
