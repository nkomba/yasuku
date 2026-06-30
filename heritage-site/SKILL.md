---
name: heritage-site
description: >
  Use this skill to build a complete bilingual (French/English) static website
  for a cultural heritage community — a diaspora group, ethnic community,
  indigenous people, or any group wanting to preserve and share their history,
  language, stories, and traditions online. Trigger this skill whenever the user
  asks to create a cultural website, community archive, heritage portal,
  diaspora site, or language preservation site, even if they don't use those
  exact words. Also trigger when someone says things like "build a site for my
  village/clan/ethnic group", "create a website about my people's history",
  "I want to preserve our culture online", or "build something like bakoko.org
  for my community". The output is a folder of plain HTML/CSS/JS files the user
  can open in any browser immediately, with no server or build tools required.
---

# Bilingual Cultural Heritage Website

## What This Skill Builds

A multi-page static website (HTML + CSS + JS, zero frameworks) that:

- Presents a community's history, genealogy, values, and oral traditions
- Teaches the community's language with vocabulary cards and phrase tables
- Tells ancient stories and oral tradition narratives
- Offers interactive cultural games and quizzes
- Has a bilingual French/English toggle that works on every page
- Works offline, opens by double-clicking any `.html` file
- Has no external image dependencies — all illustrations are inline SVGs

---

## Phase 1: Research and Content Gathering

Before writing any code, gather answers to these questions — from the user, from
attached documents, or from web search:

**Community identity**
- Community name, alternate spellings
- Geographic location (region, country, river/landmark)
- Administrative structure (canton, arrondissement, chief's name)
- Population, founding date, significant historical events

**Cultural content**
- Ancestor names and genealogical chain (e.g. Founder → Son → Grandson → People)
- Meaning of the community's name (literal translation)
- Clans / sub-groups / families
- Key oral traditions, proverbs, resistance stories
- Ritual/ceremonial practices (societies, ceremonies, dances)
- Language name and ISO code if known

**Language**
- Greetings, family terms, nature/water vocabulary
- Key cultural phrases and their translations
- Name of the language and its relationship to neighboring languages

**Visual identity**
- Geographic landmark (river, mountain, sacred site) to use as the visual motif
- Color palette cues (the natural environment — sky, water, forest, earth)

---

## Phase 2: File Structure

Create this structure in the user's target folder:

```
<site-folder>/
├── index.html        # Homepage
├── history.html      # History, genealogy, resistance
├── community.html    # Villages/clans, values, leadership
├── learn.html        # Language learning (vocabulary, phrases)
├── stories.html      # Oral tradition narratives
├── games.html        # Interactive cultural games
├── about.html        # About the developer / site creator
├── css/
│   └── style.css     # Shared stylesheet (all pages)
├── js/
│   └── main.js       # Shared JavaScript (all pages)
└── images/
    └── README.txt    # Tells user what filename to save photos as
```

---

## Phase 3: CSS Architecture

### Design Tokens

Open `style.css` with CSS custom properties derived from the community's
natural environment. Example for a river community:

```css
:root {
  --river-deep:   #0d3b5e;
  --river-mid:    #1a6b8a;
  --river-light:  #3ea8cc;
  --river-pale:   #c8e8f5;
  --river-mist:   #eef7fb;
  --forest-deep:  #1a3d1a;
  --forest-mid:   #2d6a2d;
  --gold:         #d4a843;
  --sunset:       #e07020;
  --earth:        #7d4f1a;
  --text:         #2c2c2c;
  --text-light:   #556;
  --light-bg:     #f8f4ee;
  --white:        #ffffff;
  --font-head:    'Playfair Display', Georgia, serif;
  --font-body:    'Lato', 'Helvetica Neue', sans-serif;
}
```

Adapt colors to the community — a mountain community uses greys and greens; a
desert community uses ochres and terracottas; a coastal community uses deep
blues and sandy whites.

### The Bilingual Toggle CSS — CRITICAL RULES

**Rule 1:** Use `:not(body)` on the hide rule. Without it, `body.lang-fr`
matches `.lang-fr { display:none }` and the entire page goes blank.

```css
/* CORRECT — the :not(body) is essential */
.lang-fr:not(body), .lang-en:not(body) { display: none !important; }
body.lang-fr .lang-fr { display: revert !important; }
body.lang-en .lang-en { display: revert !important; }
```

**Rule 2:** Use `display: revert` (not `display: block`). `revert` restores the
element's native display type, so a `<span>` stays inline, a `<li>` stays
list-item, and a `<table>` stays table.

### Photo / Illustration Cards

All illustration areas use a consistent gradient so the page looks cohesive
even before real photos are added. For a river community:

```css
.photo-card {
  background: linear-gradient(145deg, #b8dcea 0%, #d8eef8 45%, #c5e3f0 100%);
}
```

---

## Phase 4: JavaScript Architecture (`main.js`)

### Language Toggle — CRITICAL RULES

**Rule 1:** Store language in a JS variable, NOT localStorage.

```js
let currentLang = 'fr'; // default

function setLanguage(lang) {
  currentLang = lang;
  document.body.classList.remove('lang-fr', 'lang-en');
  document.body.classList.add('lang-' + lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.textContent = lang === 'fr' ? 'English' : 'Français';
  });
  document.documentElement.lang = lang;
}

function toggleLanguage() {
  setLanguage(currentLang === 'fr' ? 'en' : 'fr');
}
```

**Rule 2:** Bind the language button ONLY via `addEventListener` in JS. NEVER
add `onclick="toggleLanguage()"` in HTML AND an event listener — this fires the
toggle twice (fr→en→fr), making the button appear broken (nothing changes).

```js
// In DOMContentLoaded:
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', toggleLanguage);
});
```

In HTML, the button has NO onclick attribute:
```html
<button class="lang-btn">English</button>  <!-- no onclick! -->
```

### Navigation

```js
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded',
        navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')
      ?.classList.toggle('scrolled', window.scrollY > 10);
  });
}
```

### Interactive Games (for games.html)

Three standard game types to include. Each must guard with an early return
since main.js runs on all pages:

**1. Mancala / seed game**
- DOM IDs: `pit-b0..pit-b5` (bottom/player 1), `pit-t0..pit-t5` (top/player 2),
  `store1`, `store2`, `mancalaMsg`, `mancalaReset`

**2. Memory card game** (clan names ↔ ancestor names)
- DOM IDs: `memoryGrid`, `memScore`, `memMsg`, `memoryReset`

**3. Two-player race** (canoe or culturally appropriate equivalent)
- DOM IDs: `canoe1`, `canoe2`, `raceMsg`, `raceBtn1`, `raceBtn2`, `raceReset`

```js
function initMancala() {
  if (!document.getElementById('pit-b0')) return; // guard — not on games page
  // ... game logic
}
```

**Important:** If game JS sets `element.textContent = value`, place any
descriptive labels (like "J1 / Player 1") in SIBLING elements, not inside the
element whose textContent gets overwritten — otherwise labels disappear.

---

## Phase 5: Shared Nav Template

Copy this to every page. Change only the `class="active"` on the current page's link.
The `<button class="lang-btn">` has NO onclick attribute.

```html
<nav id="navbar">
  <a href="index.html" class="nav-logo">
    <!-- inline SVG logo (200×200 viewBox, community scene) -->
    <div>
      <span class="nav-logo-text">SiteName.org</span>
      <span class="nav-logo-sub">Community · Country</span>
    </div>
  </a>
  <ul class="nav-links" id="navLinks">
    <li><a href="index.html"><span class="lang-fr">Accueil</span><span class="lang-en">Home</span></a></li>
    <li><a href="history.html"><span class="lang-fr">Histoire</span><span class="lang-en">History</span></a></li>
    <li><a href="community.html"><span class="lang-fr">Communauté</span><span class="lang-en">Community</span></a></li>
    <li><a href="learn.html"><span class="lang-fr">Apprendre</span><span class="lang-en">Learn</span></a></li>
    <li><a href="stories.html"><span class="lang-fr">Récits</span><span class="lang-en">Stories</span></a></li>
    <li><a href="games.html"><span class="lang-fr">Jeux</span><span class="lang-en">Games</span></a></li>
    <li><a href="about.html"><span class="lang-fr">À propos</span><span class="lang-en">About</span></a></li>
    <button class="lang-btn">English</button>
  </ul>
  <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>
```

### Bilingual Content Pattern

Every piece of text appears twice — the community's primary language first:

```html
<span class="lang-fr">Accueil</span><span class="lang-en">Home</span>
<p class="lang-fr">Texte en français.</p>
<p class="lang-en">English text.</p>
<h2 class="lang-fr">Notre histoire</h2>
<h2 class="lang-en">Our history</h2>
```

---

## Phase 6: SVG Illustrations

All illustrations are inline SVGs — no image files needed. Adapt the natural
setting (river, mountain, savanna, forest, coast) to the community.

**Logo SVG:** 200×200 viewBox, community's signature activity
(paddling, farming, weaving, hunting) against the natural backdrop.

**Scene SVG:** 400–700×200–380 viewBox for card illustrations. Always include:
- Sky / background gradient
- The natural landmark (water, mountain, trees)
- Silhouette figures engaged in cultural activity
- Local vegetation for atmosphere

**Background gradients by biome:**
- River/lake: `linear-gradient(160deg, #b8dcea 0%, #d8eef8 50%, #c5e3f0 100%)`
- Mountain: `linear-gradient(160deg, #c8d8e8 0%, #e0e8f0 50%, #d0dce8 100%)`
- Savanna: `linear-gradient(160deg, #e8d8a0 0%, #f0e8c0 50%, #e0d098 100%)`
- Forest: `linear-gradient(160deg, #b8d8b0 0%, #d0e8c8 50%, #c0d8b8 100%)`
- Coast: `linear-gradient(160deg, #a8d8f0 0%, #c8eaf8 50%, #b8e0f8 100%)`

---

## Phase 7: Page Content Guide

### index.html (Homepage)
- Hero with animated waves and inline SVG logo
- Facts strip: population, number of clans/villages, key annual date, founding event
- About section: community identity + large scene illustration
- 6 navigation cards to other pages (each with unique SVG scene)
- Proverb block (community saying in original language + translation)
- 4-card river/nature life illustration grid
- Diaspora section (4 connect cards)
- Second proverb with meaning

### history.html
- Origin narrative (migration story, earliest known location)
- Sacred site section (the community's founding landmark)
- Genealogy section: visual ancestor chain from founder to present day
- Resistance/sovereignty timeline (documented historical events with real dates)
- Oral tradition forms (types of songs, poetry, ceremonial recitation)

### community.html
- Administrative overview table (region, department, code, population, chief)
- Clans/sub-groups table (highlight the user's own clan in gold)
- Village/settlement grid (one card per village/neighborhood with description)
- Daily life illustration cards
- Community values section (4 cards: land, solidarity, governance, transmission)

### learn.html
- Language family overview (language group, ISO code, dialects map)
- Vocabulary tables: naming prefixes/roots, water/nature terms, cultural terms
- 12 interactive flip vocabulary cards (click to reveal meaning + translation)
- Greetings table (language ↔ French ↔ English)
- Family terms table
- Nature/environment vocabulary table
- External resource links (Omniglot, Glottolog, community archive)

### stories.html
- Opening note: oral tradition as primary historical source
- 5–6 story cards, each with:
  - Story number (Story I, Story II…)
  - Bilingual title and source attribution
  - 3–5 paragraphs per language
  - Optional SVG scene illustration
- Story types to include: origin myth, ancestor naming, resistance, spirit/nature,
  contemporary (living community member's story)
- Closing call-to-action to contribute more stories

### games.html
- Mancala/seed game (see DOM IDs in JS section)
- Memory matching game (clan names ↔ ancestor names)
- Two-player race/competition game
- Optional: cultural knowledge quiz (multiple choice, 8 questions)
- Physical games section (3 cards for outdoor games to play in person)

### about.html
- Photo of developer/founder (`images/founder-name.jpg` with fallback SVG)
- Full bilingual biography
- Ancestor acknowledgment (parents, grandparents, community elders by name)
- Project mission statement
- Links to related community projects
- Proverb closing

---

## Phase 8: Photo Handling

When the user has real photos:
1. Create `images/` folder with `README.txt` listing expected filenames
2. Use `onerror` fallback so missing photos degrade gracefully:

```html
<img src="images/photo.jpg" alt="Caption"
     onerror="this.style.display='none';
              this.nextElementSibling.style.display='flex'"/>
<div class="photo-fallback" style="display:none">
  <!-- SVG placeholder + instruction text -->
</div>
```

3. Tell user exactly: "Save your photo as `images/photo.jpg` in the site folder"

---

## Phase 9: Known Bugs to Avoid

| Bug | Symptom | Fix |
|-----|---------|-----|
| `.lang-fr { display:none }` without `:not(body)` | Entire page is blank white | Add `:not(body)` to the selector |
| `onclick` + `addEventListener` on language button | Toggle does nothing | Remove `onclick`, use only `addEventListener` |
| Game JS sets `textContent` on container with label children | Player labels disappear | Move labels to sibling elements outside the updated container |
| SVG `d` attribute split into two HTML attributes | SVG parse error, blank page | Keep entire path in a single `d="..."` attribute, no spaces mid-value |
| `display: block` instead of `display: revert` on language show rule | `<span>` elements break layout | Use `display: revert` |
| `localStorage` in language toggle | Errors in some environments | Store language in a `let currentLang` variable instead |

---

## Quality Checklist Before Delivery

- [ ] Every `.html` file opens without blank page
- [ ] Language toggle switches all content cleanly in both directions
- [ ] Nav links work on every page, correct `active` class per page
- [ ] Mobile: hamburger appears, nav collapses, content stacks
- [ ] games.html: Mancala board visible, memory grid renders, race track visible
- [ ] Zero `onclick="toggle` in HTML (grep to verify)
- [ ] Zero split SVG paths (`d="M[digits]" y=` pattern — grep to verify)

---

## Delivery Format

Present all files using `mcp__cowork__present_files`. In the summary note:
- Pages built and their purpose
- Language toggle works (both directions)
- Any photos the user needs to add manually, with exact filename and folder path
- One-line reminder on how to edit text themselves
