import { fetchJSON } from '../core/api.js';
import { toast } from '../core/utils.js';

const AUDIT_TABS = {
  discounts: {
    key: 'discounts',
    label: 'Discounts',
    empty: 'No discount activity found.',
    columns: [
      { key: 'receipt', label: 'Receipt' },
      { key: 'cashier', label: 'Cashier' },
      { key: 'type', label: 'Type' },
      { key: 'reason', label: 'Reason' },
      { key: 'amount', label: 'Amount', render: (item) => formatCurrency(item.amount) },
      { key: 'time', label: 'Time' },
    ],
  },
  storno: {
    key: 'storno',
    label: 'Storno / Voids',
    empty: 'No storno or void activity found.',
    columns: [
      { key: 'receipt', label: 'Receipt' },
      { key: 'cashier', label: 'Cashier' },
      { key: 'type', label: 'Type' },
      { key: 'reason', label: 'Reason' },
      { key: 'amount', label: 'Amount', render: (item) => formatCurrency(item.amount) },
      { key: 'time', label: 'Time' },
    ],
  },
  refunds: {
    key: 'refunds',
    label: 'Refunds',
    empty: 'No refund activity found.',
    columns: [
      { key: 'receipt', label: 'Receipt' },
      { key: 'cashier', label: 'Cashier' },
      { key: 'product', label: 'Product' },
      { key: 'reason', label: 'Reason' },
      { key: 'amount', label: 'Amount', render: (item) => formatCurrency(item.amount) },
      { key: 'time', label: 'Time' },
    ],
  },
};

let reportState = {
  activeAuditTab: 'discounts',
  summary: {},
  topProducts: [],
  cashierPerformance: [],
  discounts: [],
  storno: [],
  refunds: [],
};

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0));
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat('de-DE').format(Number(value || 0));
}

function formatPercent(value = 0) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getFilters() {
  return {
    range: document.getElementById('report-range')?.value || 'today',
    from: document.getElementById('report-date-from')?.value || '',
    to: document.getElementById('report-date-to')?.value || '',
  };
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setHTML(id, html) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = html;
}

function renderTableRows(items = [], columns = [], emptyMessage = 'No data available.') {
  if (!items.length) {
    return `<tr><td colspan="${columns.length}">${emptyMessage}</td></tr>`;
  }

  return items
    .map((item) => {
      const cells = columns
        .map((column) => {
          const value =
            typeof column.render === 'function'
              ? column.render(item)
              : (item[column.key] ?? '—');

          return `<td>${value}</td>`;
        })
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');
}

function renderAuditHead(columns = []) {
  return columns.map((column) => `<th>${column.label}</th>`).join('');
}

function renderPageShell() {
  return `
    <section class="page-shell reports-page">
      <div class="reports-topbar">
        <div class="reports-title">
          <h2>Reports</h2>
          <p>Sales, discounts, refunds, and cashier activity.</p>
        </div>

        <div class="reports-filters">
          <select class="form-control" id="report-range" aria-label="Report range">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          <input type="date" class="form-control" id="report-date-from" aria-label="From date" />
          <input type="date" class="form-control" id="report-date-to" aria-label="To date" />

          <button class="btn btn-primary" id="run-report-btn" type="button">Run</button>
          <button class="btn btn-ghost" id="export-report-btn" type="button">Export</button>
        </div>
      </div>

      <section class="reports-kpis">
        <article class="kpi-card">
          <span class="kpi-label">Gross Sales</span>
          <strong class="kpi-value" id="gross-sales-value">€0.00</strong>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">Net Sales</span>
          <strong class="kpi-value" id="net-sales-value">€0.00</strong>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">Transactions</span>
          <strong class="kpi-value" id="transactions-value">0</strong>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">Avg Basket</span>
          <strong class="kpi-value" id="average-basket-value">€0.00</strong>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">Discounts</span>
          <strong class="kpi-value" id="discount-total-value">€0.00</strong>
        </article>

        <article class="kpi-card">
          <span class="kpi-label">Refunds + Storno</span>
          <strong class="kpi-value" id="refund-storno-value">€0.00</strong>
        </article>
      </section>

      <section class="reports-grid reports-grid-2">
        <div class="panel">
          <div class="panel-header">
            <h3>Sales Trend</h3>
          </div>
          <div class="panel-body chart-placeholder" id="sales-trend-panel">
            No trend data available
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>Payments & Rates</h3>
          </div>

          <div class="panel-body payment-summary-grid">
            <div class="mini-stat">
              <span>Cash</span>
              <strong id="cash-sales-value">€0.00</strong>
            </div>
            <div class="mini-stat">
              <span>Card</span>
              <strong id="card-sales-value">€0.00</strong>
            </div>
            <div class="mini-stat">
              <span>Discount Rate</span>
              <strong id="discount-rate-value">0.0%</strong>
            </div>
            <div class="mini-stat">
              <span>Refund Rate</span>
              <strong id="refund-rate-value">0.0%</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="reports-grid reports-grid-2">
        <div class="panel">
          <div class="panel-header">
            <h3>Top Products</h3>
            <button class="btn btn-sm btn-ghost" id="export-products-btn" type="button">Export</button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody id="top-products-table">
                <tr><td colspan="4">No product performance data available.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>Cashiers</h3>
            <button class="btn btn-sm btn-ghost" id="export-cashiers-btn" type="button">Export</button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cashier</th>
                  <th>Transactions</th>
                  <th>Sales</th>
                  <th>Discounts</th>
                  <th>Storno</th>
                </tr>
              </thead>
              <tbody id="cashier-performance-table">
                <tr><td colspan="5">No cashier performance data available.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h3>Audit</h3>

          <div class="audit-toolbar">
            <div class="segmented-tabs" id="audit-tabs">
              <button class="segmented-tab active" type="button" data-audit-tab="discounts">Discounts</button>
              <button class="segmented-tab" type="button" data-audit-tab="storno">Storno / Voids</button>
              <button class="segmented-tab" type="button" data-audit-tab="refunds">Refunds</button>
            </div>

            <button class="btn btn-sm btn-ghost" id="export-audit-btn" type="button">Export</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr id="audit-table-head"></tr>
            </thead>
            <tbody id="audit-table-body">
              <tr><td colspan="6">No audit records found.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

async function loadReportData(filters = {}) {
  const query = buildQuery(filters);

  const requests = [
    fetchJSON(`/api/reports/summary${query}`).catch(() => ({})),
    fetchJSON(`/api/reports/top-products${query}`).catch(() => ([])),
    fetchJSON(`/api/reports/cashier-performance${query}`).catch(() => ([])),
    fetchJSON(`/api/reports/discounts${query}`).catch(() => ([])),
    fetchJSON(`/api/reports/storno${query}`).catch(() => ([])),
    fetchJSON(`/api/reports/refunds${query}`).catch(() => ([])),
  ];

  const [
    summaryResponse,
    topProductsResponse,
    cashierPerformanceResponse,
    discountsResponse,
    stornoResponse,
    refundsResponse,
  ] = await Promise.all(requests);

  return {
    summary: summaryResponse?.data || summaryResponse || {},
    topProducts: safeArray(topProductsResponse?.data || topProductsResponse),
    cashierPerformance: safeArray(cashierPerformanceResponse?.data || cashierPerformanceResponse),
    discounts: safeArray(discountsResponse?.data || discountsResponse),
    storno: safeArray(stornoResponse?.data || stornoResponse),
    refunds: safeArray(refundsResponse?.data || refundsResponse),
  };
}

function renderSummary(summary = {}) {
  const refundAndStorno = Number(summary.refundAmount || 0) + Number(summary.stornoAmount || 0);

  setText('gross-sales-value', formatCurrency(summary.grossSales));
  setText('net-sales-value', formatCurrency(summary.netSales));
  setText('transactions-value', formatNumber(summary.transactions));
  setText('average-basket-value', formatCurrency(summary.averageBasket));
  setText('discount-total-value', formatCurrency(summary.totalDiscounts));
  setText('refund-storno-value', formatCurrency(refundAndStorno));

  setText('cash-sales-value', formatCurrency(summary.cashSales));
  setText('card-sales-value', formatCurrency(summary.cardSales));
  setText('discount-rate-value', formatPercent(summary.discountRate));
  setText('refund-rate-value', formatPercent(summary.refundRate));
}

function renderTopProducts(items = []) {
  setHTML(
    'top-products-table',
    renderTableRows(
      items,
      [
        { key: 'name' },
        { key: 'sku' },
        { key: 'unitsSold', render: (item) => formatNumber(item.unitsSold) },
        { key: 'revenue', render: (item) => formatCurrency(item.revenue) },
      ],
      'No product performance data available.'
    )
  );
}

function renderCashierPerformance(items = []) {
  setHTML(
    'cashier-performance-table',
    renderTableRows(
      items,
      [
        { key: 'name' },
        { key: 'transactions', render: (item) => formatNumber(item.transactions) },
        { key: 'sales', render: (item) => formatCurrency(item.sales) },
        { key: 'discounts', render: (item) => formatCurrency(item.discounts) },
        { key: 'storno', render: (item) => formatCurrency(item.storno) },
      ],
      'No cashier performance data available.'
    )
  );
}

function renderAuditTable() {
  const currentTab = AUDIT_TABS[reportState.activeAuditTab];
  const items = safeArray(reportState[currentTab.key]);

  setHTML('audit-table-head', renderAuditHead(currentTab.columns));
  setHTML(
    'audit-table-body',
    renderTableRows(items, currentTab.columns, currentTab.empty)
  );

  document.querySelectorAll('[data-audit-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.auditTab === reportState.activeAuditTab);
  });
}

function bindAuditTabs() {
  document.querySelectorAll('[data-audit-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      reportState.activeAuditTab = button.dataset.auditTab;
      renderAuditTable();
    });
  });
}

function bindActions() {
  document.getElementById('run-report-btn')?.addEventListener('click', async () => {
    await refreshReports();
  });

  document.getElementById('export-report-btn')?.addEventListener('click', () => {
    toast('Export started');
  });

  document.getElementById('export-products-btn')?.addEventListener('click', () => {
    toast('Top products export started');
  });

  document.getElementById('export-cashiers-btn')?.addEventListener('click', () => {
    toast('Cashier export started');
  });

  document.getElementById('export-audit-btn')?.addEventListener('click', () => {
    toast(`Audit export started: ${AUDIT_TABS[reportState.activeAuditTab].label}`);
  });

  bindAuditTabs();
}

async function refreshReports() {
  try {
    const filters = getFilters();
    const reportData = await loadReportData(filters);

    reportState = {
      ...reportState,
      ...reportData,
    };

    renderSummary(reportState.summary);
    renderTopProducts(reportState.topProducts);
    renderCashierPerformance(reportState.cashierPerformance);
    renderAuditTable();
  } catch (error) {
    console.error('Failed to load reports:', error);
    toast('Failed to load report data');
  }
}

export async function renderReports() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = renderPageShell();
  bindActions();
  renderAuditTable();
  await refreshReports();
}
