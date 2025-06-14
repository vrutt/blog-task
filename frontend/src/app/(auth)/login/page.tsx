"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

import { Form, Input, Button, Select } from 'antd';
import Cookies from 'js-cookie';

import { useToast } from '@/components/ToastProvider';
import { callAPI, getURL } from '@/service';

const { Option } = Select;

const Login = () => {
    const router = useRouter();
    const message = useToast();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        try {
            const baseURL = getURL(`/auth/login`);
            const response = await callAPI(baseURL, values, "POST");
            Cookies.set('auth_token', response?.data?.token, {
                expires: new Date(Date.now() + response?.data?.expiresIn * 60000),
                secure: true,
                sameSite: 'none',
            });
            message.success('Signin successful!');
            router.push('/list');
        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.error || 'Signup failed');
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '50px auto' }}>
            <h2>Login</h2>
            <Form
                form={form}
                name="signup"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ role: 'user' }}
            >

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

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Sign In
                    </Button>
                </Form.Item>
            </Form>
                <a href="/signup">Sign Up</a>
        </div>
    );
};

export default Login;
