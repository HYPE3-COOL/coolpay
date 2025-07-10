"use client";

import { PagingInfo } from "@/interfaces";
import { List } from "@refinedev/antd";
import { Pagination, Table, Tag, Input, Form, Button, Row, Col, Select, Modal } from "antd";
import { showExplorer, showTweetExplorer } from "@/utils/string";
import { ExplorerLinkButton, CopyButton } from "@/components/dashboard/buttons";
import { XTweetQueueSelect } from "@/db/schema/x-tweet-queue";
import { XTweetQueueStatus, XTweetQueueType, XTweetQueueFailedReason } from "@/interfaces/x-tweet-queue.interface";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function XTweetQueueList() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<XTweetQueueSelect[]>([]);
  const [meta, setMeta] = useState<PagingInfo>({ count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [metaModal, setMetaModal] = useState<{ open: boolean; value: any }>({ open: false, value: null });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    setLoading(true);
    fetch(`/api/v1/x-tweet-queues?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || []);
        setMeta(res.meta || { count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (values: any) => {
    setSearching(true);
    const params = new URLSearchParams();
    params.set("pageSize", String(searchParams.get("pageSize") || 10));
    params.set("page", "1");
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    router.push(`/dashboard/x-tweet-queues?${params.toString()}`);
    setSearching(false);
  };

  const statusOptions = Object.values(XTweetQueueStatus).map((status) => ({ label: status, value: status }));
  const typeOptions = Object.values(XTweetQueueType).map((type) => ({ label: type, value: type }));
  const failedReasonOptions = Object.values(XTweetQueueFailedReason).map((reason) => ({ label: reason, value: reason }));

  // Color maps for type, status, and failed_reason
  const typeColorMap: Record<string, string> = {
    mentions: 'blue',
    replies: 'green',
    retweets: 'purple',
    likes: 'orange',
    quotes: 'magenta',
  };
  const statusColorMap: Record<string, string> = {
    pending: 'orange',
    payment_pending: 'gold',
    processing: 'blue',
    done: 'green',
    failed: 'red',
  };
  const failedReasonColorMap: Record<string, string> = {
    creator_not_mentioned: 'red',
    incomplete_request: 'orange',
    not_registered: 'volcano',
    wallet_not_delegated: 'purple',
    less_than_minimum: 'gold',
    insufficient_balance: 'magenta',
    other: 'gray',
    '': 'default',
  };

  return (
    <List canCreate={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={12}>
          <Col><Form.Item name="q" label="Text Search"><Input placeholder="tweet id, status, type, reason..." allowClear /></Form.Item></Col>
          <Col><Form.Item name="status" label="Status"><Select placeholder="Status" allowClear options={statusOptions} style={{ minWidth: 150 }} /></Form.Item></Col>
          <Col><Form.Item name="type" label="Type"><Select placeholder="Type" allowClear options={typeOptions} style={{ minWidth: 150 }} /></Form.Item></Col>
          <Col><Form.Item name="failed_reason" label="Failed Reason"><Select placeholder="Failed Reason" allowClear options={failedReasonOptions} style={{ minWidth: 150 }} /></Form.Item></Col>
          <Col>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit" loading={searching}>Search</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={data}
        loading={loading}
        pagination={false}
        style={{ marginBottom: 24 }}
        rowKey="id"
        scroll={{ x: true }}
      >
        <Table.Column
          dataIndex="tweet_id"
          title={"Related Tweet"}
          render={(value: string | number) => (
            value ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <a
                  href={showTweetExplorer(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 500 }}
                >
                  {value}
                </a>
                <ExplorerLinkButton url={showTweetExplorer(value)} tooltip="Open Tweet in X" />
              </span>
            ) : null
          )}
        />
        <Table.Column dataIndex="type" title={"Type"} render={(type: string) => (
          <Tag color={typeColorMap[type] || 'default'}>{type}</Tag>
        )} />
        <Table.Column dataIndex="status" title={"Status"} render={(status: string) => (
          <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>
        )} />
        <Table.Column dataIndex="failed_reason" title={"Failed Reason"} render={(reason: string) => (
          <Tag color={failedReasonColorMap[reason] || 'default'}>{reason}</Tag>
        )} />
        <Table.Column dataIndex="amount" title={"Amount (lamports)"} render={(value: string) => value ? <span>{value}</span> : null} />
        <Table.Column
          dataIndex="meta"
          title={"Meta"}
          render={(meta: any) =>
            meta ? (
              <Button size="small" onClick={() => setMetaModal({ open: true, value: meta })}>
                View JSON
              </Button>
            ) : null
          }
        />
        <Table.Column dataIndex="created_at" title={"Created At"} render={(value: string) => <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span>} />
        <Table.Column dataIndex="updated_at" title={"Updated At"} render={(value: string) => <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span>} />
      </Table>
      <Pagination
        showTotal={() => `Total ${meta?.total || 0} items`}
        current={meta?.page ?? 1}
        pageSize={meta?.pageSize ?? 10}
        total={meta?.total ?? 0}
        onChange={(page, pageSize) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(page));
          params.set("pageSize", String(pageSize));
          router.push(`/dashboard/x-tweet-queues?${params.toString()}`);
        }}
        showSizeChanger={true}
        pageSizeOptions={["10", "20", "50", "100"]}
      />
      <Modal
        open={metaModal.open}
        onCancel={() => setMetaModal({ open: false, value: null })}
        onOk={() => setMetaModal({ open: false, value: null })}
        title="Meta JSON"
        width={700}
        footer={null}
      >
        <pre style={{ fontSize: 12, maxWidth: 650, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f6f6f6', borderRadius: 4, padding: 12, margin: 0 }}>
          {metaModal.value ? JSON.stringify(metaModal.value, null, 2) : ''}
        </pre>
      </Modal>
    </List>
  );
}
