const nodemailer = require('nodemailer');
const config = require('../config/env');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const sendInvoiceEmail = async ({ to, subject, body, attachments }) => {
  try {
    const mailOptions = {
      from: `"${config.smtp.from}" <${config.smtp.from}>`,
      to,
      subject: subject || 'Your Invoice',
      html: body,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const buildInvoiceEmailBody = (invoice) => {
  const symbol = getCurrencySymbol(invoice.currency || 'USD');
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Invoice ${invoice.invoiceNumber}</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">Hi ${invoice.clientName},</p>
        <p style="font-size: 14px; color: #6b7280;">Please find attached your invoice from <strong>${invoice.companyName || 'us'}</strong>.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Invoice Number:</td>
              <td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Issue Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formatDate(invoice.issueDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Due Date:</td>
              <td style="padding: 8px 0; text-align: right;">${formatDate(invoice.dueDate)}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; font-size: 16px;">Amount Due:</td>
              <td style="padding: 12px 0; font-weight: bold; font-size: 16px; color: #2563eb; text-align: right;">${symbol} ${invoice.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        ${invoice.notes ? `<p style="font-size: 13px; color: #6b7280; font-style: italic;">${invoice.notes}</p>` : ''}
        <p style="font-size: 14px; color: #6b7280;">If you have any questions, please don't hesitate to reach out.</p>
      </div>
      <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Powered by InvoiceMo</p>
      </div>
    </div>
  `;
};

const getCurrencySymbol = (code) => {
  const symbols = { BDT: '\u09F3', EUR: '\u20AC', GBP: '\u00A3', INR: '\u20B9', USD: '$' };
  return symbols[code] || '$';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

module.exports = { sendInvoiceEmail, buildInvoiceEmailBody };
