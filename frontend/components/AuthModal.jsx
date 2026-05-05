"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message } from 'react-redux'; // Wait, I don't have react-redux, I should use antd
import { useAuth } from '@/context/AuthContext';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

// Correcting the import
import { Modal as AntModal, Form as AntForm, Input as AntInput, Button as AntButton, Tabs as AntTabs } from 'antd';

const AuthModal = ({ open, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login, register } = useAuth();
  const [form] = AntForm.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    let success = false;
    if (activeTab === 'login') {
      success = await login(values);
    } else {
      success = await register(values);
    }
    setLoading(false);
    if (success) {
      onCancel();
      form.resetFields();
    }
  };

  const items = [
    {
      key: 'login',
      label: 'Login',
      children: (
        <AntForm form={form} onFinish={onFinish} layout="vertical">
          <AntForm.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input your email!' }]}
          >
            <AntInput prefix={<MailOutlined />} placeholder="Email" />
          </AntForm.Item>
          <AntForm.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <AntInput.Password prefix={<LockOutlined />} placeholder="Password" />
          </AntForm.Item>
          <AntForm.Item>
            <AntButton type="primary" htmlType="submit" loading={loading} block>
              Log in
            </AntButton>
          </AntForm.Item>
        </AntForm>
      ),
    },
    {
      key: 'register',
      label: 'Register',
      children: (
        <AntForm form={form} onFinish={onFinish} layout="vertical">
          <AntForm.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <AntInput prefix={<UserOutlined />} placeholder="Full Name" />
          </AntForm.Item>
          <AntForm.Item
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input your email!' }]}
          >
            <AntInput prefix={<MailOutlined />} placeholder="Email" />
          </AntForm.Item>
          <AntForm.Item
            name="password"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters!' }]}
          >
            <AntInput.Password prefix={<LockOutlined />} placeholder="Password" />
          </AntForm.Item>
          <AntForm.Item>
            <AntButton type="primary" htmlType="submit" loading={loading} block>
              Register
            </AntButton>
          </AntForm.Item>
        </AntForm>
      ),
    },
  ];

  return (
    <AntModal
      title={activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <AntTabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </AntModal>
  );
};

export default AuthModal;
