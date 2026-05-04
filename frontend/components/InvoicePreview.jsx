"use client";

import React from 'react';
import { Card, Divider, Button, Space } from 'antd';
import { DownloadOutlined, PrinterOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';

const InvoicePreview = ({ values, totals, logoUrl, template, onDownloadPDF, onSaveJSON, onPrint, isDarkMode, isSaving }) => {
  const {
    companyName = 'Your Company',
    companyAddress = 'Company Address',
    companyEmail = '',
    companyPhone = '',
    clientName = 'Client Name',
    clientEmail = 'client@example.com',
    clientPhone = '',
    clientAddress = 'Client Address',
    invoiceNumber = 'INV-0000',
    issueDate,
    dueDate,
    currency = 'USD',
    items = [],
    notes = '',
    terms = '',
  } = values || {};

  const getCurrencySymbol = (code) => {
    const symbols = { BDT: '৳', EUR: '€', GBP: '£', INR: '₹', USD: '$' };
    return symbols[code] || '$';
  };

  const formatCurrency = (amount) => {
    return `${symbol} ${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (typeof date.format === 'function') return date.format('MMM DD, YYYY');
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const symbol = getCurrencySymbol(currency);

  const ModernTemplate = () => (
    <div className="bg-white p-8 min-h-[842px] w-full text-gray-800 font-sans">
      <div className="flex justify-between items-start mb-10">
        <div>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="max-h-20 mb-4 rounded-lg object-contain" />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl shadow-md">
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-blue-600 uppercase tracking-tight">{companyName || 'Your Company'}</h1>
          {companyEmail && <p className="text-gray-500 text-sm">{companyEmail}</p>}
          {companyPhone && <p className="text-gray-500 text-sm">{companyPhone}</p>}
          <p className="text-gray-500 text-sm whitespace-pre-wrap mt-1">{companyAddress}</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-gray-200 uppercase mb-2 tracking-wide">Invoice</h2>
          <p className="font-semibold text-gray-700 text-lg"># {invoiceNumber}</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Issued: <span className="font-medium text-gray-700">{formatDate(issueDate)}</span></p>
            <p>Due: <span className="font-medium text-gray-700">{formatDate(dueDate)}</span></p>
          </div>
        </div>
      </div>

      <Divider className="my-6" style={{ borderTop: '2px solid #f1f5f9' }} />

      <div className="mb-10">
        <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Bill To</h3>
        <p className="font-bold text-lg text-gray-800">{clientName || 'Client Name'}</p>
        {clientEmail && <p className="text-gray-600">{clientEmail}</p>}
        {clientPhone && <p className="text-gray-600">{clientPhone}</p>}
        <p className="text-gray-600 whitespace-pre-wrap">{clientAddress}</p>
      </div>

      <table className="w-full mb-10 border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
            <th className="py-4 px-4 text-left rounded-l-lg">Description</th>
            <th className="py-4 px-4 text-center w-20">Qty</th>
            <th className="py-4 px-4 text-right w-32">Price</th>
            <th className="py-4 px-4 text-right w-32 rounded-r-lg">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items && items.length > 0 ? items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="py-5 px-4">
                <p className="font-semibold text-gray-800">{item.name || 'Item'}</p>
                {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
              </td>
              <td className="py-5 px-4 text-center text-gray-700">{item.quantity || 0}</td>
              <td className="py-5 px-4 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
              <td className="py-5 px-4 text-right font-bold text-gray-800">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="py-8 text-center text-gray-400 italic">No items added yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-gray-600 py-2">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
          </div>
          {parseFloat(totals.taxAmount) > 0 && (
            <div className="flex justify-between text-gray-600 py-2">
              <span>Tax ({values.taxRate || 0}%)</span>
              <span className="font-semibold">{formatCurrency(totals.taxAmount)}</span>
            </div>
          )}
          {parseFloat(totals.discountAmount) > 0 && (
            <div className="flex justify-between text-red-500 py-2">
              <span>Discount</span>
              <span className="font-semibold">-{formatCurrency(totals.discountAmount)}</span>
            </div>
          )}
          <Divider className="my-2" style={{ borderTop: '2px solid #f1f5f9' }} />
          <div className="flex justify-between text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
            <span>Grand Total</span>
            <span className="text-blue-600">{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {(notes || terms) && (
        <div className="mt-16 grid grid-cols-2 gap-8">
          {notes && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-20 pt-10 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm italic">Thank you for your business!</p>
      </div>
    </div>
  );

  const ClassicTemplate = () => (
    <div className="bg-white p-8 min-h-[842px] w-full text-gray-800 font-serif">
      <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
        {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-20 mx-auto mb-4 rounded object-contain" />}
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">{companyName || 'Your Company'}</h1>
        <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{companyAddress}</p>
        {companyEmail && <p className="text-gray-600 text-sm">{companyEmail}</p>}
        {companyPhone && <p className="text-gray-600 text-sm">{companyPhone}</p>}
      </div>

      <div className="flex justify-between mb-10">
        <div>
          <h3 className="font-bold text-sm uppercase mb-2 border-b pb-1">Bill To</h3>
          <p className="font-bold">{clientName || 'Client Name'}</p>
          <p className="text-gray-600 text-sm">{clientEmail}</p>
          {clientPhone && <p className="text-gray-600 text-sm">{clientPhone}</p>}
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{clientAddress}</p>
        </div>
        <div className="text-right">
          <table className="text-sm inline-table">
            <tbody>
              <tr>
                <td className="pr-4 py-1 font-bold">Invoice #:</td>
                <td className="py-1">{invoiceNumber}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 font-bold">Issue Date:</td>
                <td className="py-1">{formatDate(issueDate)}</td>
              </tr>
              <tr>
                <td className="pr-4 py-1 font-bold">Due Date:</td>
                <td className="py-1">{formatDate(dueDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table className="w-full mb-10 border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <th className="py-3 px-4 text-left border-b border-r border-gray-300">Item</th>
            <th className="py-3 px-4 text-center border-b border-r border-gray-300 w-20">Qty</th>
            <th className="py-3 px-4 text-right border-b border-r border-gray-300 w-32">Unit Price</th>
            <th className="py-3 px-4 text-right border-b border-gray-300 w-32">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items && items.length > 0 ? items.map((item, index) => (
            <tr key={index}>
              <td className="py-3 px-4 border-r border-gray-200">
                <p className="font-semibold">{item.name || 'Item'}</p>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
              </td>
              <td className="py-3 px-4 text-center border-r border-gray-200">{item.quantity || 0}</td>
              <td className="py-3 px-4 text-right border-r border-gray-200">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 px-4 text-right font-semibold">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="py-8 text-center text-gray-400 italic">No items added yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-72 border border-gray-300">
          <div className="flex justify-between px-4 py-2 border-b border-gray-200">
            <span className="text-sm">Subtotal</span>
            <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
          </div>
          {parseFloat(totals.taxAmount) > 0 && (
            <div className="flex justify-between px-4 py-2 border-b border-gray-200">
              <span className="text-sm">Tax ({values.taxRate || 0}%)</span>
              <span className="font-semibold">{formatCurrency(totals.taxAmount)}</span>
            </div>
          )}
          {parseFloat(totals.discountAmount) > 0 && (
            <div className="flex justify-between px-4 py-2 border-b border-gray-200 text-red-600">
              <span className="text-sm">Discount</span>
              <span className="font-semibold">-{formatCurrency(totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3 bg-gray-100 font-bold text-lg">
            <span>Total Due</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {(notes || terms) && (
        <div className="mt-12 pt-6 border-t border-gray-300">
          {notes && (
            <div className="mb-4">
              <h4 className="font-bold text-sm uppercase mb-1">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <h4 className="font-bold text-sm uppercase mb-1">Terms & Conditions</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-16 pt-6 border-t-2 border-gray-800 text-center">
        <p className="text-gray-500 text-sm italic">Payment is due within the specified terms. Thank you!</p>
      </div>
    </div>
  );

  return (
    <Card
      className={`shadow-lg rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <span className="text-lg font-bold flex items-center gap-2">
          <FileTextOutlined className="text-blue-500" />
          Live Preview
        </span>
        <Space wrap size="small" className="no-print">
          <Button icon={<PrinterOutlined />} onClick={onPrint} size="small">Print</Button>
          <Button icon={<SaveOutlined />} onClick={onSaveJSON} size="small">Save JSON</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={onDownloadPDF} loading={isSaving} size="small">Download PDF</Button>
        </Space>
      </div>
      <div className="p-4 bg-gray-100 dark:bg-gray-900 overflow-auto max-h-[calc(100vh-240px)]">
        <div className="shadow-2xl rounded-lg overflow-hidden">
          {template === 'modern' ? <ModernTemplate /> : <ClassicTemplate />}
        </div>
      </div>
    </Card>
  );
};

export default InvoicePreview;
