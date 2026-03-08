import { fetchJSON } from '../core/api.js';
import { Loading, ErrorBanner, $, setTitle, formatMoney, toast } from '../core/utils.js';
import { openModal } from '../core/modal.js';

export async function renderBank() {
  setTitle('Bank Accounts');
  $('#app').innerHTML = Loading();
  try {
    const accounts = await fetchJSON('/bank-accounts', {}, { fallback: [] });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header"><h2>Accounts</h2><button class="btn btn-primary" id="btn-add-acct">Add Account</button></div>
        <div class="table-responsive">
          <table class="data-table">
            <caption class="sr-only">Bank accounts</caption>
            <thead><tr><th>Name</th><th>IBAN</th><th>Balance</th><th>Actions</th></tr></thead>
            <tbody>
              ${accounts.map((a) => `
                <tr>
                  <td>${a.name}</td><td>${a.iban || '-'}</td><td>${formatMoney(a.balance || 0)}</td>
                  <td><button class="btn btn-sm btn-primary" data-action="reconcile" data-id="${a.id}">Reconcile</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    $('#btn-add-acct').onclick = () => {
      openModal({
        title: 'Add Bank Account',
        body: `<div class="form-group"><label>Name</label><input class="form-control" id="ba-name"></div>`,
        onSubmit: async () => {
          const name = $('#ba-name').value.trim();
          if (!name) throw new Error();
          await fetchJSON('/bank-accounts', { method: 'POST', body: JSON.stringify({ name }) }, { fallback: { ok: true } });
          renderBank();
        },
      });
    };

    $('#app').addEventListener('click', async (event) => {
      const btn = event.target.closest('button[data-action="reconcile"]');
      if (!btn) return;
      const id = btn.dataset.id;
      await fetchJSON(`/bank-accounts/${id}/reconcile`, { method: 'POST' }, { fallback: { ok: true } });
      toast('Reconcile started');
    });
  } catch (e) {
    $('#app').innerHTML = ErrorBanner('Failed to load bank accounts');
  }
}
