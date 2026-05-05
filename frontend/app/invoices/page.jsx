"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Table, Tag, Space, Button, Card, Breadcrumb, message, Modal } from 'antd';
import { FileTextOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { invoiceApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import InvoicePreview from '@/components/InvoicePreview';
import dayjs from 'dayjs';

const { Content, Header } = Layout;
const { Title, Text, Image } = Typography;

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const { data, pagination: meta } = await invoiceApi.getAll({ page, limit: pagination.pageSize });
      setInvoices(data);
      setPagination(prev => ({ ...prev, current: page, total: meta.total }));
    } catch (error) {
      message.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchInvoices();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleView = (record) => {
    // Map backend item names to frontend names for InvoicePreview
    const mappedInvoice = {
      ...record,
      items: record.items.map(item => ({
        ...item,
        name: item.itemName // InvoicePreview expects 'name'
      })),
      taxRate: record.tax, // Backend uses 'tax' for rate
    };
    setSelectedInvoice(mappedInvoice);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this invoice?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await invoiceApi.delete(id);
          message.success('Invoice deleted successfully');
          fetchInvoices(pagination.current);
        } catch (error) {
          message.error('Failed to delete invoice');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount, record) => (
        <Text strong>
          {record.currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'paid') color = 'success';
        if (status === 'sent') color = 'processing';
        if (status === 'unpaid') color = 'error';
        if (status === 'overdue') color = 'warning';
        return <Tag color={color} className="uppercase">{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small" title="View" onClick={() => handleView(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record._id)} title="Delete" />
        </Space>
      ),
    },
  ];

  if (authLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Title level={3}>Please log in to view your invoices</Title>
        <Link href="/">
          <Button type="primary" size="large">Go to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Header className="bg-white border-b px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="InvoiceMo Logo" width={32} height={32} className="rounded-lg" />
            <Title level={4} className="m-0 hidden sm:block">InvoiceMo</Title>
          </Link>
        </div>
        <Space>
          <Text strong>{user.name}</Text>
          <Link href="/">
            <Button icon={<PlusOutlined />} type="primary">New Invoice</Button>
          </Link>
        </Space>
      </Header>

      <Content className="p-8 max-w-[1200px] mx-auto w-full">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>My Invoices</Breadcrumb.Item>
        </Breadcrumb>

        <div className="mb-8 flex justify-between items-end">
          <div>
            <Title level={2} className="m-0">My Invoices</Title>
            <Text type="secondary">Manage and track all your generated invoices.</Text>
          </div>
        </div>

        <Card className="shadow-sm rounded-xl">
          <Table
            columns={columns}
            dataSource={invoices}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: fetchInvoices,
            }}
          />
        </Card>
      </Content>

      <Modal
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1000}
        centered
        destroyOnClose
      >
        {selectedInvoice && (
          <div className="py-4">
            <InvoicePreview
              values={selectedInvoice}
              totals={{
                subtotal: selectedInvoice.subtotal,
                taxAmount: selectedInvoice.taxAmount,
                discountAmount: selectedInvoice.discountAmount,
                grandTotal: selectedInvoice.grandTotal
              }}
              logoUrl={selectedInvoice.companyLogo}
              template={selectedInvoice.template || 'modern'}
              onDownloadPDF={() => {}} // Placeholder or implement
              onSaveJSON={() => {}}
              onPrint={() => window.print()}
              isDarkMode={false}
              isSaving={false}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
}
