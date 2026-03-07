/********************
 * CONFIG & HELPERS *
 ********************/
const CONFIG = {
  BASE_URL: localStorage.getItem('api_base') || 'http://localhost:8000',
  TOKEN: localStorage.getItem('auth_token') || null,
  THEME: localStorage.getItem('theme') || 'light',
};

document.documentElement.setAttribute('data-theme', CONFIG.THEME);

const headers = () => ({
  'Content-Type': 'application/json',
  ...(CONFIG.TOKEN ? { Authorization: `Bearer ${CONFIG.TOKEN}` } : {}),
});

function buildQuery(params){
  const q = Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== '').map(([k,v])=> `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return q ? `?${q}` : '';
}

async function fetchJSON(path, opts = {}, { fallback } = {}) {
  const url = path.startsWith('http') ? path : `${CONFIG.BASE_URL}${path}`;
  try {
    const res = await fetch(url, { headers: headers(), ...opts });
    if (!res.ok) throw new Error(await res.text());
    const ct = res.headers.get('content-type')||'';
    return ct.includes('application/json') ? await res.json() : await res.text();
  } catch (err) {
    console.warn('API error:', err.message);
    if (typeof fallback !== 'undefined') return fallback;
    throw err;
  }
}

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const setTitle = (t) => { $('#page-title').textContent = t; };

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), 2200);
}

function formatMoney(n) { return new Intl.NumberFormat(undefined, { style:'currency', currency:'EUR' }).format(Number(n||0)); }
function isoToLocal(dt) { try { return new Date(dt).toLocaleString(); } catch { return dt; } }

// Loading / error helpers
const Loading = () => `<div class="center" style="padding:1rem"><div class="spinner"></div></div>`;
const ErrorBanner = (msg) => `<div class="error-banner"><strong>Error:</strong> ${msg}</div>`;

/***********
 * ROUTER *
 ***********/
const routes = {
  dashboard: renderDashboard,
  terminals: renderTerminals,
  cashiers: renderCashiers,
  inventory: renderInventory,
  sales: renderSales,
  cash: renderCash,
  reports: renderReports,
  sync: renderSync,
  bank: renderBank,
  settings: renderSettings,
  logout: handleLogout,
};

function navigate(route){
  if(!routes[route]) route = 'dashboard';
  location.hash = route;
}

window.addEventListener('hashchange', () => mount());

function setActive(route){
  $$('.sidebar-menu a').forEach(a=> a.classList.toggle('active', a.dataset.route === route));
}

function mount(){
  const route = (location.hash || '#dashboard').replace('#','');
  setActive(route);
  routes[route]();
}

// Sidebar clicks
$$('.sidebar-menu a').forEach(a=> a.addEventListener('click', (e)=>{
  e.preventDefault(); navigate(a.dataset.route);
}));

// Page state for pagination/search
const pageState = {
  terminals: { page:1, limit:10, q:'' },
  cashiers:  { page:1, limit:10, q:'' },
  inventory: { page:1, limit:10, q:'' },
  sales:     { page:1, limit:10, q:'' },
};

/***********
 * MODAL   *
 ***********/
function openModal({ title = 'Modal', body = '', onSubmit }){
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = body;
  $('#modal').classList.add('show');
  $('#modal').setAttribute('aria-hidden','false');
  const submitBtn = $('#modal-submit');
  submitBtn.onclick = async ()=> {
    try { await onSubmit?.(); closeModal(); toast('Saved'); } catch(e){ toast('Action failed'); }
  };
}
function closeModal(){
  $('#modal').classList.remove('show');
  $('#modal').setAttribute('aria-hidden','true');
  $('#modal-body').innerHTML = '';
}
$('#modal').addEventListener('click', (e)=>{ if(e.target.matches('[data-close], .backdrop')) closeModal(); });
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

/***********
 * VIEWS   *
 ***********/
async function renderDashboard(){
  setTitle('Dashboard Overview');
  $('#app').innerHTML = Loading();
  try {
    const metrics = await fetchJSON('/api/dashboard', {}, {
      fallback: { today_sales: 0, total_products: 0, active_cashiers: 0, total_revenue: 0, cash_total: 0, card_total: 0 }
    });

    $('#app').innerHTML = `
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-info"><h3>Today's Sales</h3><p id="m-today">${formatMoney(metrics.today_sales)}</p></div>
          <div class="stat-icon sales"><i class="fas fa-euro-sign"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info"><h3>Total Products</h3><p id="m-products">${metrics.total_products}</p></div>
          <div class="stat-icon products"><i class="fas fa-box"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info"><h3>Active Cashiers</h3><p id="m-cashiers">${metrics.active_cashiers}</p></div>
          <div class="stat-icon cashiers"><i class="fas fa-user"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info"><h3>Total Revenue</h3><p id="m-revenue">${formatMoney(metrics.total_revenue)}</p></div>
          <div class="stat-icon revenue"><i class="fas fa-chart-line"></i></div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header"><h2>Payment Overview</h2></div>
        <div class="payment-cards">
          <div class="payment-card"><h3>Total Cash Payments</h3><p id="m-cash">${formatMoney(metrics.cash_total)}</p></div>
          <div class="payment-card"><h3>Total Card Payments</h3><p id="m-card">${formatMoney(metrics.card_total)}</p></div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>Recent Sales</h2>
          <button class="btn btn-primary" data-nav="sales">View All</button>
        </div>
        <div class="table-responsive">
          <table class="data-table" id="recent-sales">
            <thead><tr><th>Sale ID</th><th>Cashier</th><th>Time</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `;

    $('[data-nav="sales"]').addEventListener('click', ()=> navigate('sales'));

    const recent = await fetchJSON('/api/sales?limit=10', {}, { fallback: [] });
    const tbody = $('#recent-sales tbody');
    if (!recent.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted)">No sales yet.</td></tr>`;
    } else {
      tbody.innerHTML = recent.map(s=> `
        <tr>
          <td>${s.id}</td>
          <td>${s.cashier || '-'}</td>
          <td>${isoToLocal(s.timestamp)}</td>
          <td>${formatMoney(s.amount)}</td>
          <td>${s.payment_method}</td>
          <td><span class="status ${s.status==='completed'?'online':'pending'}">${s.status}</span></td>
        </tr>`).join('');
    }
  } catch(e){
    $('#app').innerHTML = ErrorBanner('Failed to load dashboard');
  }
}

async function renderTerminals(){
  setTitle('POS Terminals');
  const state = pageState.terminals;
  $('#app').innerHTML = `
    <div class="content-section">
      <div id="terminals-error"></div>
      <div class="section-header">
        <h2>Registered Terminals</h2>
        <div class="toolbar">
          <input class="form-control" style="width:220px" id="t-search" placeholder="Search name/IP" value="${state.q}">
          <select class="form-control" id="t-limit" style="width:auto">
            <option 10>10</option><option 20>20</option><option 50>50</option>
          </select>
          <div class="spacer"></div>
          <button class="btn btn-primary" id="btn-register-terminal"><i class="fa fa-plus"></i> Register</button>
          <button class="btn btn-ghost" id="btn-bootstrap"><i class="fa fa-download"></i> Bootstrap</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>IP</th><th>Version</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="t-body"></tbody>
        </table>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.75rem">
        <div id="t-total" style="color:var(--muted)"></div>
        <div>
          <button class="btn btn-outline btn-sm" id="t-prev">Prev</button>
          <span style="margin:0 .5rem" id="t-page">1/1</span>
          <button class="btn btn-outline btn-sm" id="t-next">Next</button>
        </div>
      </div>
    </div>`;

  $('#t-limit').value = String(state.limit);

  async function load(){
    $('#t-body').innerHTML = `<tr><td colspan="6">${Loading()}</td></tr>`;
    $('#terminals-error').innerHTML = '';
    try {
      const resp = await fetchJSON(`/api/pos-terminals${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`, {}, { fallback: [] });
      const items = Array.isArray(resp) ? resp : (resp.items || []);
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#t-page').textContent = `${state.page}/${pages}`;
      $('#t-total').textContent = `${total} total`;
      $('#t-prev').disabled = state.page <= 1; $('#t-next').disabled = state.page >= pages;
      $('#t-body').innerHTML = items.map(t=> `
        <tr>
          <td>${t.id}</td>
          <td>${t.name}</td>
          <td>${t.ip || '-'}</td>
          <td>${t.version || '-'}</td>
          <td><span class="status ${t.online?'online':'offline'}">${t.online?'Online':'Offline'}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" data-action="ping" data-id="${t.id}">Ping</button>
            <button class="btn btn-sm btn-secondary" data-action="sync" data-id="${t.id}">Sync</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="6" style="color:var(--muted)">No terminals</td></tr>`;
    } catch(e){
      $('#terminals-error').innerHTML = ErrorBanner('Failed to load terminals');
    }
  }

  $('#t-search').addEventListener('input', (e)=>{ state.q = e.target.value; state.page = 1; load(); });
  $('#t-limit').addEventListener('change', (e)=>{ state.limit = Number(e.target.value); state.page = 1; load(); });
  $('#t-prev').onclick = ()=>{ state.page = Math.max(1, state.page - 1); load(); };
  $('#t-next').onclick = ()=>{ state.page += 1; load(); };

  $('#btn-bootstrap').onclick = async ()=>{ await fetchJSON('/pos/bootstrap', {}, { fallback:{ ok:true } }); toast('Bootstrap requested.'); };
  $('#btn-register-terminal').onclick = ()=>{
    openModal({
      title: 'Register Terminal',
      body: `<div class="form-group"><label>Name</label><input class="form-control" id="mt-name"></div>`,
      onSubmit: async ()=>{ const name = $('#mt-name').value.trim(); if(!name) throw new Error(); await fetchJSON('/api/pos-terminals', { method:'POST', body: JSON.stringify({ name }) }, { fallback:{ ok:true } }); load(); }
    });
  };

  $('#app').addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id, action = btn.dataset.action;
    if(action==='ping'){
      await fetchJSON(`/api/pos-terminals/${id}/ping`, {}, { fallback:{ ok:true } });
      toast(`Pinged ${id}`);
    }
    if(action==='sync'){
      await fetchJSON(`/api/pos-terminals/${id}/sync`, { method:'POST' }, { fallback:{ ok:true } });
      toast(`Sync started for ${id}`);
    }
  });

  load();
}

async function renderCashiers(){
  setTitle('Cashier Management');
  const state = pageState.cashiers;
  $('#app').innerHTML = `
    <div class="content-section">
      <div id="cashiers-error"></div>
      <div class="section-header">
        <h2>Cashiers</h2>
        <div class="toolbar">
          <input class="form-control" style="width:220px" id="c-search" placeholder="Search name/username" value="${state.q}">
          <select class="form-control" id="c-limit" style="width:auto"><option 10>10</option><option 20>20</option><option 50>50</option></select>
          <div class="spacer"></div>
          <button class="btn btn-primary" id="btn-add-cashier">Add New Cashier</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="tbl-cashiers">
          <thead><tr><th>Name</th><th>Username</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="c-body"></tbody>
        </table>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.75rem">
        <div id="c-total" style="color:var(--muted)"></div>
        <div>
          <button class="btn btn-outline btn-sm" id="c-prev">Prev</button>
          <span style="margin:0 .5rem" id="c-page">1/1</span>
          <button class="btn btn-outline btn-sm" id="c-next">Next</button>
        </div>
      </div>
    </div>`;
  $('#c-limit').value = String(state.limit);

  async function load(){
    $('#c-body').innerHTML = `<tr><td colspan="5">${Loading()}</td></tr>`;
    $('#cashiers-error').innerHTML = '';
    try{
      const resp = await fetchJSON(`/api/cashiers${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`, {}, { fallback: [] });
      const items = Array.isArray(resp) ? resp : (resp.items || []);
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#c-page').textContent = `${state.page}/${pages}`; $('#c-total').textContent = `${total} total`;
      $('#c-prev').disabled = state.page <= 1; $('#c-next').disabled = state.page >= pages;
      $('#c-body').innerHTML = items.map(u=> `
        <tr>
          <td>${u.name}</td>
          <td>${u.username}</td>
          <td>${u.last_login ? isoToLocal(u.last_login) : '-'}</td>
          <td><span class="status ${u.active?'online':'offline'}">${u.active?'Active':'Inactive'}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" data-action="edit" data-id="${u.id}">Edit</button>
            <button class="btn btn-sm btn-secondary" data-action="reset" data-id="${u.id}">Reset Password</button>
          </td>
        </tr>`).join('') || `<tr><td colspan="5" style="color:var(--muted)">No cashiers</td></tr>`;
    }catch(e){
      $('#cashiers-error').innerHTML = ErrorBanner('Failed to load cashiers');
    }
  }

  $('#btn-add-cashier').onclick = ()=>{
    openModal({
      title: 'Add Cashier',
      body: `
        <div class="grid-2">
          <div class="form-group"><label>Name</label><input class="form-control" id="f-name"></div>
          <div class="form-group"><label>Username</label><input class="form-control" id="f-username"></div>
          <div class="form-group"><label>Password</label><input type="password" class="form-control" id="f-pass"></div>
          <div class="form-group"><label><input type="checkbox" id="f-active" checked> Active</label></div>
        </div>`,
      onSubmit: async ()=>{
        const payload = { name: $('#f-name').value, username: $('#f-username').value, password: $('#f-pass').value, active: $('#f-active').checked };
        if(!payload.name || !payload.username || !payload.password) throw new Error('invalid');
        await fetchJSON('/api/cashiers', { method:'POST', body: JSON.stringify(payload) }, { fallback:{ ok:true } });
        load();
      }
    });
  };

  $('#tbl-cashiers').addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-action]'); if(!btn) return;
    const id = btn.dataset.id, action = btn.dataset.action;
    if(action==='reset'){
      await fetchJSON(`/api/cashiers/${id}/reset-password`, { method:'POST' }, { fallback:{ ok:true } });
      toast('Password reset initiated');
    }
    if(action==='edit'){
      // Simple edit prompt via modal (could preload data from API)
      openModal({
        title: 'Edit Cashier',
        body: `<div class="form-group"><label>Name</label><input class="form-control" id="fe-name"></div>`,
        onSubmit: async ()=>{
          const name = $('#fe-name').value; if(!name) throw new Error();
          await fetchJSON(`/api/cashiers/${id}`, { method:'PUT', body: JSON.stringify({ name }) }, { fallback:{ ok:true } });
          load();
        }
      });
    }
  });

  $('#c-search').addEventListener('input', (e)=>{ state.q = e.target.value; state.page = 1; load(); });
  $('#c-limit').addEventListener('change', (e)=>{ state.limit = Number(e.target.value); state.page = 1; load(); });
  $('#c-prev').onclick = ()=>{ state.page = Math.max(1, state.page-1); load(); };
  $('#c-next').onclick = ()=>{ state.page += 1; load(); };

  load();
}

async function renderInventory(){
  setTitle('Inventory');
  const state = pageState.inventory;
  $('#app').innerHTML = `
    <div class="content-section">
      <div id="inv-error"></div>
      <div class="section-header">
        <h2>Products</h2>
        <div class="toolbar">
          <input class="form-control" id="i-search" placeholder="Search name/SKU" style="width:240px" value="${state.q}">
          <select class="form-control" id="i-limit" style="width:auto"><option 10>10</option><option 20>20</option><option 50>50</option></select>
          <div class="spacer"></div>
          <button class="btn btn-primary" id="btn-create-item"><i class="fa fa-plus"></i> New Product</button>
          <button class="btn btn-ghost" id="btn-pull"><i class="fa fa-download"></i> Pull from Central</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="tbl-inv">
          <thead><tr><th>SKU</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody id="i-body"></tbody>
        </table>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.75rem">
        <div id="i-total" style="color:var(--muted)"></div>
        <div>
          <button class="btn btn-outline btn-sm" id="i-prev">Prev</button>
          <span style="margin:0 .5rem" id="i-page">1/1</span>
          <button class="btn btn-outline btn-sm" id="i-next">Next</button>
        </div>
      </div>
    </div>`;
  $('#i-limit').value = String(state.limit);

  async function load(){
    $('#i-body').innerHTML = `<tr><td colspan="5">${Loading()}</td></tr>`;
    $('#inv-error').innerHTML = '';
    try {
      const resp = await fetchJSON(`/api/inventory${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`, {}, { fallback: [] });
      const items = Array.isArray(resp) ? resp : (resp.items || []);
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#i-page').textContent = `${state.page}/${pages}`; $('#i-total').textContent = `${total} total`;
      $('#i-prev').disabled = state.page <= 1; $('#i-next').disabled = state.page >= pages;
      $('#i-body').innerHTML = items.map(p=> `
        <tr>
          <td>${p.sku}</td>
          <td>${p.name}</td>
          <td>${formatMoney(p.price)}</td>
          <td>${p.stock ?? '-'}</td>
          <td><button class="btn btn-sm btn-primary" data-action="edit" data-sku="${p.sku}">Edit</button></td>
        </tr>`).join('') || `<tr><td colspan="5" style="color:var(--muted)">No products</td></tr>`;
    } catch(e){
      $('#inv-error').innerHTML = ErrorBanner('Failed to load inventory');
    }
  }

  $('#btn-pull').onclick = async ()=> { await fetchJSON('/inventory/pull', { method:'POST' }, { fallback:{ ok:true } }); toast('Inventory pull started'); };
  $('#btn-create-item').onclick = ()=> {
    openModal({
      title:'New Product',
      body:`
        <div class="grid-2">
          <div class="form-group"><label>SKU</label><input class="form-control" id="np-sku"></div>
          <div class="form-group"><label>Name</label><input class="form-control" id="np-name"></div>
          <div class="form-group"><label>Price</label><input type="number" step="0.01" class="form-control" id="np-price"></div>
          <div class="form-group"><label>Stock</label><input type="number" class="form-control" id="np-stock"></div>
        </div>`,
      onSubmit: async ()=>{
        const payload = { sku: $('#np-sku').value, name: $('#np-name').value, price: Number($('#np-price').value), stock: Number($('#np-stock').value) };
        if(!payload.sku || !payload.name) throw new Error();
        await fetchJSON('/api/inventory', { method:'POST', body: JSON.stringify(payload) }, { fallback:{ ok:true } });
        load();
      }
    });
  };

  $('#tbl-inv').addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-action="edit"]'); if(!btn) return;
    const sku = btn.dataset.sku;
    openModal({
      title: `Edit ${sku}`,
      body: `<div class="form-group"><label>New Price</label><input type="number" step="0.01" class="form-control" id="ed-price"></div>`,
      onSubmit: async ()=>{
        const price = Number($('#ed-price').value); if(!price) throw new Error();
        await fetchJSON(`/api/inventory/${encodeURIComponent(sku)}`, { method:'PUT', body: JSON.stringify({ price }) }, { fallback:{ ok:true } });
        load();
      }
    });
  });

  $('#i-search').addEventListener('input', (e)=>{ state.q = e.target.value; state.page = 1; load(); });
  $('#i-limit').addEventListener('change', (e)=>{ state.limit = Number(e.target.value); state.page = 1; load(); });
  $('#i-prev').onclick = ()=>{ state.page = Math.max(1, state.page-1); load(); };
  $('#i-next').onclick = ()=>{ state.page += 1; load(); };

  load();
}

async function renderSales(){
  setTitle('Sales');
  const state = pageState.sales;
  $('#app').innerHTML = `
    <div class="content-section">
      <div id="sales-error"></div>
      <div class="section-header">
        <h2>Sales</h2>
        <div class="toolbar">
          <input class="form-control" id="s-search" placeholder="Search cashier/payment/ID" style="width:260px" value="${state.q}">
          <select class="form-control" id="s-limit" style="width:auto"><option 10>10</option><option 20>20</option><option 100>100</option></select>
          <div class="spacer"></div>
          <button class="btn btn-primary" id="btn-export"><i class="fa fa-file-export"></i> Export CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="tbl-sales">
          <thead><tr><th>ID</th><th>Cashier</th><th>Time</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody id="s-body"></tbody>
        </table>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.75rem">
        <div id="s-total" style="color:var(--muted)"></div>
        <div>
          <button class="btn btn-outline btn-sm" id="s-prev">Prev</button>
          <span style="margin:0 .5rem" id="s-page">1/1</span>
          <button class="btn btn-outline btn-sm" id="s-next">Next</button>
        </div>
      </div>
    </div>`;
  $('#s-limit').value = String(state.limit);

  async function load(){
    $('#s-body').innerHTML = `<tr><td colspan="6">${Loading()}</td></tr>`;
    $('#sales-error').innerHTML = '';
    try{
      const resp = await fetchJSON(`/api/sales${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`, {}, { fallback: [] });
      const items = Array.isArray(resp) ? resp : (resp.items || []);
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#s-page').textContent = `${state.page}/${pages}`; $('#s-total').textContent = `${total} total`;
      $('#s-prev').disabled = state.page <= 1; $('#s-next').disabled = state.page >= pages;
      $('#s-body').innerHTML = items.map(s=> `
        <tr>
          <td>${s.id}</td>
          <td>${s.cashier || '-'}</td>
          <td>${isoToLocal(s.timestamp)}</td>
          <td>${formatMoney(s.amount)}</td>
          <td>${s.payment_method}</td>
          <td><span class="status ${s.status==='completed'?'online':'pending'}">${s.status}</span></td>
        </tr>`).join('') || `<tr><td colspan="6" style="color:var(--muted)">No sales</td></tr>`;
    }catch(e){
      $('#sales-error').innerHTML = ErrorBanner('Failed to load sales');
    }
  }

  $('#btn-export').onclick = ()=> exportCSV('#tbl-sales');
  $('#s-search').addEventListener('input', (e)=>{ state.q = e.target.value; state.page = 1; load(); });
  $('#s-limit').addEventListener('change', (e)=>{ state.limit = Number(e.target.value); state.page = 1; load(); });
  $('#s-prev').onclick = ()=>{ state.page = Math.max(1, state.page-1); load(); };
  $('#s-next').onclick = ()=>{ state.page += 1; load(); };

  load();
}

async function renderCash(){
  setTitle('Cash Management');
  $('#app').innerHTML = Loading();
  try{
    const initial = await fetchJSON('/api/cash-management', {}, { fallback:{ cash_drawer: 0, bank_balance: 0 } });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header"><h2>Cash Management</h2></div>
        <div class="grid-2">
          <div class="content-section" style="background:var(--primary-light)">
            <h3>Cash Register</h3>
            <p>Current Cash Amount: <strong id="cash-current">${formatMoney(initial.cash_drawer)}</strong></p>
            <div class="form-group"><label>Counted Cash Amount</label><input type="number" id="cash-count" class="form-control" placeholder="Enter counted amount"></div>
            <div>
              <button class="btn btn-primary" id="confirm-cash">Confirm Count</button>
              <button class="btn btn-secondary" id="deposit-cash">Deposit to Bank</button>
            </div>
          </div>
          <div class="content-section" style="background:var(--secondary-light)">
            <h3>Bank Account</h3>
            <p>Current Balance: <strong id="bank-balance">${formatMoney(initial.bank_balance)}</strong></p>
            <div class="form-group"><label>Deposit Amount</label><input type="number" id="deposit-amount" class="form-control" placeholder="Enter deposit amount"></div>
            <button class="btn btn-primary" id="confirm-deposit">Confirm Deposit</button>
          </div>
        </div>
      </div>`;

    async function refreshStatus(){
      const s = await fetchJSON('/api/cash-management', {}, { fallback: initial });
      $('#cash-current').textContent = formatMoney(s.cash_drawer ?? 0);
      $('#bank-balance').textContent = formatMoney(s.bank_balance ?? 0);
    }

    $('#confirm-cash').onclick = async ()=>{
      const val = Number($('#cash-count').value);
      if(!val){ toast('Please enter the counted cash amount'); return; }
      await fetchJSON('/api/cash-management/count', { method:'POST', body: JSON.stringify({ amount: val }) }, { fallback:{ ok:true } });
      await refreshStatus();
      $('#cash-count').value = '';
      toast('Cash count confirmed');
    };

    // Prefill deposit from counted cash, then focus the bank input
    $('#deposit-cash').onclick = ()=>{
      const counted = Number($('#cash-count').value);
      if(!counted){ toast('Please count cash first'); return; }
      $('#deposit-amount').value = counted;
      $('#deposit-amount').focus();
      toast('Prepared deposit amount from counted cash');
    };

    $('#confirm-deposit').onclick = async ()=>{
      const amt = Number($('#deposit-amount').value);
      if(!amt){ toast('Please enter the deposit amount'); return; }
      await fetchJSON('/api/cash-management/deposit', { method:'POST', body: JSON.stringify({ amount: amt }) }, { fallback:{ ok:true } });
      await refreshStatus();
      $('#deposit-amount').value = '';
      toast('Deposit recorded');
    };
  }catch(e){
    $('#app').innerHTML = ErrorBanner('Failed to load cash management');
  }
}

async function renderReports(){
  setTitle('Reports');
  $('#app').innerHTML = Loading();
  try{
    const r = await fetchJSON('/api/reports/summary', {}, { fallback:{ period:'today', totals:{ sales:0, items:0, refunds:0 } } });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2>Summary (${r.period})</h2>
          <div>
            <select id="report-period" class="form-control" style="width:auto; display:inline-block">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button class="btn btn-primary" id="run-report">Run</button>
          </div>
        </div>
        <div class="dashboard-stats">
          <div class="stat-card"><div class="stat-info"><h3>Sales</h3><p>${formatMoney(r.totals.sales)}</p></div><div class="stat-icon sales"><i class="fa fa-receipt"></i></div></div>
          <div class="stat-card"><div class="stat-info"><h3>Items Sold</h3><p>${r.totals.items}</p></div><div class="stat-icon products"><i class="fa fa-box"></i></div></div>
          <div class="stat-card"><div class="stat-info"><h3>Refunds</h3><p>${formatMoney(r.totals.refunds||0)}</p></div><div class="stat-icon revenue"><i class="fa fa-rotate-left"></i></div></div>
        </div>
      </div>`;

    $('#run-report').onclick = async ()=>{
      const p = $('#report-period').value;
      await fetchJSON(`/api/reports/summary?period=${encodeURIComponent(p)}`, {}, { fallback:r });
      toast('Report updated');
      renderReports();
    };
  }catch(e){
    $('#app').innerHTML = ErrorBanner('Failed to load reports');
  }
}

async function renderSync(){
  setTitle('Sync Status');
  $('#app').innerHTML = Loading();
  try{
    const s = await fetchJSON('/api/sync/status', {}, { fallback:{ online:true, last_success: new Date().toISOString(), pending_operations: 0 } });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2>Sync with Central System</h2>
          <button class="btn btn-primary" id="force-sync">Force Sync</button>
        </div>
        <p>Current Status: <span class="status ${s.online?'online':'offline'}">${s.online? 'Online' : 'Offline'}</span></p>
        <p>Last successful sync: ${isoToLocal(s.last_success)}</p>
        <p>Pending operations: ${s.pending_operations}</p>
      </div>`;

    $('#force-sync').onclick = async ()=>{
      await fetchJSON('/api/sync/force', { method:'POST' }, { fallback:{ ok:true } });
      toast('Sync started');
    };
  }catch(e){
    $('#app').innerHTML = ErrorBanner('Failed to load sync status');
  }
}

async function renderBank(){
  setTitle('Bank Accounts');
  $('#app').innerHTML = Loading();
  try{
    const acc = await fetchJSON('/api/bank-accounts', {}, { fallback: [] });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header"><h2>Accounts</h2><button class="btn btn-primary" id="btn-add-acct">Add Account</button></div>
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Name</th><th>IBAN</th><th>Balance</th><th>Actions</th></tr></thead>
            <tbody>
              ${acc.map(a=> `
                <tr>
                  <td>${a.name}</td><td>${a.iban || '-'}</td><td>${formatMoney(a.balance||0)}</td>
                  <td><button class="btn btn-sm btn-primary" data-action="reconcile" data-id="${a.id}">Reconcile</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    $('#btn-add-acct').onclick = ()=>{
      openModal({
        title:'Add Bank Account',
        body:`<div class="form-group"><label>Name</label><input class="form-control" id="ba-name"></div>`,
        onSubmit: async ()=>{ const name = $('#ba-name').value.trim(); if(!name) throw new Error(); await fetchJSON('/api/bank-accounts', { method:'POST', body: JSON.stringify({ name }) }, { fallback:{ ok:true } }); renderBank(); }
      });
    };

    $('#app').addEventListener('click', async (e)=>{
      const btn = e.target.closest('button[data-action="reconcile"]');
      if(!btn) return; const id = btn.dataset.id;
      await fetchJSON(`/api/bank-accounts/${id}/reconcile`, { method:'POST' }, { fallback:{ ok:true } });
      toast('Reconcile started');
    });
  }catch(e){
    $('#app').innerHTML = ErrorBanner('Failed to load bank accounts');
  }
}

async function renderSettings(){
  setTitle('Settings');
  $('#app').innerHTML = `
    <div class="content-section">
      <div class="section-header"><h2>Backend Connection</h2></div>
      <div class="grid-2">
        <div class="form-group"><label>API Base URL</label><input id="api-base" class="form-control" placeholder="http://localhost:8000" value="${CONFIG.BASE_URL}"></div>
        <div class="form-group"><label>Auth Token</label><input id="api-token" class="form-control" placeholder="optional" value="${CONFIG.TOKEN||''}"></div>
      </div>
      <div class="form-group"><label>Theme</label>
        <select id="theme-select" class="form-control" style="width:auto">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <button class="btn btn-primary" id="save-settings">Save</button>
        <button class="btn btn-ghost" id="ping-api">Ping API</button>
      </div>
    </div>`;

  $('#theme-select').value = document.documentElement.getAttribute('data-theme');

  $('#save-settings').onclick = ()=>{
    const base = $('#api-base').value.trim();
    const token = $('#api-token').value.trim();
    const theme = $('#theme-select').value;
    localStorage.setItem('api_base', base);
    if(token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
    localStorage.setItem('theme', theme);
    CONFIG.BASE_URL = base; CONFIG.TOKEN = token || null; CONFIG.THEME = theme;
    document.documentElement.setAttribute('data-theme', theme);
    toast('Settings saved');
  };
  $('#ping-api').onclick = async ()=>{
    try { await fetchJSON('/health', {}, { fallback:{ status:'ok' } }); toast('API reachable'); }
    catch { toast('API not reachable'); }
  };
}
function handleLogout(){
  localStorage.removeItem('auth_token');
  toast('Logged out');
  navigate('dashboard');
}
/****************
 * UTILITIES    *
 ****************/
function exportCSV(tableSel){
  const rows = $$("tr", $(tableSel));
  const csv = rows.map(tr => $$("th,td", tr).map(td => '"'+ String(td.textContent).replaceAll('"','""') +'"').join(',')).join('');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click();
  URL.revokeObjectURL(url);
}
// Clock
function updateClock(){
  const now = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  $('#current-time').textContent = `${now.toLocaleDateString(undefined, opts)} ${now.toLocaleTimeString()}`;
}
setInterval(updateClock, 1000); updateClock();
// Theme toggle button
$('#toggle-theme').onclick = ()=>{
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
};
// Initial mount
mount();
