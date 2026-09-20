/** Format amounts for the SHOP storefront (INR). */
export function formatINR(amount: number) {
  const n = Number(amount) || 0;
  return `INR ${Math.round(n).toLocaleString('en-IN')}`;
}

export function formatINRCompact(amount: number) {
  const n = Number(amount) || 0;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
