"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import { Spin, Drawer, Button } from 'antd';
import { useToast } from '@/components/ToastProvider';
import { callAPI, getURL } from '@/service/index';
import ArticleForm from '@/components/ArticleForm';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const message = useToast();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 1,
    totalPages: 1
  });

  const [history, setHistory] = useState<{ createdAt: string, id: number }[]>([]);
  const [page, setPage] = useState<number>(1);
  const [historyId, setHistoryId] = useState<number | null>(null);

  const [article, setArticle] = useState<{ title: string; content: string } | null>(null);
  const [articlesummery, setArticleSummery] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const [loadingArticle, setLoadingArticle] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchArticle = async (requestUrl: string) => {
    try {
      setLoadingArticle(true);
      const url = getURL(requestUrl);
      const response = await callAPI(url, {}, 'GET') as any;
      const { title, content, summary } = response.data.data;
      setArticle({ title, content });
      setArticleSummery(summary);
    } catch (error) {
      console.error(error);
      message.error('Failed to load article details');
    } finally {
      setLoadingArticle(false);
    }
  };

  // Fetch article details
  useEffect(() => {
    setShowHistory(false);
    if (!historyId) {
      fetchArticle(`/article/detail/${id}`)
    } else { fetchArticle(`/article/revision/${historyId}`); }
  }, [historyId, id]);

  // Fetch history page
  const fetchHistory = async (pg = 1, pageSize = 1) => {
    try {
      setLoadingHistory(true);
      const baseURL = getURL(`/article/history/${id}`, { page: pg, pageSize });
      const response = await callAPI(baseURL, {}, "GET") as any;

      const { data, pagination: serverPagination } = response.data;

      // Append data if not first page
      setHistory(prev =>
        pg === 1 ? data : [...prev, ...data]
      );

      setPagination({
        current: serverPagination.page,
        pageSize: serverPagination.pageSize,
        totalPages: serverPagination.totalPages
      });

    } catch (err) {
      console.error(err);
      message.error('Failed to load article history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle opening/closing history drawer
  const toggleHistory = () => {
    const nextState = !showHistory;
    setShowHistory(nextState);

    if (nextState) {
      setPage(1);
      setHistory([]);
      fetchHistory(1);
    }
  };

  // Handle "Load More"
  const loadMoreHistory = () => {
    if (page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
  };

  const getSummery = async () => {
    try {
      const url = getURL(`/article/get-summary/${id}`);
      const response = await callAPI(url, {}, 'GET') as any;
      setArticleSummery(response?.data);
      message.success('Summery updated successfully');

    } catch (err) {
      console.error(err);
    }
  }

  const handleEdit = async (values: { title: string; content: string }) => {
    try {
      if (_.isEqual(article, values)) {
        setReadOnly(true);
        message.info('No changes made');
        return;
      }

      const url = getURL(`/article/update/${id}`);
      await callAPI(url, values, 'PUT');
      setArticle(values);
      message.success('Article updated successfully');
      setReadOnly(true);
    } catch (error) {
      console.error(error);
      message.error('Failed to update article');
    }
  };

  if (loadingArticle) {
    return <div><Spin /></div>;
  }

  return (
    readOnly ? (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <h1>{article?.title}</h1>
        {!historyId ? <div style={{ marginBottom: 20 }}>
          <button style={{ marginRight: 10 }} onClick={() => setReadOnly(false)}>Edit</button>
          <button onClick={toggleHistory}>View History</button>
          {articlesummery?.trim() ? <p>Summery: {articlesummery}</p> : <button onClick={getSummery}>Generate summery</button>}
        </div> : <div>
          <button onClick={() => setHistoryId(null)}>Back</button>
        </div>}
        <p>{article?.content}</p>

        {showHistory && (
          <Drawer
            title="History"
            open={showHistory}
            onClose={toggleHistory}
          >
            {history.map((item, index) => (
              <div key={index}>
                <button onClick={() => setHistoryId(item.id)}>
                  <p>{item.createdAt}</p>
                </button>

              </div>
            ))}
            {loadingHistory && <Spin />}
            {!loadingHistory && page < pagination.totalPages && (
              <Button onClick={loadMoreHistory}>Load More</Button>
            )}
          </Drawer>
        )}
      </div>
    ) : (
      <>
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setReadOnly(true)}>Cancel</button>
        </div>
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
          <ArticleForm
            onSubmit={handleEdit}
            loading={loadingArticle}
            submitLabel="Edit Article"
            initialValues={article || { title: '', content: '' }}
          />
        </div>
      </>
    )
  );
};

export default ArticleDetailPage;
