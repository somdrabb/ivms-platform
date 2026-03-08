import { fetchJSON, buildQuery } from '../core/api.js';
import { Loading, ErrorBanner, $, setTitle, toast, isoToLocal, EmptyState } from '../core/utils.js';
import { openModal } from '../core/modal.js';

const state = { page: 1, limit: 10, q: '' };

export async function renderCashiers() {
  setTitle('Cashier Management');
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
          <caption class="sr-only">Cashier roster</caption>
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

  async function load() {
    $('#c-body').innerHTML = `<tr><td colspan="5">${Loading()}</td></tr>`;
    $('#cashiers-error').innerHTML = '';
    try {
      const resp = await fetchJSON(`/cashiers${buildQuery({ page: state.page, limit: state.limit, q: state.q })}`, {}, { fallback: [] });
      const items = Array.isArray(resp) ? resp : resp.items || [];
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#c-page').textContent = `${state.page}/${pages}`;
      $('#c-total').textContent = `${total} total`;
      $('#c-prev').disabled = state.page <= 1;
      $('#c-next').disabled = state.page >= pages;
      if (!items.length) {
        $('#c-body').innerHTML = `<tr><td colspan="5">${EmptyState('No cashier accounts yet', [{ label: 'Add Cashier', id: 'empty-add-cashier' }])}</td></tr>`;
        $('#empty-add-cashier')?.addEventListener('click', () => $('#btn-add-cashier').click());
      } else {
        $('#c-body').innerHTML = items
          .map((u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.username}</td>
          <td>${u.last_login ? isoToLocal(u.last_login) : '-'}</td>
          <td><span class="status ${u.active ? 'online' : 'offline'}">${u.active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" data-action="edit" data-id="${u.id}">Edit</button>
            <button class="btn btn-sm btn-secondary" data-action="reset" data-id="${u.id}">Reset Password</button>
          </td>
        </tr>`)
          .join('');
      }
    } catch (e) {
      $('#cashiers-error').innerHTML = ErrorBanner('Failed to load cashiers');
    }
  }

  $('#btn-add-cashier').onclick = () => {
    openModal({
      title: 'Add Cashier',
      body: `
        <div class="grid-2">
          <div class="form-group"><label>Name</label><input class="form-control" id="f-name"></div>
          <div class="form-group"><label>Username</label><input class="form-control" id="f-username"></div>
          <div class="form-group"><label>Password</label><input type="password" class="form-control" id="f-pass"></div>
          <div class="form-group"><label><input type="checkbox" id="f-active" checked> Active</label></div>
        </div>`,
      onSubmit: async () => {
        const payload = {
          name: $('#f-name').value,
          username: $('#f-username').value,
          password: $('#f-pass').value,
          active: $('#f-active').checked,
        };
        if (!payload.name || !payload.username || !payload.password) throw new Error('invalid');
        await fetchJSON('/cashiers', { method: 'POST', body: JSON.stringify(payload) }, { fallback: { ok: true } });
        load();
      },
    });
  };

  $('#tbl-cashiers').addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'reset') {
      await fetchJSON(`/cashiers/${id}/reset-password`, { method: 'POST' }, { fallback: { ok: true } });
      toast('Password reset initiated');
    }
    if (action === 'edit') {
      openModal({
        title: 'Edit Cashier',
        body: `<div class="form-group"><label>Name</label><input class="form-control" id="fe-name"></div>`,
        onSubmit: async () => {
          const name = $('#fe-name').value;
          if (!name) throw new Error();
          await fetchJSON(`/cashiers/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }, { fallback: { ok: true } });
          load();
        },
      });
    }
  });

  $('#c-search').addEventListener('input', (event) => {
    state.q = event.target.value;
    state.page = 1;
    load();
  });
  $('#c-limit').addEventListener('change', (event) => {
    state.limit = Number(event.target.value);
    state.page = 1;
    load();
  });
  $('#c-prev').onclick = () => {
    state.page = Math.max(1, state.page - 1);
    load();
  };
  $('#c-next').onclick = () => {
    state.page += 1;
    load();
  };

  load();
}
