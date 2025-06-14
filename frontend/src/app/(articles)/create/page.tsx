// app/create/page.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { callAPI, getURL } from '@/service/index';
import ArticleForm from '@/components/ArticleForm';

const CreateArticlePage = () => {
  const router = useRouter();
  const message = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (values: { title: string; content: string }) => {
    setLoading(true);
    try {
      const baseURL = getURL(`/article/create`);
      await callAPI(baseURL, values, "POST");
      message.success('Article created successfully');
      router.push('/list');
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.error || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1>Create New Article</h1>
      <ArticleForm
        onSubmit={handleCreate}
        loading={loading}
        submitLabel="Create Article"
      />
    </div>
  );
};

export default CreateArticlePage;
