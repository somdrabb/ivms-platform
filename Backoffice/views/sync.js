import { fetchJSON } from '../core/api.js';
import { Loading, ErrorBanner, $, setTitle, toast } from '../core/utils.js';

export async function renderSync() {
  setTitle('Sync Status');
  $('#app').innerHTML = Loading();
  try {
    const s = await fetchJSON('/sync/status', {}, { fallback: { online: true, last_success: new Date().toISOString(), pending_operations: 0 } });
    $('#app').innerHTML = `
      <div class="content-section">
        <div class="section-header">
          <h2>Sync with Central System</h2>
          <button class="btn btn-primary" id="force-sync">Force Sync</button>
        </div>
        <p>Current Status: <span class="status ${s.online ? 'online' : 'offline'}">${s.online ? 'Online' : 'Offline'}</span></p>
        <p>Last successful sync: ${new Date(s.last_success).toLocaleString()}</p>
        <p>Pending operations: ${s.pending_operations}</p>
      </div>`;

    $('#force-sync').onclick = async () => {
      await fetchJSON('/sync/force', { method: 'POST' }, { fallback: { ok: true } });
      toast('Sync started');
    };
  } catch (e) {
    $('#app').innerHTML = ErrorBanner('Failed to load sync status');
  }
}
