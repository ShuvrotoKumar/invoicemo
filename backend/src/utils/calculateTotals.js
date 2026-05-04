const calculateTotals = (items, tax = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return sum + quantity * unitPrice;
  }, 0);

  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = discount || 0;
  const grandTotal = subtotal + taxAmount - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    grandTotal: Math.round(Math.max(0, grandTotal) * 100) / 100,
  };
};

module.exports = calculateTotals;
