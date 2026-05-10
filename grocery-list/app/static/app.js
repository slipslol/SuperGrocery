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

// ── State
let allItems = [];
let mode = 'building'; // 'building' | 'reviewing' | 'shopping' | 'done'
let searchQuery = '';
let browseFilter = 'all';
let editingItem = null;
let toastTimer = null;
let krogerEnabled = false;
let priceCache = {}; // { [id]: {price, promo, loading, failed} }
let priceFetchActive = false;

// ── Derived
const listItems = () => allItems.filter(i => i.in_list);

function visibleItems() {
  let items = allItems;
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── API
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
    syncPriceCacheFromItems();
    renderBrowse();
    updateCTA();
  } catch (e) {
    toast(`Failed to load: ${e.message}`);
  }
}

function syncPriceCacheFromItems() {
  for (const item of allItems) {
    if (item.kroger_price != null && priceCache[item.id] === undefined) {
      priceCache[item.id] = {
        price: item.kroger_price,
        promo: item.kroger_promo,
        loading: false,
        failed: false,
      };
    }
  }
}

async function initKrogerStatus() {
  try {
    const st = await api('GET', '/api/kroger/status');
    krogerEnabled = !!(st && st.enabled);
  } catch {
    krogerEnabled = false;
  }
}

// ── Mode machine
function setMode(newMode) {
  mode = newMode;

  document.getElementById('barBuild').classList.toggle('hidden', newMode !== 'building');
  document.getElementById('barReview').classList.toggle('hidden', newMode !== 'reviewing');
  document.getElementById('barShop').classList.toggle('hidden', newMode !== 'shopping');

  const modeMap = {building:'buildMode', reviewing:'reviewMode', shopping:'shopMode', done:'doneMode'};
  Object.entries(modeMap).forEach(([m, id]) => {
    const el = document.getElementById(id);
    el.classList.toggle('active', m === newMode);
    el.classList.toggle('slide-right', m !== newMode);
  });

  if (newMode === 'reviewing') {
    renderReview();
    if (krogerEnabled) fetchPricesForList();
  } else if (newMode === 'shopping') {
    renderShop();
  } else if (newMode === 'done') {
    showDoneScreen();
    celebrate();
  } else if (newMode === 'building') {
    updateCTA();
    renderBrowse();
  }
}

function showDoneScreen() {
  const items = listItems();
  const checked = items.filter(i => i.checked).length;
  document.getElementById('doneSub').textContent = checked === items.length
    ? `You picked up all ${items.length} item${items.length !== 1 ? 's' : ''} 🎉`
    : `${checked} of ${items.length} item${items.length !== 1 ? 's' : ''} picked up`;
}

// ── CTA
function updateCTA() {
  const n = listItems().length;
  document.getElementById('ctaCount').textContent = `${n} item${n !== 1 ? 's' : ''}`;
  document.getElementById('ctaFloat').classList.toggle('visible', n > 0 && mode === 'building');
  document.getElementById('clearAllBtn').classList.toggle('hidden', n === 0);
}

document.getElementById('clearAllBtn').addEventListener('click', async () => {
  const count = listItems().length;
  if (!count) return;
  allItems.forEach(i => { if (i.in_list) { i.in_list = 0; i.checked = 0; } });
  priceCache = {};
  renderBrowse();
  updateCTA();
  toast('List cleared');
  await api('DELETE', '/api/list');
});

// ── Browse
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

  el.innerHTML = `
    <span class="browse-emoji">${getEmoji(item)}</span>
    <div class="browse-body">
      <div class="browse-name">${esc(item.name)}</div>
    </div>
    <div class="browse-toggle"></div>`;

  el.addEventListener('click', () => toggleList(item));
  return el;
}

// ── Review
function renderReview() {
  const container = document.getElementById('reviewList');
  const items = listItems();

  document.getElementById('reviewTitle').textContent = `Your List (${items.length})`;

  if (!items.length) {
    container.innerHTML = `<div class="empty-list"><div class="empty-emoji">🛒</div><p>Nothing added yet</p><span>Go back and add items</span></div>`;
    updateReviewTotal();
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
        <span class="cat-hdr-count">${catItems.length}</span>
      </div>`;
    catItems.forEach(item => group.appendChild(reviewRow(item)));
    frag.appendChild(group);
  });

  container.innerHTML = '';
  container.appendChild(frag);
  updateReviewTotal();
}

function reviewRow(item) {
  const el = document.createElement('div');
  el.className = 'review-item';
  el.dataset.id = item.id;

  const qty = item.quantity || '1';

  el.innerHTML = `
    <div class="review-top">
      <span class="review-emoji">${getEmoji(item)}</span>
      <div class="review-body">
        <div class="review-name">${esc(item.name)}</div>
      </div>
      <div class="review-price" data-price-id="${item.id}">${renderPriceBadge(item.id)}</div>
      <button class="review-remove" type="button" aria-label="Remove">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>
    <div class="review-controls">
      <div class="qty-stepper">
        <button class="qty-btn qty-dec" type="button">−</button>
        <input class="qty-field" type="text" inputmode="decimal" value="${esc(qty)}" aria-label="Quantity">
        <button class="qty-btn qty-inc" type="button">+</button>
      </div>
      <input class="review-notes-input" type="text" placeholder="Notes (brand, size…)" value="${esc(item.notes || '')}">
    </div>`;

  el.querySelector('.qty-dec').addEventListener('click', () => adjustQty(item, -1, el));
  el.querySelector('.qty-inc').addEventListener('click', () => adjustQty(item, +1, el));
  el.querySelector('.qty-field').addEventListener('change', e => saveQty(item, e.target.value));
  el.querySelector('.review-notes-input').addEventListener('change', e => saveNotes(item, e.target.value));
  el.querySelector('.review-remove').addEventListener('click', () => removeFromReview(item, el));

  return el;
}

function renderPriceBadge(itemId) {
  if (!krogerEnabled) return '';
  const c = priceCache[itemId];
  if (!c || c.loading) return '<span class="price-badge loading">…</span>';
  if (c.failed || c.price == null) return '<span class="price-badge unknown">—</span>';
  const p = (c.promo && c.promo < c.price) ? c.promo : c.price;
  return `<span class="price-badge">~$${p.toFixed(2)}</span>`;
}

function refreshPriceDisplay(itemId) {
  const el = document.querySelector(`[data-price-id="${itemId}"]`);
  if (el) el.innerHTML = renderPriceBadge(itemId);
}

async function fetchPricesForList() {
  if (priceFetchActive) return;
  priceFetchActive = true;
  try {
    const items = listItems();
    for (const item of items) {
      const cached = priceCache[item.id];
      if (cached && !cached.loading && !cached.failed && cached.price != null) continue;
      priceCache[item.id] = { loading: true, failed: false, price: null, promo: null };
      refreshPriceDisplay(item.id);
      try {
        const data = await api('GET', `/api/items/${item.id}/price`);
        priceCache[item.id] = {
          price: data.kroger_price,
          promo: data.kroger_promo,
          loading: false,
          failed: false,
        };
      } catch {
        priceCache[item.id] = { price: null, promo: null, loading: false, failed: true };
      }
      refreshPriceDisplay(item.id);
      updateReviewTotal();
      await sleep(350);
    }
  } finally {
    priceFetchActive = false;
  }
}

function calcTotal(items) {
  let total = 0, count = 0;
  for (const item of items) {
    const c = priceCache[item.id];
    if (c && !c.loading && !c.failed && c.price != null) {
      const qty = Math.max(1, parseFloat(item.quantity) || 1);
      const p = (c.promo && c.promo < c.price) ? c.promo : c.price;
      total += p * qty;
      count++;
    }
  }
  return count > 0 ? total : null;
}

function updateReviewTotal() {
  const total = calcTotal(listItems());
  const el = document.getElementById('reviewTotalAmt');
  if (el) el.textContent = total !== null ? `~$${total.toFixed(2)}` : '—';
}

function updateShopTotal() {
  const total = calcTotal(listItems());
  const el = document.getElementById('shopTotalAmt');
  if (el) el.textContent = total !== null ? `~$${total.toFixed(2)}` : '—';
}

async function adjustQty(item, delta, rowEl) {
  const cur = parseFloat(item.quantity) || 1;
  const next = Math.max(1, Math.round((cur + delta) * 100) / 100);
  item.quantity = String(next);
  const field = rowEl.querySelector('.qty-field');
  if (field) field.value = next;
  updateReviewTotal();
  try { await api('PUT', `/api/items/${item.id}`, {quantity: item.quantity}); }
  catch { toast('Save failed'); }
}

async function saveQty(item, val) {
  const n = parseFloat(val);
  item.quantity = isNaN(n) || n < 0.01 ? '1' : String(n);
  updateReviewTotal();
  try { await api('PUT', `/api/items/${item.id}`, {quantity: item.quantity}); }
  catch { toast('Save failed'); }
}

async function saveNotes(item, val) {
  item.notes = val.trim();
  try { await api('PUT', `/api/items/${item.id}`, {notes: item.notes}); }
  catch { toast('Save failed'); }
}

async function removeFromReview(item, rowEl) {
  item.in_list = 0;
  item.checked = 0;
  rowEl.remove();
  document.getElementById('reviewTitle').textContent = `Your List (${listItems().length})`;
  updateReviewTotal();
  try { await api('PUT', `/api/items/${item.id}`, {in_list: 0, checked: 0}); }
  catch { await loadAll(); }
}

// ── Shop
function renderShop() {
  const container = document.getElementById('shopList');
  const items = listItems();
  updateProgress();
  updateShopTotal();

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
  const c = priceCache[item.id];
  let priceHtml = '';
  if (krogerEnabled && c && !c.loading && !c.failed && c.price != null) {
    const p = (c.promo && c.promo < c.price) ? c.promo : c.price;
    priceHtml = `<span class="shop-price">~$${p.toFixed(2)}</span>`;
  }

  const metaParts = [
    qty ? `<span class="shop-qty">${esc(qty)}</span>` : '',
    item.notes ? `<span class="shop-notes">${esc(item.notes)}</span>` : '',
    priceHtml,
  ].filter(Boolean);

  el.innerHTML = `
    <div class="shop-check"></div>
    <span class="shop-emoji">${getEmoji(item)}</span>
    <div class="shop-body">
      <div class="shop-name">${esc(item.name)}</div>
      ${metaParts.length ? `<div class="shop-meta">${metaParts.join('')}</div>` : ''}
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

// ── Actions
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
    const catItems = listItems().filter(i => i.category === item.category);
    const hdr = parent.querySelector('.cat-hdr-count');
    if (hdr) hdr.textContent = `${catItems.filter(i=>!i.checked).length}/${catItems.length}`;
  }
  updateProgress();
  try { await api('PUT', `/api/items/${item.id}`, {checked: item.checked}); }
  catch { await loadAll(); }
}

async function toggleList(item) {
  item.in_list = item.in_list ? 0 : 1;
  if (item.in_list) {
    item.checked = 0;
    item.quantity = '1';
    item.unit = '';
    item.notes = '';
  }
  renderBrowse();
  updateCTA();
  try { await api('PUT', `/api/items/${item.id}`, {in_list: item.in_list, checked: item.checked, quantity: item.quantity, unit: item.unit, notes: item.notes}); }
  catch { await loadAll(); }
}

async function addCustom(name) {
  const cat = browseFilter !== 'all' ? browseFilter : 'Other';
  try {
    const item = await api('POST', '/api/items', {name, category: cat, in_list: 1});
    allItems.push(item);
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    document.getElementById('searchClear').classList.add('hidden');
    renderBrowse();
    updateCTA();
    toast(`Added "${name}"`);
  } catch { toast('Could not add item'); }
}

// ── Edit sheet
function openEdit(item) {
  editingItem = item;
  document.getElementById('editId').value = item.id;
  document.getElementById('editName').value = item.name;
  document.getElementById('editQty').value = item.quantity || '1';
  document.getElementById('editUnit').value = item.unit || '';
  document.getElementById('editCat').value = item.category || 'Other';
  document.getElementById('editNotes').value = item.notes || '';
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
  };
  if (!payload.name) return;
  try {
    const updated = await api('PUT', `/api/items/${editingItem.id}`, payload);
    const idx = allItems.findIndex(i => i.id === editingItem.id);
    if (idx !== -1) allItems[idx] = updated;
    renderBrowse();
    if (mode === 'reviewing') renderReview();
    closeSheet('editSheet', 'editOverlay');
    toast('Saved');
  } catch { toast('Save failed'); }
});

// ── Sheet helpers
function openSheet(sheetId, overlayId) {
  document.getElementById(sheetId).classList.add('open');
  document.getElementById(overlayId).classList.add('visible');
  setTimeout(() => {
    const first = document.getElementById(sheetId).querySelector('input:not([type=hidden])');
    if (first) first.focus();
  }, 340);
}

function closeSheet(sheetId, overlayId) {
  document.getElementById(sheetId).classList.remove('open');
  document.getElementById(overlayId).classList.remove('visible');
}

document.getElementById('editOverlay').addEventListener('click', () => closeSheet('editSheet', 'editOverlay'));

// ── Navigation events
document.getElementById('readyBtn').addEventListener('click', () => {
  if (!listItems().length) return;
  setMode('reviewing');
});

document.getElementById('exitReview').addEventListener('click', () => setMode('building'));
document.getElementById('startShopBtn').addEventListener('click', () => setMode('shopping'));
document.getElementById('exitShop').addEventListener('click', () => setMode('reviewing'));
document.getElementById('finishBtn').addEventListener('click', () => setMode('done'));

document.getElementById('btnNewList').addEventListener('click', async () => {
  allItems.forEach(i => { if (i.in_list) { i.in_list = 0; i.checked = 0; } });
  priceCache = {};
  await api('DELETE', '/api/list');
  setMode('building');
});

document.getElementById('btnShopAgain').addEventListener('click', async () => {
  allItems.forEach(i => { if (i.in_list) { i.checked = 0; } });
  await api('DELETE', '/api/list/uncheck');
  setMode('building');
});

// ── Celebrate
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

// ── Category filter
document.getElementById('catPills').addEventListener('click', e => {
  const pill = e.target.closest('.cpill');
  if (!pill) return;
  document.querySelectorAll('.cpill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  browseFilter = pill.dataset.cat;
  renderBrowse();
});

// ── Search
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

// ── Toast
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ── Utils
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Boot
searchClear.classList.add('hidden');
initKrogerStatus().then(() => loadAll());
