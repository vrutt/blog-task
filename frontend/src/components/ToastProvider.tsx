// components/ToastProvider.tsx
"use client";

import React, { createContext, useContext, useRef } from 'react';
import { message } from 'antd';

const ToastContext = createContext<any>(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const toastRef = useRef({
    success: (msg: string) => messageApi.success(msg),
    error: (msg: string) => messageApi.error(msg),
    info: (msg: string) => messageApi.info(msg),
    warning: (msg: string) => messageApi.warning(msg),
    loading: (msg: string) => messageApi.loading(msg),
  });

  return (
    <ToastContext.Provider value={toastRef.current}>
      {contextHolder}
      {children}
    </ToastContext.Provider>
  );
};
