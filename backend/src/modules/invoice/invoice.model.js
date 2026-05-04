const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  total: {
    type: Number,
  },
}, { _id: true });

itemSchema.pre('save', function (next) {
  this.total = this.quantity * this.unitPrice;
  next();
});

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    companyLogo: {
      type: String,
      trim: true,
    },
    companyAddress: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    companyEmail: {
      type: String,
      trim: true,
    },
    companyPhone: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: 200,
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
    },
    clientAddress: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    clientPhone: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    currency: {
      type: String,
      enum: ['USD', 'BDT', 'EUR', 'GBP', 'INR'],
      default: 'USD',
    },
    items: [itemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'unpaid', 'overdue'],
      default: 'draft',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    terms: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ clientName: 'text', invoiceNumber: 'text' });

invoiceSchema.pre('save', function (next) {
  if (this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  if (this.status === 'paid' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

invoiceSchema.methods.toJSON = function () {
  const invoice = this.toObject();
  delete invoice.__v;
  delete invoice.deletedAt;
  return invoice;
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
