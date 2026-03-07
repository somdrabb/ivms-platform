export function normalizePurchaseItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 200).map(item => ({
    productId: item.productId || '',
    productName: item.productName || '',
    quantity: Number.parseInt(item.quantity, 10) || 0,
    unitCost: Number.parseFloat(item.unitCost) || 0
  }));
}

export function computePurchaseTotals(items = []) {
  const normalized = normalizePurchaseItems(items);
  const totals = normalized.reduce((acc, item) => {
    return {
      totalItems: acc.totalItems + (Number(item.quantity) || 0),
      totalCost: acc.totalCost + ((Number(item.quantity) || 0) * (Number(item.unitCost) || 0))
    };
  }, { totalItems: 0, totalCost: 0 });
  return { normalizedItems: normalized, ...totals };
}
