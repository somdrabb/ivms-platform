import { Loading, ErrorBanner, $, setTitle, toast, EmptyState } from '../core/utils.js';
import { openModal } from '../core/modal.js';
import { getTerminals, bootstrapTerminal, registerTerminal, pingTerminal, syncTerminal } from '../services/terminalsService.js';

const state = { page: 1, limit: 10, q: '' };

export async function renderTerminals() {
  setTitle('POS Terminals');
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
          <caption class="sr-only">Registered POS terminals</caption>
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

  async function load() {
    $('#t-body').innerHTML = `<tr><td colspan="6">${Loading()}</td></tr>`;
    $('#terminals-error').innerHTML = '';
    try {
      const resp = await getTerminals({ page: state.page, limit: state.limit, q: state.q });
      const items = Array.isArray(resp) ? resp : resp.items || [];
      const total = Array.isArray(resp) ? items.length : (resp.total ?? items.length);
      const pages = Math.max(1, Math.ceil(total / state.limit));
      $('#t-page').textContent = `${state.page}/${pages}`;
      $('#t-total').textContent = `${total} total`;
      $('#t-prev').disabled = state.page <= 1;
      $('#t-next').disabled = state.page >= pages;
      if (!items.length) {
        $('#t-body').innerHTML = `<tr><td colspan="6">${EmptyState('No terminals found', [{ label: 'Register Terminal', id: 'empty-register-terminal' }])}</td></tr>`;
        $('#empty-register-terminal')?.addEventListener('click', () => $('#btn-register-terminal').click());
      } else {
        $('#t-body').innerHTML = items
          .map((t) => `
          <tr>
            <td>${t.id}</td>
            <td>${t.name}</td>
            <td>${t.ip || '-'}</td>
            <td>${t.version || '-'}</td>
            <td><span class="status ${t.online ? 'online' : 'offline'}">${t.online ? 'Online' : 'Offline'}</span></td>
            <td>
              <button class="btn btn-sm btn-primary" data-action="ping" data-id="${t.id}">Ping</button>
              <button class="btn btn-sm btn-secondary" data-action="sync" data-id="${t.id}">Sync</button>
            </td>
          </tr>`)
          .join('');
      }
    } catch (e) {
      $('#terminals-error').innerHTML = ErrorBanner('Failed to load terminals');
    }
  }

  $('#t-search').addEventListener('input', (event) => {
    state.q = event.target.value;
    state.page = 1;
    load();
  });
  $('#t-limit').addEventListener('change', (event) => {
    state.limit = Number(event.target.value);
    state.page = 1;
    load();
  });
  $('#t-prev').onclick = () => {
    state.page = Math.max(1, state.page - 1);
    load();
  };
  $('#t-next').onclick = () => {
    state.page += 1;
    load();
  };

    $('#btn-bootstrap').onclick = async () => {
      await bootstrapTerminal();
      toast('Bootstrap requested.');
    };
    $('#btn-register-terminal').onclick = () => {
      openModal({
        title: 'Register Terminal',
        body: `<div class="form-group"><label>Name</label><input class="form-control" id="mt-name"></div>`,
        onSubmit: async () => {
          const name = $('#mt-name').value.trim();
          if (!name) throw new Error();
          await registerTerminal(name);
          load();
        },
      });
    };

  $('#app').addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'ping') {
        await pingTerminal(id);
        toast(`Pinged ${id}`);
      }
      if (action === 'sync') {
        await syncTerminal(id);
        toast(`Sync started for ${id}`);
      }
  });

  load();
}
