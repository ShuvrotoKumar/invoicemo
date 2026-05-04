"use client";

import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Card, Upload } from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Dragger } = Upload;

const InvoiceFormFields = ({ setLogoUrl }) => {
  const [logoFileList, setLogoFileList] = useState([]);

  const handleLogoChange = ({ fileList }) => {
    setLogoFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target.result);
      reader.readAsDataURL(fileList[0].originFileObj);
    } else if (fileList.length === 0) {
      setLogoUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Company Details" className="shadow-sm rounded-xl bg-white dark:bg-gray-800">
          <Form.Item label="Company Logo" className="mb-4">
            <Dragger
              listType="picture"
              maxCount={1}
              fileList={logoFileList}
              beforeUpload={() => false}
              onChange={handleLogoChange}
              accept="image/*"
              className="rounded-lg"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-blue-500 text-2xl" />
              </p>
              <p className="ant-upload-text">Click or drag image to upload</p>
              <p className="ant-upload-hint">PNG, JPG, SVG up to 2MB</p>
            </Dragger>
          </Form.Item>
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Your Company Name" />
          </Form.Item>
          <Form.Item name="companyEmail" label="Company Email">
            <Input placeholder="contact@company.com" />
          </Form.Item>
          <Form.Item name="companyPhone" label="Phone">
            <Input placeholder="+1 (555) 000-0000" />
          </Form.Item>
          <Form.Item name="companyAddress" label="Address">
            <Input.TextArea rows={2} placeholder="Company Address" />
          </Form.Item>
        </Card>

        <Card title="Client Details" className="shadow-sm rounded-xl bg-white dark:bg-gray-800">
          <Form.Item
            name="clientName"
            label="Client Name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input placeholder="Client Name" />
          </Form.Item>
          <Form.Item
            name="clientEmail"
            label="Client Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="client@example.com" />
          </Form.Item>
          <Form.Item name="clientPhone" label="Client Phone">
            <Input placeholder="+1 (555) 000-0000" />
          </Form.Item>
          <Form.Item name="clientAddress" label="Client Address">
            <Input.TextArea rows={2} placeholder="Client Address" />
          </Form.Item>
        </Card>
      </div>

      <Card title="Invoice Information" className="shadow-sm rounded-xl bg-white dark:bg-gray-800">
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="invoiceNumber"
              label="Invoice Number"
              rules={[{ required: true }]}
            >
              <Input placeholder="INV-001" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8}>
            <Form.Item name="issueDate" label="Issue Date">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8}>
            <Form.Item name="dueDate" label="Due Date">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="currency" label="Currency">
              <Select>
                <Option value="USD">USD ($)</Option>
                <Option value="BDT">BDT (৳)</Option>
                <Option value="EUR">EUR (€)</Option>
                <Option value="GBP">GBP (£)</Option>
                <Option value="INR">INR (₹)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Notes & Terms" className="shadow-sm rounded-xl bg-white dark:bg-gray-800">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={4} placeholder="Payment is due within 30 days..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="terms" label="Terms & Conditions">
              <Input.TextArea rows={4} placeholder="Late payments may incur a 2% monthly fee..." />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InvoiceFormFields;
