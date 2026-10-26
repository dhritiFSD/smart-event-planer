'use strict';
/* =========================================================
   Planora AI – vanilla JavaScript
   1. Data & helpers   2. Forms   3. Views   4. Actions   5. Start
   ========================================================= */

/* ---------- 1. DATA & HELPERS ---------- */
const KEY = 'planora-ai-v1';
const TYPES = ['Wedding', 'Birthday', 'College Event', 'Community Gathering'];
const PHOTOS = {
  'Wedding': 'photo-1519741497674-611481863552',
  'Birthday': 'photo-1530103862676-de8c9debad1d',
  'College Event': 'photo-1523580846011-d3a5bc25702b',
  'Community Gathering': 'photo-1511795409834-ef04bbd61622'
};
const CATS = ['Venue', 'Catering', 'Decoration', 'Photography', 'Entertainment', 'Invitations', 'Clothing', 'Other'];
const VCATS = ['Venue', 'Catering', 'Photography', 'Decoration', 'Entertainment'];
const VICON = { Venue: 'landmark', Catering: 'utensils', Photography: 'camera', Decoration: 'wand-magic-sparkles', Entertainment: 'music' };
const STATUS = ['Enquired', 'Booked', 'Cancelled'];
const VIEWS = ['home', 'create', 'events', 'dashboard', 'ideas', 'budget', 'tasks', 'timeline', 'vendors'];
const TOOLS = ['dashboard', 'ideas', 'budget', 'tasks', 'timeline', 'vendors'];
const MILES = [ // [days from event date, title, icon]
  [-90, 'Lock the date and book the venue', 'landmark'],
  [-75, 'Set the budget and shortlist vendors', 'indian-rupee-sign'],
  [-60, 'Finalise guest list and theme', 'users'],
  [-45, 'Book catering, photography and decoration', 'utensils'],
  [-30, 'Send invitations', 'envelope'],
  [-14, 'Confirm final headcount and menu', 'list-check'],
  [-7, 'Reconfirm all vendors and timings', 'phone'],
  [-1, 'Venue walkthrough and packing', 'clipboard-check'],
  [0, 'Event day', 'champagne-glasses'],
  [3, 'Send thank-you notes and settle payments', 'heart']
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const money = n => inr.format(n || 0);
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const diff = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const fmt = s => s ? new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const sum = (arr, key) => arr.reduce((t, x) => t + Number(x[key] || 0), 0);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const pic = (type, w = 700) => `<img src="https://images.unsplash.com/${PHOTOS[type] || PHOTOS.Wedding}?auto=format&fit=crop&w=${w}&q=70" alt="${esc(type)} event" loading="lazy" onerror="this.remove()">`;

/* ---------- Storage (localStorage) ---------- */
let db = load();
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.events)) return d;
  } catch (err) { /* corrupted data: fall back to sample data */ }
  return seed();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (err) { toast('Could not save. Browser storage may be full or blocked.', 'error'); }
}
function seed() {
  const t = today(), w = uid(), b = uid();
  const ex = (e, title, category, amount) => ({ id: uid(), eventId: e, title, category, amount });
  const tk = (e, title, days, done = false) => ({ id: uid(), eventId: e, title, deadline: addDays(t, days), done });
  const vn = (e, category, name, phone, email, price, status) => ({ id: uid(), eventId: e, category, name, phone, email, price, status });
  const d = {
    active: w,
    events: [
      { id: w, name: "Aarav & Meera's Wedding", type: 'Wedding', date: addDays(t, 75), location: 'Udaipur, Rajasthan', guests: 250, budget: 1500000, theme: 'Royal ivory and gold', locked: true },
      { id: b, name: "Riya's 21st Birthday", type: 'Birthday', date: addDays(t, 20), location: 'Ahmedabad, Gujarat', guests: 60, budget: 80000, theme: 'Pastel garden party', locked: true }
    ],
    expenses: [
      ex(w, 'Venue deposit', 'Venue', 300000), ex(w, 'Caterer advance', 'Catering', 250000), ex(w, 'Mandap and floral decor', 'Decoration', 120000),
      ex(w, 'Photographer advance', 'Photography', 60000), ex(w, 'Invitation printing', 'Invitations', 25000),
      ex(b, 'Cake and desserts', 'Catering', 8000), ex(b, 'Balloon decor', 'Decoration', 12000)
    ],
    tasks: [
      tk(w, 'Pay venue deposit', -5, true), tk(w, 'Finalise guest list', 10), tk(w, 'Book makeup artist', 25), tk(w, 'Send invitations', 30), tk(w, 'Confirm catering menu', 45),
      tk(b, 'Send WhatsApp invites', 3), tk(b, 'Order the cake', 10), tk(b, 'Create the party playlist', 14)
    ],
    vendors: [
      vn(w, 'Venue', 'Lakeview Palace Hotel', '+91 98250 11223', 'events@lakeview.example', 450000, 'Booked'),
      vn(w, 'Catering', 'Annapurna Caterers', '+91 98790 44556', 'hello@annapurna.example', 600000, 'Booked'),
      vn(w, 'Photography', 'Candid Frames Studio', '+91 99090 77889', 'book@candidframes.example', 150000, 'Enquired'),
      vn(w, 'Decoration', 'Phool & Co. Decor', '+91 97120 33445', 'team@phoolco.example', 250000, 'Enquired'),
      vn(w, 'Entertainment', 'Dhol Beats Band', '+91 98240 55667', '', 80000, 'Enquired'),
      vn(b, 'Decoration', 'Balloon Bazaar', '+91 98980 12121', '', 12000, 'Booked'),
      vn(b, 'Entertainment', 'DJ Nikhil', '+91 97370 90909', 'nikhil@djnikhil.example', 15000, 'Enquired')
    ]
  };
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (err) { /* ignore */ }
  return d;
}

const cur = () => db.events.find(e => e.id === db.active);
const find = (coll, id) => db[coll].find(x => x.id === id);
const mine = coll => db[coll].filter(x => x.eventId === db.active);

function toast(msg, type = 'ok') {
  const d = document.createElement('div');
  d.className = 'toast ' + type;
  d.innerHTML = `<i class="fa-solid fa-${type === 'error' ? 'circle-exclamation' : 'circle-check'}"></i> ${esc(msg)}`;
  $('#toasts').append(d);
  setTimeout(() => d.remove(), 3400);
}

/* ---------- 2. FORMS (build, validate, dialog) ---------- */
const EVENT_F = [
  { name: 'name', label: 'Event name', type: 'text', req: 1, ph: "e.g. Riya's 21st Birthday" },
  { name: 'type', label: 'Event type', type: 'select', options: TYPES },
  { name: 'date', label: 'Event date', type: 'date', req: 1 },
  { name: 'location', label: 'Location', type: 'text', req: 1, ph: 'City or venue' },
  { name: 'guests', label: 'Guest count', type: 'number', req: 1, min: 1, ph: 'e.g. 120' },
  { name: 'budget', label: 'Budget (₹)', type: 'number', req: 1, min: 1, ph: 'e.g. 500000' },
  { name: 'theme', label: 'Theme', type: 'text', req: 1, ph: 'e.g. Royal gold and florals' }
];
const CREATE_F = EVENT_F.map(f => f.name === 'date' ? { ...f, future: 1 } : f);
const EXP_F = [
  { name: 'title', label: 'What was it for?', type: 'text', req: 1, ph: 'e.g. Venue deposit' },
  { name: 'category', label: 'Category', type: 'select', options: CATS },
  { name: 'amount', label: 'Amount (₹)', type: 'number', req: 1, min: 1 }
];
const TASK_F = [
  { name: 'title', label: 'Task', type: 'text', req: 1, ph: 'e.g. Book the DJ' },
  { name: 'deadline', label: 'Deadline', type: 'date', req: 1 }
];
const VEN_F = [
  { name: 'category', label: 'Category', type: 'select', options: VCATS },
  { name: 'name', label: 'Vendor name', type: 'text', req: 1 },
  { name: 'phone', label: 'Phone', type: 'tel', req: 1, ph: '+91 98765 43210' },
  { name: 'email', label: 'Email (optional)', type: 'email' },
  { name: 'price', label: 'Estimated price (₹)', type: 'number', req: 1, min: 0 },
  { name: 'status', label: 'Booking status', type: 'select', options: STATUS }
];
const CFG = {
  events: { f: EVENT_F, n: 'event' },
  expenses: { f: EXP_F, n: 'expense', d: { category: 'Venue' } },
  tasks: { f: TASK_F, n: 'task' },
  vendors: { f: VEN_F, n: 'vendor', d: { status: 'Enquired' } }
};

function fieldHTML(f, vals) {
  const v = vals && vals[f.name] != null ? vals[f.name] : '';
  const input = f.type === 'select'
    ? `<select name="${f.name}">${f.options.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`
    : `<input name="${f.name}" type="${f.type}" value="${esc(v)}" placeholder="${esc(f.ph || '')}" ${f.min != null ? `min="${f.min}"` : ''}>`;
  return `<label class="field"><span>${f.label}</span>${input}<small class="err" role="alert"></small></label>`;
}

// Returns an object of clean values, or null if something is invalid (errors are shown under each field)
function readForm(form, fields) {
  let ok = true; const out = {};
  fields.forEach(f => {
    const el = form.elements[f.name]; let v = el.value.trim(), m = '';
    if (f.req && !v) m = 'This field is required.';
    else if (f.type === 'number' && v !== '') {
      const n = Number(v);
      if (isNaN(n) || n < (f.min ?? 0)) m = `Enter a number ${f.min ?? 0} or higher.`;
      v = n;
    }
    else if (f.type === 'date' && f.future && v < today()) m = 'Choose today or a later date.';
    else if (f.type === 'tel' && !/^[+\d][\d\s-]{6,}$/.test(v)) m = 'Enter a valid phone number.';
    else if (f.type === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) m = 'Enter a valid email address.';
    el.closest('.field').querySelector('.err').textContent = m;
    if (m) ok = false;
    out[f.name] = v;
  });
  return ok ? out : null;
}

function openForm(title, fields, vals, onSave) {
  const d = $('#dlg');
  d.innerHTML = `<form id="dlgForm" novalidate><h3>${esc(title)}</h3>${fields.map(f => fieldHTML(f, vals)).join('')}
    <div class="row end"><button type="button" class="btn ghost" id="dlgCancel">Cancel</button><button class="btn">Save</button></div></form>`;
  $('#dlgCancel').onclick = () => d.close();
  $('#dlgForm').onsubmit = e => {
    e.preventDefault();
    const v = readForm(e.target, fields);
    if (v) { onSave(v); d.close(); }
  };
  d.showModal();
}

/* ---------- 3. VIEWS ---------- */
const empty = (icon, title, text, action = '') => `<div class="empty"><i class="fa-solid fa-${icon}"></i><h3>${title}</h3><p>${text}</p>${action}</div>`;
const head = (t, sub, btn = '') => `<div class="phead"><div><h2>${t}</h2><p class="mute">${sub}</p></div>${btn}</div>`;
const addBtn = (coll, label) => `<button class="btn" data-act="add" data-coll="${coll}"><i class="fa-solid fa-plus"></i> ${label}</button>`;
const rowBtns = (coll, id, noDel = false) => `<button class="ib" title="Edit" aria-label="Edit" data-act="edit" data-coll="${coll}" data-id="${id}"><i class="fa-solid fa-pen"></i></button> ${noDel ? '' : `<button class="ib del" title="Delete" aria-label="Delete" data-act="del" data-coll="${coll}" data-id="${id}"><i class="fa-solid fa-trash"></i></button>`}`;
const stat = (icon, big, label, cls = '') => `<div class="card stat ${cls}"><i class="fa-solid fa-${icon}"></i><div><strong>${big}</strong><span>${label}</span></div></div>`;

// Shows an empty state and returns null when there is no active event
function needEvent(box) {
  const e = cur();
  if (!e) box.innerHTML = empty('calendar-plus', 'No event yet', 'Create your first event to start planning.', '<a class="btn" href="#create">Plan My Event</a>');
  return e;
}

let pendingType = null, vf = 'All', chart = null;
const ideas = {};

/* --- Create --- */
function renderCreate() {
  if (pendingType) { $('#eventForm').elements.type.value = pendingType; pendingType = null; }
}

/* --- My Events --- */
function renderEvents() {
  const box = $('#view-events');
  const btn = '<a class="btn" href="#create"><i class="fa-solid fa-plus"></i> New event</a>';
  if (!db.events.length) { box.innerHTML = head('My events', 'Your saved event plans.', btn) + empty('calendar-xmark', 'No saved events', 'Create an event and it will appear here.', '<a class="btn" href="#create">Plan My Event</a>'); return; }
  box.innerHTML = head('My events', `${plural(db.events.length, 'saved plan')}.`, btn) + `<div class="vgrid">${db.events.map(e => {
    const d = diff(today(), e.date);
    const when = d < 0 ? 'Event completed' : d === 0 ? 'Happening today' : `${plural(d, 'day')} to go`;
    return `<article class="card evcard"><div class="pic">${pic(e.type, 600)}<span class="pill">${esc(e.type)}</span></div>
      <div class="evbody"><h3>${esc(e.name)}</h3>
      <div class="meta"><span><i class="fa-regular fa-calendar"></i>${fmt(e.date)} (${when})</span><span><i class="fa-solid fa-location-dot"></i>${esc(e.location)}</span>
      <span><i class="fa-solid fa-users"></i>${e.guests} guests</span><span><i class="fa-solid fa-indian-rupee-sign"></i>${money(e.budget)}</span><span><i class="fa-solid fa-palette"></i>${esc(e.theme)}</span></div>
      <div class="evact"><button class="btn" data-act="open" data-id="${e.id}">Open planner</button>${rowBtns('events', e.id, e.locked)}</div></div></article>`;
  }).join('')}</div>`;
}

/* --- Dashboard --- */
function renderDashboard() {
  const box = $('#view-dashboard'), e = needEvent(box); if (!e) return;
  const xs = mine('expenses'), ts = mine('tasks'), vs = mine('vendors');
  const spent = sum(xs, 'amount'), days = diff(today(), e.date), done = ts.filter(t => t.done).length;
  const next = ts.filter(t => !t.done).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  box.innerHTML = `<div class="banner">${pic(e.type, 1200)}<div class="shade"></div><div class="btxt"><span class="pill light">${esc(e.type)}</span><h2>${esc(e.name)}</h2>
    <div class="meta"><span><i class="fa-regular fa-calendar"></i> ${fmt(e.date)}</span><span><i class="fa-solid fa-location-dot"></i> ${esc(e.location)}</span><span><i class="fa-solid fa-users"></i> ${e.guests} guests</span><span><i class="fa-solid fa-palette"></i> ${esc(e.theme)}</span></div></div></div>
    <div class="stats4">
      ${stat('hourglass-half', days < 0 ? 'Done' : days === 0 ? 'Today' : days, days > 0 ? 'days to go' : 'event date')}
      ${stat('wallet', Math.round(spent / e.budget * 100) + '%', `${money(spent)} of ${money(e.budget)}`, spent > e.budget ? 'bad' : '')}
      ${stat('list-check', `${done}/${ts.length}`, 'tasks completed')}
      ${stat('handshake', `${vs.filter(v => v.status === 'Booked').length}/${vs.length}`, 'vendors booked')}
    </div>
    <div class="split"><div class="card"><h3>Up next</h3>${next.length ? `<ul class="list">${next.map(t => `<li><div class="grow"><b>${esc(t.title)}</b><small class="mute">Due ${fmt(t.deadline)}</small></div></li>`).join('')}</ul>` : empty('circle-check', 'All caught up', 'No pending tasks. Add one in the Tasks tab.')}</div>
    <div class="card"><h3>Quick actions</h3><div class="quick">
      <a class="btn ghost" href="#ideas"><i class="fa-solid fa-lightbulb"></i> Get ideas</a><a class="btn ghost" href="#budget"><i class="fa-solid fa-indian-rupee-sign"></i> Budget</a>
      <a class="btn ghost" href="#tasks"><i class="fa-solid fa-list-check"></i> Tasks</a><a class="btn ghost" href="#timeline"><i class="fa-solid fa-timeline"></i> Timeline</a>
      <a class="btn ghost" href="#vendors"><i class="fa-solid fa-store"></i> Vendors</a></div></div></div>`;
}

/* --- AI Ideas ---
   FUTURE AI: replace the body of getIdeas() with a real API call, for example:
   const res = await fetch('/api/ideas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(event) });
   return await res.json();
   Keep the same return shape: { tip, decoration[], food[], venue[], entertainment[] }.   */
async function getIdeas(event) {
  await new Promise(r => setTimeout(r, 800)); // pretend to think
  return demoIdeas(event);
}

const BANK = {
  'Wedding': {
    decoration: ['Marigold and jasmine mandap with a fairy-light canopy', 'Floating candles and a petal-lined aisle', 'Mirror-work backdrop with brass diyas'],
    food: ['Live chaat and dosa counters', 'Regional thali with Gujarati, Rajasthani and Punjabi dishes', 'Dessert bar with jalebi-rabri and kulfi'],
    venue: ['Heritage haveli courtyard', 'Lakeside garden lawn with a covered stage', 'Banquet hall with an open-air pheras area'],
    fun: ['Dhol band for the baraat', 'Sangeet with choreographed family dances', 'Live ghazal singer for the reception']
  },
  'Birthday': {
    decoration: ['Balloon arch with a photo wall', 'Fairy lights, bunting and a neon name sign', 'Table flowers with themed cupcakes'],
    food: ['Mini burgers, pizza bites and a mocktail bar', 'Custom cake with a dessert-jar table', 'Street-food stalls: pav bhaji, pani puri, ice-cream rolls'],
    venue: ['Rooftop terrace', 'Café with a private party room', 'Garden lawn or farmhouse'],
    fun: ['DJ with dance-floor games', 'Photo booth with props', 'Karaoke and a surprise video wall']
  },
  'College Event': {
    decoration: ['LED screens with a bold stage backdrop', 'Standees, banners and a selfie corner', 'Neon-light entrance arch'],
    food: ['Food-truck lane with chai and snacks', 'Packed combo meals for volunteers', 'Cold-coffee and sandwich counter'],
    venue: ['College auditorium', 'Open-air amphitheatre', 'Seminar hall plus courtyard stalls'],
    fun: ['Battle of the bands', 'Stand-up or open-mic slot', 'Treasure hunt and quiz rounds']
  },
  'Community Gathering': {
    decoration: ['Rangoli at the entrance with diyas', 'Cloth banners and potted plants', 'Community art wall painted by kids'],
    food: ['Shared community meal', 'Potluck with a recipe-card table', 'Chai and snack stalls by local vendors'],
    venue: ['Community hall', 'Neighbourhood park or ground', 'School or temple courtyard'],
    fun: ['Folk dance and garba circle', 'Kids’ games and a raffle', 'Local musicians on a small stage']
  }
};
const shuffle = a => [...a].sort(() => Math.random() - .5);

function demoIdeas(e) {
  const b = BANK[e.type] || BANK.Wedding, pp = Math.round(e.budget / e.guests);
  const tier = pp < 1500 ? 'budget-friendly' : pp < 5000 ? 'mid-range' : 'premium';
  return {
    tip: `${money(pp)} per guest points to a ${tier} plan. A common split is about 40% food, 25% venue and 15% decoration.`,
    decoration: [`Build a "${e.theme}" colour story across flowers, lights and signage`, ...shuffle(b.decoration).slice(0, 2)],
    food: shuffle(b.food).slice(0, 3),
    venue: shuffle(b.venue).slice(0, 2).map(v => `${v} in ${e.location}`).concat(e.guests > 150 ? [`Pick a venue with two entry points for ${e.guests} guests`] : []),
    entertainment: shuffle(b.fun).slice(0, 3)
  };
}

function renderIdeas() {
  const box = $('#view-ideas'), e = needEvent(box); if (!e) return;
  const r = ideas[e.id];
  const meta = { decoration: ['Decoration', 'wand-magic-sparkles'], food: ['Food and drinks', 'utensils'], venue: ['Venue', 'landmark'], entertainment: ['Entertainment', 'music'] };
  const btn = `<button class="btn" data-act="gen"><i class="fa-solid fa-wand-magic-sparkles"></i> ${r ? 'Regenerate ideas' : 'Generate ideas'}</button>`;
  box.innerHTML = head('AI event ideas', `Personalised suggestions for ${esc(e.name)}.`, btn) + (r
    ? `<div class="tip"><i class="fa-solid fa-circle-info"></i> ${esc(r.tip)}</div><div class="ideas">${Object.keys(meta).map(k => `<div class="card"><h3><i class="fa-solid fa-${meta[k][1]}"></i>${meta[k][0]}</h3>
        <ul class="list">${r[k].map(t => `<li><span class="grow">${esc(t)}</span><button class="ib" title="Add to checklist" aria-label="Add to checklist" data-act="idea" data-text="${esc(t)}"><i class="fa-solid fa-plus"></i></button></li>`).join('')}</ul></div>`).join('')}</div>`
    : empty('lightbulb', 'No ideas yet', 'Press Generate ideas to get decoration, food, venue and entertainment suggestions based on your event.'));
}

async function generate() {
  const e = cur(); if (!e) return;
  $('#view-ideas .phead').insertAdjacentHTML('afterend', '<div class="loading"><span class="spin"></span> Planora AI is thinking…</div>');
  try { ideas[e.id] = await getIdeas(e); }
  catch (err) { toast('Could not generate ideas. Please try again.', 'error'); }
  if (location.hash === '#ideas') renderIdeas();
}

/* --- Budget --- */
function renderBudget() {
  if (chart) { chart.destroy(); chart = null; }
  const box = $('#view-budget'), e = needEvent(box); if (!e) return;
  const xs = mine('expenses'), spent = sum(xs, 'amount'), left = e.budget - spent;
  const used = Math.round(spent / e.budget * 100);
  box.innerHTML = head('Budget planner', `Track spending for ${esc(e.name)}.`, addBtn('expenses', 'Add expense')) +
    `<div class="stats4">${stat('wallet', money(e.budget), 'total budget')}${stat('receipt', money(spent), 'total expenses')}${stat('piggy-bank', money(left), left < 0 ? 'over budget' : 'remaining budget', left < 0 ? 'bad' : '')}</div>
    <div class="card"><div class="meter ${left < 0 ? 'over' : ''}"><i style="width:${Math.min(100, used)}%"></i></div><p class="mute small" style="margin-top:8px">${used}% of your budget is used${left < 0 ? `. You are ${money(-left)} over budget.` : '.'}</p></div>
    <div class="split"><div class="card"><h3>Spending by category</h3>${xs.length ? '<div class="chartbox"><canvas id="chart"></canvas></div>' : empty('chart-pie', 'No chart yet', 'Add an expense to see where the money goes.')}</div>
    <div class="card"><h3>Expenses</h3>${xs.length ? `<ul class="list">${xs.map(x => `<li><div class="grow"><b>${esc(x.title)}</b><span class="pill">${esc(x.category)}</span></div><b>${money(x.amount)}</b><span>${rowBtns('expenses', x.id)}</span></li>`).join('')}</ul>` : empty('receipt', 'No expenses', 'Log your first expense to start tracking.')}</div></div>`;
  drawChart(xs);
}

function drawChart(xs) {
  if (!xs.length) return;
  const canvas = $('#chart');
  if (!window.Chart) { canvas.parentNode.innerHTML = '<p class="mute">The chart needs an internet connection to load Chart.js.</p>'; return; }
  const by = {}; xs.forEach(x => by[x.category] = (by[x.category] || 0) + Number(x.amount));
  chart = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: Object.keys(by), datasets: [{ data: Object.values(by), backgroundColor: ['#5B2E9E', '#7B4FD0', '#A583E8', '#C9B2F2', '#8E6BBF', '#3E1F70', '#D8C7F5', '#B79AE0'], borderWidth: 3, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => ` ${c.label}: ${money(c.parsed)}` } } } }
  });
}

/* --- Tasks --- */
function renderTasks() {
  const box = $('#view-tasks'), e = needEvent(box); if (!e) return;
  const ts = mine('tasks').sort((a, b) => a.done - b.done || a.deadline.localeCompare(b.deadline));
  const done = ts.filter(t => t.done).length, pct = ts.length ? Math.round(done / ts.length * 100) : 0;
  box.innerHTML = head('Task checklist', `Things to do for ${esc(e.name)}.`, addBtn('tasks', 'Add task')) +
    `<div class="card"><div class="row" style="justify-content:space-between"><b>${done} of ${ts.length} done</b><b>${pct}%</b></div><div class="meter" style="margin:10px 0 18px"><i style="width:${pct}%"></i></div>
    ${ts.length ? `<ul class="list">${ts.map(t => {
      const d = diff(today(), t.deadline);
      const tag = t.done ? 'Completed' : d < 0 ? `Overdue by ${plural(-d, 'day')}` : d === 0 ? 'Due today' : `Due in ${plural(d, 'day')}`;
      return `<li class="task ${t.done ? 'done' : ''}"><button class="check" data-act="toggle" data-id="${t.id}" aria-label="${t.done ? 'Mark as not done' : 'Mark as done'}"><i class="fa-solid fa-check"></i></button>
        <div class="grow"><b>${esc(t.title)}</b><small>${fmt(t.deadline)}</small><small class="${!t.done && d < 0 ? 'late' : ''}">${tag}</small></div><span>${rowBtns('tasks', t.id)}</span></li>`;
    }).join('')}</ul>` : empty('clipboard-list', 'No tasks yet', 'Add a task, or build a starter list from the Timeline tab.')}</div>`;
}

/* --- Timeline --- */
function renderTimeline() {
  const box = $('#view-timeline'), e = needEvent(box); if (!e) return;
  let nextFound = false;
  const btn = '<button class="btn" data-act="ms"><i class="fa-solid fa-list-check"></i> Add upcoming steps to checklist</button>';
  box.innerHTML = head('Event timeline', `Milestones counted back from ${fmt(e.date)}.`, btn) + `<ul class="tl">${MILES.map(([d, title, icon]) => {
    const date = addDays(e.date, d), delta = diff(today(), date);
    let cls = 'up', label = `In ${plural(delta, 'day')}`;
    if (delta < 0) { cls = 'past'; label = 'Passed'; }
    else { if (!nextFound) { cls = 'next'; nextFound = true; } if (delta === 0) label = 'Today'; }
    return `<li class="${cls}"><b><i class="fa-solid fa-${icon}"></i>${title}</b><div class="when"><span>${fmt(date)}</span><span>${label}${cls === 'next' ? ' (next up)' : ''}</span></div></li>`;
  }).join('')}</ul>`;
}

/* --- Vendors --- */
function renderVendors() {
  const box = $('#view-vendors'), e = needEvent(box); if (!e) return;
  const vs = mine('vendors'), shown = vf === 'All' ? vs : vs.filter(v => v.category === vf);
  const est = sum(vs.filter(v => v.status !== 'Cancelled'), 'price'), booked = vs.filter(v => v.status === 'Booked');
  box.innerHTML = head('Vendors', `Contacts and bookings for ${esc(e.name)}.`, addBtn('vendors', 'Add vendor')) +
    `<div class="stats4">${stat('receipt', money(est), 'estimated total')}${stat('handshake', plural(booked.length, 'vendor'), 'booked, worth ' + money(sum(booked, 'price')))}</div>
    <div class="chips">${['All', ...VCATS].map(c => `<button class="chip ${c === vf ? 'on' : ''}" data-act="filter" data-val="${c}">${c}</button>`).join('')}</div>` +
    (!vs.length ? empty('store', 'No vendors yet', 'Add a venue, caterer, photographer, decorator or entertainer.')
      : !shown.length ? empty('filter', `No ${vf.toLowerCase()} vendors`, 'Try another category or add a new vendor.')
      : `<div class="vgrid">${shown.map(v => `<article class="card vcard"><div class="vtop"><span class="cat"><i class="fa-solid fa-${VICON[v.category]}"></i> ${esc(v.category)}</span>
        <button class="badge ${v.status}" data-act="cycle" data-id="${v.id}" title="Click to change status">${v.status}</button></div>
        <h3>${esc(v.name)}</h3><a href="tel:${esc(v.phone.replace(/\s/g, ''))}"><i class="fa-solid fa-phone"></i> ${esc(v.phone)}</a>
        ${v.email ? `<a href="mailto:${esc(v.email)}"><i class="fa-solid fa-envelope"></i> ${esc(v.email)}</a>` : ''}
        <div class="vtop"><span class="price">${money(v.price)}</span><span>${rowBtns('vendors', v.id)}</span></div></article>`).join('')}</div>`);
}

/* ---------- Router ---------- */
const RENDER = { create: renderCreate, events: renderEvents, dashboard: renderDashboard, ideas: renderIdeas, budget: renderBudget, tasks: renderTasks, timeline: renderTimeline, vendors: renderVendors };

function render() {
  if (!db.events.some(e => e.id === db.active)) db.active = db.events[0] ? db.events[0].id : null;
  let v = location.hash.slice(1) || 'home';
  if (!VIEWS.includes(v)) v = 'home';
  $$('.view').forEach(s => s.hidden = s.id !== 'view-' + v);
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === (TOOLS.includes(v) ? 'dashboard' : v)));
  $$('[data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === v));
  $('#toolbar').hidden = !TOOLS.includes(v);
  $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false');
  $('#activeEvent').innerHTML = db.events.map(e => `<option value="${e.id}" ${e.id === db.active ? 'selected' : ''}>${esc(e.name)}</option>`).join('') || '<option>No events yet</option>';
  $('#activeEvent').disabled = !db.events.length;
  if (RENDER[v]) RENDER[v]();
}

/* ---------- 4. ACTIONS (one click handler for every button) ---------- */
function removeItem(coll, id) {
  if (coll === 'events') {
    db.events = db.events.filter(e => e.id !== id);
    ['expenses', 'tasks', 'vendors'].forEach(c => db[c] = db[c].filter(x => x.eventId !== id));
    delete ideas[id];
  } else db[coll] = db[coll].filter(x => x.id !== id);
  save(); render();
}

const ACT = {
  toggle: d => { const t = find('tasks', d.id); t.done = !t.done; save(); render(); },
  cycle: d => { const v = find('vendors', d.id); v.status = STATUS[(STATUS.indexOf(v.status) + 1) % STATUS.length]; save(); toast(`${v.name} marked as ${v.status.toLowerCase()}.`); render(); },
  open: d => { db.active = d.id; save(); location.hash = '#dashboard'; },
  filter: d => { vf = d.val; render(); },
  gen: generate,
  idea: d => { db.tasks.push({ id: uid(), eventId: db.active, title: d.text, deadline: cur().date, done: false }); save(); toast('Added to your checklist.'); },
  ms: () => {
    const e = cur(); let n = 0;
    MILES.forEach(([days, title]) => {
      const date = addDays(e.date, days);
      if (date < today() || db.tasks.some(x => x.eventId === e.id && x.title === title)) return;
      db.tasks.push({ id: uid(), eventId: e.id, title, deadline: date, done: false }); n++;
    });
    save();
    if (n) toast(`${plural(n, 'step')} added to your checklist.`); else toast('Nothing new to add. Your checklist already has these steps.', 'error');
  },
  reset: () => { if (confirm('Reset everything back to the demo sample data?')) { localStorage.removeItem(KEY); location.reload(); } }
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-type]'); if (t) pendingType = t.dataset.type;
  const b = e.target.closest('[data-act]'); if (!b) return;
  const { act, coll, id } = b.dataset, c = CFG[coll];
  if (act === 'add') {
    if (!db.active) { toast('Create an event first.', 'error'); return; }
    openForm('Add ' + c.n, c.f, c.d, v => { db[coll].push({ id: uid(), eventId: db.active, ...v }); save(); toast(cap(c.n) + ' added.'); render(); });
  } else if (act === 'edit') {
    const item = find(coll, id);
    openForm('Edit ' + c.n, c.f, item, v => { Object.assign(item, v); save(); toast(cap(c.n) + ' updated.'); render(); });
  } else if (act === 'del') {
    const target = find(coll, id);
    if (target && target.locked) { toast('Sample events are protected. Create your own event to delete it.', 'error'); return; }
    const msg = coll === 'events' ? 'Delete this event and all its expenses, tasks and vendors?' : `Delete this ${c.n}?`;
    if (confirm(msg)) { removeItem(coll, id); toast(cap(c.n) + ' deleted.'); }
  } else if (ACT[act]) {
    ACT[act](b.dataset);
    if (act === 'ms' || act === 'idea') render();
  }
});

/* ---------- 5. START ---------- */
$('#eventForm').innerHTML = CREATE_F.map(f => fieldHTML(f)).join('') + '<button class="btn lg">Create event</button>';
$('#eventForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = readForm(e.target, CREATE_F);
  if (!v) { toast('Please fix the highlighted fields.', 'error'); return; }
  const ev = { id: uid(), ...v };
  db.events.push(ev); db.active = ev.id; save();
  e.target.reset();
  toast('Event created. Here are some ideas to start with.');
  location.hash = '#ideas';
});
$('#activeEvent').addEventListener('change', e => { db.active = e.target.value; save(); render(); });
$('#burger').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); });
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();
