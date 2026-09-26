/* QuizNova — static data: categories, subjects and the question bank. */
window.QUIZ_DATA = (() => {
  // Bump when questions change, so old challenge codes can warn that questions may differ.
  const BANK_VERSION = 2;

  const CATEGORIES = [
    { id: 'edu', name: 'Educational', icon: 'book' },
    { id: 'maths', name: 'Maths', icon: 'math' },
    { id: 'comics', name: 'Comics', icon: 'mask' },
    { id: 'movies', name: 'Movies', icon: 'film' },
    { id: 'series', name: 'Series', icon: 'tv' },
    { id: 'anime', name: 'Anime', icon: 'sparkle' },
    { id: 'gaming', name: 'Gaming', icon: 'gamepad' },
    { id: 'sports', name: 'Sports', icon: 'ball' },
    { id: 'party', name: 'Party', icon: 'dice' },
  ];

  // `topic` is what the AI is asked to write about. `aiOnly` subjects have no built-in questions.
  // `hidden` subjects never appear as cards (the custom-topic slot).
  // `gen` subjects get fresh problems from js/maths.js by default (answers worked out by QuizNova); players can pick AI instead.
  const SUBJECTS = [
    { id: 'web', name: 'HTML & CSS', category: 'edu', code: 'WEB', tagline: 'Tags, selectors and layout tricks.', topic: 'HTML and CSS for web development' },
    { id: 'js', name: 'JavaScript', category: 'edu', code: 'JS', tagline: 'Types, arrays and the event loop.', topic: 'JavaScript programming' },
    { id: 'devops', name: 'Git & DevOps', category: 'edu', code: 'OPS', tagline: 'Git, GitHub and Jenkins pipelines.', topic: 'Git, GitHub, CI/CD and Jenkins' },
    { id: 'dsa', name: 'Data Structures', category: 'edu', code: 'DSA', tagline: 'Stacks, trees and Big-O.', topic: 'data structures and algorithms' },
    { id: 'science', name: 'Science', category: 'edu', code: 'SCI', tagline: 'Atoms, cells and planets.', topic: 'general science: physics, chemistry, biology and space' },
    { id: 'geography', name: 'Geography', category: 'edu', code: 'GEO', tagline: 'Countries, capitals, rivers and landmarks.', topic: 'world geography: countries, capitals, rivers, mountains and landmarks', icon: 'globe', aiOnly: true },
    { id: 'history', name: 'History', category: 'edu', code: 'HIS', tagline: 'Empires, inventions and turning points.', topic: 'world and Indian history', icon: 'scroll', aiOnly: true },
    { id: 'math', name: 'Mathematics', category: 'maths', code: 'MTH', tagline: 'A mix of everything: sums to calculus.', topic: 'school mathematics, from arithmetic and algebra to geometry and calculus', gen: 'mix' },
    { id: 'arith', name: 'Arithmetic', category: 'maths', code: 'ARI', tagline: 'Sums, times tables, fractions and percentages.', topic: 'arithmetic: mental calculation, times tables, fractions, decimals, percentages and order of operations', gen: 'arith', icon: 'calc' },
    { id: 'algebra1', name: 'Basic Algebra', category: 'maths', code: 'ALG', tagline: 'Solve for x, simplify and expand.', topic: 'basic algebra: solving linear equations, simplifying, expanding brackets and substitution', gen: 'algebra1', icon: 'xeq' },
    { id: 'algebra', name: 'Algebra', category: 'maths', code: 'AL2', tagline: 'Quadratics, indices, logs and simultaneous equations.', topic: 'algebra: quadratic equations, factorising, indices, logarithms and simultaneous equations', gen: 'algebra', icon: 'parabola' },
    { id: 'geometry', name: 'Geometry & Trig', category: 'maths', code: 'GEO', tagline: 'Areas, angles, Pythagoras and trig values.', topic: 'geometry and trigonometry: areas, perimeters, angles, Pythagoras, circles, volumes and exact trig values', gen: 'geometry', icon: 'triangle' },
    { id: 'calculus', name: 'Calculus', category: 'maths', code: 'CAL', tagline: 'Derivatives, integrals and limits.', topic: 'calculus: derivatives, integrals and limits', gen: 'calculus', icon: 'integral' },
    { id: 'marvel', name: 'Marvel', category: 'comics', code: 'MRV', tagline: 'Avengers, Infinity Stones and Wakanda.', topic: 'Marvel comics and the Marvel Cinematic Universe' },
    { id: 'dc', name: 'DC', category: 'comics', code: 'DC', tagline: 'Gotham, Krypton and the Justice League.', topic: 'DC comics and DC films' },
    { id: 'hollywood', name: 'Hollywood', category: 'movies', code: 'HLW', tagline: 'Blockbusters, directors and iconic lines.', topic: 'Hollywood movies, actors and directors' },
    { id: 'indian', name: 'Indian Cinema', category: 'movies', code: 'IND', tagline: 'Bollywood, Tollywood and beyond.', topic: 'Indian cinema: Bollywood, Tollywood, Kollywood and more' },
    { id: 'harrypotter', name: 'Harry Potter', category: 'movies', code: 'HP', tagline: 'Hogwarts, spells and the Wizarding World.', topic: 'the Harry Potter books and films', icon: 'sparkle', aiOnly: true },
    { id: 'starwars', name: 'Star Wars', category: 'movies', code: 'SW', tagline: 'Jedi, Sith and a galaxy far, far away.', topic: 'the Star Wars films and series', icon: 'star', aiOnly: true },
    { id: 'seriesmix', name: 'Series Mix', category: 'series', code: 'TV', tagline: 'Hit shows from Netflix, Prime and beyond.', topic: 'popular TV and streaming series from around the world — a different show for every question', icon: 'tv', aiOnly: true },
    { id: 'strangerthings', name: 'Stranger Things', category: 'series', code: 'ST', tagline: 'Hawkins, the Upside Down and Eleven.', topic: 'the Netflix series Stranger Things', icon: 'tv', aiOnly: true },
    { id: 'got', name: 'Game of Thrones', category: 'series', code: 'GOT', tagline: 'Westeros, dragons and the Iron Throne.', topic: 'Game of Thrones and House of the Dragon', icon: 'crown', aiOnly: true },
    { id: 'breakingbad', name: 'Breaking Bad', category: 'series', code: 'BB', tagline: 'Walter White, Jesse and Better Call Saul.', topic: 'Breaking Bad and Better Call Saul', icon: 'science', aiOnly: true },
    { id: 'moneyheist', name: 'Money Heist', category: 'series', code: 'MH', tagline: 'The Professor, the Royal Mint and Bella Ciao.', topic: 'the Spanish series Money Heist (La Casa de Papel)', icon: 'mask', aiOnly: true },
    { id: 'squidgame', name: 'Squid Game', category: 'series', code: 'SQG', tagline: 'Deadly games, players and the Front Man.', topic: 'the Korean series Squid Game', icon: 'shield', aiOnly: true },
    { id: 'friends', name: 'Friends', category: 'series', code: 'FRN', tagline: 'Central Perk, Ross, Rachel and the gang.', topic: 'the sitcom Friends', icon: 'users', aiOnly: true },
    { id: 'theoffice', name: 'The Office', category: 'series', code: 'OFC', tagline: 'Dunder Mifflin, Michael Scott and pranks.', topic: 'the US sitcom The Office', icon: 'tv', aiOnly: true },
    { id: 'indianseries', name: 'Indian Web Series', category: 'series', code: 'IWS', tagline: 'Panchayat, Mirzapur, Kota Factory and more.', topic: 'Indian web series such as Panchayat, Mirzapur, Kota Factory, The Family Man, Scam 1992, Sacred Games and Paatal Lok', icon: 'tv', aiOnly: true },
    { id: 'kdrama', name: 'K-Dramas', category: 'series', code: 'KD', tagline: 'Korean dramas, stars and iconic scenes.', topic: 'popular Korean dramas (K-dramas) and their stars', icon: 'star', aiOnly: true },
    { id: 'cartoons', name: 'Cartoons', category: 'series', code: 'CTN', tagline: 'Doraemon, Shinchan, Tom & Jerry and more.', topic: 'popular cartoons such as Doraemon, Shinchan, Tom and Jerry, Oggy and the Cockroaches, Ben 10, Motu Patlu and Chhota Bheem', icon: 'sparkle', aiOnly: true },
    { id: 'onepiece', name: 'One Piece', category: 'anime', code: 'OP', tagline: 'Straw Hats, Devil Fruits and the Grand Line.', topic: 'the anime and manga One Piece by Eiichiro Oda' },
    { id: 'naruto', name: 'Naruto', category: 'anime', code: 'NRT', tagline: 'Hidden Leaf ninjas and their jutsu.', topic: 'Naruto and Naruto Shippuden' },
    { id: 'dragonball', name: 'Dragon Ball', category: 'anime', code: 'DB', tagline: 'Saiyans, Dragon Balls and power levels.', topic: 'Dragon Ball, Dragon Ball Z and Dragon Ball Super', icon: 'target', aiOnly: true },
    { id: 'demonslayer', name: 'Demon Slayer', category: 'anime', code: 'DS', tagline: 'Hashira, breathing styles and demons.', topic: 'Demon Slayer: Kimetsu no Yaiba', icon: 'flame', aiOnly: true },
    { id: 'aot', name: 'Attack on Titan', category: 'anime', code: 'AOT', tagline: 'Walls, Titans and the Survey Corps.', topic: 'Attack on Titan (Shingeki no Kyojin)', icon: 'shield', aiOnly: true },
    { id: 'jjk', name: 'Jujutsu Kaisen', category: 'anime', code: 'JJK', tagline: 'Cursed energy, sorcerers and domains.', topic: 'Jujutsu Kaisen', icon: 'bolt', aiOnly: true },
    { id: 'games', name: 'Video Games', category: 'gaming', code: 'VG', tagline: 'Consoles, classics and gaming legends.', topic: 'video games: classic and modern games, consoles, studios and characters', icon: 'gamepad', aiOnly: true },
    { id: 'minecraft', name: 'Minecraft', category: 'gaming', code: 'MC', tagline: 'Creepers, Redstone and the Ender Dragon.', topic: 'the video game Minecraft', icon: 'cube', aiOnly: true },
    { id: 'gta', name: 'Grand Theft Auto', category: 'gaming', code: 'GTA', tagline: 'Los Santos, Vice City and big heists.', topic: 'the Grand Theft Auto video game series', icon: 'car', aiOnly: true },
    { id: 'fortnite', name: 'Fortnite', category: 'gaming', code: 'FN', tagline: 'Battle royale, skins and chapters.', topic: 'the video game Fortnite', icon: 'crosshair', aiOnly: true },
    { id: 'pokemon', name: 'Pokémon', category: 'gaming', code: 'PKM', tagline: 'Pokédex, gyms and legendary Pokémon.', topic: 'Pokémon games, Pokémon species and the anime', icon: 'target', aiOnly: true },
    { id: 'mario', name: 'Super Mario', category: 'gaming', code: 'SMB', tagline: 'The Mushroom Kingdom, Bowser and power-ups.', topic: 'Super Mario and other Nintendo games', icon: 'star', aiOnly: true },
    { id: 'bgmi', name: 'BGMI & PUBG', category: 'gaming', code: 'PUBG', tagline: 'Erangel, chicken dinners and loadouts.', topic: 'Battlegrounds Mobile India (BGMI) and PUBG', icon: 'crosshair', aiOnly: true },
    { id: 'freefire', name: 'Free Fire', category: 'gaming', code: 'FF', tagline: 'Bermuda, characters and pets.', topic: 'the mobile game Garena Free Fire', icon: 'flame', aiOnly: true },
    { id: 'valorant', name: 'Valorant', category: 'gaming', code: 'VAL', tagline: 'Agents, maps and abilities.', topic: 'the video game Valorant', icon: 'target', aiOnly: true },
    { id: 'cod', name: 'Call of Duty', category: 'gaming', code: 'COD', tagline: 'Campaigns, Warzone and legendary maps.', topic: 'the Call of Duty video game series, including Warzone and Call of Duty Mobile', icon: 'crosshair', aiOnly: true },
    { id: 'clash', name: 'Clash of Clans & Royale', category: 'gaming', code: 'COC', tagline: 'Troops, towers and Supercell battles.', topic: 'Clash of Clans, Clash Royale and other Supercell games', icon: 'shield', aiOnly: true },
    { id: 'zelda', name: 'The Legend of Zelda', category: 'gaming', code: 'LOZ', tagline: 'Link, Hyrule and the Master Sword.', topic: 'The Legend of Zelda video game series', icon: 'shield', aiOnly: true },
    { id: 'cricket', name: 'Cricket', category: 'sports', code: 'CRK', tagline: 'World Cups, legends and the laws of the game.', topic: 'cricket: IPL, World Cups, legends and the laws of the game' },
    { id: 'football', name: 'Football', category: 'sports', code: 'FTB', tagline: 'World Cups, clubs and superstars.', topic: 'football (soccer): World Cups, clubs, players and rules' },
    { id: 'f1', name: 'Formula 1', category: 'sports', code: 'F1', tagline: 'Drivers, teams and legendary circuits.', topic: 'Formula 1 motor racing', icon: 'flag', aiOnly: true },
    { id: 'basketball', name: 'Basketball', category: 'sports', code: 'BSK', tagline: 'NBA legends, records and big moments.', topic: 'basketball and the NBA', icon: 'ball', aiOnly: true },
    { id: 'surprise', name: 'Surprise Me', category: 'party', code: 'MIX', tagline: 'Every question on a different random topic.', topic: 'a surprise mix of trivia — every question on a different topic: pop culture, science, sports, geography, food, history, anime, music and technology', icon: 'dice', aiOnly: true },
    { id: 'gk', name: 'General Knowledge', category: 'party', code: 'GK', tagline: 'A bit of everything, pub-quiz style.', topic: 'general knowledge', icon: 'bulb', aiOnly: true },
    { id: 'music', name: 'Music', category: 'party', code: 'MUS', tagline: 'Artists, songs and instruments.', topic: 'music: artists, songs, albums and instruments, including Indian film music', icon: 'music', aiOnly: true },
    { id: 'custom', name: 'Any topic', category: 'party', code: 'AI', tagline: 'Anything you type.', topic: '', icon: 'sparkle', aiOnly: true, hidden: true },
  ];

  // MCQ answers are the index into `options`; options are shuffled per game at runtime.
  // Written answers are compared against `accept` (case, spacing and punctuation are ignored).
  const QUESTION_BANK = {
    web: [
      { type: 'mcq', q: 'Which HTML element defines the most important (top-level) heading on a page?', options: ['<h1>', '<heading>', '<h6>', '<head>'], answer: 0, mono: true, explain: '<h1> is the top-level heading and <h6> the least important. <head> holds page metadata, not visible headings.' },
      { type: 'mcq', q: 'Which CSS property controls the space between an element’s content and its border?', options: ['padding', 'margin', 'spacing', 'border-gap'], answer: 0, mono: true, explain: 'Padding sits inside the border; margin sits outside it.' },
      { type: 'mcq', q: 'In a default flex row, what does this rule do to the children of .toolbar?', code: '.toolbar {\n  display: flex;\n  justify-content: center;\n}', lang: 'css', options: ['Centers them horizontally along the main axis', 'Centers them vertically', 'Wraps them onto new lines', 'Stretches them to fill the width'], answer: 0, explain: 'justify-content aligns items along the main axis, which is horizontal for flex-direction: row.' },
      { type: 'mcq', q: 'Which attribute fills the blank so screen readers can describe this image?', code: '<img src="logo.png" ____="QuizNova logo">', lang: 'html', options: ['alt', 'title', 'label', 'desc'], answer: 0, mono: true, explain: 'The alt attribute provides alternative text for assistive technology and for when the image fails to load.' },
      { type: 'mcq', q: 'Which selector has the highest specificity?', options: ['#menu', '.menu li a', 'ul li a', 'nav > a'], answer: 0, mono: true, explain: 'An ID selector (1,0,0) outranks any number of class and element selectors.' },
      { type: 'written', q: 'Which CSS property changes the text colour of an element?', accept: ['color', 'colour'], answerText: 'color', explain: 'The color property sets the foreground (text) colour.' },
      { type: 'mcq', q: 'Which HTML5 element is meant for a block of major navigation links?', options: ['<nav>', '<menu>', '<links>', '<navigation>'], answer: 0, mono: true, explain: '<nav> is the semantic sectioning element for major navigation blocks.' },
      { type: 'mcq', q: 'Given this rule, how wide is the left margin of each paragraph?', code: 'p {\n  margin: 10px 20px;\n}', lang: 'css', options: ['20px', '10px', '0', '30px'], answer: 0, mono: true, explain: 'With two values, the first sets top and bottom, the second sets left and right.' },
      { type: 'written', q: 'What does the abbreviation CSS stand for?', accept: ['cascading style sheets', 'cascading style sheet', 'cascading stylesheets', 'cascading stylesheet'], answerText: 'Cascading Style Sheets', explain: '“Cascading” refers to how rules from several sources combine and override each other.' },
      { type: 'mcq', q: 'Which CSS unit is relative to the root element’s font size?', options: ['rem', 'em', 'vh', 'px'], answer: 0, mono: true, explain: 'rem means “root em”. A plain em is relative to the element’s own font size.' },
    ],
    js: [
      { type: 'mcq', q: 'What does this code print?', code: 'console.log(typeof null);', lang: 'js', options: ['"object"', '"null"', '"undefined"', '"number"'], answer: 0, mono: true, explain: 'A long-standing quirk of the language: typeof null returns "object".' },
      { type: 'mcq', q: 'Which keyword declares a block-scoped variable that cannot be reassigned?', options: ['const', 'let', 'var', 'static'], answer: 0, mono: true, explain: 'const is block-scoped and cannot be reassigned, although an object it holds can still be mutated.' },
      { type: 'mcq', q: 'What is logged to the console?', code: 'const nums = [1, 2, 3];\nconsole.log(nums.map(n => n * 2));', lang: 'js', options: ['[2, 4, 6]', '[1, 2, 3]', '12', '[1, 4, 9]'], answer: 0, mono: true, explain: 'map returns a new array with the callback applied to every element.' },
      { type: 'mcq', q: 'What does this comparison evaluate to?', code: '0.1 + 0.2 === 0.3', lang: 'js', options: ['false', 'true', 'undefined', 'It throws a TypeError'], answer: 0, explain: 'Floating-point rounding makes 0.1 + 0.2 equal 0.30000000000000004.' },
      { type: 'written', q: 'Which array method returns a new array containing only the elements that pass a test?', accept: ['filter', 'filter()', '.filter', '.filter()', 'array.filter', 'array.filter()', 'array.prototype.filter', 'array.prototype.filter()'], answerText: 'filter()', explain: 'filter keeps every element for which the callback returns a truthy value.' },
      { type: 'mcq', q: 'Which method turns a JSON string into a JavaScript object?', options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'Object.fromJSON()'], answer: 0, mono: true, explain: 'JSON.parse reads JSON text; JSON.stringify does the reverse.' },
      { type: 'mcq', q: 'What does this code print?', code: 'let a = "5";\nlet b = 2;\nconsole.log(a * b, a + b);', lang: 'js', options: ['10 52', '52 7', '10 7', 'NaN 52'], answer: 0, mono: true, explain: '* converts "5" to a number (10), but + with a string concatenates ("52").' },
      { type: 'mcq', q: 'What does the strict equality operator === compare?', options: ['Both value and type', 'Only the value', 'Only the memory address', 'Only the type'], answer: 0, explain: '=== never coerces types, so 1 === "1" is false.' },
      { type: 'written', q: 'Which DOM method attaches an event handler, such as a "click" handler, to an element?', accept: ['addeventlistener', 'addeventlistener()', '.addeventlistener', '.addeventlistener()', 'element.addeventlistener', 'element.addeventlistener()'], answerText: 'addEventListener()', explain: 'element.addEventListener("click", handler) registers a listener without overwriting existing ones.' },
      { type: 'mcq', q: 'In what order are the letters logged?', code: 'setTimeout(() => console.log("A"), 0);\nconsole.log("B");', lang: 'js', options: ['B, then A', 'A, then B', 'Only A', 'Only B'], answer: 0, explain: 'The timeout callback is queued and runs after the current script finishes, even with a 0 ms delay.' },
    ],
    devops: [
      { type: 'mcq', q: 'Which command creates a new, empty Git repository in the current folder?', options: ['git init', 'git start', 'git create', 'git new'], answer: 0, mono: true, explain: 'git init creates the hidden .git directory that stores the project history.' },
      { type: 'mcq', q: 'What does git clone do?', options: ['Copies a remote repository, including its history, to your machine', 'Creates a new branch', 'Uploads your commits to GitHub', 'Deletes untracked files'], answer: 0, explain: 'git clone downloads the full repository and sets it up as the “origin” remote.' },
      { type: 'mcq', q: 'Which file defines a Jenkins pipeline as code inside a repository?', options: ['Jenkinsfile', 'pipeline.yml', 'jenkins.json', 'build.xml'], answer: 0, mono: true, explain: 'A Jenkinsfile committed to the repo lets Jenkins build the pipeline straight from source control.' },
      { type: 'mcq', q: 'In DevOps, what does CI stand for?', options: ['Continuous Integration', 'Code Inspection', 'Container Instance', 'Central Infrastructure'], answer: 0, explain: 'Continuous Integration merges and tests changes frequently, usually on every push.' },
      { type: 'written', q: 'Which Git command uploads your local commits to a remote repository?', accept: ['git push', 'push', 'git push origin', 'git push origin main'], answerText: 'git push', explain: 'git push sends commits from your local branch to its remote branch.' },
      { type: 'mcq', q: 'Which command shows staged, unstaged and untracked changes?', options: ['git status', 'git log', 'git show', 'git remote'], answer: 0, mono: true, explain: 'git status summarises the working tree and the staging area.' },
      { type: 'mcq', q: 'What is GitHub Pages used for?', options: ['Hosting static websites directly from a repository', 'Running Jenkins build agents', 'Storing Docker images', 'Tracking time spent on issues'], answer: 0, explain: 'GitHub Pages serves HTML, CSS and JavaScript straight from a branch — a good fit for this quiz app.' },
      { type: 'mcq', q: 'In this Jenkinsfile, what does agent any mean?', code: "pipeline {\n  agent any\n  stages {\n    stage('Build') {\n      steps { echo 'Building...' }\n    }\n  }\n}", lang: 'groovy', options: ['Run the pipeline on any available agent', 'Run only on the Jenkins controller', 'Skip the build stage', 'Run inside a Docker container'], answer: 0, explain: 'agent any lets Jenkins schedule the pipeline on whichever executor is free.' },
      { type: 'written', q: 'Which Git command combines another branch’s history into your current branch?', accept: ['git merge', 'merge'], answerText: 'git merge', explain: 'git merge <branch> integrates that branch into the one you have checked out.' },
      { type: 'mcq', q: 'What is a pull request on GitHub?', options: ['A proposal to merge changes that others can review first', 'A command that downloads a repository', 'A way to delete a remote branch', 'An automatic rollback of the last commit'], answer: 0, explain: 'Pull requests collect review, discussion and CI results before changes are merged.' },
    ],
    dsa: [
      { type: 'mcq', q: 'Which data structure follows Last-In, First-Out (LIFO) order?', options: ['Stack', 'Queue', 'Linked list', 'Binary tree'], answer: 0, explain: 'The last item pushed onto a stack is the first one popped off.' },
      { type: 'mcq', q: 'What is the in-order traversal of this binary search tree?', image: 'bst', caption: 'Binary search tree', options: ['1, 3, 6, 8, 10, 14', '8, 3, 1, 6, 10, 14', '1, 6, 3, 14, 10, 8', '8, 10, 14, 3, 6, 1'], answer: 0, mono: true, explain: 'In-order visits the left subtree, the node, then the right subtree, which always yields sorted order in a BST.' },
      { type: 'mcq', q: 'What is the time complexity of binary search on a sorted array?', options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'], answer: 0, mono: true, explain: 'Each comparison halves the remaining search space.' },
      { type: 'mcq', q: 'Breadth-first search (BFS) is usually implemented with which structure?', options: ['Queue', 'Stack', 'Heap', 'Hash map'], answer: 0, explain: 'A first-in, first-out queue makes BFS explore the graph level by level.' },
      { type: 'written', q: 'In Big-O notation, what is the time complexity of reading an array element by its index?', accept: ['o(1)', 'o1', 'constant', 'constant time'], answerText: 'O(1)', explain: 'Arrays compute an element’s address directly, so access takes constant time.' },
      { type: 'mcq', q: 'What is the average-case lookup time in a well-distributed hash table?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 0, mono: true, explain: 'Hashing jumps straight to a bucket; collisions only matter in the worst case.' },
      { type: 'mcq', q: 'In which linked list does every node point to both the next and the previous node?', options: ['Doubly linked list', 'Singly linked list', 'Circular singly linked list', 'Skip list'], answer: 0, explain: 'Doubly linked nodes hold both prev and next pointers, so you can walk the list in either direction.' },
      { type: 'mcq', q: 'What does this code log?', code: 'const stack = [];\nstack.push(1);\nstack.push(2);\nstack.push(3);\nstack.pop();\nconsole.log(stack);', lang: 'js', options: ['[1, 2]', '[2, 3]', '[1, 2, 3]', '[3]'], answer: 0, mono: true, explain: 'pop removes the most recently pushed item, which is 3.' },
      { type: 'written', q: 'How many edges does a tree with 10 nodes have?', accept: ['9', 'nine'], answerText: '9', explain: 'A tree with n nodes always has exactly n − 1 edges.' },
      { type: 'mcq', q: 'Which sorting algorithm guarantees O(n log n) time even in the worst case?', options: ['Merge sort', 'Quick sort', 'Bubble sort', 'Insertion sort'], answer: 0, explain: 'Merge sort always splits evenly; quick sort degrades to O(n²) with bad pivots.' },
    ],
    science: [
      { type: 'mcq', q: 'What is the chemical symbol for gold?', options: ['Au', 'Ag', 'Gd', 'Go'], answer: 0, explain: 'Au comes from the Latin word aurum. Ag is silver.' },
      { type: 'mcq', q: 'Which organelle is known as the powerhouse of the cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'], answer: 0, explain: 'Mitochondria produce most of the cell’s ATP through respiration.' },
      { type: 'mcq', q: 'Approximately how fast does light travel in a vacuum?', options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁵ m/s', '3 × 10¹⁰ m/s'], answer: 0, explain: 'Light travels about 299,792 km every second — roughly 3 × 10⁸ metres per second.' },
      { type: 'mcq', q: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Jupiter', 'Mercury'], answer: 0, explain: 'Iron oxide (rust) in its surface dust gives Mars its reddish colour.' },
      { type: 'written', q: 'Which gas do plants absorb from the air for photosynthesis?', accept: ['carbon dioxide', 'co2', 'co₂', 'carbon-dioxide'], answerText: 'Carbon dioxide (CO₂)', explain: 'Plants combine CO₂, water and light energy to make glucose, releasing oxygen.' },
      { type: 'mcq', q: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 0, explain: 'One newton accelerates 1 kg at 1 m/s². Joule is energy, watt is power and pascal is pressure.' },
      { type: 'mcq', q: 'Which subatomic particle carries a negative charge?', options: ['Electron', 'Proton', 'Neutron', 'Photon'], answer: 0, explain: 'Electrons are negative, protons are positive and neutrons are neutral.' },
      { type: 'mcq', q: 'What is the pH of pure water at 25 °C?', options: ['7', '0', '14', '1'], answer: 0, explain: 'Pure water is neutral, which is pH 7 at 25 °C.' },
      { type: 'written', q: 'What is the chemical formula of water?', accept: ['h2o', 'h₂o'], answerText: 'H₂O', explain: 'Each water molecule has two hydrogen atoms bonded to one oxygen atom.' },
      { type: 'mcq', q: 'Which organ produces insulin?', options: ['Pancreas', 'Liver', 'Kidney', 'Stomach'], answer: 0, explain: 'Beta cells in the pancreas release insulin to regulate blood sugar.' },
    ],
    math: [
      { type: 'mcq', q: 'Find the length of the hypotenuse x.', image: 'triangle', caption: 'Right triangle with legs 6 and 8', options: ['10', '12', '14', '9.8'], answer: 0, explain: 'By Pythagoras, x² = 6² + 8² = 100, so x = 10.' },
      { type: 'mcq', q: 'What is π rounded to two decimal places?', options: ['3.14', '3.41', '3.12', '3.16'], answer: 0, explain: 'π ≈ 3.14159…' },
      { type: 'mcq', q: 'What is the derivative of x² with respect to x?', options: ['2x', 'x', 'x³ / 3', '2'], answer: 0, explain: 'Power rule: the derivative of xⁿ is n·xⁿ⁻¹.' },
      { type: 'written', q: 'What is 15% of 200?', accept: ['30', '30.0'], answerText: '30', explain: '0.15 × 200 = 30.' },
      { type: 'mcq', q: 'What is the sum of the interior angles of a hexagon?', options: ['720°', '540°', '360°', '1080°'], answer: 0, explain: '(n − 2) × 180° = 4 × 180° = 720°.' },
      { type: 'mcq', q: 'Solve for x:  3x + 5 = 20', options: ['5', '15', '25', '3'], answer: 0, explain: '3x = 15, so x = 5.' },
      { type: 'mcq', q: 'Which of these numbers is prime?', options: ['29', '21', '27', '33'], answer: 0, explain: '29 has no divisors other than 1 and itself; 21 = 3·7, 27 = 3³ and 33 = 3·11.' },
      { type: 'written', q: 'What is the square root of 144?', accept: ['12', 'twelve', '+12', '±12'], answerText: '12', explain: '12 × 12 = 144.' },
      { type: 'mcq', q: 'What is log₁₀(1000)?', options: ['3', '10', '100', '30'], answer: 0, explain: '10³ = 1000.' },
      { type: 'mcq', q: 'What is the probability of getting heads when flipping a fair coin?', options: ['1/2', '1/3', '1/4', '1'], answer: 0, explain: 'There are two equally likely outcomes and one of them is heads.' },
    ],
    marvel: [
      { type: 'mcq', q: 'What is the name of Thor’s enchanted hammer?', options: ['Mjolnir', 'Stormbreaker', 'Gungnir', 'Jarnbjorn'], answer: 0, explain: 'Mjolnir is Thor’s hammer. Stormbreaker is the axe he forges in Avengers: Infinity War.' },
      { type: 'mcq', q: 'In the MCU, Captain America’s shield is made mainly of which metal?', options: ['Vibranium', 'Adamantium', 'Uru', 'Carbonadium'], answer: 0, explain: 'Howard Stark built the shield from Wakandan vibranium.' },
      { type: 'mcq', q: 'What is Tony Stark’s AI assistant called in the early Iron Man films?', options: ['J.A.R.V.I.S.', 'F.R.I.D.A.Y.', 'E.D.I.T.H.', 'KAREN'], answer: 0, explain: 'J.A.R.V.I.S. runs Tony’s suits until it becomes Vision; F.R.I.D.A.Y. takes over later.' },
      { type: 'mcq', q: 'On which planet was the Soul Stone hidden?', options: ['Vormir', 'Xandar', 'Titan', 'Sakaar'], answer: 0, explain: 'The Red Skull guards the Soul Stone on Vormir, where it demands a sacrifice.' },
      { type: 'written', q: 'What is the first name of Peter Parker’s aunt, who raises him?', accept: ['may', 'aunt may', 'may parker'], answerText: 'May', explain: 'Aunt May raises Peter in Queens after his parents are gone.' },
      { type: 'mcq', q: 'Which fictional African nation is ruled by Black Panther?', options: ['Wakanda', 'Genosha', 'Latveria', 'Sokovia'], answer: 0, explain: 'Wakanda hides its vibranium-powered technology from the world.' },
      { type: 'mcq', q: 'Which actor played Tony Stark in the Marvel Cinematic Universe?', options: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo'], answer: 0, explain: 'Robert Downey Jr. played Tony Stark from Iron Man (2008) to Avengers: Endgame (2019).' },
      { type: 'mcq', q: 'Which Guardian of the Galaxy is a tree-like being who only says “I am Groot”?', options: ['Groot', 'Rocket', 'Drax', 'Mantis'], answer: 0, explain: 'Groot is a Flora colossus whose only words are “I am Groot”.' },
      { type: 'written', q: 'What is the real name of the Hulk?', accept: ['bruce banner', 'banner', 'robert bruce banner', 'dr bruce banner', 'doctor bruce banner'], answerText: 'Bruce Banner', explain: 'Dr. Bruce Banner turns into the Hulk after exposure to gamma radiation.' },
      { type: 'mcq', q: 'Which film kicked off the Marvel Cinematic Universe in 2008?', options: ['Iron Man', 'The Incredible Hulk', 'Thor', 'Captain America: The First Avenger'], answer: 0, explain: 'Iron Man opened in May 2008; The Incredible Hulk followed a month later.' },
    ],
    dc: [
      { type: 'mcq', q: 'What is Superman’s home planet?', options: ['Krypton', 'Apokolips', 'Thanagar', 'Oa'], answer: 0, explain: 'Baby Kal-El was sent to Earth just before Krypton exploded.' },
      { type: 'mcq', q: 'Which city does Batman protect?', options: ['Gotham City', 'Metropolis', 'Central City', 'Star City'], answer: 0, explain: 'Gotham is Batman’s city; Metropolis belongs to Superman.' },
      { type: 'mcq', q: 'What is the Flash’s main superpower?', options: ['Super speed', 'Flight', 'Invisibility', 'Telepathy'], answer: 0, explain: 'The Flash draws on the Speed Force to move faster than light.' },
      { type: 'mcq', q: 'What is the name of Wonder Woman’s home island?', options: ['Themyscira', 'Atlantis', 'Krypton', 'Apokolips'], answer: 0, explain: 'Diana grew up among the Amazons on the hidden island of Themyscira.' },
      { type: 'written', q: 'What is Batman’s secret identity?', accept: ['bruce wayne', 'wayne'], answerText: 'Bruce Wayne', explain: 'Billionaire Bruce Wayne became Batman after his parents were murdered.' },
      { type: 'mcq', q: 'Who is Batman’s loyal butler?', options: ['Alfred Pennyworth', 'Lucius Fox', 'James Gordon', 'Dick Grayson'], answer: 0, explain: 'Alfred raised Bruce and helps run the Batcave.' },
      { type: 'mcq', q: 'Which substance weakens Superman?', options: ['Kryptonite', 'Vibranium', 'Adamantium', 'Nth metal'], answer: 0, explain: 'Radioactive fragments of Krypton — kryptonite — drain Superman’s powers.' },
      { type: 'mcq', q: 'Where does a Green Lantern’s power come from?', options: ['A power ring', 'A magic lasso', 'A cosmic belt', 'A mystic amulet'], answer: 0, explain: 'The power ring turns willpower into hard-light constructs.' },
      { type: 'mcq', q: 'Which villain is known as the “Clown Prince of Crime”?', options: ['The Joker', 'The Riddler', 'The Penguin', 'Two-Face'], answer: 0, explain: 'The Joker is Batman’s most famous arch-enemy.' },
      { type: 'written', q: 'At which newspaper does Clark Kent work as a reporter?', accept: ['daily planet', 'the daily planet'], answerText: 'The Daily Planet', explain: 'Clark works at the Daily Planet in Metropolis alongside Lois Lane.' },
    ],
    hollywood: [
      { type: 'mcq', q: 'Who directed both Titanic (1997) and Avatar (2009)?', options: ['James Cameron', 'Steven Spielberg', 'Christopher Nolan', 'Ridley Scott'], answer: 0, explain: 'James Cameron directed both, and both became the highest-grossing film of their time.' },
      { type: 'mcq', q: 'In The Lion King (1994), what is the name of Simba’s father?', options: ['Mufasa', 'Scar', 'Rafiki', 'Zazu'], answer: 0, explain: 'Mufasa is king of the Pride Lands; Scar is his jealous brother.' },
      { type: 'mcq', q: 'Which film series made the line “May the Force be with you” famous?', options: ['Star Wars', 'Star Trek', 'Dune', 'Guardians of the Galaxy'], answer: 0, explain: 'The line has been part of Star Wars since the first film in 1977.' },
      { type: 'mcq', q: 'Which of these films did Christopher Nolan direct?', options: ['Inception', 'Avatar', 'Jurassic Park', 'The Matrix'], answer: 0, explain: 'Nolan directed Inception (2010); The Matrix was made by the Wachowskis.' },
      { type: 'written', q: 'In Toy Story, what is the name of the cowboy toy?', accept: ['woody', 'sheriff woody'], answerText: 'Woody', explain: 'Sheriff Woody is Andy’s favourite toy until Buzz Lightyear arrives.' },
      { type: 'mcq', q: 'Which film is set on the fictional island of Isla Nublar?', options: ['Jurassic Park', 'King Kong', 'Jaws', 'Pirates of the Caribbean'], answer: 0, explain: 'John Hammond builds his dinosaur park on Isla Nublar.' },
      { type: 'mcq', q: 'Who plays Captain Jack Sparrow in Pirates of the Caribbean?', options: ['Johnny Depp', 'Orlando Bloom', 'Brad Pitt', 'Keanu Reeves'], answer: 0, explain: 'Johnny Depp was Oscar-nominated for the role in The Curse of the Black Pearl.' },
      { type: 'mcq', q: 'In The Matrix, which pill does Neo take?', options: ['The red pill', 'The blue pill', 'The green pill', 'The yellow pill'], answer: 0, explain: 'The red pill shows Neo the truth about the Matrix.' },
      { type: 'mcq', q: 'Which animated film features Elsa, a queen with ice powers?', options: ['Frozen', 'Tangled', 'Moana', 'Brave'], answer: 0, explain: 'Frozen (2013) follows Elsa and her sister Anna in Arendelle.' },
      { type: 'written', q: 'What is the name of the wizarding school in Harry Potter?', accept: ['hogwarts', 'hogwarts school', 'hogwarts school of witchcraft and wizardry'], answerText: 'Hogwarts', explain: 'Hogwarts School of Witchcraft and Wizardry is where Harry studies magic.' },
    ],
    indian: [
      { type: 'mcq', q: 'The song “Naatu Naatu” won the Oscar for Best Original Song. Which film is it from?', options: ['RRR', 'Baahubali 2', 'Pushpa', 'KGF'], answer: 0, explain: 'Naatu Naatu from the Telugu film RRR won the Academy Award in 2023.' },
      { type: 'mcq', q: 'Who directed Baahubali and RRR?', options: ['S. S. Rajamouli', 'Mani Ratnam', 'Sukumar', 'Prashanth Neel'], answer: 0, explain: 'S. S. Rajamouli directed both epics.' },
      { type: 'mcq', q: 'What is the name of the famous villain in Sholay (1975)?', options: ['Gabbar Singh', 'Mogambo', 'Shakaal', 'Kancha Cheena'], answer: 0, explain: 'Amjad Khan’s Gabbar Singh is one of Hindi cinema’s most famous villains.' },
      { type: 'mcq', q: 'Which 2009 film follows the friends Rancho, Farhan and Raju?', options: ['3 Idiots', 'Zindagi Na Milegi Dobara', 'Dil Chahta Hai', 'Munna Bhai M.B.B.S.'], answer: 0, explain: '3 Idiots, starring Aamir Khan, is set in an engineering college.' },
      { type: 'written', q: 'In Baahubali, who killed Amarendra Baahubali?', accept: ['kattappa', 'katappa'], answerText: 'Kattappa', explain: '“Why did Kattappa kill Baahubali?” was the cliffhanger answered in Baahubali 2.' },
      { type: 'mcq', q: 'Which film about a village cricket match was nominated for the Oscar for Best Foreign Language Film in 2002?', options: ['Lagaan', 'Chak De! India', 'Iqbal', '83'], answer: 0, explain: 'Lagaan (2001) was nominated at the 74th Academy Awards.' },
      { type: 'mcq', q: 'Dangal (2016) is about which sport?', options: ['Wrestling', 'Boxing', 'Kabaddi', 'Hockey'], answer: 0, explain: 'Dangal tells the story of wrestler Mahavir Singh Phogat and his daughters.' },
      { type: 'mcq', q: 'Which actor do fans call “Thalaivar”?', options: ['Rajinikanth', 'Kamal Haasan', 'Chiranjeevi', 'Mohanlal'], answer: 0, explain: 'Thalaivar means “leader”, and it is the nickname fans use for Rajinikanth.' },
      { type: 'mcq', q: 'Who plays Pushpa Raj in Pushpa: The Rise?', options: ['Allu Arjun', 'Ram Charan', 'Jr. NTR', 'Prabhas'], answer: 0, explain: 'Allu Arjun won the National Film Award for Best Actor for the role.' },
      { type: 'written', q: 'In which city is the Hindi film industry, “Bollywood”, based?', accept: ['mumbai', 'bombay'], answerText: 'Mumbai', explain: 'The name Bollywood blends Bombay (now Mumbai) and Hollywood.' },
    ],
    onepiece: [
      { type: 'mcq', q: 'What is Monkey D. Luffy’s dream?', options: ['To become King of the Pirates', 'To become the world’s greatest swordsman', 'To find the All Blue', 'To draw a map of the whole world'], answer: 0, explain: 'Luffy wants to find the One Piece and become King of the Pirates.' },
      { type: 'mcq', q: 'Which Devil Fruit gave Luffy his rubber body, as it was first named in the story?', options: ['Gum-Gum Fruit', 'Flame-Flame Fruit', 'Chop-Chop Fruit', 'Smoke-Smoke Fruit'], answer: 0, explain: 'The Gum-Gum Fruit (Gomu Gomu no Mi) made Luffy’s body stretch like rubber.' },
      { type: 'mcq', q: 'How many swords does Roronoa Zoro use in his signature fighting style?', options: ['Three', 'Two', 'One', 'Four'], answer: 0, explain: 'Zoro’s Three Sword Style (Santoryu) uses one sword in each hand and one in his mouth.' },
      { type: 'mcq', q: 'Who gave Luffy his straw hat?', options: ['Shanks', 'Garp', 'Whitebeard', 'Gol D. Roger'], answer: 0, explain: 'Red-Haired Shanks left his straw hat with young Luffy as a promise to meet again.' },
      { type: 'mcq', q: 'What is the name of the Straw Hat Pirates’ second ship?', options: ['Thousand Sunny', 'Going Merry', 'Moby Dick', 'Red Force'], answer: 0, explain: 'Franky built the Thousand Sunny after the Going Merry was lost.' },
      { type: 'written', q: 'What is the name of the Straw Hats’ reindeer doctor?', accept: ['chopper', 'tony tony chopper', 'tony chopper'], answerText: 'Tony Tony Chopper', explain: 'Chopper ate the Human-Human Fruit and became the crew’s doctor.' },
      { type: 'mcq', q: 'Which Straw Hat is the crew’s navigator?', options: ['Nami', 'Nico Robin', 'Usopp', 'Franky'], answer: 0, explain: 'Nami is the navigator and dreams of mapping the entire world.' },
      { type: 'mcq', q: 'What is the name of the legendary treasure left behind by Gol D. Roger?', options: ['One Piece', 'Poneglyph', 'Pluton', 'All Blue'], answer: 0, explain: 'Roger’s final words sent the world searching for the One Piece.' },
      { type: 'mcq', q: 'Sanji dreams of finding which legendary sea?', options: ['All Blue', 'Grand Line', 'Red Line', 'Calm Belt'], answer: 0, explain: 'The All Blue is said to hold fish from every sea in the world.' },
      { type: 'written', q: 'Who is Luffy’s sworn brother, known as “Fire Fist”?', accept: ['ace', 'portgas d ace', 'portgas ace', 'portgas d. ace'], answerText: 'Portgas D. Ace', explain: 'Ace ate the Flame-Flame Fruit and sailed with the Whitebeard Pirates.' },
    ],
    naruto: [
      { type: 'mcq', q: 'Which village is Naruto Uzumaki from?', options: ['Hidden Leaf (Konoha)', 'Hidden Sand', 'Hidden Mist', 'Hidden Cloud'], answer: 0, explain: 'Naruto grows up in Konohagakure, the Village Hidden in the Leaves.' },
      { type: 'mcq', q: 'Which tailed beast is sealed inside Naruto?', options: ['The Nine-Tailed Fox', 'The One-Tailed Shukaku', 'The Eight-Tailed Ox', 'The Two-Tailed Cat'], answer: 0, explain: 'The Nine-Tails, Kurama, was sealed into Naruto on the day he was born.' },
      { type: 'mcq', q: 'What is Naruto’s favourite food?', options: ['Ramen', 'Sushi', 'Dango', 'Curry'], answer: 0, explain: 'Naruto’s favourite spot is Ichiraku Ramen.' },
      { type: 'written', q: 'Who is Naruto’s rival on Team 7, from the Uchiha clan?', accept: ['sasuke', 'sasuke uchiha', 'uchiha sasuke'], answerText: 'Sasuke Uchiha', explain: 'Sasuke is Naruto’s rival and best friend.' },
      { type: 'mcq', q: 'Which technique lets Naruto create solid copies of himself?', options: ['Shadow Clone Jutsu', 'Rasengan', 'Chidori', 'Sharingan'], answer: 0, explain: 'The Shadow Clone Jutsu makes real, solid clones — Naruto’s signature move.' },
      { type: 'mcq', q: 'What is Naruto’s lifelong dream?', options: ['To become Hokage', 'To become a Sannin', 'To join the Akatsuki', 'To lead the Anbu'], answer: 0, explain: 'Naruto wants to become Hokage so the whole village will acknowledge him.' },
      { type: 'mcq', q: 'Who is the jonin teacher who leads Team 7?', options: ['Kakashi Hatake', 'Might Guy', 'Asuma Sarutobi', 'Kurenai Yuhi'], answer: 0, explain: 'Kakashi leads Naruto, Sasuke and Sakura.' },
      { type: 'mcq', q: 'The Sharingan is the special eye of which clan?', options: ['Uchiha', 'Hyuga', 'Uzumaki', 'Senju'], answer: 0, explain: 'The Sharingan belongs to the Uchiha; the Hyuga have the Byakugan.' },
      { type: 'mcq', q: 'Which jutsu, created by the Fourth Hokage, did Naruto later master?', options: ['Rasengan', 'Chidori', 'Amaterasu', 'Kamui'], answer: 0, explain: 'Minato Namikaze created the Rasengan; Jiraiya taught it to Naruto.' },
      { type: 'written', q: 'Which toad sage trained Naruto and wrote the Icha Icha books?', accept: ['jiraiya', 'jiraya', 'pervy sage'], answerText: 'Jiraiya', explain: 'Jiraiya, one of the Legendary Sannin, was Naruto’s mentor.' },
    ],
    cricket: [
      { type: 'mcq', q: 'How many players from each team are on the field in a cricket match?', options: ['11', '10', '12', '9'], answer: 0, explain: 'Each side fields eleven players.' },
      { type: 'mcq', q: 'Which player is known as the “God of Cricket”?', options: ['Sachin Tendulkar', 'MS Dhoni', 'Virat Kohli', 'Brian Lara'], answer: 0, explain: 'Sachin Tendulkar scored 100 international centuries.' },
      { type: 'mcq', q: 'How many legal deliveries are there in a standard over?', options: ['6', '5', '8', '4'], answer: 0, explain: 'A standard over has six legal balls.' },
      { type: 'mcq', q: 'Which team won the first Cricket World Cup in 1975?', options: ['West Indies', 'Australia', 'England', 'India'], answer: 0, explain: 'Clive Lloyd’s West Indies beat Australia in the 1975 final at Lord’s.' },
      { type: 'written', q: 'What is it called when a batter is dismissed without scoring a run?', accept: ['duck', 'a duck'], answerText: 'A duck', explain: 'Getting out for zero is called a duck.' },
      { type: 'mcq', q: 'In which year did India win its first Cricket World Cup?', options: ['1983', '2011', '1975', '2007'], answer: 0, explain: 'Kapil Dev’s team beat the West Indies in the 1983 final.' },
      { type: 'mcq', q: 'Which captain led India to the 2007 T20 World Cup, the 2011 World Cup and the 2013 Champions Trophy?', options: ['MS Dhoni', 'Sourav Ganguly', 'Virat Kohli', 'Rahul Dravid'], answer: 0, explain: 'MS Dhoni is the only captain to win all three ICC white-ball trophies.' },
      { type: 'mcq', q: 'What does LBW stand for?', options: ['Leg Before Wicket', 'Long Ball Wide', 'Left Bat Wicket', 'Leg Bye Wide'], answer: 0, explain: 'A batter is out LBW when the ball would have hit the stumps but struck their leg first.' },
      { type: 'mcq', q: 'How many runs are scored when the ball clears the boundary without bouncing?', options: ['6', '4', '5', '8'], answer: 0, explain: 'A six; a ball that bounces before the boundary is worth four.' },
      { type: 'written', q: 'Which T20 league features teams like Chennai Super Kings and Mumbai Indians?', accept: ['ipl', 'indian premier league', 'the ipl'], answerText: 'IPL (Indian Premier League)', explain: 'The Indian Premier League started in 2008.' },
    ],
    football: [
      { type: 'mcq', q: 'How many players does each team have on the pitch?', options: ['11', '10', '12', '9'], answer: 0, explain: 'Each side has eleven players, including the goalkeeper.' },
      { type: 'mcq', q: 'Which country has won the most FIFA World Cups?', options: ['Brazil', 'Germany', 'Italy', 'Argentina'], answer: 0, explain: 'Brazil has won five World Cups.' },
      { type: 'mcq', q: 'Which player is nicknamed “CR7”?', options: ['Cristiano Ronaldo', 'Neymar', 'Kylian Mbappé', 'Lionel Messi'], answer: 0, explain: 'CR7 combines Cristiano Ronaldo’s initials with his shirt number.' },
      { type: 'mcq', q: 'Which country won the 2022 FIFA World Cup in Qatar?', options: ['Argentina', 'France', 'Croatia', 'Brazil'], answer: 0, explain: 'Argentina beat France on penalties in the final.' },
      { type: 'written', q: 'What is it called when one player scores three goals in a match?', accept: ['hat trick', 'hat-trick', 'hattrick', 'a hat trick', 'a hat-trick'], answerText: 'A hat-trick', explain: 'Three goals by one player in a single match is a hat-trick.' },
      { type: 'mcq', q: 'How long is a standard professional football match, not counting stoppage time?', options: ['90 minutes', '60 minutes', '80 minutes', '120 minutes'], answer: 0, explain: 'Two halves of 45 minutes each.' },
      { type: 'mcq', q: 'Which club plays its home matches at Camp Nou?', options: ['FC Barcelona', 'Real Madrid', 'Manchester United', 'Bayern Munich'], answer: 0, explain: 'Camp Nou is FC Barcelona’s home stadium.' },
      { type: 'mcq', q: 'Which card does a referee show to send a player off?', options: ['Red card', 'Yellow card', 'Green card', 'Blue card'], answer: 0, explain: 'A red card means the player must leave the pitch.' },
      { type: 'mcq', q: 'In which country was Lionel Messi born?', options: ['Argentina', 'Spain', 'Portugal', 'Brazil'], answer: 0, explain: 'Messi was born in Rosario, Argentina.' },
      { type: 'written', q: 'What is the name of England’s top professional football league?', accept: ['premier league', 'the premier league', 'epl', 'english premier league'], answerText: 'The Premier League', explain: 'The Premier League has been England’s top division since 1992.' },
    ],
  };

  // Inline SVG figures so questions can carry images without extra files.
  const QUESTION_IMAGES = {
    bst: `<svg class="q-svg" viewBox="0 0 340 210" role="img" aria-label="Binary search tree. Root 8. Its left child is 3, which has children 1 and 6. Its right child is 10, which has a right child 14.">
      <g class="svg-edges">
        <line x1="170" y1="36" x2="95" y2="102"/><line x1="170" y1="36" x2="245" y2="102"/>
        <line x1="95" y1="102" x2="50" y2="170"/><line x1="95" y1="102" x2="140" y2="170"/>
        <line x1="245" y1="102" x2="290" y2="170"/>
      </g>
      <g class="svg-nodes">
        <g transform="translate(170 36)"><circle r="22"/><text>8</text></g>
        <g transform="translate(95 102)"><circle r="22"/><text>3</text></g>
        <g transform="translate(245 102)"><circle r="22"/><text>10</text></g>
        <g transform="translate(50 170)"><circle r="22"/><text>1</text></g>
        <g transform="translate(140 170)"><circle r="22"/><text>6</text></g>
        <g transform="translate(290 170)"><circle r="22"/><text>14</text></g>
      </g>
    </svg>`,
    triangle: `<svg class="q-svg" viewBox="0 0 320 210" role="img" aria-label="Right triangle. The vertical leg is 6, the horizontal leg is 8, and the hypotenuse is labelled x.">
      <polygon class="svg-shape" points="70,170 270,170 70,40"/>
      <polyline class="svg-right" points="70,150 90,150 90,170"/>
      <text class="svg-label" x="48" y="110">6</text>
      <text class="svg-label" x="170" y="198">8</text>
      <text class="svg-label svg-accent" x="186" y="96">x</text>
    </svg>`,
  };

  return { BANK_VERSION, CATEGORIES, SUBJECTS, QUESTION_BANK, QUESTION_IMAGES };
})();
