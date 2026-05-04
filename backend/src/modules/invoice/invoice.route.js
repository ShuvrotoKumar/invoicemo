const express = require('express');
const invoiceController = require('./invoice.controller');
const { authMiddleware, authorize } = require('../../middleware/auth.middleware');
const { validate, invoiceSchema, paginationSchema } = require('../../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/analytics', invoiceController.getAnalytics);
router.get('/', validate(paginationSchema), invoiceController.getAll);
router.get('/:id/pdf', invoiceController.getPDF);
router.get('/:id', invoiceController.getById);
router.post('/', validate(invoiceSchema), invoiceController.create);
router.patch('/:id', invoiceController.update);
router.delete('/:id', invoiceController.deleteInvoice);
router.post('/:id/send', invoiceController.sendInvoice);

module.exports = router;
