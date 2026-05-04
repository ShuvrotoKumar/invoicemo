const invoiceService = require('./invoice.service');

const create = async (req, res, next) => {
  try {
    const invoice = await invoiceService.createInvoice(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 20,
      status: req.query.status,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      currency: req.query.currency,
    };

    const result = await invoiceService.getAllInvoices(req.user._id, filters);
    res.status(200).json({
      status: 'success',
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.user._id, req.params.id);
    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.user._id, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.deleteInvoice(req.user._id, req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const getPDF = async (req, res, next) => {
  try {
    const { pdfBuffer, filename } = await invoiceService.generateInvoicePDF(req.user._id, req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const sendInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.sendInvoice(req.user._id, req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { email: result.email },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await invoiceService.getAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteInvoice,
  getPDF,
  sendInvoice,
  getAnalytics,
};
