const Invoice = require('./invoice.model');
const generateInvoiceNumber = require('../../utils/generateInvoiceNumber');
const calculateTotals = require('../../utils/calculateTotals');
const generatePDF = require('../../utils/generatePDF');
const { sendInvoiceEmail, buildInvoiceEmailBody } = require('../../utils/sendEmail');
const { AppError } = require('../../middleware/errorHandler');

const createInvoice = async (userId, data) => {
  const invoiceNumber = await generateInvoiceNumber(userId);

  const items = data.items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));

  const totals = calculateTotals(items, data.tax || 0, data.discount || 0);

  const invoice = await Invoice.create({
    userId,
    invoiceNumber,
    companyName: data.companyName,
    companyLogo: data.companyLogo,
    companyAddress: data.companyAddress,
    companyEmail: data.companyEmail,
    companyPhone: data.companyPhone,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientAddress: data.clientAddress,
    clientPhone: data.clientPhone,
    issueDate: data.issueDate || new Date(),
    dueDate: data.dueDate,
    currency: data.currency || 'USD',
    items,
    subtotal: totals.subtotal,
    tax: data.tax || 0,
    taxAmount: totals.taxAmount,
    discount: data.discount || 0,
    discountAmount: totals.discountAmount,
    grandTotal: totals.grandTotal,
    status: data.status || 'draft',
    notes: data.notes,
    terms: data.terms,
  });

  return invoice;
};

const getAllInvoices = async (userId, filters) => {
  const { page, limit, status, search, dateFrom, dateTo, currency } = filters;
  const skip = (page - 1) * limit;

  const query = { userId, deletedAt: null };

  if (status) {
    query.status = status;
  }

  if (currency) {
    query.currency = currency;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments(query),
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + invoices.length < total,
    },
  };
};

const getInvoiceById = async (userId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId, deletedAt: null });
  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }
  return invoice;
};

const updateInvoice = async (userId, invoiceId, data) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId, deletedAt: null });
  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  if (data.items) {
    data.items = data.items.map((item) => ({
      ...item,
      total: (item.quantity || 0) * (item.unitPrice || 0),
    }));

    const totals = calculateTotals(data.items, data.tax ?? invoice.tax, data.discount ?? invoice.discount);
    data.subtotal = totals.subtotal;
    data.taxAmount = totals.taxAmount;
    data.discountAmount = totals.discountAmount;
    data.grandTotal = totals.grandTotal;
  }

  if (data.tax !== undefined || data.discount !== undefined) {
    const tax = data.tax ?? invoice.tax;
    const discount = data.discount ?? invoice.discount;
    const items = data.items || invoice.items;
    const totals = calculateTotals(items, tax, discount);
    data.subtotal = totals.subtotal;
    data.taxAmount = totals.taxAmount;
    data.discountAmount = totals.discountAmount;
    data.grandTotal = totals.grandTotal;
  }

  const updated = await Invoice.findOneAndUpdate(
    { _id: invoiceId, userId, deletedAt: null },
    { $set: data },
    { new: true, runValidators: true }
  );

  return updated;
};

const deleteInvoice = async (userId, invoiceId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, userId, deletedAt: null });
  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  invoice.deletedAt = new Date();
  invoice.status = 'draft';
  await invoice.save();

  return { message: 'Invoice deleted successfully' };
};

const generateInvoicePDF = async (userId, invoiceId) => {
  const invoice = await getInvoiceById(userId, invoiceId);
  const pdfBuffer = await generatePDF(invoice);
  return { pdfBuffer, filename: `${invoice.invoiceNumber}.pdf` };
};

const sendInvoice = async (userId, invoiceId) => {
  const invoice = await getInvoiceById(userId, invoiceId);

  if (!invoice.clientEmail) {
    throw new AppError('Client email is required to send invoice', 400);
  }

  const { pdfBuffer, filename } = await generateInvoicePDF(userId, invoiceId);
  const emailBody = buildInvoiceEmailBody(invoice);

  await sendInvoiceEmail({
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName || 'InvoiceMo'}`,
    body: emailBody,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  await Invoice.findByIdAndUpdate(invoiceId, {
    status: 'sent',
    sentAt: new Date(),
  });

  return { message: 'Invoice sent successfully', email: invoice.clientEmail };
};

const getAnalytics = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [totalInvoices, paidInvoices, unpaidInvoices, monthlyRevenue, yearlyRevenue] =
    await Promise.all([
      Invoice.countDocuments({ userId, deletedAt: null }),
      Invoice.countDocuments({ userId, status: 'paid', deletedAt: null }),
      Invoice.countDocuments({ userId, status: { $in: ['unpaid', 'sent', 'overdue'] }, deletedAt: null }),
      Invoice.aggregate([
        { $match: { userId, status: 'paid', createdAt: { $gte: startOfMonth }, deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { userId, status: 'paid', createdAt: { $gte: startOfYear }, deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
    ]);

  const statusBreakdown = await Invoice.aggregate([
    { $match: { userId, deletedAt: null } },
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$grandTotal' } } },
  ]);

  const monthlyTrend = await Invoice.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const currencyBreakdown = await Invoice.aggregate([
    { $match: { userId, deletedAt: null } },
    { $group: { _id: '$currency', count: { $sum: 1 }, revenue: { $sum: '$grandTotal' } } },
  ]);

  return {
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    monthlyRevenue: monthlyRevenue[0] ? monthlyRevenue[0].total : 0,
    monthlyInvoiceCount: monthlyRevenue[0] ? monthlyRevenue[0].count : 0,
    yearlyRevenue: yearlyRevenue[0] ? yearlyRevenue[0].total : 0,
    yearlyInvoiceCount: yearlyRevenue[0] ? yearlyRevenue[0].count : 0,
    statusBreakdown: statusBreakdown.reduce((acc, item) => {
      acc[item._id] = { count: item.count, revenue: item.revenue };
      return acc;
    }, {}),
    monthlyTrend,
    currencyBreakdown,
  };
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  generateInvoicePDF,
  sendInvoice,
  getAnalytics,
};
