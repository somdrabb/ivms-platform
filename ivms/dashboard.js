const dashboardKPIState = {
    activeKPI: '',
    activeTab: 'chart',
    cardCharts: {},
    detailChart: null,
    subviewChart: null,
    cache: {
        lowStock: [],
        restocked: [],
        topValueCategories: [],
        topWarehouses: [],
        topQty: [],
        topProfit: [],
        heavyRows: [],
        topStockValueProducts: []
    }
};

let dashboardKPIInitialized = false;

function getTopProductsBy(field, limit = 5, direction = 'desc') {
    const list = Array.isArray(products) ? [...products] : [];
    list.sort((a, b) => {
        const av = Number(a?.[field]) || 0;
        const bv = Number(b?.[field]) || 0;
        return direction === 'desc' ? bv - av : av - bv;
    });
    return list.slice(0, limit);
}

function getTopCategoriesByValue(limit = 5) {
    const map = new Map();
    (products || []).forEach((product) => {
        const key = product.primaryCategory || product.category || 'Uncategorized';
        const value = computeStockValue(product);
        map.set(key, (map.get(key) || 0) + value);
    });
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}

function getTopWarehousesByStock(limit = 5) {
    const map = new Map();
    (products || []).forEach((product) => {
        const key = getWarehouseDisplayName(product.warehouseId || product.warehouse || 'Unassigned');
        const qty = Number(product.amount) || 0;
        map.set(key, (map.get(key) || 0) + qty);
    });
    return Array.from(map.entries())
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, limit);
}

function rebuildDashboardCache() {
    const lowStock = getLowStockItems();
    const restocked = getRestockedItems();
    const topValueCategories = getTopCategoriesByValue(5);
    const topWarehouses = getTopWarehousesByStock(5);
    const topQty = getTopProductsBy('amount', 5, 'desc');
    const topProfit = [...(products || [])]
        .map(product => ({
            name: product.name || 'Unnamed product',
            value: ((Number(product.price) || 0) - (Number(product.cost) || 0)) * (Number(product.amount) || 0),
            units: Number(product.amount) || 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    const heavyRows = getTopProductsBy('weight', 5, 'desc');
    const topStockValueProducts = [...(products || [])]
        .map(product => ({
            name: product.name || 'Unnamed product',
            value: computeStockValue(product),
            units: Number(product.amount) || 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    dashboardKPIState.cache = {
        lowStock,
        restocked,
        topValueCategories,
        topWarehouses,
        topQty,
        topProfit,
        heavyRows,
        topStockValueProducts
    };
}

function createSparkBarChart(el, data = [], color = '#2563eb') {
    if (!el || typeof ApexCharts === 'undefined') return null;
    const chart = new ApexCharts(el, {
        chart: {
            type: 'bar',
            height: 90,
            sparkline: { enabled: true },
            toolbar: { show: false },
            animations: { enabled: true }
        },
        series: [{ data }],
        colors: [color],
        plotOptions: {
            bar: {
                columnWidth: '48%',
                borderRadius: 2
            }
        },
        dataLabels: { enabled: false },
        tooltip: { enabled: true },
        grid: { show: false },
        xaxis: { labels: { show: false } },
        yaxis: { show: false }
    });
    chart.render();
    return chart;
}

function createRadialMiniChart(el, value = 0, color = '#16a34a') {
    if (!el || typeof ApexCharts === 'undefined') return null;
    const chart = new ApexCharts(el, {
        chart: {
            type: 'radialBar',
            height: 90,
            sparkline: { enabled: true }
        },
        series: [Math.max(0, Math.min(100, value))],
        colors: [color],
        plotOptions: {
            radialBar: {
                hollow: { size: '58%' },
                track: { background: 'rgba(148,163,184,0.16)' },
                dataLabels: {
                    name: { show: false },
                    value: {
                        fontSize: '14px',
                        fontWeight: 700,
                        offsetY: 4,
                        formatter: (v) => `${Math.round(v)}%`
                    }
                }
            }
        }
    });
    chart.render();
    return chart;
}

function destroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
    }
}

function updateKPIDeltas() {
    const { lowStock, restocked } = dashboardKPIState.cache;
    const totalUnits = products.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const healthyCount = Math.max(0, products.length - lowStock.length);
    const avgUnitsPerSku = products.length ? totalUnits / products.length : 0;

    const buying = document.getElementById('total-buying-amount')?.textContent || '0.00';
    const selling = document.getElementById('totall-selling-amount')?.textContent || '0.00';
    const margin = document.getElementById('kpi-delta-profit')?.textContent || 'Margin 0%';
    const avgCost = document.getElementById('average-unit-cost')?.textContent || '0.00';
    const totalWeight = document.getElementById('total-weight')?.textContent || '0 kg';

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('kpi-delta-active-products', `${healthyCount} healthy · ${lowStock.length} low stock`);
    setText('kpi-delta-units-on-hand', `Avg ${formatNumber(avgUnitsPerSku, 1)} per SKU`);
    setText('kpi-delta-low-stock', lowStock.length ? `${lowStock.length} urgent product${lowStock.length === 1 ? '' : 's'}` : 'No urgent items');
    setText('kpi-delta-restock', restocked.length ? `${restocked.length} recently replenished` : 'No recent restocks');
    setText('kpi-delta-inventory-value', `Cost ${buying} · Sales ${selling}`);
    setText('kpi-delta-profit', margin);
    setText('kpi-delta-weight', `${totalWeight} · Avg cost ${avgCost}`);
}

function renderDashboardCardCharts() {
    if (typeof ApexCharts === 'undefined') {
        console.warn('ApexCharts is not loaded.');
        return;
    }

    rebuildDashboardCache();
    updateKPIDeltas();

    Object.values(dashboardKPIState.cardCharts).forEach(destroyChart);
    dashboardKPIState.cardCharts = {};

    const {
        lowStock,
        restocked,
        topValueCategories,
        topQty,
        topProfit,
        heavyRows
    } = dashboardKPIState.cache;

    dashboardKPIState.cardCharts['active-products'] = createRadialMiniChart(
        document.getElementById('chart-card-active-products'),
        products.length ? ((products.length - lowStock.length) / products.length) * 100 : 0,
        '#2563eb'
    );

    dashboardKPIState.cardCharts['units-on-hand'] = createSparkBarChart(
        document.getElementById('chart-card-units-on-hand'),
        topQty.map(item => Number(item.amount) || 0),
        '#4338ca'
    );

    dashboardKPIState.cardCharts['low-stock'] = createSparkBarChart(
        document.getElementById('chart-card-low-stock'),
        lowStock.slice(0, 5).map(item => Math.max(0, (item.reorderLevel || 10) - (item.amount || 0))),
        '#dc2626'
    );

    dashboardKPIState.cardCharts['restock'] = createSparkBarChart(
        document.getElementById('chart-card-restock'),
        restocked.slice(0, 5).map(item => Number(item.amount) || 0),
        '#16a34a'
    );

    dashboardKPIState.cardCharts['inventory-value'] = createSparkBarChart(
        document.getElementById('chart-card-inventory-value'),
        topValueCategories.map(item => Number(item.value) || 0),
        '#7c3aed'
    );

    dashboardKPIState.cardCharts['potential-profit'] = createSparkBarChart(
        document.getElementById('chart-card-profit'),
        topProfit.map(item => Number(item.value) || 0),
        '#d97706'
    );

    dashboardKPIState.cardCharts['weight-cost'] = createRadialMiniChart(
        document.getElementById('chart-card-weight'),
        Math.min(100, (avgNumberSafe(document.getElementById('average-unit-cost')?.textContent) || 0) * 10),
        '#0f766e'
    );
}

function avgNumberSafe(text) {
    const cleaned = String(text || '')
        .replace(/,/g, '')
        .replace(/[^\d.-]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
}

function rankBadge(rank) {
    return `<span class="kpi-rank kpi-rank--${Math.min(rank, 5)}">${rank}</span>`;
}

function stockChip(amount, reorderLevel = 10) {
    const qty = Number(amount) || 0;
    const reorder = Number(reorderLevel) || 10;
    if (qty <= 0) return `<span class="kpi-chip kpi-chip--danger">Out</span>`;
    if (qty <= reorder) return `<span class="kpi-chip kpi-chip--warning">Low</span>`;
    return `<span class="kpi-chip kpi-chip--success">OK</span>`;
}

function renderTop5Table(title, headers, rows) {
    return `
      <div class="kpi-detail-card">
        <h4>${escapeHtml(title)}</h4>
        <div class="kpi-detail-table-wrap">
          <table class="kpi-detail-table">
            <thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.join('')}</tbody>
          </table>
        </div>
      </div>
    `;
}

function getKPIDetailConfig(kpi) {
    const {
        lowStock,
        restocked,
        topValueCategories,
        topWarehouses,
        topQty,
        topProfit,
        heavyRows,
        topStockValueProducts
    } = dashboardKPIState.cache;

    switch (kpi) {
        case 'active-products':
            return {
                title: 'Active Products',
                subtitle: 'Category and warehouse distribution of active SKUs.',
                chart: {
                    type: 'donut',
                    series: topValueCategories.map(x => Math.round(x.value || 0)),
                    labels: topValueCategories.map(x => x.name),
                    colors: ['#2563eb', '#60a5fa', '#93c5fd', '#1d4ed8', '#7dd3fc']
                },
                top5: `
                  ${renderTop5Table('Top Categories', ['#', 'Category', 'Value'],
                    topValueCategories.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatCurrency(item.value)}</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Top Warehouses', ['#', 'Warehouse', 'Units'],
                    topWarehouses.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatNumber(item.qty, 0)}</td></tr>`))}
                `,
                related: { label: 'Open product table', filter: 'all' }
            };

        case 'units-on-hand':
            return {
                title: 'Units On Hand',
                subtitle: 'Highest quantity products and unit distribution.',
                chart: {
                    type: 'bar',
                    series: [{ name: 'Units', data: topQty.map(x => Number(x.amount) || 0) }],
                    categories: topQty.map(x => x.name || 'Unnamed'),
                    colors: ['#4338ca']
                },
                top5: `
                  ${renderTop5Table('Top Products by Units', ['#', 'Product', 'Units'],
                    topQty.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name || 'Unnamed')}</td><td>${formatNumber(item.amount || 0, 0)}</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Top Warehouses by Units', ['#', 'Warehouse', 'Units'],
                    topWarehouses.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatNumber(item.qty, 0)}</td></tr>`))}
                `,
                related: { label: 'Open product table', filter: 'all' }
            };

        case 'low-stock':
            return {
                title: 'Low Stock Alerts',
                subtitle: 'Urgent reorder items and reorder gaps.',
                chart: {
                    type: 'bar',
                    series: [{ name: 'Gap', data: lowStock.slice(0, 5).map(x => Math.max(0, (x.reorderLevel || 10) - (x.amount || 0))) }],
                    categories: lowStock.slice(0, 5).map(x => x.name || 'Unnamed'),
                    colors: ['#dc2626']
                },
                top5: `
                  ${renderTop5Table('Most Urgent Products', ['#', 'Product', 'Stock', 'Status'],
                    lowStock.slice(0, 5).map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name || 'Unnamed')}</td><td>${formatNumber(item.amount || 0, 0)} / ${formatNumber(item.reorderLevel || 10, 0)}</td><td>${stockChip(item.amount, item.reorderLevel)}</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Low Stock by Warehouse', ['#', 'Warehouse', 'Units'],
                    topWarehouses.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatNumber(item.qty, 0)}</td></tr>`))}
                `,
                related: { label: 'Open low stock table', filter: 'low-stock' }
            };

        case 'restock':
            return {
                title: 'Restock Queue',
                subtitle: 'Recently replenished products and recovery volume.',
                chart: {
                    type: 'bar',
                    series: [{ name: 'Units', data: restocked.slice(0, 5).map(x => Number(x.amount) || 0) }],
                    categories: restocked.slice(0, 5).map(x => x.name || 'Unnamed'),
                    colors: ['#16a34a']
                },
                top5: `
                  ${renderTop5Table('Recently Restocked', ['#', 'Product', 'Units'],
                    restocked.slice(0, 5).map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name || 'Unnamed')}</td><td>${formatNumber(item.amount || 0, 0)}</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Restock by Warehouse', ['#', 'Warehouse', 'Units'],
                    topWarehouses.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatNumber(item.qty, 0)}</td></tr>`))}
                `,
                related: { label: 'Open restock table', filter: 'restock' }
            };

        case 'inventory-value':
            return {
                title: 'Inventory Value',
                subtitle: 'Category value contribution and high-value products.',
                chart: {
                    type: 'bar',
                    series: [{ name: 'Value', data: topValueCategories.map(x => Number(x.value) || 0) }],
                    categories: topValueCategories.map(x => x.name),
                    colors: ['#7c3aed']
                },
                top5: `
                  ${renderTop5Table('Top Categories by Value', ['#', 'Category', 'Value'],
                    topValueCategories.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatCurrency(item.value)}</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Top Products by Stock Value', ['#', 'Product', 'Value'],
                    topStockValueProducts.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatCurrency(item.value)}</td></tr>`))}
                `
            };

        case 'potential-profit':
            return {
                title: 'Potential Profit',
                subtitle: 'Highest margin contributors based on current stock.',
                chart: {
                    type: 'bar',
                    series: [{ name: 'Profit', data: topProfit.map(x => Number(x.value) || 0) }],
                    categories: topProfit.map(x => x.name),
                    colors: ['#d97706']
                },
                top5: `
                  ${renderTop5Table('Top Profit Contributors', ['#', 'Product', 'Profit', 'Units'],
                    topProfit.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatCurrency(item.value)}</td><td>${formatNumber(item.units, 0)}</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Top Categories by Value', ['#', 'Category', 'Value'],
                    topValueCategories.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatCurrency(item.value)}</td></tr>`))}
                `
            };

        case 'weight-cost':
            return {
                title: 'Stock Weight / Avg Cost',
                subtitle: 'Weight leaders and logistics distribution.',
                chart: {
                    type: 'bar',
                    series: [{ name: 'Weight', data: heavyRows.map(x => Number(x.weight) || 0) }],
                    categories: heavyRows.map(x => x.name || 'Unnamed'),
                    colors: ['#0f766e']
                },
                top5: `
                  ${renderTop5Table('Heaviest Products', ['#', 'Product', 'Weight'],
                    heavyRows.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name || 'Unnamed')}</td><td>${formatNumber(item.weight || 0, 2)} kg</td></tr>`))}
                `,
                distribution: `
                  ${renderTop5Table('Warehouse Units', ['#', 'Warehouse', 'Units'],
                    topWarehouses.map((item, i) => `<tr><td>${rankBadge(i + 1)}</td><td>${escapeHtml(item.name)}</td><td>${formatNumber(item.qty, 0)}</td></tr>`))}
                `
            };

        default:
            return null;
    }
}

function renderApexDetailChart(targetEl, config) {
    if (!targetEl || !config || typeof ApexCharts === 'undefined') return null;

    const baseOptions = {
        chart: {
            height: 320,
            toolbar: { show: false },
            animations: { enabled: true }
        },
        dataLabels: { enabled: false },
        stroke: { width: 2 },
        legend: { position: 'bottom' }
    };

    let options;
    if (config.type === 'donut') {
        options = {
            ...baseOptions,
            chart: { ...baseOptions.chart, type: 'donut' },
            series: config.series,
            labels: config.labels,
            colors: config.colors
        };
    } else {
        options = {
            ...baseOptions,
            chart: { ...baseOptions.chart, type: 'bar' },
            series: config.series,
            colors: config.colors,
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '46%'
                }
            },
            xaxis: {
                categories: config.categories,
                labels: { rotate: -20 }
            },
            yaxis: {
                labels: {
                    formatter: (val) => `${Math.round(val)}`
                }
            }
        };
    }

    const chart = new ApexCharts(targetEl, options);
    chart.render();
    return chart;
}

function renderKPIDetailView(kpi, tab = 'chart', target = 'panel') {
    const config = getKPIDetailConfig(kpi);
    if (!config) return;

    const chartEl = target === 'subview'
        ? document.getElementById('dashboard-kpi-subview-chart')
        : document.getElementById('kpi-detail-chart');

    const contentEl = target === 'subview'
        ? document.getElementById('dashboard-kpi-subview-body')
        : document.getElementById('kpi-detail-content');

    if (!chartEl || !contentEl) return;

    if (target === 'subview') {
        destroyChart(dashboardKPIState.subviewChart);
        dashboardKPIState.subviewChart = null;
    } else {
        destroyChart(dashboardKPIState.detailChart);
        dashboardKPIState.detailChart = null;
    }

    if (tab === 'chart') {
        chartEl.style.display = '';
        contentEl.innerHTML = '';
        const chart = renderApexDetailChart(chartEl, config.chart);
        if (target === 'subview') dashboardKPIState.subviewChart = chart;
        else dashboardKPIState.detailChart = chart;
    } else {
        chartEl.innerHTML = '';
        chartEl.style.display = 'none';
        contentEl.innerHTML = tab === 'top5' ? config.top5 : config.distribution;
    }
}

function syncKPIButtons(tab) {
    document.querySelectorAll('.kpi-detail-tab').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.kpiTab === tab);
    });
    document.querySelectorAll('.dashboard-kpi-subview-tab').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.kpiSubtab === tab);
    });
}

function openRelatedInventoryView(filterType) {
    const targetTab = document.querySelector('.primary-nav .nav-pill[data-tab="product-management"]');
    targetTab?.click();

    switch (filterType) {
        case 'low-stock':
            renderInventory(getLowStockItems(), false, 'low-stock');
            break;
        case 'restock':
            renderInventory(getRestockedItems(), false, 'restock');
            break;
        default:
            renderInventory(products, false, 'all');
            break;
    }
}

function openKPIDetailPanel(kpi) {
    closeKPIDashboardSubview();
    dashboardKPIState.activeKPI = kpi;
    dashboardKPIState.activeTab = 'chart';
    rebuildDashboardCache();

    const panel = document.getElementById('kpi-detail-panel');
    const titleEl = document.getElementById('kpi-detail-title');
    const subtitleEl = document.getElementById('kpi-detail-subtitle');
    const relatedBtn = document.getElementById('kpi-detail-open-related');
    const config = getKPIDetailConfig(kpi);

    if (!panel || !titleEl || !subtitleEl || !config) return;

    setActiveDashboardCard(kpi);
    syncKPIButtons('chart');
    panel.hidden = false;

    titleEl.textContent = config.title;
    subtitleEl.textContent = config.subtitle;

    if (config.related) {
        relatedBtn.hidden = false;
        relatedBtn.textContent = config.related.label;
        relatedBtn.onclick = () => openRelatedInventoryView(config.related.filter);
    } else {
        relatedBtn.hidden = true;
        relatedBtn.onclick = null;
    }

    renderKPIDetailView(kpi, 'chart', 'panel');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openKPIDashboardSubview() {
    const subview = document.getElementById('dashboard-kpi-subview');
    const titleEl = document.getElementById('dashboard-kpi-subview-title');
    const subtitleEl = document.getElementById('dashboard-kpi-subview-subtitle');
    const config = getKPIDetailConfig(dashboardKPIState.activeKPI);

    if (!subview || !config) return;

    titleEl.textContent = config.title;
    subtitleEl.textContent = config.subtitle;
    subview.hidden = false;
    syncKPIButtons(dashboardKPIState.activeTab);
    renderKPIDetailView(dashboardKPIState.activeKPI, dashboardKPIState.activeTab, 'subview');
    subview.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeKPIDetailPanel() {
    const panel = document.getElementById('kpi-detail-panel');
    if (panel) panel.hidden = true;
    destroyChart(dashboardKPIState.detailChart);
    dashboardKPIState.detailChart = null;
    setActiveDashboardCard('');
}

function closeKPIDashboardSubview() {
    const subview = document.getElementById('dashboard-kpi-subview');
    if (subview) subview.hidden = true;
    destroyChart(dashboardKPIState.subviewChart);
    dashboardKPIState.subviewChart = null;
}

function setActiveDashboardCard(kpi) {
    document.querySelectorAll('.dashboard-kpi-card').forEach(card => {
        card.classList.toggle('is-active', card.dataset.kpi === kpi);
    });
}

function initializeDashboardKPIDrilldown() {
    if (dashboardKPIInitialized) return;
    dashboardKPIInitialized = true;

    document.querySelectorAll('.dashboard-kpi-card').forEach(card => {
        const open = () => openKPIDetailPanel(card.dataset.kpi || '');
        card.addEventListener('click', open);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open();
            }
        });
    });

    document.getElementById('kpi-detail-close')?.addEventListener('click', closeKPIDetailPanel);
    document.getElementById('kpi-detail-popout')?.addEventListener('click', openKPIDashboardSubview);
    document.getElementById('dashboard-kpi-subview-back')?.addEventListener('click', closeKPIDashboardSubview);

    document.querySelectorAll('.kpi-detail-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.kpiTab || 'chart';
            dashboardKPIState.activeTab = tab;
            syncKPIButtons(tab);
            renderKPIDetailView(dashboardKPIState.activeKPI, tab, 'panel');
        });
    });

    document.querySelectorAll('.dashboard-kpi-subview-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.kpiSubtab || 'chart';
            dashboardKPIState.activeTab = tab;
            syncKPIButtons(tab);
            renderKPIDetailView(dashboardKPIState.activeKPI, tab, 'subview');
        });
    });
}
