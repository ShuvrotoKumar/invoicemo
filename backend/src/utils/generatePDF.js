const PDFDocument = require('pdfkit');

const generatePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: invoice.companyName || 'InvoiceMo',
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const symbol = getCurrencySymbol(invoice.currency || 'USD');
      const primaryColor = '#2563eb';
      const grayDark = '#1f2937';
      const grayMedium = '#6b7280';
      const grayLight = '#f3f4f6';

      // Header bar
      doc
        .fillColor(primaryColor)
        .rect(0, 0, 595.28, 80)
        .fill();

      doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('INVOICE', 50, 22);

      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica')
        .text(invoice.invoiceNumber, 450, 30, { align: 'right' });

      doc.moveDown(4);

      // Company info
      if (invoice.companyName) {
        doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text(invoice.companyName, 50);
      }

      doc.fillColor(grayMedium).fontSize(9).font('Helvetica');
      const companyDetails = [];
      if (invoice.companyAddress) companyDetails.push(invoice.companyAddress);
      if (invoice.companyEmail) companyDetails.push(invoice.companyEmail);
      if (invoice.companyPhone) companyDetails.push(invoice.companyPhone);
      if (companyDetails.length > 0) {
        doc.text(companyDetails.join('\n'), 50);
      }

      doc.moveDown(1);

      // Invoice details
      doc
        .fillColor(grayMedium)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Issue Date:', 350, doc.y, { align: 'right' });
      doc
        .font('Helvetica')
        .text(formatDate(invoice.issueDate), 450, doc.y - 12, { align: 'right' });

      doc
        .fillColor(grayMedium)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Due Date:', 350, doc.y, { align: 'right' });
      doc
        .font('Helvetica')
        .text(formatDate(invoice.dueDate), 450, doc.y - 12, { align: 'right' });

      doc
        .fillColor(grayMedium)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Status:', 350, doc.y, { align: 'right' });
      doc
        .font('Helvetica')
        .fillColor(getStatusColor(invoice.status))
        .text((invoice.status || 'unpaid').toUpperCase(), 450, doc.y - 12, { align: 'right' });

      doc.moveDown(1.5);

      // Divider
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      // Bill To
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('BILL TO', 50);
      doc.fillColor(grayDark).fontSize(12).font('Helvetica-Bold').text(invoice.clientName || '', 50);
      doc.fillColor(grayMedium).fontSize(9).font('Helvetica');
      const clientDetails = [];
      if (invoice.clientEmail) clientDetails.push(invoice.clientEmail);
      if (invoice.clientPhone) clientDetails.push(invoice.clientPhone);
      if (invoice.clientAddress) clientDetails.push(invoice.clientAddress);
      if (clientDetails.length > 0) {
        doc.text(clientDetails.join('\n'), 50);
      }

      doc.moveDown(1);

      // Items table header
      const tableTop = doc.y;
      const tableHeaders = ['Description', 'Qty', 'Unit Price', 'Total'];
      const colWidths = [240, 60, 100, 100];
      const colPositions = [50, 290, 350, 450];

      doc.fillColor(grayLight).rect(50, tableTop, 495, 25).fill();

      doc.fillColor(grayMedium).fontSize(8).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        const align = i === 0 ? 'left' : i === 1 ? 'center' : 'right';
        const x = i === 0 ? 55 : colPositions[i] + colWidths[i] - 5;
        doc.text(header, x, tableTop + 6, {
          width: colWidths[i] - 10,
          align,
        });
      });

      // Items rows
      let currentY = tableTop + 30;
      (invoice.items || []).forEach((item, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        const rowHeight = index % 2 === 0 ? 25 : 25;
        if (index % 2 === 0) {
          doc.fillColor(grayLight).rect(50, currentY - 5, 495, rowHeight).fill();
        }

        doc.fillColor(grayDark).fontSize(9).font('Helvetica');
        doc.text(item.itemName || '', 55, currentY, { width: 230, ellipsis: true });

        if (item.description) {
          doc.fillColor(grayMedium).fontSize(7).text(item.description, 55, currentY + 10, { width: 230, ellipsis: true });
        }

        doc.text(String(item.quantity || 0), 290, currentY, { width: 60, align: 'center' });
        doc.text(`${symbol} ${(item.unitPrice || 0).toFixed(2)}`, 360, currentY, { width: 90, align: 'right' });
        doc.font('Helvetica-Bold').text(`${symbol} ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}`, 460, currentY, { width: 90, align: 'right' });

        currentY += rowHeight + 8;
      });

      // Totals
      currentY += 10;
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(350, currentY).lineTo(545, currentY).stroke();
      currentY += 10;

      const totalsData = [
        { label: 'Subtotal', value: `${symbol} ${invoice.subtotal.toFixed(2)}` },
      ];

      if (invoice.taxAmount > 0) {
        totalsData.push({ label: `Tax (${invoice.tax}%)`, value: `${symbol} ${invoice.taxAmount.toFixed(2)}` });
      }

      if (invoice.discountAmount > 0) {
        totalsData.push({ label: 'Discount', value: `-${symbol} ${invoice.discountAmount.toFixed(2)}`, color: '#dc2626' });
      }

      totalsData.forEach((row) => {
        doc.fillColor(grayMedium).fontSize(9).font('Helvetica').text(row.label, 360, currentY, { width: 80, align: 'right' });
        if (row.color) {
          doc.fillColor(row.color);
        } else {
          doc.fillColor(grayDark);
        }
        doc.font('Helvetica').text(row.value, 460, currentY, { width: 90, align: 'right' });
        currentY += 18;
      });

      // Grand total
      doc.fillColor(grayLight).rect(350, currentY - 5, 195, 30).fill();
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('TOTAL', 360, currentY, { width: 80, align: 'right' });
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(`${symbol} ${invoice.grandTotal.toFixed(2)}`, 460, currentY, { width: 90, align: 'right' });

      // Notes and Terms
      currentY += 45;
      if (invoice.notes || invoice.terms) {
        if (currentY > 650) {
          doc.addPage();
          currentY = 50;
        }

        doc.strokeColor('#e5e7eb').lineWidth(0.5).moveTo(50, currentY).lineTo(545, currentY).stroke();
        currentY += 15;

        if (invoice.notes) {
          doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text('NOTES', 50, currentY);
          doc.fillColor(grayMedium).fontSize(8).font('Helvetica').text(invoice.notes, 50, currentY + 14, { width: 230 });
        }

        if (invoice.terms) {
          const termsX = invoice.notes ? 300 : 50;
          doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text('TERMS & CONDITIONS', termsX, currentY);
          doc.fillColor(grayMedium).fontSize(8).font('Helvetica').text(invoice.terms, termsX, currentY + 14, { width: 230 });
        }
      }

      // Footer
      const pageHeight = 842;
      doc
        .fillColor(grayMedium)
        .fontSize(8)
        .font('Helvetica')
        .text('Generated by InvoiceMo - Thank you for your business!', 50, pageHeight - 30, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const getCurrencySymbol = (code) => {
  const symbols = { BDT: '\u09F3', EUR: '\u20AC', GBP: '\u00A3', INR: '\u20B9', USD: '$' };
  return symbols[code] || '$';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status) => {
  const colors = { paid: '#16a34a', unpaid: '#dc2626', overdue: '#ea580c', sent: '#2563eb', draft: '#6b7280' };
  return colors[status] || '#6b7280';
};

module.exports = generatePDF;
