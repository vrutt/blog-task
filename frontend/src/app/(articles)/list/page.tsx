"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from 'antd';
import { useToast } from '@/components/ToastProvider';
import { callAPI, getURL } from '@/service/index';

const ArticleListPage = () => {
  const message = useToast();
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchArticles = async (page = 1, pageSize = 1) => {
    setLoading(true);
    try {
      const baseURL = getURL(`/article/list`, { page, pageSize });
      const response = await callAPI(baseURL, {}, "GET") as any;

      const { data, pagination: serverPagination } = response.data;

      setArticles(data);
      setPagination({
        current: serverPagination.page,
        pageSize: serverPagination.pageSize,
        total: serverPagination.totalItems
      });
    } catch (err) {
      console.error(err);
      message.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchArticles(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: any) => {
        console.log(record);
        return <>
          <div key="view">
            <a onClick={() => router.push(`/detail/${record.id}`)}>View</a>
          </div>
        </>
    }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <a href="/create">Create Article</a>
      <h1>My Articles</h1>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey={(record: any) => record.id} // ✅ preferred if `id` is unique
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}

      />
    </div>
  );
};

export default ArticleListPage;
