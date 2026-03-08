import { fetchJSON, buildQuery } from '../core/api.js';
import { Loading, ErrorBanner, formatMoney, $, setTitle, toast } from '../core/utils.js';
import { openModal } from '../core/modal.js';

export async function renderInventory() {
  setTitle('Inventory');
  const app = $('#app');
  const state = { page: 1, limit: 10, q: '' };

  app.innerHTML = `
    <div class="content-section">
      <div class="section-header">
        <h2>Products</h2>
        <div class="toolbar">
          <input class="form-control" id="i-q" placeholder="Search name/SKU">
          <select class="form-control" id="i-limit" style="width:auto">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <div class="spacer"></div>
          <button class="btn btn-primary" id="btn-create-item">
            <i class="fa fa-plus"></i> New Product
          </button>
        </div>
      </div>

      <div id="inv-error"></div>

      <div class="table-responsive">
        <table class="data-table" id="tbl-inv">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
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
    </div>
  `;

  $('#i-limit').value = String(state.limit);

  async function load() {
    $('#i-body').innerHTML = `<tr><td colspan="5">${Loading()}</td></tr>`;
    $('#inv-error').innerHTML = '';

    try {
      const resp = await fetchJSON(
        `/api/products${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`,
        {},
        { fallback: [] }
      );

      const items = Array.isArray(resp) ? resp : resp.items || resp.data || [];
      const total = Array.isArray(resp) ? items.length : resp.total ?? items.length;
      const pages = Math.max(1, Math.ceil(total / state.limit));

      $('#i-page').textContent = `${state.page}/${pages}`;
      $('#i-total').textContent = `${total} total`;
      $('#i-prev').disabled = state.page <= 1;
      $('#i-next').disabled = state.page >= pages;

      $('#i-body').innerHTML =
        items
          .map((p) => `
            <tr>
              <td>${p.sku ?? '—'}</td>
              <td>${p.name ?? '—'}</td>
              <td>${formatMoney(p.price)}</td>
              <td>${p.amount ?? 0}</td>
              <td>
                <button class="btn btn-sm btn-primary" data-action="edit" data-id="${p.id || p._id || ''}">
                  Edit
                </button>
              </td>
            </tr>
          `)
          .join('') || `<tr><td colspan="5" style="color:var(--muted)">No products found.</td></tr>`;
    } catch (e) {
      $('#inv-error').innerHTML = ErrorBanner('Failed to load inventory');
    }
  }

  $('#i-q').addEventListener('input', (e) => {
    state.q = e.target.value.trim();
    state.page = 1;
    load();
  });

  $('#i-limit').addEventListener('change', (e) => {
    state.limit = Number(e.target.value) || 10;
    state.page = 1;
    load();
  });

  $('#i-prev').onclick = () => {
    if (state.page > 1) {
      state.page -= 1;
      load();
    }
  };

  $('#i-next').onclick = () => {
    state.page += 1;
    load();
  };

  $('#btn-create-item').onclick = () => {
    openModal({
      title: 'New Product',
      body: `
        <div class="grid-2">
          <div class="form-group">
            <label>SKU</label>
            <input class="form-control" id="np-sku">
          </div>
          <div class="form-group">
            <label>Name</label>
            <input class="form-control" id="np-name">
          </div>
          <div class="form-group">
            <label>Price</label>
            <input type="number" step="0.01" class="form-control" id="np-price">
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input type="number" class="form-control" id="np-stock">
          </div>
        </div>
      `,
      onSubmit: async () => {
        const payload = {
          sku: $('#np-sku').value.trim(),
          name: $('#np-name').value.trim(),
          price: Number($('#np-price').value || 0),
          amount: Number($('#np-stock').value || 0),
        };

        if (!payload.sku || !payload.name) {
          throw new Error('SKU and Name are required');
        }

        await fetchJSON(
          '/api/products',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
          { fallback: { ok: true } }
        );

        load();
      },
    });
  };

  $('#i-body').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="edit"]');
    if (!btn) return;
    toast('Edit flow can be connected next');
  });

  await load();
}
