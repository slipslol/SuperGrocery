const BASE = (window.HA_BASE || '').replace(/\/+$/, '');

const CAT_ORDER = ['Produce','Dairy','Meat','Bakery','Pantry','Frozen','Beverages','Other'];
const CAT_COLOR = {
  Produce:'#22c55e', Dairy:'#60a5fa', Meat:'#f87171', Bakery:'#fb923c',
  Pantry:'#fbbf24', Frozen:'#818cf8', Beverages:'#34d399', Other:'#6b7280',
};
const CAT_EMOJI = {
  Produce:'🥦', Dairy:'🥛', Meat:'🥩', Bakery:'🍞',
  Pantry:'🥫', Frozen:'🧊', Beverages:'🥤', Other:'📦',
};
const ITEM_EMOJI = {
  'apples':'🍎','apple juice':'🍎','apple cider vinegar':'🍏',
  'bananas':'🍌','oranges':'🍊','lemons':'🍋','limes':'🍋',
  'strawberries':'🍓','blueberries':'🫐','raspberries':'🍓',
  'red grapes':'🍇','green grapes':'🍇','grapes':'🍇',
  'watermelon':'🍉','cantaloupe':'🍈','peaches':'🍑','pears':'🍐',
  'plums':'🍑','cherries':'🍒','pineapple':'🍍','mango':'🥭',
  'avocado':'🥑','tomatoes':'🍅','cherry tomatoes':'🍅','cucumber':'🥒',
  'zucchini':'🥒','broccoli':'🥦','cauliflower':'🥦','carrots':'🥕',
  'celery':'🥬','bell peppers':'🫑','jalapeños':'🌶️','spinach':'🥬',
  'kale':'🥬','romaine lettuce':'🥬','cabbage':'🥬','mushrooms':'🍄',
  'onions':'🧅','red onion':'🧅','green onions':'🧅','garlic':'🧄',
  'potatoes':'🥔','sweet potatoes':'🍠','corn on the cob':'🌽',
  'green beans':'🫘','brussels sprouts':'🥦',
  'asparagus':'🌿','beets':'🫚','edamame':'🫘',
  'whole milk':'🥛','2% milk':'🥛','almond milk':'🥛','oat milk':'🥛',
  'half & half':'🥛','heavy cream':'🥛','sour cream':'🫙',
  'greek yogurt':'🫙','plain yogurt':'🫙','flavored yogurt cups':'🫙',
  'butter':'🧈','cream cheese':'🧀','cheddar cheese':'🧀',
  'shredded cheddar':'🧀','mozzarella':'🧀','parmesan':'🧀',
  'swiss cheese':'🧀','provolone':'🧀','pepper jack':'🧀',
  'colby jack':'🧀','american cheese slices':'🧀','cottage cheese':'🫙',
  'ricotta':'🫙','eggs':'🥚','string cheese':'🧀','coffee creamer':'☕',
  'chicken breast':'🍗','chicken thighs':'🍗','chicken wings':'🍗',
  'whole chicken':'🐔','ground beef 80/20':'🥩','ground beef 90/10':'🥩',
  'ground turkey':'🦃','ground pork':'🥩','ribeye steak':'🥩',
  'ny strip steak':'🥩','sirloin steak':'🥩','flank steak':'🥩',
  'chuck roast':'🥩','pork chops':'🥩','pork tenderloin':'🥩',
  'baby back ribs':'🍖','bacon':'🥓','turkey bacon':'🥓',
  'ham':'🍖','deli turkey':'🥙','deli ham':'🥙',
  'hot dogs':'🌭','bratwurst':'🌭','italian sausage':'🌭',
  'breakfast sausage':'🌭','pepperoni':'🍕','salmon fillet':'🐟',
  'tilapia':'🐟','shrimp':'🦐','cod':'🐟','tuna steak':'🐟',
  'canned tuna':'🐟','canned salmon':'🐟','lamb chops':'🍖',
  'white bread':'🍞','whole wheat bread':'🍞','sourdough bread':'🥖',
  'rye bread':'🍞','brioche':'🥐','bagels':'🥯',
  'english muffins':'🫓','croissants':'🥐','dinner rolls':'🥖',
  'hamburger buns':'🍔','hot dog buns':'🌭','flour tortillas':'🫓',
  'corn tortillas':'🌮','pita bread':'🫓','naan':'🫓',
  'baguette':'🥖','blueberry muffins':'🧁','donuts':'🍩',
  'cinnamon rolls':'🥐','biscuits':'🧇',
  'coffee':'☕','tea bags':'🍵','hot cocoa mix':'☕',
  'orange juice':'🍊','cranberry juice':'🍷',
  'lemonade':'🍋','iced tea':'🧋','green tea':'🍵',
  'sports drink':'🏃','energy drink':'⚡','soda (cola)':'🥤',
  'diet soda':'🥤','root beer':'🍺','ginger ale':'🥤',
  'beer':'🍺','red wine':'🍷','white wine':'🥂',
  'hard seltzer':'🍹','kombucha':'🍶','water bottles':'💧',
  'sparkling water':'💧',
  'peanut butter':'🥜','almond butter':'🥜',
  'honey':'🍯','maple syrup':'🍁','olive oil':'🫒',
  'pasta sauce':'🍅','cereal':'🥣','oatmeal':'🥣',
  'granola':'🥣','chocolate chips':'🍫',
  'ice cream':'🍦','frozen yogurt':'🍦','popsicles':'🧊','ice cream bars':'🍦',
  'frozen pizza':'🍕','french fries':'🍟','tater tots':'🍟',
  'frozen waffles':'🧇','frozen pancakes':'🥞',
  'frozen chicken nuggets':'🍗','mac and cheese':'🧀',
  'ramen noodles':'🍜','white rice':'🍚','brown rice':'🍚',
  'paper towels':'🧻','toilet paper':'🧻','dish soap':'🧴',
  'laundry detergent':'🧺','shampoo':'🧴','conditioner':'🧴',
  'body wash':'🧴','toothpaste':'🪥','hand soap':'🧼',
  'tissues':'🤧','trash bags':'🗑️',
};

// ── State ────────────────────────────────────────────────────
let allItems = [];
let mode = 'building'; // 'building' | 'shopping' | 'done'
let storeSheetContext = 'filter'; // 'filter' | 'start'
let shoppingStore = 'all';
let storeFilter = 'all';
let activeTab = 'browse';
let searchQuery = '';
let browseFilter = 'all';
let editingItem = null;
let toastTimer = null;

// ── Derived ──────────────────────────────────────────────────
const listItems = () => allItems.filter(i => i.in_list);
const unchecked = () => listItems().filter(i => !i.checked).length;

function visibleItems() {
  let items = allItems;
  if (storeFilter !== 'all') items = items.filter(i => !i.store || i.store === storeFilter);
  if (browseFilter !== 'all') items = items.filter(i => i.category === browseFilter);
  const q = searchQuery.trim().toLowerCase();
  if (q) items = items.filter(i => i.name.toLowerCase().includes(q));
  return items;
}

function getEmoji(item) {
  return ITEM_EMOJI[item.name.toLowerCase()] || CAT_EMOJI[item.category] || '🛒';
}

function qtyLabel(item) {
  const q = item.quantity, u = item.unit;
  if (q && q !== '1' && u) return `${q} ${u}`;
  if (q && q !== '1') return q;
  if (u) return u;
  return '';
}

// ── API ──────────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? {'Content-Type':'application/json'} : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

async function loadAll() {
  try {
    allItems = await api('GET', '/api/items');
    render();
  } catch (e) {
    toast(`Failed to load: ${e.message}`);
  }
}

// ── Mode machine ─────────────────────────────────────────────
function setMode(newMode) {
  mode = newMode;
  const barBuild = document.getElementById('barBuild');
  const barShop  = document.getElementById('barShop');
  const buildEl  = document.getElementById('buildMode');
  const shopEl   = document.getElementById('shopMode');
  const doneEl   = document.getElementById('doneMode');

  barBuild.classList.toggle('hidden', newMode !== 'building');
  barShop.classList.toggle('hidden', newMode === 'building');

  buildEl.classList.toggle('active',      newMode === 'building');
  buildEl.classList.toggle('slide-right', newMode !== 'building');
  shopEl.classList.toggle('active',       newMode === 'shopping');
  shopEl.classList.toggle('slide-right',  newMode !== 'shopping');
  doneEl.classList.toggle('active',       newMode === 'done');
  doneEl.classList.toggle('slide-right',  newMode !== 'done');

  if (newMode === 'shopping') {
    document.getElementById('shopStoreName').textContent =
      shoppingStore !== 'all' ? shoppingStore : 'Shopping';
    renderShop();
  } else if (newMode === 'done') {
    showDoneScreen();
    celebrate();
  } else if (newMode === 'building') {
    updateCTA();
    render();
  }
}

function showDoneScreen() {
  const items = listItems();
  const checked = items.filter(i => i.checked).length;
  const storePart = shoppingStore !== 'all' ? ` from ${shoppingStore}` : '';
  document.getElementById('doneSub').textContent = checked === items.length
    ? `You picked up all ${items.length} item${items.length !== 1 ? 's' : ''}${storePart} 🎉`
    : `${checked} of ${items.length} item${items.length !== 1 ? 's' : ''} picked up${storePart}`;
}

// ── Render ───────────────────────────────────────────────────
function render() {
  updateBadge();
  updateCTA();
  if (mode === 'building') {
    if (activeTab === 'browse' || isDesktop()) renderBrowse();
    if (activeTab === 'list'   || isDesktop()) renderList();
  } else if (mode === 'shopping') {
    renderShop();
  }
}

function isDesktop() { return window.innerWidth >= 1024; }

function updateBadge() {
  const n = listItems().length;
  document.getElementById('badge').textContent = n > 0 ? n : '';
}

function updateCTA() {
  const n = listItems().length;
  document.getElementById('ctaCount').textContent = `${n} item${n !== 1 ? 's' : ''}`;
  document.getElementById('ctaFloat').classList.toggle('visible', n > 0 && mode === 'building');
}

// ── Browse view ──────────────────────────────────────────────
function renderBrowse() {
  const container = document.getElementById('browseList');
  const items = visibleItems();
  const q = searchQuery.trim();

  if (!items.length && !q) {
    container.innerHTML = `<div class="browse-empty"><div class="e-icon">🔍</div><p>No items found</p></div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  if (q) {
    const sorted = [...items].sort((a, b) => {
      if (b.in_list !== a.in_list) return b.in_list - a.in_list;
      return a.name.localeCompare(b.name);
    });
    sorted.forEach(item => frag.appendChild(browseRow(item)));

    const exactMatch = allItems.some(i => i.name.toLowerCase() === q.toLowerCase());
    if (!exactMatch) {
      const row = document.createElement('div');
      row.className = 'add-custom';
      row.innerHTML = `<span class="add-custom-icon">➕</span><span class="add-custom-text">Add "<em>${esc(q)}</em>" to list</span>`;
      row.addEventListener('click', () => addCustom(q));
      frag.appendChild(row);
    }
  } else {
    const cats = browseFilter === 'all' ? CAT_ORDER : [browseFilter];
    cats.forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      if (!catItems.length) return;
      const group = document.createElement('div');
      group.className = 'cat-group';
      group.innerHTML = `
        <div class="cat-hdr">
          <div class="cat-dot" style="background:${CAT_COLOR[cat]}"></div>
          <span class="cat-hdr-name">${cat}</span>
          <span class="cat-hdr-count">${catItems.length}</span>
        </div>`;
      catItems.forEach(item => group.appendChild(browseRow(item)));
      frag.appendChild(group);
    });
  }

  container.innerHTML = '';
  container.appendChild(frag);
}

function browseRow(item) {
  const el = document.createElement('div');
  el.className = 'browse-item' + (item.in_list ? ' in-list' : '');
  el.dataset.id = item.id;

  const qty = qtyLabel(item);
  const meta = [
    qty ? `<span class="browse-qty">${esc(qty)}</span>` : '',
    item.notes ? `<span class="browse-notes">${esc(item.notes)}</span>` : '',
    item.store ? `<span class="browse-store-tag">${esc(item.store)}</span>` : '',
  ].filter(Boolean).join('');

  el.innerHTML = `
    <span class="browse-emoji">${getEmoji(item)}</span>
    <div class="browse-body">
      <div class="browse-name">${esc(item.name)}</div>
      ${meta ? `<div class="browse-meta">${meta}</div>` : ''}
    </div>
    <div class="browse-toggle"></div>
    <button class="browse-add ${item.in_list ? 'in-list-btn' : ''}" aria-label="${item.in_list ? 'Remove' : 'Add'}">
      <svg viewBox="0 0 24 24">${item.in_list
        ? '<path d="M9 16.17L5.53 12.7a1 1 0 0 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a1 1 0 0 0-1.41-1.41L9 16.17z"/>'
        : '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>'}
      </svg>
    </button>`;

  el.addEventListener('click', () => toggleList(item));
  return el;
}

// ── List view ────────────────────────────────────────────────
function renderList() {
  const container = document.getElementById('shoppingList');
  const empty = document.getElementById('emptyList');
  const items = listItems();

  const summary = document.getElementById('listSummary');
  const done = items.filter(i => i.checked).length;
  summary.textContent = items.length === 0 ? '0 items'
    : done > 0 ? `${items.length - done} left · ${done} done`
    : `${items.length} item${items.length !== 1 ? 's' : ''}`;

  if (!items.length) {
    container.innerHTML = '';
    container.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  const cats = CAT_ORDER.filter(c => items.some(i => i.category === c));

  cats.forEach(cat => {
    const catItems = items.filter(i => i.category === cat);
    const group = document.createElement('div');
    group.className = 'cat-group';
    group.innerHTML = `
      <div class="cat-hdr">
        <div class="cat-dot" style="background:${CAT_COLOR[cat]}"></div>
        <span class="cat-hdr-name">${cat}</span>
        <span class="cat-hdr-count">${catItems.filter(i=>!i.checked).length}/${catItems.length}</span>
      </div>`;
    [...catItems].sort((a,b) => a.checked - b.checked).forEach(item => {
      group.appendChild(listRow(item));
    });
    frag.appendChild(group);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

function listRow(item) {
  const el = document.createElement('div');
  el.className = 'list-item' + (item.checked ? ' checked' : '');
  el.dataset.id = item.id;

  const qty = qtyLabel(item);
  const meta = [
    qty ? `<span class="list-qty">${esc(qty)}</span>` : '',
    item.notes ? `<span class="list-notes">${esc(item.notes)}</span>` : '',
    item.store ? `<span class="list-store-tag">${esc(item.store)}</span>` : '',
  ].filter(Boolean).join('');

  el.innerHTML = `
    <div class="list-check" role="checkbox" aria-checked="${!!item.checked}" tabindex="0"></div>
    <span class="list-emoji">${getEmoji(item)}</span>
    <div class="list-body">
      <div class="list-name">${esc(item.name)}</div>
      ${meta ? `<div class="list-meta">${meta}</div>` : ''}
    </div>
    <div class="list-actions">
      <button class="list-btn edit" aria-label="Edit">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
      <button class="list-btn remove" aria-label="Remove">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>`;

  el.querySelector('.list-check').addEventListener('click', () => toggleCheck(item));
  el.querySelector('.list-check').addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleCheck(item); }
  });
  el.querySelector('.edit').addEventListener('click', () => openEdit(item));
  el.querySelector('.remove').addEventListener('click', () => removeFromList(item));

  return el;
}

// ── Shop view ────────────────────────────────────────────────
function renderShop() {
  const container = document.getElementById('shopList');
  const items = listItems();

  updateProgress();

  if (!items.length) {
    container.innerHTML = '<div class="empty-list"><div class="empty-emoji">🛒</div><p>List is empty</p></div>';
    return;
  }

  const frag = document.createDocumentFragment();
  const cats = CAT_ORDER.filter(c => items.some(i => i.category === c));

  cats.forEach(cat => {
    const catItems = items.filter(i => i.category === cat);
    const group = document.createElement('div');
    group.className = 'cat-group';
    group.innerHTML = `
      <div class="cat-hdr">
        <div class="cat-dot" style="background:${CAT_COLOR[cat]}"></div>
        <span class="cat-hdr-name">${cat}</span>
        <span class="cat-hdr-count">${catItems.filter(i=>!i.checked).length}/${catItems.length}</span>
      </div>`;
    [...catItems].sort((a,b) => a.checked - b.checked).forEach(item => {
      group.appendChild(shopRow(item));
    });
    frag.appendChild(group);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

function shopRow(item) {
  const el = document.createElement('div');
  el.className = 'shop-item' + (item.checked ? ' done' : '');
  el.dataset.id = item.id;

  const qty = qtyLabel(item);
  const meta = [
    qty ? `<span class="shop-qty">${esc(qty)}</span>` : '',
    item.notes ? `<span class="shop-notes">${esc(item.notes)}</span>` : '',
  ].filter(Boolean).join('');

  el.innerHTML = `
    <div class="shop-check"></div>
    <span class="shop-emoji">${getEmoji(item)}</span>
    <div class="shop-body">
      <div class="shop-name">${esc(item.name)}</div>
      ${meta ? `<div class="shop-meta">${meta}</div>` : ''}
    </div>`;

  el.addEventListener('click', () => toggleShopCheck(item));
  return el;
}

function updateProgress() {
  const items = listItems();
  const total = items.length;
  const done = items.filter(i => i.checked).length;
  const pct = total ? (done / total) * 100 : 0;

  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressText').textContent = `${done} / ${total}`;

  if (total > 0 && done === total && mode === 'shopping') {
    setTimeout(() => setMode('done'), 700);
  }
}

// ── Actions ──────────────────────────────────────────────────
async function toggleShopCheck(item) {
  item.checked = item.checked ? 0 : 1;

  const el = document.querySelector(`#shopList .shop-item[data-id="${item.id}"]`);
  if (el) {
    el.classList.toggle('done', !!item.checked);
    const parent = el.parentNode;
    if (item.checked) {
      parent.appendChild(el);
    } else {
      const firstDone = parent.querySelector('.shop-item.done');
      parent.insertBefore(el, firstDone || null);
    }
    // Update category count header
    const catItems = listItems().filter(i => i.category === item.category);
    const hdr = parent.querySelector('.cat-hdr-count');
    if (hdr) hdr.textContent = `${catItems.filter(i=>!i.checked).length}/${catItems.length}`;
  }

  updateProgress();

  try {
    await api('PUT', `/api/items/${item.id}`, {checked: item.checked});
  } catch { await loadAll(); }
}

async function toggleList(item) {
  item.in_list = item.in_list ? 0 : 1;
  if (item.in_list) item.checked = 0;
  render();
  try {
    await api('PUT', `/api/items/${item.id}`, {in_list: item.in_list, checked: item.checked});
  } catch { await loadAll(); }
}

async function toggleCheck(item) {
  item.checked = item.checked ? 0 : 1;
  render();
  try {
    await api('PUT', `/api/items/${item.id}`, {checked: item.checked});
  } catch { await loadAll(); }
}

async function removeFromList(item) {
  item.in_list = 0;
  item.checked = 0;
  render();
  try {
    await api('PUT', `/api/items/${item.id}`, {in_list: 0, checked: 0});
  } catch { await loadAll(); }
}

async function addCustom(name) {
  const cat = browseFilter !== 'all' ? browseFilter : 'Other';
  try {
    const item = await api('POST', '/api/items', {name, category: cat, in_list: 1});
    allItems.push(item);
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    document.getElementById('searchClear').classList.add('hidden');
    render();
    toast(`Added "${name}"`);
    if (!isDesktop()) switchTab('list');
  } catch (e) {
    toast('Could not add item');
  }
}

// ── Clear actions ────────────────────────────────────────────
document.getElementById('clearDone').addEventListener('click', async () => {
  const count = listItems().filter(i => i.checked).length;
  if (!count) { toast('Nothing checked off yet'); return; }
  allItems.forEach(i => { if (i.in_list && i.checked) { i.in_list = 0; i.checked = 0; } });
  render();
  toast(`Cleared ${count} item${count !== 1 ? 's' : ''}`);
  await api('DELETE', '/api/items/checked');
});

document.getElementById('clearAll').addEventListener('click', async () => {
  const count = listItems().length;
  if (!count) { toast('List is already empty'); return; }
  allItems.forEach(i => { if (i.in_list) { i.in_list = 0; i.checked = 0; } });
  render();
  toast('List cleared');
  await api('DELETE', '/api/list');
});

// ── Shopping flow ────────────────────────────────────────────
document.getElementById('readyBtn').addEventListener('click', () => {
  storeSheetContext = 'start';
  document.getElementById('storeSheetTitle').textContent = 'Shop at which store?';
  document.querySelectorAll('.store-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.store === shoppingStore));
  openSheet('storeSheet', 'storeOverlay');
});

document.getElementById('exitShop').addEventListener('click', () => {
  setMode('building');
});

document.getElementById('finishBtn').addEventListener('click', () => {
  setMode('done');
});

document.getElementById('btnNewList').addEventListener('click', async () => {
  allItems.forEach(i => { if (i.in_list) { i.in_list = 0; i.checked = 0; } });
  await api('DELETE', '/api/list');
  setMode('building');
});

document.getElementById('btnShopAgain').addEventListener('click', async () => {
  allItems.forEach(i => { if (i.in_list) { i.checked = 0; } });
  await api('DELETE', '/api/list/uncheck');
  setMode('building');
});

// ── Celebrate ────────────────────────────────────────────────
function celebrate() {
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

  const colors = ['#22c55e','#fbbf24','#f87171','#60a5fa','#fb923c','#818cf8','#34d399','#fff'];
  for (let i = 0; i < 72; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = 5 + Math.random() * 7;
    el.style.cssText = `left:${Math.random()*100}%;top:-12px;width:${size}px;height:${size}px;`
      + `background:${colors[Math.floor(Math.random()*colors.length)]};`
      + `border-radius:${Math.random()>0.45?'50%':'2px'};`
      + `animation-duration:${1.3+Math.random()*1.7}s;`
      + `animation-delay:${Math.random()*0.5}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ── Edit sheet ───────────────────────────────────────────────
function openEdit(item) {
  editingItem = item;
  document.getElementById('editId').value = item.id;
  document.getElementById('editName').value = item.name;
  document.getElementById('editQty').value = item.quantity || '1';
  document.getElementById('editUnit').value = item.unit || '';
  document.getElementById('editCat').value = item.category || 'Other';
  document.getElementById('editNotes').value = item.notes || '';
  document.getElementById('editStore').value = item.store || '';
  openSheet('editSheet', 'editOverlay');
}

document.getElementById('editForm').addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    name:     document.getElementById('editName').value.trim(),
    quantity: document.getElementById('editQty').value.trim() || '1',
    unit:     document.getElementById('editUnit').value.trim(),
    category: document.getElementById('editCat').value,
    notes:    document.getElementById('editNotes').value.trim(),
    store:    document.getElementById('editStore').value,
  };
  if (!payload.name) return;
  try {
    const updated = await api('PUT', `/api/items/${editingItem.id}`, payload);
    const idx = allItems.findIndex(i => i.id === editingItem.id);
    if (idx !== -1) allItems[idx] = updated;
    render();
    closeSheet('editSheet', 'editOverlay');
    toast('Saved');
  } catch { toast('Save failed'); }
});

// ── Store sheet ──────────────────────────────────────────────
document.getElementById('storeFilterBtn').addEventListener('click', () => {
  storeSheetContext = 'filter';
  document.getElementById('storeSheetTitle').textContent = 'Select Store';
  document.querySelectorAll('.store-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.store === storeFilter));
  openSheet('storeSheet', 'storeOverlay');
});

document.getElementById('storeSheet').addEventListener('click', e => {
  const opt = e.target.closest('.store-opt');
  if (!opt) return;
  const store = opt.dataset.store;
  closeSheet('storeSheet', 'storeOverlay');

  if (storeSheetContext === 'filter') {
    storeFilter = store;
    document.querySelectorAll('.store-opt').forEach(o =>
      o.classList.toggle('active', o.dataset.store === storeFilter));
    document.getElementById('storeFilterName').textContent = storeFilter === 'all' ? 'All Stores' : storeFilter;
    document.getElementById('storeFilterBtn').classList.toggle('active', storeFilter !== 'all');
    render();
  } else {
    shoppingStore = store;
    setMode('shopping');
  }
});

// ── Sheet helpers ────────────────────────────────────────────
function openSheet(sheetId, overlayId) {
  document.getElementById(sheetId).classList.add('open');
  document.getElementById(overlayId).classList.add('visible');
  setTimeout(() => {
    const first = document.getElementById(sheetId).querySelector('input');
    if (first) first.focus();
  }, 340);
}

function closeSheet(sheetId, overlayId) {
  document.getElementById(sheetId).classList.remove('open');
  document.getElementById(overlayId).classList.remove('visible');
}

document.getElementById('editOverlay').addEventListener('click', () => closeSheet('editSheet', 'editOverlay'));
document.getElementById('storeOverlay').addEventListener('click', () => closeSheet('storeSheet', 'storeOverlay'));

// ── Tab switching ────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('browseView').classList.toggle('hidden', tab !== 'browse');
  document.getElementById('listView').classList.toggle('hidden', tab !== 'list');
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  render();
}

document.querySelector('.tab-bar').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (tab) switchTab(tab.dataset.tab);
});

// ── Category filter ──────────────────────────────────────────
document.getElementById('catPills').addEventListener('click', e => {
  const pill = e.target.closest('.cpill');
  if (!pill) return;
  document.querySelectorAll('.cpill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  browseFilter = pill.dataset.cat;
  render();
});

// ── Search ───────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  searchClear.classList.toggle('hidden', !searchQuery);
  renderBrowse();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.classList.add('hidden');
  searchInput.focus();
  renderBrowse();
});

// ── Toast ────────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ── Utils ────────────────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Responsive ───────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (mode !== 'building') return;
  if (isDesktop()) {
    document.getElementById('browseView').classList.remove('hidden');
    document.getElementById('listView').classList.remove('hidden');
  } else {
    switchTab(activeTab);
  }
});

// ── Boot ─────────────────────────────────────────────────────
searchClear.classList.add('hidden');
loadAll();
