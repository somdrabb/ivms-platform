import { $, $$ } from './utils.js';

const DEFAULT_ROUTE = 'dashboard';

let routeGroups = [];
let flatRoutes = [];
let routeMap = Object.create(null);
let isRouterInitialized = false;

function normalizeRoute(route) {
  if (!route) return DEFAULT_ROUTE;
  return String(route).replace(/^#/, '').trim() || DEFAULT_ROUTE;
}

function getCurrentRoute() {
  return normalizeRoute(window.location.hash);
}

function getSafeRoute(route) {
  const normalizedRoute = normalizeRoute(route);
  return routeMap[normalizedRoute] ? normalizedRoute : DEFAULT_ROUTE;
}

function flattenRoutes(groups = []) {
  return groups.flatMap((group) => group.items || []);
}

function buildSidebarGroup(group) {
  const items = (group.items || [])
    .map(
      (route) => `
        <li role="presentation">
          <a
            href="#${route.id}"
            data-route="${route.id}"
            data-permission="${route.permission || ''}"
            role="menuitem"
          >
            <i class="fas ${route.icon}" aria-hidden="true"></i>
            <span>${route.title}</span>
          </a>
        </li>
      `
    )
    .join('');

  return `
    <div class="sidebar-group">
      <div class="sidebar-group-title">${group.group}</div>
      <ul class="sidebar-group-list">
        ${items}
      </ul>
    </div>
  `;
}

export function setRoutes(config = []) {
  routeGroups = Array.isArray(config) ? config : [];
  flatRoutes = flattenRoutes(routeGroups);

  routeMap = Object.fromEntries(
    flatRoutes.map(({ id, renderer }) => [id, renderer])
  );
}

export function navigate(route) {
  const targetRoute = getSafeRoute(route);

  if (getCurrentRoute() === targetRoute) {
    mount();
    return;
  }

  window.location.hash = targetRoute;
}

export function renderSidebar(selector = '#sidebar-nav') {
  const sidebarList = $(selector);
  if (!sidebarList) return;

  sidebarList.innerHTML = routeGroups.map(buildSidebarGroup).join('');
  attachSidebarHandlers(sidebarList);
}

function attachSidebarHandlers(container) {
  const links = $$('a[data-route]', container);

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(link.dataset.route);
    });
  });
}

export function setActive(route) {
  const activeRoute = getSafeRoute(route);

  $$('.sidebar-menu a').forEach((link) => {
    const isActive = link.dataset.route === activeRoute;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

export function mount() {
  const targetRoute = getSafeRoute(getCurrentRoute());
  const renderView = routeMap[targetRoute];

  setActive(targetRoute);

  if (typeof renderView === 'function') {
    renderView();
  }
}

function handleHashChange() {
  mount();
}

export function initRouter() {
  if (isRouterInitialized) return;

  renderSidebar();
  mount();

  window.addEventListener('hashchange', handleHashChange);
  isRouterInitialized = true;
}
