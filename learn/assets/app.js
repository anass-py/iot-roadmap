/* =========================================================================
   Telemetrie IoT — carnets de revision
   Le contenu vient de assets/content.js, genere par learn/build.py.
   ========================================================================= */
(() => {
'use strict';

const DOCS = (window.IOT_CONTENT || { docs: [] }).docs;
const BY_ID = Object.fromEntries(DOCS.map(d => [d.id, d]));
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ACCENT = {
  dark:  { home: '#58A6E8', notes: '#4FBF95', debug: '#E4655F', frictions: '#A78BFA' },
  light: { home: '#17527E', notes: '#3E7A66', debug: '#B3453E', frictions: '#6B54C6' },
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');

/* ---------------------------------------------------------------- outils */
const SCRATCH = document.createElement('div');
const strip = html => { SCRATCH.innerHTML = html || ''; return SCRATCH.textContent.trim(); };
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------------------------------------------------------- etat */
const KEY = { theme: 'iot.theme', quiz: 'iot.quiz', done: 'iot.done' };
const read = (k, fb) => { try { const v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const DONE = new Set(read(KEY.done, []));
const saveDone = () => write(KEY.done, [...DONE]);

const state = {
  view: 'home',
  theme: read(KEY.theme, 'dark'),
  quiz: read(KEY.quiz, false),
};

const TOTAL_SECTIONS = DOCS.reduce((n, d) => n + d.sections.length, 0);
const sectionKey = (doc, sec) => doc.id + '/' + sec.id;

/* ---------------------------------------------------------------- comptes */
function countCards(doc) {
  let n = 0;
  doc.sections.forEach(s => s.blocks.forEach(b => {
    if (b.type === 'list') n += b.items.length;
    else if (b.type === 'entry') n += 1;
    else if (b.type === 'steps') n += b.items.length;
  }));
  return n;
}
const countEntries = doc => doc.sections.reduce(
  (n, s) => n + s.blocks.filter(b => b.type === 'entry').length, 0);

DOCS.forEach(d => { d.nCards = countCards(d); d.nEntries = countEntries(d); });

/* ================================================================ rendu */

function itemCard(it, id, i) {
  const cls = ['card'];
  if (it.def) cls.push('has-def');
  if (!it.term) cls.push('statement');
  const body = it.def || it.text || '';
  return `<div class="${cls.join(' ')}" id="${id}" data-reveal style="--d:${(i % 12) * 0.035}s">
    ${it.term ? `<p class="term">${it.term}</p>` : ''}
    ${body ? `<p class="def">${body}</p>` : ''}
  </div>`;
}

function renderList(b, uid) {
  const hasTerms = b.items.some(it => it.term);
  if (!hasTerms) {
    return `<ul class="rows" data-reveal>${b.items.map((it, i) =>
      `<li id="${uid(i)}" style="--d:${(i % 12) * 0.05}s">${it.text || it.def || ''}</li>`).join('')}</ul>`;
  }
  return `<div class="cards">${b.items.map((it, i) => itemCard(it, uid(i), i)).join('')}</div>`;
}

function renderCase(b, id, i) {
  const fixes = b.fixes.map(f => f.kind === 'lesson'
    ? `<li class="lesson"><b>Leçon</b>${f.html}</li>`
    : `<li class="fix">${f.html}</li>`).join('');
  return `<article class="case" id="${id}" data-reveal style="--d:${(i % 8) * 0.05}s">
    <div class="case-head"><i class="sig"></i><h3>${b.title}</h3></div>
    <div class="answer">
      ${b.body ? `<p class="cause">${b.body}</p>` : ''}
      ${fixes ? `<ul class="fixes">${fixes}</ul>` : ''}
    </div>
  </article>`;
}

function renderIdea(b, id, i) {
  const pts = b.points.map(p =>
    `<li>${p.term ? `<b>${p.term}</b>` : ''}${p.def || p.text || ''}</li>`).join('');
  return `<article class="idea" id="${id}" data-reveal style="--d:${i * 0.06}s">
    <h3>${b.title}</h3>
    ${b.body ? `<p class="cause">${b.body}</p>` : ''}
    ${pts ? `<ul class="points">${pts}</ul>` : ''}
    ${b.fixes.length ? `<ul class="points">${b.fixes.map(f => `<li>${f.html}</li>`).join('')}</ul>` : ''}
  </article>`;
}

function renderBlocks(doc, sec) {
  let entryIdx = 0;
  const out = sec.blocks.map((b, bi) => {
    const uid = i => `${doc.id}--${sec.id}--${bi}-${i}`;
    switch (b.type) {
      case 'list':  return renderList(b, uid);
      case 'entry': return doc.id === 'debug'
        ? renderCase(b, uid(0), entryIdx++)
        : renderIdea(b, uid(0), entryIdx++);
      case 'steps': return `<ol class="steps" data-reveal>${b.items.map((it, i) =>
        `<li id="${uid(i)}">${it.html}</li>`).join('')}</ol>`;
      case 'code':  return `<div class="codeblock" data-reveal><span class="tag">flux</span><pre>${esc(b.text)}</pre></div>`;
      default:      return `<p class="para" id="${uid(0)}" data-reveal>${b.html}</p>`;
    }
  });
  return `<div class="stack">${out.join('')}</div>`;
}

function renderDoc(doc) {
  const rail = doc.sections.map((s, i) => {
    const k = sectionKey(doc, s);
    const ng = i > 0 && s.group !== doc.sections[i - 1].group;
    return `<li class="${ng ? 'newgroup' : ''}">
      <a href="#/${doc.id}/${s.id}" data-sec="${s.id}" class="${DONE.has(k) ? 'done' : ''}">
        <i class="tick"></i><span>${s.short || s.title}</span>
      </a></li>`;
  }).join('');

  const secs = doc.sections.map((s, i) => {
    const k = sectionKey(doc, s), on = DONE.has(k);
    return `<section class="sec" id="${doc.id}--${s.id}" data-sec="${s.id}">
      <div class="sec-head">
        <span class="num">${pad(i + 1)}</span>
        <h2>${s.title}</h2>
        <i class="rule"></i>
        <button class="done-btn ${on ? 'on' : ''}" data-done="${k}" data-sec="${s.id}">
          <i class="bx"></i><span>${on ? 'révisé' : 'à revoir'}</span>
        </button>
      </div>
      ${renderBlocks(doc, s)}
    </section>`;
  }).join('');

  const nxt = DOCS[(DOCS.indexOf(doc) + 1) % DOCS.length];
  const intro = doc.intro.filter(b => b.type === 'p').slice(1)
    .map(b => `<p class="para">${b.html}</p>`).join('');

  app.innerHTML = `<div class="shell">
    <aside class="rail">
      <p class="kick">${doc.verb} — ${doc.sections.length} sections</p>
      <ol><i class="rail-ink" id="railink"></i>${rail}</ol>
      <div class="rail-foot">
        <span id="railcount">0 / ${doc.sections.length} révisé</span>
        <div class="rail-bar"><i id="railbar"></i></div>
      </div>
    </aside>
    <article class="doc">
      <header class="doc-head">
        <p class="kick">${doc.kicker} · ${doc.source}</p>
        <h1>${doc.title}</h1>
        <p class="lead" id="lead"></p>
        <div class="meta">
          <span><b>${doc.sections.length}</b> sections</span>
          <span><b>${doc.nCards}</b> fiches</span>
          <span>mode ${state.quiz ? '<b>révision</b>' : 'lecture'}</span>
        </div>
        ${intro ? `<div class="note-block" style="margin-top:20px">${intro}</div>` : ''}
      </header>
      ${secs}
      <div class="foot">
        <span>fin de « ${strip(doc.title)} »</span>
        <button class="nx" data-go="${nxt.id}">suivant : ${nxt.label} →</button>
      </div>
    </article>
  </div>`;

  typeIn($('#lead'), doc.lead);
  updateRailProgress(doc);
  requestAnimationFrame(() => moveRailInk(doc.sections[0].id));
}

/* ---------------------------------------------------------------- accueil */
const NODE_H = 46;
const NODES = [
  { id: 'sender', x: 38,  y: 44,  w: 120, t: 'sender',       s: 'capteurs' },
  { id: 'broker', x: 184, y: 44,  w: 140, t: 'mosquitto',    s: 'broker mqtt' },
  { id: 'recv',   x: 350, y: 44,  w: 150, t: 'receiver',     s: 'ingestion' },
  { id: 'db',     x: 526, y: 44,  w: 156, t: 'timescaledb',  s: 'hypertable' },
  { id: 'api',    x: 708, y: 44,  w: 110, t: 'fastapi',      s: 'api' },
  { id: 'graf',   x: 844, y: 44,  w: 118, t: 'grafana',      s: 'dashboard' },
  { id: 'surv',   x: 526, y: 152, w: 156, t: 'surveillance', s: 'détection' },
  { id: 'tg',     x: 744, y: 152, w: 130, t: 'telegram',     s: 'alerte' },
];
const NMAP = Object.fromEntries(NODES.map(n => [n.id, n]));
const SEGS = [
  { a: 'sender', b: 'broker', o: 0 },
  { a: 'broker', b: 'recv',   o: 1 },
  { a: 'recv',   b: 'db',     o: 2 },
  { a: 'db',     b: 'api',    o: 3 },
  { a: 'api',    b: 'graf',   o: 4 },
  { a: 'db',     b: 'surv',   o: 3, v: true, alt: true },
  { a: 'surv',   b: 'tg',     o: 4, alt: true },
];

function segPath(s) {
  const a = NMAP[s.a], b = NMAP[s.b];
  if (s.v) return `M ${a.x + a.w / 2} ${a.y + NODE_H} L ${b.x + b.w / 2} ${b.y - 7}`;
  return `M ${a.x + a.w} ${a.y + NODE_H / 2} L ${b.x - 7} ${b.y + NODE_H / 2}`;
}

function pipeSVG() {
  const links = SEGS.map((s, i) =>
    `<path class="link" id="seg${i}" d="${segPath(s)}" marker-end="url(#ah)" style="--d:${0.5 + i * 0.09}s"></path>`).join('');
  const nodes = NODES.map((n, i) => `<g class="node" id="n-${n.id}" style="--d:${0.15 + i * 0.08}s">
    <rect class="halo" x="${n.x - 3}" y="${n.y - 3}" width="${n.w + 6}" height="${NODE_H + 6}" rx="11"/>
    <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${NODE_H}" rx="8"/>
    <text x="${n.x + n.w / 2}" y="${n.y + 21}">${n.t}</text>
    <text class="sub" x="${n.x + n.w / 2}" y="${n.y + 34}">${n.s}</text>
  </g>`).join('');
  return `<div class="pipe-scroll"><svg viewBox="0 0 1000 214" preserveAspectRatio="xMidYMid meet"
      aria-label="Architecture du projet : sender, broker MQTT, receiver, TimescaleDB, API, Grafana, surveillance, Telegram">
    <defs><marker id="ah" viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
      <path d="M0 0 L7 4 L0 8 z"/></marker></defs>
    <text class="glabel" x="38" y="20">chemin des mesures</text>
    <text class="glabel" x="526" y="140">branche surveillance</text>
    ${links}${nodes}
  </svg></div>`;
}

let rafId = 0;
function animatePipe(root) {
  const svg = $('svg', root);
  if (!svg) return;
  const segs = SEGS.map((s, i) => {
    const p = $('#seg' + i, svg);
    const len = p.getTotalLength();
    p.style.setProperty('--len', len);
    return { ...s, path: p, len, node: $('#n-' + s.b, svg) };
  });

  if (RM) return;

  const DUR = 1150, GAP = 2500, WAVES = 3, CYCLE = WAVES * GAP;
  const pairs = [];
  for (let w = 0; w < WAVES; w++) segs.forEach(s => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', '3.6');
    c.setAttribute('class', 'pkt' + (s.alt ? ' alt' : ''));
    c.style.opacity = '0';
    svg.appendChild(c);
    pairs.push({ s, c, start: w * GAP + s.o * DUR, live: false });
  });

  const t0 = performance.now();
  const tick = now => {
    const t = now - t0 - 900;
    pairs.forEach(p => {
      let dt = (t - p.start) % CYCLE;
      if (dt < 0) dt += CYCLE;
      const prog = dt / DUR;
      if (prog > 1 || t < p.start) {
        if (p.live) {
          p.live = false;
          p.c.style.opacity = '0';
          if (p.s.node) {
            p.s.node.classList.add('hit');
            setTimeout(() => p.s.node.classList.remove('hit'), 620);
          }
        }
        return;
      }
      p.live = true;
      const pt = p.s.path.getPointAtLength(prog * p.s.len);
      p.c.setAttribute('cx', pt.x);
      p.c.setAttribute('cy', pt.y);
      p.c.style.opacity = clamp(Math.min(prog, 1 - prog) * 9, 0, 1);
    });
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function renderHome() {
  const doors = DOCS.map((d, i) => `<button class="door" data-go="${d.id}" data-reveal
      style="--dc:${ACCENT[state.theme][d.id]};--d:${0.06 + i * 0.09}s">
    <span class="spark"></span><span class="go">↗</span>
    <p class="kick">${pad(i + 1)} — ${d.kicker}</p>
    <h3>${d.label}</h3>
    <p>${d.lead}</p>
    <div class="meta"><span>${d.sections.length} sections</span><span>${d.nCards} fiches</span></div>
  </button>`).join('');

  const notes = BY_ID.notes, debug = BY_ID.debug, fr = BY_ID.frictions;
  let wi = 0;
  const title = [['Trois', 'carnets.'], ['Une', 'seule', 'lecture.']].map(line =>
    `<span class="line">${line.map(w =>
      `<span class="w${w === 'lecture.' ? ' acc' : ''}" style="--d:${0.1 + (wi++) * 0.07}s">${w}</span>`
    ).join(' ')}</span>`).join('');

  app.innerHTML = `<section class="hero">
    <p class="kick">projet télémétrie iot · docs/</p>
    <h1>${title}</h1>
    <p class="hero-sub" data-reveal style="--d:.45s">Les notions à réviser, les pannes réellement rencontrées et les
      frictions qui restent — relues au même endroit. Tout est généré depuis les fichiers Markdown du dépôt.</p>

    <div class="pipe" data-reveal style="--d:.5s">
      <div class="pipe-head">
        <span class="t">Un seul écrivain, quatre services</span>
        <span class="m">flux en direct</span>
      </div>
      ${pipeSVG()}
    </div>

    <div class="stats">
      <div class="stat" data-reveal style="--d:.05s"><span class="n" data-count="${notes.nCards}">0</span><span class="l">notions</span></div>
      <div class="stat" data-reveal style="--d:.1s"><span class="n" data-count="${debug.nEntries}">0</span><span class="l">pannes résolues</span></div>
      <div class="stat" data-reveal style="--d:.15s"><span class="n" data-count="${fr.nCards}">0</span><span class="l">frictions notées</span></div>
      <div class="stat ring" data-reveal style="--d:.2s">
        <svg viewBox="0 0 52 52"><circle class="bg" cx="26" cy="26" r="22"/><circle class="fg" id="ring" cx="26" cy="26" r="22"/></svg>
        <div><span class="n" id="pct">0%</span><span class="l">révisé</span></div>
      </div>
    </div>

    <div class="doors">${doors}</div>
  </section>`;

  animatePipe($('.pipe', app));
  countUp();
  const pct = TOTAL_SECTIONS ? DONE.size / TOTAL_SECTIONS : 0;
  requestAnimationFrame(() => {
    const ring = $('#ring');
    if (ring) ring.style.strokeDashoffset = String(138 * (1 - pct));
    const el = $('#pct');
    if (el) el.textContent = Math.round(pct * 100) + '%';
  });
}

/* ---------------------------------------------------------------- animations */
function countUp() {
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count;
    if (RM) { el.textContent = to; return; }
    const t0 = performance.now(), D = 1000;
    const step = now => {
      const k = clamp((now - t0) / D, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

let typeToken = 0;
function typeIn(el, text) {
  if (!el) return;
  const me = ++typeToken;
  if (RM) { el.textContent = text; return; }
  el.innerHTML = '<span class="caret"></span>';
  let i = 0;
  const caret = $('.caret', el);
  const step = () => {
    if (me !== typeToken) return;
    i += 1;
    caret.insertAdjacentText('beforebegin', text[i - 1]);
    if (i < text.length) setTimeout(step, text[i - 1] === ' ' ? 8 : 15);
    else setTimeout(() => { if (me === typeToken) caret.remove(); }, 1400);
  };
  setTimeout(step, 340);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });

function observeAll() {
  $$('[data-reveal], .sec', app).forEach(el => {
    if (RM) { el.classList.add('in'); return; }
    io.observe(el);
  });
}

/* ---------------------------------------------------------------- rail */
function moveRailInk(secId) {
  const ink = $('#railink');
  if (!ink) return;
  const a = $(`.rail a[data-sec="${CSS.escape(secId)}"]`);
  if (!a) return;
  $$('.rail a').forEach(x => x.classList.toggle('cur', x === a));
  ink.style.height = a.offsetHeight + 'px';
  ink.style.transform = `translateY(${a.parentElement.offsetTop + a.offsetTop}px)`;
}

function updateRailProgress(doc) {
  const n = doc.sections.filter(s => DONE.has(sectionKey(doc, s))).length;
  const c = $('#railcount'), b = $('#railbar');
  if (c) c.textContent = `${n} / ${doc.sections.length} révisé`;
  if (b) b.style.width = (doc.sections.length ? n / doc.sections.length * 100 : 0) + '%';
}

/* ---------------------------------------------------------------- scroll */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#prog').style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
    if (state.view === 'home') return;
    const line = 130;
    let cur = null;
    $$('.sec', app).forEach(s => { if (s.getBoundingClientRect().top <= line) cur = s; });
    if (!cur) cur = $('.sec', app);
    if (cur && cur.dataset.sec !== onScroll.last) {
      onScroll.last = cur.dataset.sec;
      moveRailInk(cur.dataset.sec);
    }
  });
}

/* ---------------------------------------------------------------- vues */
const accentFor = view => ACCENT[state.theme][view] || ACCENT[state.theme].home;
const paintAccent = () => document.documentElement.style.setProperty('--acc', accentFor(state.view));

function buildTabs() {
  const items = [{ id: 'home', label: 'Accueil' }, ...DOCS.map(d => ({ id: d.id, label: d.label }))];
  $('#tabs').insertAdjacentHTML('beforeend', items.map(i =>
    `<button role="tab" data-go="${i.id}" data-tab="${i.id}">${i.label}</button>`).join(''));
}

function moveTabInk() {
  const b = $(`.tabs button[data-tab="${state.view}"]`);
  const ink = $('#tabink');
  $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
  if (!b) return;
  ink.style.width = b.offsetWidth + 'px';
  ink.style.transform = `translateX(${b.offsetLeft}px)`;
}

function syncHash(sec) {
  const h = state.view === 'home' ? '#/' : '#/' + state.view + (sec ? '/' + sec : '');
  if (location.hash !== h) history.replaceState(null, '', h);
}

function paint() {
  paintAccent();
  onScroll.last = null;
  if (state.view === 'home') renderHome();
  else renderDoc(BY_ID[state.view]);
  observeAll();
  moveTabInk();
  onScroll();
}

function setView(view, opts = {}) {
  if (!BY_ID[view] && view !== 'home') view = 'home';
  if (view === state.view) { if (opts.sec) jumpToSection(opts.sec); return; }

  cancelAnimationFrame(rafId);
  app.classList.add('swap');
  setTimeout(() => {
    state.view = view;
    paint();
    syncHash();
    app.classList.remove('swap');
    if (opts.sec) jumpToSection(opts.sec, true);
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, RM ? 0 : 190);
}

function jumpToSection(secId, instant) {
  const el = document.getElementById(`${state.view}--${secId}`);
  if (!el) return;
  syncHash(secId);
  const y = el.getBoundingClientRect().top + scrollY - 84;
  window.scrollTo({ top: y, behavior: instant || RM ? 'auto' : 'smooth' });
  moveRailInk(secId);
}

function jumpTo(docId, secId, elId) {
  const after = () => requestAnimationFrame(() => {
    const el = elId && document.getElementById(elId);
    const target = el || document.getElementById(`${docId}--${secId}`);
    if (!target) return;
    target.classList.add('in');
    const y = target.getBoundingClientRect().top + scrollY - 140;
    window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
    target.classList.add('flash');
    if (state.quiz) target.classList.add('open');
    setTimeout(() => target.classList.remove('flash'), 1600);
    const sec = target.closest('.sec');
    if (sec) moveRailInk(sec.dataset.sec);
  });

  if (state.view !== docId) { setView(docId); setTimeout(after, RM ? 10 : 260); }
  else after();
}

/* ---------------------------------------------------------------- recherche */
const INDEX = [];
DOCS.forEach(doc => doc.sections.forEach(sec => sec.blocks.forEach((b, bi) => {
  const uid = i => `${doc.id}--${sec.id}--${bi}-${i}`;
  const add = (id, t, sub, extra) => t && INDEX.push({
    d: doc.id, s: sec.id, id, t, sub: sub || '',
    sec: strip(sec.title), k: norm(t + ' ' + (sub || '')),
    kx: norm(extra || ''), ks: norm(sec.q),
  });
  if (b.type === 'list') b.items.forEach((it, i) =>
    add(uid(i), strip(it.term || it.text || ''), strip(it.def || (it.term ? '' : it.text) || '')));
  else if (b.type === 'entry') {
    // le remede compte autant que le symptome : il entre dans la cle secondaire
    const extra = [...b.fixes.map(f => f.q),
                   ...b.points.map(p => strip((p.term || '') + ' ' + (p.def || p.text || '')))].join(' ');
    add(uid(0), strip(b.title),
        b.bodyq || (b.points[0] ? strip(b.points[0].def || b.points[0].text || '') : ''), extra);
  } else if (b.type === 'steps') b.items.forEach((it, i) => add(uid(i), it.q, ''));
  else if (b.type === 'p') add(uid(0), strip(sec.title), b.q);
})));

function search(q) {
  const n = norm(q.trim());
  if (!n) return [];
  const words = n.split(/\s+/);
  return INDEX.map(e => {
    let sc = 0;
    for (const w of words) {
      const it = e.k.indexOf(w);
      if (it === 0) sc += 100;
      else if (it > 0) sc += 55 - Math.min(40, it / 4);
      else if (e.kx.includes(w)) sc += 24;
      else if (e.ks.includes(w)) sc += 14;
      else return null;
    }
    return { e, sc };
  }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 24).map(x => x.e);
}

function mark(text, q) {
  const n = norm(q.trim().split(/\s+/)[0] || '');
  const i = n ? norm(text).indexOf(n) : -1;
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + n.length)) + '</mark>' + esc(text.slice(i + n.length));
}

let sel = 0;
function renderResults(q) {
  const box = $('#results');
  const hits = search(q);
  sel = 0;
  if (!q.trim()) {
    box.innerHTML = `<div class="empty">Tapez pour chercher dans les ${INDEX.length} fiches des trois carnets.</div>`;
    return;
  }
  if (!hits.length) { box.innerHTML = `<div class="empty">Rien pour « ${esc(q)} ».</div>`; return; }
  box.innerHTML = hits.map((e, i) => `<button class="r ${i === 0 ? 'sel' : ''}" data-d="${e.d}" data-s="${e.s}"
      data-id="${e.id}" style="--d:${Math.min(i, 10) * 0.018}s">
    <div class="rp">${BY_ID[e.d].label} · ${esc(e.sec)}</div>
    <div class="rt">${mark(e.t, q)}</div>
    ${e.sub ? `<div class="rd">${esc(e.sub)}</div>` : ''}
  </button>`).join('');
}

function moveSel(d) {
  const rs = $$('#results .r');
  if (!rs.length) return;
  sel = (sel + d + rs.length) % rs.length;
  rs.forEach((r, i) => r.classList.toggle('sel', i === sel));
  rs[sel].scrollIntoView({ block: 'nearest' });
}

function openFinder() {
  $('#overlay').classList.add('open');
  const q = $('#q');
  q.value = '';
  renderResults('');
  setTimeout(() => q.focus(), 40);
}
const closeFinder = () => $('#overlay').classList.remove('open');

/* ---------------------------------------------------------------- reglages */
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  write(KEY.theme, state.theme);
  $('#ico-theme').innerHTML = state.theme === 'dark'
    ? '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'
    : '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>';
  paintAccent();
  $$('.door').forEach(d => d.style.setProperty('--dc', ACCENT[state.theme][d.dataset.go]));
}

function applyQuiz() {
  document.body.classList.toggle('quiz', state.quiz);
  $('#btn-quiz').classList.toggle('on', state.quiz);
  write(KEY.quiz, state.quiz);
  const m = $('.doc-head .meta span:last-child');
  if (m) m.innerHTML = `mode ${state.quiz ? '<b>révision</b>' : 'lecture'}`;
  if (!state.quiz) $$('.open', app).forEach(e => e.classList.remove('open'));
}

/* ---------------------------------------------------------------- evenements */
document.addEventListener('click', ev => {
  const go = ev.target.closest('[data-go]');
  if (go) { setView(go.dataset.go); return; }

  const railLink = ev.target.closest('.rail a');
  if (railLink) { ev.preventDefault(); jumpToSection(railLink.dataset.sec); return; }

  const done = ev.target.closest('.done-btn');
  if (done) {
    const k = done.dataset.done;
    DONE.has(k) ? DONE.delete(k) : DONE.add(k);
    saveDone();
    const on = DONE.has(k);
    done.classList.toggle('on', on);
    $('span', done).textContent = on ? 'révisé' : 'à revoir';
    const a = $(`.rail a[data-sec="${CSS.escape(done.dataset.sec)}"]`);
    if (a) a.classList.toggle('done', on);
    updateRailProgress(BY_ID[state.view]);
    return;
  }

  const res = ev.target.closest('.r');
  if (res) { closeFinder(); jumpTo(res.dataset.d, res.dataset.s, res.dataset.id); return; }

  if (ev.target.closest('#btn-search')) { openFinder(); return; }
  if (ev.target.closest('#btn-quiz')) { state.quiz = !state.quiz; applyQuiz(); return; }
  if (ev.target.closest('#btn-theme')) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); return; }
  if (ev.target.id === 'overlay') { closeFinder(); return; }

  if (state.quiz) {
    const card = ev.target.closest('.card.has-def, .case');
    if (card) card.classList.toggle('open');
  }
});

$('#q').addEventListener('input', e => renderResults(e.target.value));

document.addEventListener('keydown', e => {
  const open = $('#overlay').classList.contains('open');
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open ? closeFinder() : openFinder(); return; }
  if (open) {
    if (e.key === 'Escape') { closeFinder(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); return; }
    if (e.key === 'Enter') { const r = $$('#results .r')[sel]; if (r) r.click(); return; }
    return;
  }
  if (typing) return;
  if (e.key === '/') { e.preventDefault(); openFinder(); }
  else if (e.key.toLowerCase() === 'r') { state.quiz = !state.quiz; applyQuiz(); }
  else if (e.key.toLowerCase() === 't') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); }
});

addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { moveTabInk(); if (onScroll.last) moveRailInk(onScroll.last); });
addEventListener('hashchange', () => {
  const [d, s] = location.hash.replace(/^#\/?/, '').split('/');
  if (d && (BY_ID[d] || d === 'home')) setView(d, { sec: s });
});

/* ---------------------------------------------------------------- demarrage */
buildTabs();
applyTheme();
applyQuiz();
const [h0, h1] = location.hash.replace(/^#\/?/, '').split('/');
state.view = BY_ID[h0] ? h0 : 'home';
paint();
if (h1) setTimeout(() => jumpToSection(h1, true), 60);

})();
