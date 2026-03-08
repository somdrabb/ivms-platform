import { fetchJSON } from '../core/api.js';
import { Loading, ErrorBanner, formatMoney, isoToLocal, $, setTitle } from '../core/utils.js';
import { navigate } from '../core/router.js';

function safeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function buildStatusBadge(label, tone = 'online') {
  return `<span class="status ${tone}">${label}</span>`;
}

function renderRecentPurchaseRows(items = []) {
  if (!items.length) {
    return `<tr><td colspan="6" class="text-muted">No recent purchase activity available.</td></tr>`;
  }

  return items
    .slice(0, 8)
    .map((item) => `
      <tr>
        <td>${item.id ?? item._id ?? '—'}</td>
        <td>${item.supplier || item.createdBy || '—'}</td>
        <td>${item.createdAt ? isoToLocal(item.createdAt) : '—'}</td>
        <td>${formatMoney(
          safeNumber(
            item.total ??
            item.totalCost ??
            item.grandTotal ??
            item.amount
          ) || (
            Array.isArray(item.items)
              ? item.items.reduce((sum, row) => {
                  const qty = safeNumber(row.quantity ?? row.qty ?? row.amount, 1);
                  const price = safeNumber(row.price ?? row.cost ?? row.unitPrice);
                  return sum + qty * price;
                }, 0)
              : 0
          )
        )}</td>
        <td>${item.state || item.status || '—'}</td>
        <td>${buildStatusBadge(item.status || 'pending', item.status === 'received' ? 'online' : 'pending')}</td>
      </tr>
    `)
    .join('');
}

export async function renderDashboard() {
  setTitle('Dashboard Overview');
  const app = $('#app');
  if (!app) return;

  app.innerHTML = Loading();

  try {
    const [productsResponse, purchasesResponse] = await Promise.all([
      fetchJSON('/api/products', {}, { fallback: [] }),
      fetchJSON('/api/purchases', {}, { fallback: [] }),
    ]);

    const products = toArray(productsResponse);
    const purchases = toArray(purchasesResponse);

    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => {
      const amount = safeNumber(p.amount);
      const reorderLevel = safeNumber(p.reorderLevel, 5);
      return amount <= reorderLevel;
    }).length;

    const totalInventoryValue = products.reduce((sum, product) => {
      const price = safeNumber(product.price);
      const amount = safeNumber(product.amount);
      return sum + price * amount;
    }, 0);

    const totalPurchases = purchases.length;
    const totalPurchaseValue = purchases.reduce((sum, purchase) => {
      const directValue =
        purchase.total ??
        purchase.totalCost ??
        purchase.grandTotal ??
        purchase.amount;

      if (directValue != null) {
        return sum + safeNumber(directValue);
      }

      const itemsTotal = Array.isArray(purchase.items)
        ? purchase.items.reduce((itemSum, item) => {
            const qty = safeNumber(item.quantity ?? item.qty ?? item.amount, 1);
            const price = safeNumber(item.price ?? item.cost ?? item.unitPrice);
            return itemSum + qty * price;
          }, 0)
        : 0;

      return sum + itemsTotal;
    }, 0);

    const pendingPurchases = purchases.filter((purchase) => {
      const status = String(purchase.status || '').toLowerCase();
      return status && status !== 'received' && status !== 'completed';
    }).length;

    app.innerHTML = `
      <section class="page-shell dashboard-page">
        <div class="dashboard-hero">
          <div class="dashboard-hero-copy">
            <h2>Operations Dashboard</h2>
            <p>Live overview of products, purchasing activity, stock alerts, and operational status.</p>
          </div>

          <div class="dashboard-hero-actions">
            <button class="btn btn-primary" type="button" data-nav="inventory">Open Inventory</button>
            <button class="btn btn-ghost" type="button" data-nav="reports">View Reports</button>
          </div>
        </div>

        <section class="dashboard-kpis">
          <article class="metric-card metric-card--primary">
            <div class="metric-copy">
              <span class="metric-label">Products</span>
              <strong class="metric-value">${totalProducts}</strong>
              <span class="metric-sub">Items currently in catalog</span>
            </div>
            <div class="metric-icon"><i class="fas fa-boxes"></i></div>
          </article>

          <article class="metric-card">
            <div class="metric-copy">
              <span class="metric-label">Inventory Value</span>
              <strong class="metric-value">${formatMoney(totalInventoryValue)}</strong>
              <span class="metric-sub">Estimated stock value</span>
            </div>
            <div class="metric-icon"><i class="fas fa-euro-sign"></i></div>
          </article>

          <article class="metric-card">
            <div class="metric-copy">
              <span class="metric-label">Purchases</span>
              <strong class="metric-value">${totalPurchases}</strong>
              <span class="metric-sub">Recorded purchase orders</span>
            </div>
            <div class="metric-icon"><i class="fas fa-receipt"></i></div>
          </article>

          <article class="metric-card">
            <div class="metric-copy">
              <span class="metric-label">Purchase Value</span>
              <strong class="metric-value">${formatMoney(totalPurchaseValue)}</strong>
              <span class="metric-sub">Total purchase volume</span>
            </div>
            <div class="metric-icon"><i class="fas fa-chart-line"></i></div>
          </article>
        </section>

        <section class="dashboard-grid dashboard-grid--2">
          <div class="panel">
            <div class="panel-header">
              <h3>Operations Snapshot</h3>
            </div>

            <div class="snapshot-grid">
              <div class="mini-stat">
                <span>Low Stock Alerts</span>
                <strong>${lowStockCount}</strong>
              </div>
              <div class="mini-stat">
                <span>Pending Purchases</span>
                <strong>${pendingPurchases}</strong>
              </div>
              <div class="mini-stat">
                <span>Total Products</span>
                <strong>${totalProducts}</strong>
              </div>
              <div class="mini-stat">
                <span>Purchases Logged</span>
                <strong>${totalPurchases}</strong>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h3>Attention Required</h3>
            </div>

            <div class="dashboard-alerts">
              <div class="alert-row">
                <div>
                  <strong>Low Stock Items</strong>
                  <p>${lowStockCount} item(s) need replenishment attention.</p>
                </div>
                ${buildStatusBadge(lowStockCount > 0 ? 'Action Needed' : 'Normal', lowStockCount > 0 ? 'pending' : 'online')}
              </div>

              <div class="alert-row">
                <div>
                  <strong>Pending Purchases</strong>
                  <p>${pendingPurchases} purchase order(s) are not yet completed.</p>
                </div>
                ${buildStatusBadge(pendingPurchases > 0 ? 'Pending' : 'Clear', pendingPurchases > 0 ? 'pending' : 'online')}
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-grid dashboard-grid--2">
          <div class="panel">
            <div class="panel-header">
              <h3>Quick Actions</h3>
            </div>

            <div class="quick-actions-grid">
              <button class="action-tile" type="button" data-nav="inventory">
                <i class="fas fa-boxes"></i>
                <span>Inventory</span>
              </button>
              <button class="action-tile" type="button" data-nav="cashiers">
                <i class="fas fa-users"></i>
                <span>Cashiers</span>
              </button>
              <button class="action-tile" type="button" data-nav="reports">
                <i class="fas fa-chart-bar"></i>
                <span>Reports</span>
              </button>
              <button class="action-tile" type="button" data-nav="settings">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
              </button>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h3>Purchase Activity</h3>
            </div>

            <div class="snapshot-grid">
              <div class="mini-stat">
                <span>Total Purchase Value</span>
                <strong>${formatMoney(totalPurchaseValue)}</strong>
              </div>
              <div class="mini-stat">
                <span>Pending Orders</span>
                <strong>${pendingPurchases}</strong>
              </div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h3>Recent Purchases</h3>
            <button class="btn btn-sm btn-ghost" type="button" data-nav="reports">View Reports</button>
          </div>

          <div class="table-responsive">
            <table class="data-table" id="recent-purchases-table">
              <caption class="sr-only">Recent purchase overview</caption>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier / User</th>
                  <th>Time</th>
                  <th>Total</th>
                  <th>State</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${renderRecentPurchaseRows(purchases)}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    `;

    app.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.nav));
    });
  } catch (error) {
    app.innerHTML = ErrorBanner('Failed to load dashboard');
  }
}
