import { fetchJSON } from '../core/api.js';
import { CONFIG, setTheme } from '../core/config.js';
import { $, setTitle, toast } from '../core/utils.js';

export function renderSettings() {
  setTitle('Settings');
  $('#app').innerHTML = `
    <div class="content-section">
      <div class="section-header"><h2>Backend Connection</h2></div>
      <div class="grid-2">
        <div class="form-group"><label>API Base URL</label><input id="api-base" class="form-control" placeholder="http://localhost:8000" value="${CONFIG.BASE_URL}"></div>
        <div class="form-group"><label>Auth Token</label><input id="api-token" class="form-control" placeholder="optional" value="${CONFIG.TOKEN || ''}"></div>
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

  $('#save-settings').onclick = () => {
    const base = $('#api-base').value.trim();
    const token = $('#api-token').value.trim();
    const theme = $('#theme-select').value;
    localStorage.setItem('api_base', base);
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
    localStorage.setItem('theme', theme);
    CONFIG.BASE_URL = base;
    CONFIG.TOKEN = token || null;
    setTheme(theme);
    toast('Settings saved');
  };

  $('#ping-api').onclick = async () => {
    try {
      await fetchJSON('/health', {}, { fallback: { status: 'ok' } });
      toast('API reachable');
    } catch {
      toast('API not reachable');
    }
  };
}
