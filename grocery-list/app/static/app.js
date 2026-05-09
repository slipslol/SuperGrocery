/* HA_BASE is injected into index.html by server.py; falls back to '' locally */
const BASE = (window.HA_BASE || '').replace(/\/+$/, '');

const CAT_ORDER = ['Produce','Dairy','Meat','Bakery','Pantry','Frozen','Beverages','Other'];

const CAT_COLOR = {
  Produce:   '#22c55e',
  Dairy:     '#60a5fa',
  Meat:      '#f87171',
  Bakery:    '#fb923c',
  Pantry:    '#fbbf24',
  Frozen:    '#818cf8',
  Beverages: '#34d399',
  Other:     '#6b7280',
};

let items = [];
let activeFilter = 'all';
let editingId = null;
let toastTimer = null;

/* ── API helpers ──────────────────────────────────────────── */
async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadItems() {
  try {
    items = await api('GET', '/api/items');
    render();
  } catch (e) {
    showToast('Failed to load items');
  }
}

/* ── Render ───────────────────────────────────────────────── */
function render() {
  const list = document.getElementById('itemList');
  const emptyEl = document.getElementById('emptyState');
  const countEl = document.getElementById('itemCount');

  const visible = activeFilter === 'all'
    ? items
    : items.filter(i => i.category === activeFilter);

  const unchecked = visible.filter(i => !i.checked).length;
  countEl.textContent = unchecked > 0 ? `${unchecked} left` : '';

  if (visible.length === 0) {
    list.innerHTML = '';
    list.appendChild(emptyEl);
    return;
  }

  const frag = document.createDocumentFragment();
  const cats = activeFilter === 'all' ? CAT_ORDER : [activeFilter];

  for (const cat of cats) {
    const catItems = visible.filter(i => i.category === cat);
    if (!catItems.length) continue;

    const group = document.createElement('div');
    group.className = 'cat-group';

    const hdr = document.createElement('div');
    hdr.className = 'cat-header';
    hdr.innerHTML = `
      <div class="cat-dot" style="background:${CAT_COLOR[cat] || CAT_COLOR.Other}"></div>
      <span class="cat-label">${cat}</span>
      <span class="cat-count">${catItems.length}</span>
    `;
    group.appendChild(hdr);

    const sorted = [...catItems].sort((a, b) => a.checked - b.checked);
    for (const item of sorted) {
      group.appendChild(buildItemEl(item));
    }
    frag.appendChild(group);
  }

  list.innerHTML = '';
  list.appendChild(frag);
}

function buildItemEl(item) {
  const el = document.createElement('div');
  el.className = 'item' + (item.checked ? ' checked' : '');
  el.dataset.id = item.id;

  const qtyText = buildQtyText(item);

  el.innerHTML = `
    <div class="item-check" role="checkbox" aria-checked="${!!item.checked}" tabindex="0"></div>
    <div class="item-body">
      <div class="item-name">${esc(item.name)}</div>
      ${qtyText ? `<div class="item-meta"><span class="item-qty">${esc(qtyText)}</span></div>` : ''}
    </div>
    <div class="item-actions">
      <button class="item-btn edit" aria-label="Edit">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
      <button class="item-btn delete" aria-label="Delete">
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm13-15h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    </div>
  `;

  el.querySelector('.item-check').addEventListener('click', () => toggleItem(item));
  el.querySelector('.item-check').addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleItem(item); }
  });
  el.querySelector('.edit').addEventListener('click', e => {
    e.stopPropagation();
    openEdit(item);
  });
  el.querySelector('.delete').addEventListener('click', e => {
    e.stopPropagation();
    removeItem(item);
  });

  return el;
}

function buildQtyText(item) {
  const q = item.quantity;
  const u = item.unit;
  if (q && q !== '1' && u) return `${q} ${u}`;
  if (q && q !== '1') return q;
  if (u) return u;
  return '';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Item actions ─────────────────────────────────────────── */
async function toggleItem(item) {
  item.checked = item.checked ? 0 : 1;
  render();
  try {
    await api('PUT', `/api/items/${item.id}`, { checked: item.checked });
  } catch {
    item.checked = item.checked ? 0 : 1;
    render();
  }
}

async function removeItem(item) {
  items = items.filter(i => i.id !== item.id);
  render();
  showToast(`Removed "${item.name}"`);
  try {
    await api('DELETE', `/api/items/${item.id}`);
  } catch {
    items.push(item);
    render();
  }
}

/* ── Sheet ────────────────────────────────────────────────── */
const sheet = document.getElementById('addSheet');
const overlay = document.getElementById('sheetOverlay');

function openSheet(title, submitLabel) {
  document.getElementById('sheetTitle').textContent = title;
  document.getElementById('submitBtn').textContent = submitLabel;
  sheet.classList.add('open');
  overlay.classList.add('visible');
  requestAnimationFrame(() =>
    setTimeout(() => document.getElementById('itemName').focus(), 300)
  );
}

function closeSheet() {
  sheet.classList.remove('open');
  overlay.classList.remove('visible');
  editingId = null;
  document.getElementById('itemForm').reset();
  document.getElementById('itemQty').value = '1';
  document.getElementById('editId').value = '';
}

function openEdit(item) {
  editingId = item.id;
  document.getElementById('editId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQty').value = item.quantity || '1';
  document.getElementById('itemUnit').value = item.unit || '';
  document.getElementById('itemCat').value = item.category || 'Other';
  openSheet('Edit Item', 'Save Changes');
}

document.getElementById('openAdd').addEventListener('click', () => {
  editingId = null;
  openSheet('Add Item', 'Add to List');
});
overlay.addEventListener('click', closeSheet);

document.getElementById('itemForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  if (!name) return;

  const payload = {
    name,
    quantity: document.getElementById('itemQty').value.trim() || '1',
    unit:     document.getElementById('itemUnit').value.trim(),
    category: document.getElementById('itemCat').value,
  };

  try {
    if (editingId) {
      const updated = await api('PUT', `/api/items/${editingId}`, payload);
      const idx = items.findIndex(i => i.id === editingId);
      if (idx !== -1) items[idx] = updated;
      showToast(`Updated "${name}"`);
    } else {
      const item = await api('POST', '/api/items', payload);
      items.push(item);
      showToast(`Added "${name}"`);
    }
    render();
    closeSheet();
  } catch {
    showToast('Something went wrong');
  }
});

/* ── Filter pills ─────────────────────────────────────────── */
document.getElementById('filterBar').addEventListener('click', e => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  activeFilter = pill.dataset.cat;
  render();
});

/* ── Clear checked ────────────────────────────────────────── */
document.getElementById('clearChecked').addEventListener('click', async () => {
  const count = items.filter(i => i.checked).length;
  if (!count) { showToast('Nothing checked off'); return; }
  items = items.filter(i => !i.checked);
  render();
  showToast(`Cleared ${count} item${count !== 1 ? 's' : ''}`);
  try {
    await api('DELETE', '/api/items/checked');
  } catch {
    await loadItems();
  }
});

/* ── Toast ────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── Boot ─────────────────────────────────────────────────── */
loadItems();
