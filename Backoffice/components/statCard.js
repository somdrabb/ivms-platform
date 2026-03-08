export function statCard({ title, value, icon }) {
  return `<div class="stat-card"><div class="stat-info"><h3>${title}</h3><p>${value}</p></div><div class="stat-icon ${icon}"><i class="fas fa-${icon}"></i></div></div>`;
}
