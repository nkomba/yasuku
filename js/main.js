/* ============================================================
   YASUKU.ORG — Canton Yassoukou
   Main JavaScript: Language Toggle, Navigation, Animations, Games
   ============================================================ */

'use strict';

/* ------ LANGUAGE TOGGLE ------ */
let currentLang = 'fr'; // default: French

function setLanguage(lang) {
  currentLang = lang;
  document.body.classList.remove('lang-fr', 'lang-en');
  document.body.classList.add('lang-' + lang);

  // Update button label
  const btns = document.querySelectorAll('.lang-btn');
  btns.forEach(btn => {
    btn.textContent = lang === 'fr' ? 'English' : 'Français';
    btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
  });

  // Update html lang attribute
  document.documentElement.lang = lang === 'fr' ? 'fr' : 'en';
}

function toggleLanguage() {
  setLanguage(currentLang === 'fr' ? 'en' : 'fr');
}

/* ------ NAVIGATION ------ */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const expanded = navLinks.classList.contains('open');
      hamburger.setAttribute('aria-expanded', expanded);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.endsWith(currentPage) || (currentPage === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Scroll: add shadow to nav
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,0.45)'
        : '0 2px 16px rgba(0,0,0,0.35)';
    }, { passive: true });
  }
}

/* ------ FADE-IN OBSERVER ------ */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* ------ VOCAB FLIP CARDS ------ */
function initVocabCards() {
  document.querySelectorAll('.vocab-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
}

/* ============================================================
   MANCALA GAME
   ============================================================ */
function initMancala() {
  const board = document.getElementById('mancalaBoard');
  if (!board) return;

  // State: pits[0..5] = player 1 (bottom row), pits[6..11] = player 2 (top row)
  // stores: store1 (index 12) = player 1, store2 (index 13) = player 2
  let pits, stores, currentPlayer, gameOver;

  const INIT_SEEDS = 4;

  function initGame() {
    pits         = new Array(12).fill(INIT_SEEDS);
    stores       = [0, 0];
    currentPlayer = 1;
    gameOver      = false;
    render();
    setMsg(currentLang === 'fr'
      ? 'Joueur 1 (bas), c\'est votre tour ! Cliquez sur un trou.'
      : 'Player 1 (bottom), your turn! Click a hole.');
  }

  function render() {
    // Bottom row (player 1): pits 0–5, left to right
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById('pit-b' + i);
      if (el) el.textContent = pits[i];
    }
    // Top row (player 2): pits 6–11, RIGHT to left on screen
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById('pit-t' + i);
      // pit-t0 is on the RIGHT side (opponent's perspective)
      if (el) el.textContent = pits[11 - i];
    }
    const s1 = document.getElementById('store1');
    const s2 = document.getElementById('store2');
    if (s1) s1.textContent = stores[0];
    if (s2) s2.textContent = stores[1];

    // Highlight active player's pits
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById('pit-b' + i);
      if (el) el.classList.toggle('active', currentPlayer === 1 && !gameOver && pits[i] > 0);
    }
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById('pit-t' + i);
      const pitIdx = 11 - i;
      if (el) el.classList.toggle('active', currentPlayer === 2 && !gameOver && pits[pitIdx] > 0);
    }
  }

  function setMsg(msg) {
    const el = document.getElementById('mancalaMsg');
    if (el) el.textContent = msg;
  }

  function sow(pitIndex) {
    if (gameOver) return;
    if (pits[pitIndex] === 0) {
      setMsg(currentLang === 'fr' ? 'Ce trou est vide, choisissez-en un autre.' : 'That hole is empty, choose another.');
      return;
    }

    let seeds = pits[pitIndex];
    pits[pitIndex] = 0;
    let idx = pitIndex;
    let bonusTurn = false;

    while (seeds > 0) {
      idx = (idx + 1) % 14;
      // Skip opponent's store
      if (currentPlayer === 1 && idx === 13) continue;
      if (currentPlayer === 2 && idx === 12) continue;

      if (idx === 12) { stores[0]++; }
      else if (idx === 13) { stores[1]++; }
      else { pits[idx]++; }
      seeds--;
    }

    // Bonus turn if last seed landed in own store
    if (currentPlayer === 1 && idx === 12) bonusTurn = true;
    if (currentPlayer === 2 && idx === 13) bonusTurn = true;

    // Capture: last seed in own empty pit on opponent's non-empty opposite
    if (idx < 12 && pits[idx] === 1) {
      const isOwnSide = (currentPlayer === 1 && idx < 6) || (currentPlayer === 2 && idx >= 6);
      if (isOwnSide) {
        const opposite = 11 - idx;
        if (pits[opposite] > 0) {
          stores[currentPlayer - 1] += pits[opposite] + 1;
          pits[opposite] = 0;
          pits[idx] = 0;
        }
      }
    }

    // Check end of game
    const p1Empty = pits.slice(0, 6).every(p => p === 0);
    const p2Empty = pits.slice(6, 12).every(p => p === 0);
    if (p1Empty || p2Empty) {
      // Collect remaining seeds
      for (let i = 0; i < 6; i++) { stores[0] += pits[i]; pits[i] = 0; }
      for (let i = 6; i < 12; i++) { stores[1] += pits[i]; pits[i] = 0; }
      gameOver = true;
      render();
      const winner = stores[0] > stores[1]
        ? (currentLang === 'fr' ? '🎉 Joueur 1 gagne !' : '🎉 Player 1 wins!')
        : stores[1] > stores[0]
          ? (currentLang === 'fr' ? '🎉 Joueur 2 gagne !' : '🎉 Player 2 wins!')
          : (currentLang === 'fr' ? '🤝 Égalité !' : '🤝 It\'s a tie!');
      setMsg(winner + (currentLang === 'fr'
        ? ` Score: J1=${stores[0]}, J2=${stores[1]}`
        : ` Score: P1=${stores[0]}, P2=${stores[1]}`));
      return;
    }

    if (!bonusTurn) {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    }
    render();

    if (!gameOver) {
      const who = currentPlayer === 1
        ? (currentLang === 'fr' ? 'Joueur 1 (bas)' : 'Player 1 (bottom)')
        : (currentLang === 'fr' ? 'Joueur 2 (haut)' : 'Player 2 (top)');
      const turn = bonusTurn
        ? (currentLang === 'fr' ? ' — Tour bonus !' : ' — Bonus turn!')
        : '';
      setMsg(who + (currentLang === 'fr' ? ', à votre tour.' : ', your turn.') + turn);
    }
  }

  // Bind bottom pit clicks (Player 1)
  for (let i = 0; i < 6; i++) {
    (function(idx) {
      const el = document.getElementById('pit-b' + idx);
      if (el) el.addEventListener('click', () => {
        if (currentPlayer !== 1 || gameOver) return;
        sow(idx);
      });
    })(i);
  }
  // Bind top pit clicks (Player 2): pit-t0 = pit[11], pit-t1 = pit[10] ...
  for (let i = 0; i < 6; i++) {
    (function(idx) {
      const el = document.getElementById('pit-t' + idx);
      if (el) el.addEventListener('click', () => {
        if (currentPlayer !== 2 || gameOver) return;
        sow(11 - idx);
      });
    })(i);
  }

  const resetBtn = document.getElementById('mancalaReset');
  if (resetBtn) resetBtn.addEventListener('click', initGame);

  initGame();
}

/* ============================================================
   MEMORY GAME (13 Clans)
   ============================================================ */
function initMemory() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;

  const clans = [
    { fr: 'Yasuku', en: 'Yasuku' },
    { fr: 'Adiè', en: 'Adié' },
    { fr: 'Yakalak', en: 'Yakalak' },
    { fr: 'Yawanda', en: 'Yawanda' },
    { fr: 'Ndonga', en: 'Ndonga' },
    { fr: 'Yabii', en: 'Yabii' },
    { fr: 'Ndogbesol', en: 'Ndogbesol' },
    { fr: 'Bisoo', en: 'Bisoo' },
  ];

  // Create pairs: clan name + ancestor
  const ancestors = ['Lisukè', 'Likandè', 'Kalake', 'Ekoum', 'Mbambo', 'Bii', 'Besol', 'Nsoo'];

  let cards = [];
  clans.forEach((c, i) => {
    cards.push({ id: i, type: 'clan',     label: c });
    cards.push({ id: i, type: 'ancestor', label: { fr: ancestors[i], en: ancestors[i] } });
  });

  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  let flipped = [], matched = 0, moves = 0, lock = false;

  function build() {
    grid.innerHTML = '';
    cards.forEach((card, pos) => {
      const el = document.createElement('div');
      el.className = 'mem-card';
      el.dataset.pos = pos;
      el.innerHTML = `<span class="back">?</span><span class="front">${
        currentLang === 'fr' ? card.label.fr : card.label.en
      }</span>`;
      el.addEventListener('click', () => flipCard(el, card, pos));
      grid.appendChild(el);
    });
    updateScore();
  }

  function flipCard(el, card, pos) {
    if (lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    el.classList.add('flipped');
    flipped.push({ el, card, pos });

    if (flipped.length === 2) {
      moves++;
      lock = true;
      const [a, b] = flipped;
      if (a.card.id === b.card.id && a.card.type !== b.card.type) {
        // Match!
        setTimeout(() => {
          a.el.classList.add('matched');
          b.el.classList.add('matched');
          matched++;
          flipped = [];
          lock = false;
          updateScore();
          if (matched === clans.length) {
            setMemMsg(currentLang === 'fr'
              ? `🎉 Bravo ! Tous les clans trouvés en ${moves} coups !`
              : `🎉 Well done! All clans found in ${moves} moves!`);
          }
        }, 600);
      } else {
        setTimeout(() => {
          a.el.classList.remove('flipped');
          b.el.classList.remove('flipped');
          flipped = [];
          lock = false;
          updateScore();
        }, 900);
      }
    }
  }

  function updateScore() {
    const el = document.getElementById('memScore');
    if (el) {
      el.textContent = currentLang === 'fr'
        ? `Paires trouvées : ${matched}/8 — Coups : ${moves}`
        : `Pairs found: ${matched}/8 — Moves: ${moves}`;
    }
  }

  function setMemMsg(msg) {
    const el = document.getElementById('memMsg');
    if (el) el.textContent = msg;
  }

  const resetBtn = document.getElementById('memoryReset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    // Re-shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    flipped = []; matched = 0; moves = 0; lock = false;
    const msgEl = document.getElementById('memMsg');
    if (msgEl) msgEl.textContent = '';
    build();
  });

  build();
}

/* ============================================================
   CANOE RACE GAME
   ============================================================ */
function initCanoeRace() {
  const p1El  = document.getElementById('canoe1');
  const p2El  = document.getElementById('canoe2');
  const msgEl = document.getElementById('raceMsg');
  if (!p1El || !p2El) return;

  const MAX = 84; // % left position
  let pos1 = 2, pos2 = 2, raceOver = false;

  function updatePositions() {
    p1El.style.left = pos1 + '%';
    p2El.style.left = pos2 + '%';
  }

  function checkWin(player) {
    if (!raceOver && ((player === 1 && pos1 >= MAX) || (player === 2 && pos2 >= MAX))) {
      raceOver = true;
      if (msgEl) msgEl.textContent = currentLang === 'fr'
        ? `🏆 Joueur ${player} gagne la course !`
        : `🏆 Player ${player} wins the race!`;
    }
  }

  const btn1 = document.getElementById('raceBtn1');
  const btn2 = document.getElementById('raceBtn2');
  const rst  = document.getElementById('raceReset');

  if (btn1) btn1.addEventListener('click', () => {
    if (raceOver) return;
    pos1 = Math.min(MAX, pos1 + (Math.random() * 8 + 4));
    updatePositions();
    checkWin(1);
  });
  if (btn2) btn2.addEventListener('click', () => {
    if (raceOver) return;
    pos2 = Math.min(MAX, pos2 + (Math.random() * 8 + 4));
    updatePositions();
    checkWin(2);
  });
  if (rst) rst.addEventListener('click', () => {
    pos1 = 2; pos2 = 2; raceOver = false;
    updatePositions();
    if (msgEl) msgEl.textContent = currentLang === 'fr'
      ? 'Cliquez sur votre bouton pour pagayer !'
      : 'Click your button to paddle!';
  });

  updatePositions();
  if (msgEl) msgEl.textContent = currentLang === 'fr'
    ? 'Cliquez sur votre bouton pour pagayer !'
    : 'Click your button to paddle!';
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setLanguage('fr'); // default French

  // Language button(s)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', toggleLanguage);
  });

  initNav();
  initFadeIn();
  initVocabCards();
  initMancala();
  initMemory();
  initCanoeRace();
});
