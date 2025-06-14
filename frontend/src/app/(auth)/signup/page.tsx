"use client";

import React from 'react';

import { useRouter } from 'next/navigation';
import { Form, Input, Button, Select } from 'antd';
import Cookies from 'js-cookie';


import { useToast } from '@/components/ToastProvider';
import { callAPI, getURL } from '@/service';

const { Option } = Select;

const Signup = () => {

  const message = useToast();
  const router = useRouter();
  
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const baseURL = getURL(`/auth/signup`);
      const response = await callAPI(baseURL, values, "POST");
      Cookies.set('auth_token', response?.data?.token, {
        expires: new Date(Date.now() + response?.data?.expiresIn * 60000),
        secure: true,
        sameSite: 'none',
      });
      message.success('Signup successful!');
      router.push('/list');
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto' }}>
      <h2>Signup</h2>
      <Form
        form={form}
        name="signup"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: 'user' }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email format' }
          ]}
        >
          <Input placeholder="example@example.com" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select>
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <a href="/login">Login</a>
    </div>
  );
};

export default Signup;
