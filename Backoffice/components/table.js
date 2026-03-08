export function renderTable({ caption, columns, rows }) {
  return `
    <div class="table-responsive">
      <table class="data-table">
        <caption class="sr-only">${caption}</caption>
        <thead><tr>${columns.map((col) => `<th>${col}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</td>`).join('')}</tbody>
      </table>
    </div>
  `;
}
