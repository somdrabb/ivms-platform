import { CONFIG, setTheme } from './core/config.js';
import { startClock } from './core/clock.js';
import { toast } from './core/toast.js';
import { setRoutes, initRouter, navigate } from './core/router.js';

import { renderDashboard } from './views/dashboard.js';
import { renderTerminals } from './views/terminals.js';
import { renderCashiers } from './views/cashiers.js';
import { renderInventory } from './views/inventory.js';
import { renderSales } from './views/sales.js';
import { renderCash } from './views/cash.js';
import { renderReports } from './views/reports.js';
import { renderSync } from './views/sync.js';
import { renderBank } from './views/bank.js';
import { renderSettings } from './views/settings.js';

const THEME_STORAGE_KEY = 'theme';
const DEFAULT_THEME = 'light';

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
}

function getNextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

function applyStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
  setTheme(storedTheme);
}

function setupThemeToggle() {
  const toggleThemeButton = document.getElementById('toggle-theme');
  if (!toggleThemeButton) return;

  toggleThemeButton.addEventListener('click', () => {
    const nextTheme = getNextTheme(getCurrentTheme());
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

function handleLogout() {
  localStorage.removeItem('auth_token');
  CONFIG.TOKEN = null;
  toast('Logged out successfully');
  navigate('dashboard');
}

const ROUTES = [
  {
    group: 'Operations',
    items: [
      { id: 'dashboard', title: 'Dashboard', icon: 'fa-home', permission: 'admin', renderer: renderDashboard },
      { id: 'terminals', title: 'POS Terminals', icon: 'fa-cash-register', permission: 'admin', renderer: renderTerminals },
      { id: 'cashiers', title: 'Cashiers', icon: 'fa-users', permission: 'admin', renderer: renderCashiers },
      { id: 'inventory', title: 'Inventory', icon: 'fa-boxes', permission: 'admin', renderer: renderInventory },
      { id: 'sales', title: 'Sales', icon: 'fa-shopping-cart', permission: 'admin', renderer: renderSales },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'cash', title: 'Cash Management', icon: 'fa-money-bill-wave', permission: 'admin', renderer: renderCash },
      { id: 'reports', title: 'Reports', icon: 'fa-chart-bar', permission: 'admin', renderer: renderReports },
      { id: 'bank', title: 'Bank Accounts', icon: 'fa-university', permission: 'admin', renderer: renderBank },
    ],
  },
  {
    group: 'Administration',
    items: [
      { id: 'settings', title: 'Settings', icon: 'fa-cog', permission: 'admin', renderer: renderSettings },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'sync', title: 'Sync Status', icon: 'fa-sync-alt', permission: 'admin', renderer: renderSync },
      { id: 'logout', title: 'Logout', icon: 'fa-sign-out-alt', permission: 'admin', renderer: handleLogout },
    ],
  },
];

function bootstrapApp() {
  applyStoredTheme();
  setRoutes(ROUTES);
  initRouter();
  startClock();
  setupThemeToggle();
}

bootstrapApp();
