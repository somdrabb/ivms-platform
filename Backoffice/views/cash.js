import { fetchJSON } from '../core/api.js';
import { Loading, ErrorBanner, $, setTitle, formatMoney, toast } from '../core/utils.js';

export async function renderCash() {
  setTitle('Cash Management');
  $('#app').innerHTML = Loading();
  try {
    const initial = await fetchJSON('/cash-management', {}, { fallback: { cash_drawer: 0, bank_balance: 0 } });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header"><h2>Cash Management</h2></div>
        <div class="grid-2">
          <div class="content-section" style="background:var(--surface)">
            <h3>Cash Register</h3>
            <p>Expected Cash: <strong id="cash-current">${formatMoney(initial.cash_drawer)}</strong></p>
            <div class="form-group"><label>Counted Cash</label><input type="number" id="cash-count" class="form-control" placeholder="Enter counted amount"></div>
            <div>
              <button class="btn btn-primary" id="confirm-cash">Confirm Count</button>
              <button class="btn btn-secondary" id="deposit-cash">Use Counted Cash</button>
            </div>
          </div>
          <div class="content-section" style="background:var(--surface)">
            <h3>Bank Account</h3>
            <p>Bank Balance: <strong id="bank-balance">${formatMoney(initial.bank_balance)}</strong></p>
            <div class="form-group"><label>Deposit Amount</label><input type="number" id="deposit-amount" class="form-control" placeholder="Enter deposit amount"></div>
            <button class="btn btn-primary" id="confirm-deposit">Transfer to Bank</button>
          </div>
        </div>
      </div>`;

    async function refreshStatus() {
      const s = await fetchJSON('/cash-management', {}, { fallback: initial });
      $('#cash-current').textContent = formatMoney(s.cash_drawer ?? 0);
      $('#bank-balance').textContent = formatMoney(s.bank_balance ?? 0);
    }

    $('#confirm-cash').onclick = async () => {
      const val = Number($('#cash-count').value);
      if (!val) {
        toast('Please enter the counted cash amount');
        return;
      }
      await fetchJSON('/cash-management/count', { method: 'POST', body: JSON.stringify({ amount: val }) }, { fallback: { ok: true } });
      await refreshStatus();
      $('#cash-count').value = '';
      toast('Cash count confirmed');
    };

    $('#deposit-cash').onclick = () => {
      const counted = Number($('#cash-count').value);
      if (!counted) {
        toast('Please count cash first');
        return;
      }
      $('#deposit-amount').value = counted;
      $('#deposit-amount').focus();
      toast('Prepared deposit amount from counted cash');
    };

    $('#confirm-deposit').onclick = async () => {
      const amt = Number($('#deposit-amount').value);
      if (!amt) {
        toast('Please enter the deposit amount');
        return;
      }
      await fetchJSON('/cash-management/deposit', { method: 'POST', body: JSON.stringify({ amount: amt }) }, { fallback: { ok: true } });
      await refreshStatus();
      $('#deposit-amount').value = '';
      toast('Transfer recorded');
    };
  } catch (e) {
    $('#app').innerHTML = ErrorBanner('Failed to load cash management');
  }
}
