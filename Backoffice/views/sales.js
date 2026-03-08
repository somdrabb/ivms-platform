import { fetchJSON, buildQuery } from '../core/api.js';
import { Loading, ErrorBanner, $, setTitle, formatMoney, isoToLocal, exportCSV, toast } from '../core/utils.js';

const state = { page: 1, limit: 10, q: '' };

export async function renderSales() {
  setTitle('Sales');
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
          <caption class="sr-only">Sales history</caption>
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

  async function load() {
    $('#s-body').innerHTML = `<tr><td colspan="6">${Loading()}</td></tr>`;
    $('#sales-error').innerHTML = '';
    try {
      const resp = await fetchJSON(`/api/sales${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`, {}, { fallback: [] });
      const items = Array.isArray(resp) ? resp : resp.items || [];
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#s-page').textContent = `${state.page}/${pages}`;
      $('#s-total').textContent = `${total} total`;
      $('#s-prev').disabled = state.page <= 1;
      $('#s-next').disabled = state.page >= pages;
      $('#s-body').innerHTML = items
        .map((s) => `
        <tr>
          <td>${s.id}</td>
          <td>${s.cashier || '-'}</td>
          <td>${isoToLocal(s.timestamp)}</td>
          <td>${formatMoney(s.amount)}</td>
          <td>${s.payment_method}</td>
          <td><span class="status ${s.status === 'completed' ? 'online' : 'pending'}">${s.status}</span></td>
        </tr>`)
        .join('') || `<tr><td colspan="6" style="color:var(--muted)">No sales</td></tr>`;
    } catch (e) {
      $('#sales-error').innerHTML = ErrorBanner('Failed to load sales');
    }
  }

  $('#btn-export').onclick = () => exportCSV('#tbl-sales');
  $('#s-search').addEventListener('input', (event) => {
    state.q = event.target.value;
    state.page = 1;
    load();
  });
  $('#s-limit').addEventListener('change', (event) => {
    state.limit = Number(event.target.value);
    state.page = 1;
    load();
  });
  $('#s-prev').onclick = () => {
    state.page = Math.max(1, state.page - 1);
    load();
  };
  $('#s-next').onclick = () => {
    state.page += 1;
    load();
  };

  load();
}
