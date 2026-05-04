const Invoice = require('../modules/invoice/invoice.model');

const generateInvoiceNumber = async (userId) => {
  const prefix = 'INV';
  const year = new Date().getFullYear().toString().slice(-2);

  const count = await Invoice.countDocuments({ userId, deletedAt: null });
  const sequence = String(count + 1).padStart(5, '0');

  return `${prefix}-${year}-${sequence}`;
};

module.exports = generateInvoiceNumber;
