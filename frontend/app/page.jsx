"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Layout, Typography, Row, Col, Space, InputNumber, Card, ConfigProvider, theme, Switch, Button, Select } from 'antd';
import { SunOutlined, MoonOutlined, DownloadOutlined, FileTextOutlined, SwapOutlined } from '@ant-design/icons';
import InvoiceForm from '@/components/InvoiceForm';
import ItemTable from '@/components/ItemTable';
import InvoicePreview from '@/components/InvoicePreview';
import { calculateTotals } from '@/utils/calculateTotals';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function Home() {
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState({});
  const [totals, setTotals] = useState({ subtotal: '0.00', taxAmount: '0.00', discountAmount: '0.00', grandTotal: '0.00' });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [template, setTemplate] = useState('modern');
  const [isSaving, setIsSaving] = useState(false);

  const onValuesChange = useCallback((_, allValues) => {
    setFormValues(allValues);
    const calculated = calculateTotals(allValues.items, allValues.taxRate, allValues.discount);
    setTotals(calculated);
    localStorage.setItem('invoiceDraft', JSON.stringify({ ...allValues, template, logoUrl }));
  }, [template, logoUrl]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('invoiceDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        form.setFieldsValue(parsed);
        setFormValues(parsed);
        if (parsed.template) setTemplate(parsed.template);
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
        const calculated = calculateTotals(parsed.items, parsed.taxRate, parsed.discount);
        setTotals(calculated);
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, [form]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    setIsSaving(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${formValues.invoiceNumber || 'draft'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveJSON = () => {
    const data = {
      ...formValues,
      totals,
      template,
      logoUrl,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${formValues.invoiceNumber || 'draft'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 8,
        },
      }}
    >
      <Layout className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
        <Header className={`bg-white dark:bg-gray-800 border-b flex items-center justify-between px-4 md:px-8 h-16 sticky top-0 z-50 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Text className="text-white font-bold">I</Text>
            </div>
            <Title level={4} className="m-0 hidden sm:block">InvoiceMo</Title>
          </div>
          <Space size="middle" className="flex-wrap">
            <div className="hidden sm:flex items-center gap-2">
              <SwapOutlined />
              <Select
                value={template}
                onChange={setTemplate}
                className="w-28"
                size="small"
              >
                <Option value="modern">Modern</Option>
                <Option value="classic">Classic</Option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <SunOutlined className={isDarkMode ? 'text-gray-400' : 'text-yellow-500'} />
              <Switch
                checked={isDarkMode}
                onChange={(checked) => setIsDarkMode(checked)}
                size="small"
              />
              <MoonOutlined className={isDarkMode ? 'text-blue-400' : 'text-gray-400'} />
            </div>
          </Space>
        </Header>

        <Content className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
          <div className="mb-4 md:mb-6">
            <Title level={2} className="m-0 text-xl md:text-2xl">Create Invoice</Title>
            <Text type="secondary" className="hidden sm:block">Fill in the details below to generate your professional invoice.</Text>
          </div>

          <Row gutter={[24, 32]}>
            <Col xs={24} lg={14} xl={15}>
              <Form
                form={form}
                onValuesChange={onValuesChange}
                layout="vertical"
                initialValues={{
                  currency: 'USD',
                  invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
                  items: [{ name: '', description: '', quantity: 1, unitPrice: 0 }],
                  taxRate: 0,
                  discount: 0
                }}
              >
                <InvoiceForm setLogoUrl={setLogoUrl} />
                <ItemTable />

                <Card title="Summary & Tax" className={`shadow-sm rounded-xl mt-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <Row gutter={16}>
                    <Col xs={12} sm={8}>
                      <Form.Item name="taxRate" label="Tax Rate (%)">
                        <InputNumber min={0} max={100} className="w-full" placeholder="0" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Form.Item name="discount" label="Discount Amount">
                        <InputNumber min={0} className="w-full" placeholder="0.00" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Form>
            </Col>

            <Col xs={24} lg={10} xl={9}>
              <div className="lg:sticky lg:top-24">
                <InvoicePreview
                  values={formValues}
                  totals={totals}
                  logoUrl={logoUrl}
                  template={template}
                  onDownloadPDF={handleDownloadPDF}
                  onSaveJSON={handleSaveJSON}
                  onPrint={handlePrint}
                  isDarkMode={isDarkMode}
                  isSaving={isSaving}
                />

                <div className="sm:hidden mt-4">
                  <Select
                    value={template}
                    onChange={setTemplate}
                    className="w-full"
                    size="large"
                  >
                    <Option value="modern">Modern Template</Option>
                    <Option value="classic">Classic Template</Option>
                  </Select>
                </div>
              </div>
            </Col>
          </Row>
        </Content>

        <style jsx global>{`
          @media print {
            .ant-layout-header, .ant-col-lg-14, .ant-card-head, .ant-btn, .no-print {
              display: none !important;
            }
            .ant-layout-content {
              padding: 0 !important;
              margin: 0 !important;
            }
            .ant-col-lg-10, .ant-col-xl-9 {
              width: 100% !important;
              max-width: 100% !important;
              flex: 0 0 100% !important;
            }
            #invoice-content {
              padding: 0 !important;
              box-shadow: none !important;
              min-height: auto !important;
            }
            body {
              background: white !important;
            }
          }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
}
