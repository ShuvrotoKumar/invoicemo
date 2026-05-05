const { z } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => {
          // Remove "body." prefix for cleaner messages
          const path = e.path.join('.');
          const cleanPath = path.startsWith('body.') ? path.replace('body.', '') : path;
          return `${cleanPath}: ${e.message}`;
        });
        return res.status(400).json({
          status: 'fail',
          message: 'Validation error',
          errors: messages,
        });
      }
      next(error);
    }
  };
};

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(128),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const invoiceSchema = z.object({
  body: z.object({
    companyName: z.string().min(1).max(200).optional(),
    companyLogo: z.string().optional().or(z.literal('')),
    companyAddress: z.string().max(500).optional(),
    companyEmail: z.string().email().optional().or(z.literal('')),
    companyPhone: z.string().max(50).optional(),
    clientName: z.string().min(1).max(200),
    clientEmail: z.string().email(),
    clientAddress: z.string().max(500).optional(),
    clientPhone: z.string().max(50).optional(),
    issueDate: z.string().datetime().optional().or(z.string().date()),
    dueDate: z.string().datetime().optional().or(z.string().date()),
    currency: z.enum(['USD', 'BDT', 'EUR', 'GBP', 'INR']).optional(),
    items: z
      .array(
        z.object({
          itemName: z.string().min(1).max(200),
          description: z.string().max(1000).optional(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
        })
      )
      .min(1),
    tax: z.number().min(0).max(100).optional(),
    discount: z.number().min(0).optional(),
    status: z.enum(['draft', 'sent', 'paid', 'unpaid', 'overdue']).optional(),
    notes: z.string().max(2000).optional(),
    terms: z.string().max(2000).optional(),
  }),
});

const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    status: z.enum(['draft', 'sent', 'paid', 'unpaid', 'overdue']).optional(),
    search: z.string().max(200).optional(),
    dateFrom: z.string().date().optional(),
    dateTo: z.string().date().optional(),
    currency: z.enum(['USD', 'BDT', 'EUR', 'GBP', 'INR']).optional(),
  }),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  invoiceSchema,
  paginationSchema,
};
