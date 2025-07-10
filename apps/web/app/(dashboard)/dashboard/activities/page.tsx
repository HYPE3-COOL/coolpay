"use client";

import { PagingInfo } from "@/interfaces";
import {
  List,
  useTable,
} from "@refinedev/antd";
import { Pagination, Table, Tag, Input, Form, Button, Row, Col, Select } from "antd";
import { showExplorer, showTweetExplorer, showXUserByIdExplorer } from "@/utils/string";
import { ExplorerLinkButton } from "@/components/dashboard/buttons";
import { ActivitySelect } from "@/db/schema";
import { ActivityStatus, ActivityPaymentStatus } from "@/interfaces/activity.interface";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ActivityList() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<ActivitySelect[]>([]);
  const [meta, setMeta] = useState<PagingInfo>({ count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    setLoading(true);
    fetch(`/api/v1/activities?${params.toString()}`)
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
    router.push(`/dashboard/activities?${params.toString()}`);
    setSearching(false);
  };

  const statusOptions = Object.values(ActivityStatus).map((status) => ({ label: status, value: status }));
  const paymentStatusOptions = Object.values(ActivityPaymentStatus).map((status) => ({ label: status, value: status }));

  const statusColorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    rejected: 'red',
    failed: 'red',
    succeeded: 'green',
    settled: 'purple',
    expired: 'gray',
  };
  const paymentStatusColorMap: Record<string, string> = {
    funded: 'blue',
    paid: 'green',
    refunded: 'red',
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
          <Col><Form.Item name="q" label="Text Search"><Input placeholder="user, creator, tweet, hash..." allowClear /></Form.Item></Col>
          <Col><Form.Item name="status" label="Status"><Select placeholder="Status" allowClear options={statusOptions} style={{ minWidth: 140 }} /></Form.Item></Col>
          <Col><Form.Item name="payment_status" label="Payment Status"><Select placeholder="Payment Status" allowClear options={paymentStatusOptions} style={{ minWidth: 140 }} /></Form.Item></Col>
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
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          title={
            <>
              User ID /<br />Creator ID
            </>
          }
          render={(_, record: ActivitySelect) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {record.user_id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showXUserByIdExplorer(record.user_id.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.user_id.toString()}
                  </a>
                  <ExplorerLinkButton url={showXUserByIdExplorer(record.user_id.toString())} tooltip="Open X Profile by ID" />
                </span>
              ) : null}
              {record.creator_id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showXUserByIdExplorer(record.creator_id.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.creator_id.toString()}
                  </a>
                  <ExplorerLinkButton url={showXUserByIdExplorer(record.creator_id.toString())} tooltip="Open X Profile by ID" />
                </span>
              ) : null}
            </div>
          )}
        />
        <Table.Column
          title={
            <>
              X Tweet ID /<br />First Reply Tweet ID
            </>
          }
          render={(_, record: ActivitySelect) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {record.x_tweet_id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showTweetExplorer(record.x_tweet_id.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.x_tweet_id.toString()}
                  </a>
                  <ExplorerLinkButton url={showTweetExplorer(record.x_tweet_id.toString())} tooltip="Open Tweet in X" />
                </span>
              ) : null}
              {record.first_reply_tweet_id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showTweetExplorer(record.first_reply_tweet_id.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.first_reply_tweet_id.toString()}
                  </a>
                  <ExplorerLinkButton url={showTweetExplorer(record.first_reply_tweet_id.toString())} tooltip="Open Tweet in X" />
                </span>
              ) : null}
            </div>
          )}
        />
        <Table.Column dataIndex="amount" title={
          <>
            Amount<br />(lamports)
          </>
        }
          render={(value: string) => (
            value ? <span>{value}</span> : null
          )} />
        <Table.Column dataIndex="fee" title={
          <>
            Fee<br />(lamports)
          </>
        }
          render={(value: string) => (
            value ? <span>{value}</span> : null
          )} />
        <Table.Column dataIndex="amountAfterFee" title={
          <>
            Amount After Fee<br />(lamports)
          </>
        }
          render={(value: string) => (
            value ? <span>{value}</span> : null
          )} />
        <Table.Column dataIndex="token" title={"Token"} />
        <Table.Column dataIndex="status" title={"Status"} render={(status: string) => (
          <Tag color={statusColorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>
        )} />
        <Table.Column dataIndex="response_count" title={"Response Count"} />
        <Table.Column dataIndex="is_live" title={"Live"} render={(v: boolean) => v ? 'Yes' : 'No'} />
        <Table.Column dataIndex="payment_status" title={"Payment Status"} render={(status: string) => (
          <Tag color={paymentStatusColorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>
        )} />
        <Table.Column dataIndex="created_at" title={"Created At"} render={(value: string) => (
          <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span>
        )} />
        <Table.Column dataIndex="started_at" title={"Started At"} render={(value: string) => (
          value ? <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span> : null
        )} />
        <Table.Column dataIndex="ended_at" title={"Ended At"} render={(value: string) => (
          value ? <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span> : null
        )} />
        <Table.Column dataIndex="fund_hash" title={"Fund Hash"} render={(value: string) => (
          value ? (
            <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
              {value?.slice(0, 8)}...{value?.slice(-6)}
              <span style={{ marginLeft: 6 }}><ExplorerLinkButton url={showExplorer(value)} /></span>
            </span>
          ) : null
        )} />
        <Table.Column dataIndex="refund_hash" title={"Refund Hash"} render={(value: string) => (
          value ? (
            <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
              {value?.slice(0, 8)}...{value?.slice(-6)}
              <span style={{ marginLeft: 6 }}><ExplorerLinkButton url={showExplorer(value)} /></span>
            </span>
          ) : null
        )} />
        <Table.Column dataIndex="paid_hash" title={"Paid Hash"} render={(value: string) => (
          value ? (
            <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
              {value?.slice(0, 8)}...{value?.slice(-6)}
              <span style={{ marginLeft: 6 }}><ExplorerLinkButton url={showExplorer(value)} /></span>
            </span>
          ) : null
        )} />
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
          router.push(`/dashboard/activities?${params.toString()}`);
        }}
        showSizeChanger={true}
        pageSizeOptions={["10", "20", "50", "100"]}
      />
    </List>
  );
}
