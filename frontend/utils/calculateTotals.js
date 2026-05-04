/**
 * Calculates the subtotal, tax amount, discount amount, and grand total for an invoice.
 * @param {Array} items - Array of objects with unitPrice and quantity.
 * @param {number} taxRate - Tax percentage (e.g., 10 for 10%).
 * @param {number} discount - Discount amount or percentage (handling as flat amount here).
 * @returns {Object} - Calculations results.
 */
export const calculateTotals = (items = [], taxRate = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice) || 0;
    const qty = parseFloat(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const discountAmount = parseFloat(discount) || 0;
  const grandTotal = subtotal + taxAmount - discountAmount;

  return {
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    grandTotal: Math.max(0, grandTotal).toFixed(2),
  };
};
